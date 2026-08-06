import { athletes, results, progressData } from '../data/mockData'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ScatterChart, Scatter, CartesianGrid,
  AreaChart, Area,
} from 'recharts'

const LIME = '#c6f135'

const disciplineLeaders = [
  { discipline: '100 м', athlete: 'Д. Волков', result: '10.72с' },
  { discipline: '110 м с/б', athlete: 'А. Петров', result: '13.98с' },
  { discipline: 'Прыжок в длину', athlete: 'А. Петров', result: '7.48м' },
  { discipline: 'Толкание ядра', athlete: 'И. Смирнов', result: '17.65м' },
  { discipline: '200 м', athlete: 'Д. Волков', result: '21.12с' },
]

const teamRadar = [
  { event: 'Спринт', val: 82 },
  { event: 'Прыжки', val: 74 },
  { event: 'Метания', val: 68 },
  { event: 'Выносливость', val: 61 },
  { event: 'Барьеры', val: 78 },
  { event: 'Шест', val: 55 },
]

const volumeData = [
  { month: 'Мар', tests: 8, comp: 2 },
  { month: 'Апр', tests: 12, comp: 3 },
  { month: 'Май', tests: 15, comp: 5 },
  { month: 'Июн', tests: 18, comp: 6 },
  { month: 'Июл', tests: 14, comp: 8 },
  { month: 'Авг', tests: 16, comp: 7 },
  { month: 'Сен', tests: 20, comp: 9 },
]

const heatmapData = [
  { name: 'А. Петров', jan: 82, feb: 85, mar: 84, apr: 87, may: 89, jun: 88, jul: 90, aug: 92, sep: 94 },
  { name: 'Д. Волков', jan: 78, feb: 79, mar: 80, apr: 81, may: 83, jun: 82, jul: 85, aug: 87, sep: 89 },
  { name: 'М. Соколова', jan: 70, feb: 72, mar: 73, apr: 75, may: 76, jun: 78, jul: 80, aug: 82, sep: 84 },
  { name: 'И. Смирнов', jan: 85, feb: 86, mar: 86, apr: 88, may: 90, jun: 89, jul: 91, aug: 93, sep: 95 },
  { name: 'А. Козлова', jan: 68, feb: 70, mar: 71, apr: 72, may: 74, jun: 75, jul: 73, aug: 70, sep: 68 },
  { name: 'П. Новиков', jan: 55, feb: 58, mar: 60, apr: 62, may: 65, jun: 67, jul: 66, aug: 68, sep: 70 },
]
const heatMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep']
const heatMonthLabels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен']

function heatColor(val: number) {
  if (val >= 90) return `rgba(198,241,53,0.85)`
  if (val >= 80) return `rgba(198,241,53,0.55)`
  if (val >= 70) return `rgba(251,191,36,0.55)`
  if (val >= 60) return `rgba(249,115,22,0.55)`
  return `rgba(248,113,113,0.45)`
}

export default function Analytics() {
  return (
    <div style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', margin: 0, letterSpacing: '0.01em' }}>
          АНАЛИТИКА
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Командная статистика · Сезон 2024</p>
      </div>

      {/* Top KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { l: 'Средние очки', v: '7 840', delta: '+4.8%', up: true, color: LIME },
          { l: 'Лучший результат', v: '8 220', sub: 'А. Петров', color: '#a78bfa' },
          { l: 'Тестирований', v: '142', sub: 'с начала сезона', color: '#60a5fa' },
          { l: 'Улучшений', v: '89%', sub: 'от всех тестов', color: '#fbbf24' },
        ].map(k => (
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
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', lineHeight: 1, marginBottom: 4 }}>{k.v}</div>
            <div style={{ fontSize: 12, color: k.delta ? (k.up ? LIME : '#f87171') : '#6b7280' }}>{k.delta || k.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Progress area */}
        <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '20px', backdropFilter: 'blur(12px)' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 16 }}>ПРОГРЕСС КОМАНДЫ</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={LIME} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={LIME} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[7000, 8500]} tick={{ fill: '#6b7280', fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={{ background: '#141720', border: '1px solid #1e2230', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="avg" stroke={LIME} strokeWidth={2} fill="url(#grad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '20px', backdropFilter: 'blur(12px)' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 8 }}>ПРОФИЛЬ КОМАНДЫ</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={teamRadar}>
              <PolarGrid stroke="#1e2230" />
              <PolarAngleAxis dataKey="event" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Radar dataKey="val" stroke={LIME} fill={LIME} fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume bar chart */}
      <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '20px', backdropFilter: 'blur(12px)', marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 16 }}>ОБЪЁМ РЕЗУЛЬТАТОВ</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={volumeData} barGap={4}>
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ background: '#141720', border: '1px solid #1e2230', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="tests" name="Тесты" fill={LIME} fillOpacity={0.7} radius={[3, 3, 0, 0]} />
            <Bar dataKey="comp" name="Соревн." fill="#a78bfa" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: LIME, opacity: 0.7 }} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>Тестирования</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: '#a78bfa', opacity: 0.7 }} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>Соревнования</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '20px', backdropFilter: 'blur(12px)', marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 16 }}>
          ТЕПЛОВАЯ КАРТА РЕЗУЛЬТАТОВ
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ width: 120, padding: '6px 12px', textAlign: 'left', fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Спортсмен</th>
                {heatMonthLabels.map(m => (
                  <th key={m} style={{ padding: '6px 8px', textAlign: 'center', fontSize: 11, color: '#6b7280' }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map(row => (
                <tr key={row.name}>
                  <td style={{ padding: '4px 12px', fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{row.name}</td>
                  {heatMonths.map((m, i) => {
                    const val = row[m as keyof typeof row] as number
                    return (
                      <td key={m} style={{ padding: '4px' }}>
                        <div style={{
                          width: '100%',
                          minWidth: 36,
                          height: 32,
                          background: heatColor(val),
                          borderRadius: 5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: val >= 80 ? '#080a0f' : '#f0f2f5',
                          fontWeight: 600,
                        }}>{val}</div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Шкала:</span>
          {[
            { min: 90, color: 'rgba(198,241,53,0.85)', label: '90+' },
            { min: 80, color: 'rgba(198,241,53,0.55)', label: '80-89' },
            { min: 70, color: 'rgba(251,191,36,0.55)', label: '70-79' },
            { min: 60, color: 'rgba(249,115,22,0.55)', label: '60-69' },
            { min: 0, color: 'rgba(248,113,113,0.45)', label: '<60' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 16, height: 16, background: s.color, borderRadius: 3 }} />
              <span style={{ fontSize: 11, color: '#6b7280' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Discipline leaders */}
      <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2230' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em' }}>ЛИДЕРЫ ПО ДИСЦИПЛИНАМ</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2230' }}>
              {['Дисциплина', 'Лидер', 'Результат', 'Прогресс'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {disciplineLeaders.map((d, i) => (
              <tr key={d.discipline} style={{ borderBottom: i < disciplineLeaders.length - 1 ? '1px solid rgba(30,34,48,0.5)' : 'none' }}>
                <td style={{ padding: '12px 16px', color: '#f0f2f5', fontWeight: 500 }}>{d.discipline}</td>
                <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{d.athlete}</td>
                <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: LIME, fontSize: 15 }}>{d.result}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ height: 4, background: '#1e2230', borderRadius: 2, maxWidth: 120 }}>
                    <div style={{ height: '100%', width: `${60 + i * 8}%`, background: LIME, borderRadius: 2 }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
