import { useState, useEffect } from 'react'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useAthletes } from '../contexts/Athletescontext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { athleteTotalPoints, resultsByMonth, teamPointsTrend, progressLeaders, decliningAthletes, disciplineLeaders } from '../lib/Scoring'
import { IconTrend } from './Icons'

const LIME = '#c6f135'
const PURPLE = '#a78bfa'

function EmptyBlock({ text }: { text: string }) {
  return (
    <div style={{ padding: '40px 12px', textAlign: 'center', color: '#4b5563', fontSize: 13 }}>
      {text}
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div style={{ padding: '16px 12px', textAlign: 'center', color: '#4b5563', fontSize: 12 }}>
      {text}
    </div>
  )
}

const tooltipStyle = {
  background: '#141720',
  border: '1px solid #1e2230',
  borderRadius: 8,
  fontSize: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
}

const gridProps = {
  stroke: '#1e2230',
  strokeDasharray: '3 3',
  vertical: false,
}

export default function Analytics() {
  const { athletes, results, loading } = useAthletes()
  const { coachProfile } = useAuth()

  const [controlEventsCount, setControlEventsCount] = useState<number | null>(null)

  useEffect(() => {
    if (!coachProfile) {
      setControlEventsCount(null)
      return
    }
    let cancelled = false
    const fetchControlEventsCount = async () => {
      const yearStart = `${new Date().getFullYear()}-01-01`
      const today = new Date().toISOString().slice(0, 10)
      const { count, error } = await supabase
        .from('control_events')
        .select('id', { count: 'exact', head: true })
        .eq('coach_id', coachProfile.id)
        .gte('date', yearStart)
        .lte('date', today)
      if (cancelled) return
      if (error) {
        console.error('Ошибка загрузки количества зачётов:', error)
        setControlEventsCount(null)
      } else {
        setControlEventsCount(count ?? 0)
      }
    }
    fetchControlEventsCount()
    return () => { cancelled = true }
  }, [coachProfile])

  const scored = athletes
    .map(a => ({ athlete: a, pts: athleteTotalPoints(a, results) }))
    .filter(s => s.pts > 0)
    .sort((a, b) => b.pts - a.pts)

  const avgPoints =
    scored.length > 0
      ? Math.round(scored.reduce((s, x) => s + x.pts, 0) / scored.length)
      : null
  const best = scored[0]
  const athletesWithResults = new Set(results.map(r => r.athleteId)).size

  const kpiCards = [
    { l: 'Средние очки', v: avgPoints !== null ? avgPoints.toLocaleString('ru') : '—', sub: scored.length > 0 ? `по ${scored.length} спортсменам` : 'нет данных', color: LIME },
    { l: 'Лучший результат', v: best ? best.pts.toLocaleString('ru') : '—', sub: best ? (best.athlete.nameShort || best.athlete.name) : 'нет данных', color: PURPLE },
    { l: 'Зачётов проведено', v: controlEventsCount !== null ? String(controlEventsCount) : '—', sub: 'с начала года', color: '#60a5fa' },
    { l: 'Спортсменов с данными', v: `${athletesWithResults}/${athletes.length}`, sub: 'внесли результаты', color: '#fbbf24' },
  ]

  // Volume of results by discipline (real, from actual entries)
  const disciplineCounts = new Map<string, number>()
  for (const r of results) {
    disciplineCounts.set(r.discipline, (disciplineCounts.get(r.discipline) || 0) + 1)
  }
  const disciplineVolume = [...disciplineCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([discipline, count]) => ({ discipline, count }))

  const activity = resultsByMonth(results)

  // Team progress over time + individual progress/decline leaders
  const trend = teamPointsTrend(athletes, results)
  const progressList = progressLeaders(athletes, results, 5)
  const declineList = decliningAthletes(athletes, results, 5)
  const leadersByDiscipline = disciplineLeaders(athletes, results)

  return (
    <div style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', margin: 0, letterSpacing: '0.01em' }}>
          АНАЛИТИКА
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
          {athletes.length > 0 ? `Командная статистика · ${athletes.length} спортсменов` : 'Пока нет спортсменов — статистика появится после добавления первых результатов'}
        </p>
      </div>

      {/* Top KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {kpiCards.map(k => (
          <div key={k.l} style={{
            background: 'rgba(15,17,23,0.8)',
            border: '1px solid #1e2230',
            borderRadius: 12,
            padding: '18px 20px',
            backdropFilter: 'blur(12px)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${k.color}, transparent)` }} />
            <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{k.l}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', lineHeight: 1, marginBottom: 4 }}>{loading ? '—' : k.v}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Activity by month */}
      <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '20px', backdropFilter: 'blur(12px)', marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 16 }}>АКТИВНОСТЬ ПО МЕСЯЦАМ</div>
        {activity.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activity} barCategoryGap="35%">
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={LIME} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={LIME} stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip cursor={{ fill: 'rgba(198,241,53,0.04)' }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Результатов" fill="url(#activityGradient)" maxBarSize={56} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyBlock text="Пока нет внесённых результатов" />
        )}
      </div>

      {/* Team progress trend */}
      <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '20px', backdropFilter: 'blur(12px)', marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 16 }}>ПРОГРЕСС КОМАНДЫ</div>
        {trend.length > 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="teamProgressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={LIME} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={LIME} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} width={44} domain={['dataMin - 100', 'dataMax + 100']} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="avg" name="Средние очки" stroke={LIME} strokeWidth={2.5} fill="url(#teamProgressGradient)" dot={{ fill: LIME, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: LIME }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyBlock text="Недостаточно данных для графика прогресса команды" />
        )}
      </div>

      {/* Progress leaders & declining athletes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '20px', backdropFilter: 'blur(12px)' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 16 }}>ЛИДЕРЫ ПРОГРЕССА</div>
          {progressList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {progressList.map((p, i) => (
                <div key={p.athlete.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(20,23,32,0.6)', borderRadius: 8, border: '1px solid #1e2230' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: i === 0 ? LIME : '#6b7280', fontWeight: 600, width: 18 }}>
                    #{i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f2f5' }}>{p.athlete.nameShort || p.athlete.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{p.event}</div>
                  </div>
                  <div style={{ fontSize: 11, color: LIME, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <IconTrend up={true} />
                    {p.deltaLabel}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyRow text="Пока недостаточно данных для оценки прогресса" />
          )}
        </div>

        <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '20px', backdropFilter: 'blur(12px)' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 16 }}>ТРЕБУЮТ ВНИМАНИЯ</div>
          {declineList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {declineList.map((d, i) => (
                <div key={`${d.athlete.id}-${i}`} style={{ padding: '12px', background: 'rgba(251,191,36,0.04)', borderRadius: 8, border: '1px solid rgba(251,191,36,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f2f5' }}>{d.athlete.nameShort || d.athlete.name}</span>
                    <span style={{ fontSize: 11, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <IconTrend up={false} />
                      {d.deltaLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{d.discipline} · ухудшение результата</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyRow text="Ухудшений результатов не выявлено" />
          )}
        </div>
      </div>

      {/* Volume by discipline */}
      <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '20px', backdropFilter: 'blur(12px)', marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 16 }}>РЕЗУЛЬТАТЫ ПО ДИСЦИПЛИНАМ</div>
        {disciplineVolume.length > 0 ? (
          <ResponsiveContainer width="100%" height={disciplineVolume.length * 34 + 40}>
            <BarChart data={disciplineVolume} layout="vertical" margin={{ left: 24 }} barCategoryGap="30%">
              <defs>
                <linearGradient id="disciplineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={PURPLE} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={PURPLE} stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e2230" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="discipline" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
              <Tooltip cursor={{ fill: 'rgba(167,139,250,0.04)' }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Результатов" fill="url(#disciplineGradient)" maxBarSize={22} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyBlock text="Нет данных по дисциплинам" />
        )}
      </div>

      {/* Leaders by discipline */}
      <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, overflow: 'hidden', backdropFilter: 'blur(12px)', marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2230' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em' }}>ЛИДЕРЫ ПО ДИСЦИПЛИНАМ</span>
        </div>
        {leadersByDiscipline.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2230' }}>
                {['Дисциплина', 'Лидер', 'Результат', 'Прогресс'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leadersByDiscipline.map((l, i) => (
                <tr key={l.discipline} style={{ borderBottom: i < leadersByDiscipline.length - 1 ? '1px solid rgba(30,34,48,0.5)' : 'none' }}>
                  <td style={{ padding: '12px 16px', color: '#f0f2f5', fontWeight: 500 }}>{l.discipline}</td>
                  <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{l.athlete.nameShort || l.athlete.name}</td>
                  <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: LIME, fontSize: 15 }}>
                    {l.result}<span style={{ fontSize: 11, color: '#6b7280', marginLeft: 4 }}>{l.unit}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ height: 4, background: '#1e2230', borderRadius: 2, maxWidth: 120 }}>
                      <div style={{ height: '100%', width: `${l.marginPercent}%`, background: LIME, borderRadius: 2 }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyBlock text="Нет данных для рейтинга по дисциплинам" />
        )}
      </div>

      {/* Overall ranking table */}
      <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2230' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em' }}>РЕЙТИНГ ПО ОЧКАМ МНОГОБОРЬЯ</span>
        </div>
        {scored.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2230' }}>
                {['Спортсмен', 'Многоборье', 'Очки', 'Прогресс'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scored.map((s, i) => (
                <tr key={s.athlete.id} style={{ borderBottom: i < scored.length - 1 ? '1px solid rgba(30,34,48,0.5)' : 'none' }}>
                  <td style={{ padding: '12px 16px', color: '#f0f2f5', fontWeight: 500 }}>{s.athlete.name}</td>
                  <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{s.athlete.gender === 'F' ? 'Семиборье' : 'Десятиборье'}</td>
                  <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: LIME, fontSize: 15 }}>{s.pts.toLocaleString('ru')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ height: 4, background: '#1e2230', borderRadius: 2, maxWidth: 120 }}>
                      <div style={{ height: '100%', width: `${scored[0] ? Math.round((s.pts / scored[0].pts) * 100) : 0}%`, background: LIME, borderRadius: 2 }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyBlock text="Пока нет данных для рейтинга — внесите результаты по дисциплинам многоборья" />
        )}
      </div>
    </div>
  )
}