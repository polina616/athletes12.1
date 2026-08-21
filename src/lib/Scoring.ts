import { decathlonEvents, heptathlonEvents, calcDecathlonPoints } from '../data/mockData';
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