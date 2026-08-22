import { decathlonEvents, heptathlonEvents, calcDecathlonPoints } from '../data/mockData';
import { disciplineMeta } from './controlEventUtils';
import type { Athlete, Result } from '../contexts/Athletescontext';

/** Возвращает набор дисциплин многоборья в зависимости от пола спортсмена. */
export function eventsFor(gender: 'M' | 'F') {
  return gender === 'F' ? heptathlonEvents : decathlonEvents;
}

/** Лучший результат спортсмена в конкретной дисциплине (меньше — лучше для бега, больше — для остального). */
export function bestResultFor(
  results: Result[],
  discipline: string,
  type: 'track' | 'field'
): Result | null {
  const evResults = results.filter(r => r.discipline === discipline);
  if (evResults.length === 0) return null;
  return evResults.reduce((best, r) =>
    type === 'track' ? (r.resultValue < best.resultValue ? r : best) : (r.resultValue > best.resultValue ? r : best)
  );
}

/** Суммарные очки многоборья спортсмена по официальным таблицам, на основе внесённых результатов. */
export function athleteTotalPoints(athlete: Athlete, allResults: Result[]): number {
  const events = eventsFor(athlete.gender);
  const athleteResults = allResults.filter(r => r.athleteId === athlete.id);
  return events.reduce((sum, ev) => {
    const best = bestResultFor(athleteResults, ev.name, ev.type as 'track' | 'field');
    if (!best) return sum;
    return sum + calcDecathlonPoints(ev, best.resultValue);
  }, 0);
}

/** Считает средний возраст по списку спортсменов, у которых указана дата рождения. */
export function averageAge(athletes: Athlete[]): number | null {
  const ages = athletes.map(a => a.age).filter((a): a is number => a !== null && a !== undefined);
  if (ages.length === 0) return null;
  return Math.round((ages.reduce((s, a) => s + a, 0) / ages.length) * 10) / 10;
}

const RU_MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

/** Группирует результаты по месяцу (YYYY-MM) и считает количество записей — для графиков активности. */
export function resultsByMonth(results: Result[]): { month: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of results) {
    const d = new Date(r.date);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, count]) => {
      const [, m] = key.split('-');
      return { month: RU_MONTHS_SHORT[Number(m) - 1], count };
    });
}
export interface MonthlyPoints {
  month: string
  avg: number
}

/** Кумулятивные очки многоборья спортсмена по состоянию на конец месяца (включительно). */
function athletePointsUpTo(athlete: Athlete, allResults: Result[], cutoffDate: string): number {
  const events = eventsFor(athlete.gender)
  const athleteResults = allResults.filter(r => r.athleteId === athlete.id && r.date <= cutoffDate)
  return events.reduce((sum, ev) => {
    const best = bestResultFor(athleteResults, ev.name, ev.type as 'track' | 'field')
    if (!best) return sum
    return sum + calcDecathlonPoints(ev, best.resultValue)
  }, 0)
}

/** Средние очки команды по месяцам — для графика "Прогресс команды". Учитывает только спортсменов, у кого на тот момент уже есть очки. */
export function teamPointsTrend(athletes: Athlete[], results: Result[]): MonthlyPoints[] {
  if (results.length === 0) return []
  const months = new Set<string>()
  for (const r of results) {
    const d = new Date(r.date)
    if (isNaN(d.getTime())) continue
    months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const sortedMonths = [...months].sort()
  return sortedMonths.map(key => {
    const [y, m] = key.split('-')
    const cutoff = `${y}-${m}-31`
    const pointsList = athletes.map(a => athletePointsUpTo(a, results, cutoff)).filter(p => p > 0)
    const avg = pointsList.length > 0
      ? Math.round(pointsList.reduce((s, p) => s + p, 0) / pointsList.length)
      : 0
    return { month: RU_MONTHS_SHORT[Number(m) - 1], avg }
  })
}

/** Изменение средних очков команды между последним и предпоследним месяцем с данными. */
export function teamPointsDelta(trend: MonthlyPoints[]): { delta: number; percent: number; up: boolean } | null {
  if (trend.length < 2) return null
  const last = trend[trend.length - 1].avg
  const prev = trend[trend.length - 2].avg
  if (prev === 0 || last === 0) return null
  const delta = last - prev
  const percent = Math.round((delta / prev) * 1000) / 10
  return { delta, percent, up: delta >= 0 }
}

export interface ProgressEntry {
  athlete: Athlete
  deltaLabel: string
  event: string
}

/**
 * "Лидеры прогресса" — спортсмены с наибольшим улучшением результата
 * (сравнение двух последних попыток в одной дисциплине). Не зависит от таблиц очков многоборья.
 */
export function progressLeaders(athletes: Athlete[], results: Result[], limit = 4): ProgressEntry[] {
  const best: { athlete: Athlete; discipline: string; improvement: number; unit: string }[] = []

  for (const a of athletes) {
    const byDiscipline = new Map<string, Result[]>()
    for (const r of results.filter(r => r.athleteId === a.id)) {
      const arr = byDiscipline.get(r.discipline) || []
      arr.push(r)
      byDiscipline.set(r.discipline, arr)
    }
    let athleteBest: { discipline: string; improvement: number; unit: string } | null = null
    for (const [discipline, list] of byDiscipline) {
      if (list.length < 2) continue
      const sorted = [...list].sort((x, y) => x.date.localeCompare(y.date))
      const prev = sorted[sorted.length - 2]
      const last = sorted[sorted.length - 1]
      const lowerIsBetter = disciplineMeta(discipline).lowerIsBetter
      const improvement = lowerIsBetter ? prev.resultValue - last.resultValue : last.resultValue - prev.resultValue
      if (improvement <= 0) continue
      if (!athleteBest || improvement > athleteBest.improvement) {
        athleteBest = { discipline, improvement, unit: last.unit }
      }
    }
    if (athleteBest) best.push({ athlete: a, ...athleteBest })
  }

  return best
    .sort((x, y) => y.improvement - x.improvement)
    .slice(0, limit)
    .map(e => ({
      athlete: e.athlete,
      event: e.discipline,
      deltaLabel: `+${Math.round(e.improvement * 100) / 100} ${e.unit}`,
    }))
}

export interface DeclineEntry {
  athlete: Athlete
  discipline: string
  deltaLabel: string
}

/** Спортсмены с ухудшением результата (сравнение двух последних попыток в дисциплине). */
export function decliningAthletes(athletes: Athlete[], results: Result[], limit = 3): DeclineEntry[] {
  const entries: DeclineEntry[] = []
  for (const a of athletes) {
    const byDiscipline = new Map<string, Result[]>()
    for (const r of results.filter(r => r.athleteId === a.id)) {
      const arr = byDiscipline.get(r.discipline) || []
      arr.push(r)
      byDiscipline.set(r.discipline, arr)
    }
    for (const [discipline, list] of byDiscipline) {
      if (list.length < 2) continue
      const sorted = [...list].sort((x, y) => x.date.localeCompare(y.date))
      const prev = sorted[sorted.length - 2]
      const last = sorted[sorted.length - 1]
      const lowerIsBetter = disciplineMeta(discipline).lowerIsBetter
      const worse = lowerIsBetter ? last.resultValue > prev.resultValue : last.resultValue < prev.resultValue
      if (!worse) continue
      const diff = Math.round(Math.abs(last.resultValue - prev.resultValue) * 100) / 100
      if (diff === 0) continue
      entries.push({
        athlete: a,
        discipline,
        deltaLabel: `${lowerIsBetter ? '+' : '-'}${diff} ${last.unit}`,
      })
    }
  }
  return entries.slice(0, limit)
}