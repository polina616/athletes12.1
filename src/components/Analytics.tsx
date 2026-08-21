import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAthletes } from '../contexts/Athletescontext'
import { athleteTotalPoints, resultsByMonth } from '../lib/Scoring'

const LIME = '#c6f135'

function EmptyBlock({ text }: { text: string }) {
  return (
    <div style={{ padding: '40px 12px', textAlign: 'center', color: '#4b5563', fontSize: 13 }}>
      {text}
    </div>
  )
}

export default function Analytics() {
  const { athletes, results, loading } = useAthletes()

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
    { l: 'Лучший результат', v: best ? best.pts.toLocaleString('ru') : '—', sub: best ? (best.athlete.nameShort || best.athlete.name) : 'нет данных', color: '#a78bfa' },
    { l: 'Результатов внесено', v: String(results.length), sub: 'с начала сезона', color: '#60a5fa' },
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
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={activity}>
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: '#141720', border: '1px solid #1e2230', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" name="Результатов" fill={LIME} fillOpacity={0.7} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyBlock text="Пока нет внесённых результатов" />
        )}
      </div>

      {/* Volume by discipline */}
      <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '20px', backdropFilter: 'blur(12px)', marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 16 }}>РЕЗУЛЬТАТЫ ПО ДИСЦИПЛИНАМ</div>
        {disciplineVolume.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={disciplineVolume} layout="vertical" margin={{ left: 24 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="discipline" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
              <Tooltip contentStyle={{ background: '#141720', border: '1px solid #1e2230', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" name="Результатов" fill="#a78bfa" fillOpacity={0.75} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyBlock text="Нет данных по дисциплинам" />
        )}
      </div>

      {/* Leaders table */}
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