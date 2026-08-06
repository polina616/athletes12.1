import { useState } from 'react'
import { athletes, results, decathlonEvents, heptathlonEvents, calcDecathlonPoints, type Athlete } from '../data/mockData'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, AreaChart, Area,
} from 'recharts'
import { IconChevron, IconTrend, IconPlus } from './Icons'

const LIME = '#c6f135'

const tabs = ['Обзор', 'Результаты', 'Медицина', 'Многоборье', 'Аналитика'] as const
type Tab = typeof tabs[number]

function StatBadge({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: 'rgba(20,23,32,0.8)',
      border: '1px solid #1e2230',
      borderRadius: 8,
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: '#f0f2f5' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function ResultsTab({ athlete }: { athlete: Athlete }) {
  const athleteResults = results.filter(r => r.athleteId === athlete.id)
  const disciplines = [...new Set(athleteResults.map(r => r.discipline))]
  const [selectedDisc, setSelectedDisc] = useState(disciplines[0] || '')

  const discResults = athleteResults
    .filter(r => r.discipline === selectedDisc)
    .sort((a, b) => a.date.localeCompare(b.date))

  const chartData = discResults.map(r => ({
    date: r.date.slice(5),
    val: r.resultValue,
    label: r.result,
  }))

  const best = discResults.reduce((b, r) => {
    if (!b) return r
    const unit = r.unit
    if (unit === 's') return r.resultValue < b.resultValue ? r : b
    return r.resultValue > b.resultValue ? r : b
  }, discResults[0])

  return (
    <div>
      {/* Discipline selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {disciplines.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDisc(d)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid',
              borderColor: selectedDisc === d ? LIME : '#1e2230',
              background: selectedDisc === d ? 'rgba(198,241,53,0.1)' : 'transparent',
              color: selectedDisc === d ? LIME : '#9ca3af',
              fontSize: 12,
              fontWeight: selectedDisc === d ? 600 : 400,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.15s',
            }}
          >{d}</button>
        ))}
      </div>

      {discResults.length > 0 ? (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <StatBadge label="Лучший результат" value={best?.result || '-'} sub={best?.unit} />
            <StatBadge label="Результатов" value={String(discResults.length)} />
            <StatBadge label="Последний" value={discResults[discResults.length - 1]?.result || '-'} sub={discResults[discResults.length - 1]?.date} />
            <StatBadge
              label="Улучшение"
              value={(() => {
                if (discResults.length < 2) return '—'
                const first = discResults[0].resultValue
                const last = discResults[discResults.length - 1].resultValue
                const isTrack = discResults[0].unit === 's'
                const delta = isTrack ? ((first - last) / first * 100) : ((last - first) / first * 100)
                return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`
              })()}
            />
          </div>

          {/* Chart */}
          <div style={{
            background: 'rgba(20,23,32,0.6)',
            border: '1px solid #1e2230',
            borderRadius: 10,
            padding: '16px',
            marginBottom: 20,
          }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={LIME} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={LIME} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#6b7280', fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={{ background: '#141720', border: '1px solid #1e2230', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [v, selectedDisc]}
                />
                <Area type="monotone" dataKey="val" stroke={LIME} strokeWidth={2} fill="url(#area)" dot={{ fill: LIME, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div style={{ background: 'rgba(20,23,32,0.5)', borderRadius: 10, overflow: 'hidden', border: '1px solid #1e2230' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e2230' }}>
                  {['Дата', 'Результат', 'Место', 'Тип', 'Ветер', 'Комментарий'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {discResults.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < discResults.length - 1 ? '1px solid rgba(30,34,48,0.5)' : 'none' }}>
                    <td style={{ padding: '10px 14px', color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>{r.date}</td>
                    <td style={{ padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: r.id === best?.id ? LIME : '#f0f2f5' }}>
                      {r.result} {r.unit}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#9ca3af' }}>{r.location}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600,
                        background: r.type === 'competition' ? 'rgba(167,139,250,0.15)' : 'rgba(96,165,250,0.1)',
                        color: r.type === 'competition' ? '#a78bfa' : '#60a5fa',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>{r.type === 'competition' ? 'Соревн' : 'Тест'}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#6b7280', fontFamily: "'JetBrains Mono'" }}>
                      {r.wind !== undefined ? `${r.wind > 0 ? '+' : ''}${r.wind}` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#6b7280' }}>{r.comment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>Результатов не найдено</div>
      )}
    </div>
  )
}

function DecathlonTab({ athlete }: { athlete: Athlete }) {
  const events = athlete.gender === 'F' ? heptathlonEvents : decathlonEvents
  const name = athlete.gender === 'F' ? 'Семиборье' : 'Десятиборье'

  const athleteResults = results.filter(r => r.athleteId === athlete.id)

  const eventsWithScores = events.map(ev => {
    const disc = ev.name
    const evResults = athleteResults.filter(r => r.discipline === disc)
    const best = evResults.reduce((b, r) => {
      if (!b) return r
      return ev.type === 'track' ? (r.resultValue < b.resultValue ? r : b) : (r.resultValue > b.resultValue ? r : b)
    }, evResults[0])

    const resultVal = best?.resultValue || 0
    const pts = resultVal > 0 ? calcDecathlonPoints(ev, resultVal) : 0
    return { ...ev, resultVal, result: best?.result || '—', pts }
  })

  const totalPts = eventsWithScores.reduce((s, e) => s + e.pts, 0)
  const maxPts = eventsWithScores.length * 1000
  const bestEvent = eventsWithScores.reduce((b, e) => e.pts > b.pts ? e : b, eventsWithScores[0])
  const worstEvent = eventsWithScores.filter(e => e.pts > 0).reduce((b, e) => e.pts < b.pts ? e : b, eventsWithScores[0])

  const radarData = eventsWithScores.map(e => ({
    event: e.name.replace('Прыжок ', '').replace('Метание ', '').replace(' м', 'м'),
    pts: e.pts,
  }))

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            {name} — текущий результат
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 52, fontWeight: 900, color: LIME, lineHeight: 1 }}>
              {totalPts.toLocaleString('ru')}
            </span>
            <span style={{ fontSize: 16, color: '#6b7280' }}>очков</span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
            <div style={{ fontSize: 12 }}>
              <span style={{ color: '#6b7280' }}>Лучшая: </span>
              <span style={{ color: LIME, fontWeight: 600 }}>{bestEvent.name}</span>
              <span style={{ color: '#6b7280' }}> ({bestEvent.pts} pts)</span>
            </div>
            <div style={{ fontSize: 12 }}>
              <span style={{ color: '#6b7280' }}>Слабая: </span>
              <span style={{ color: '#f87171', fontWeight: 600 }}>{worstEvent?.name || '—'}</span>
              <span style={{ color: '#6b7280' }}> ({worstEvent?.pts || 0} pts)</span>
            </div>
          </div>
        </div>
        {/* Radar */}
        <div style={{ width: 220 }}>
          <ResponsiveContainer width={220} height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e2230" />
              <PolarAngleAxis dataKey="event" tick={{ fill: '#6b7280', fontSize: 9 }} />
              <Radar dataKey="pts" stroke={LIME} fill={LIME} fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events table */}
      <div style={{ background: 'rgba(20,23,32,0.5)', borderRadius: 10, overflow: 'hidden', border: '1px solid #1e2230' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2230' }}>
              {['Дисциплина', 'Результат', 'Очки', 'Доля', 'Прогресс'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eventsWithScores.map((ev, i) => {
              const pct = totalPts > 0 ? (ev.pts / totalPts * 100) : 0
              return (
                <tr key={ev.id} style={{ borderBottom: i < eventsWithScores.length - 1 ? '1px solid rgba(30,34,48,0.5)' : 'none' }}>
                  <td style={{ padding: '12px 16px', color: '#f0f2f5', fontWeight: 500 }}>{ev.name}</td>
                  <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", color: '#9ca3af' }}>{ev.result} {ev.result !== '—' ? ev.unit : ''}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      fontSize: 15,
                      color: ev.pts >= 900 ? LIME : ev.pts >= 700 ? '#fbbf24' : ev.pts > 0 ? '#f87171' : '#4b5563',
                    }}>{ev.pts > 0 ? ev.pts : '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>{ev.pts > 0 ? `${pct.toFixed(1)}%` : '—'}</td>
                  <td style={{ padding: '12px 16px', width: 120 }}>
                    <div style={{ height: 4, background: '#1e2230', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, ev.pts / 10)}%`,
                        background: ev.pts >= 900 ? LIME : ev.pts >= 700 ? '#fbbf24' : '#f87171',
                        borderRadius: 2,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid #2a3040' }}>
              <td colSpan={2} style={{ padding: '12px 16px', color: '#9ca3af', fontWeight: 600 }}>Итого</td>
              <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: LIME }}>{totalPts.toLocaleString('ru')}</td>
              <td colSpan={2} style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>из ~{maxPts.toLocaleString('ru')} возможных</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default function AthleteProfile({ athleteId, onBack }: { athleteId: string; onBack: () => void }) {
  const athlete = athletes.find(a => a.id === athleteId)!
  const [tab, setTab] = useState<Tab>('Обзор')

  if (!athlete) return null

  return (
    <div style={{ animation: 'fadeIn 0.3s ease forwards' }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', color: '#6b7280',
          cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0,
          fontFamily: "'Inter', sans-serif",
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f0f2f5'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#6b7280'}
      >
        <IconChevron dir="left" /> Назад к списку
      </button>

      {/* Header */}
      <div style={{
        background: 'rgba(15,17,23,0.8)',
        border: '1px solid #1e2230',
        borderRadius: 14,
        padding: '24px',
        marginBottom: 20,
        backdropFilter: 'blur(12px)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 24,
        alignItems: 'start',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${LIME}, transparent)`,
        }} />

        {/* Photo */}
        <div style={{
          width: 88,
          height: 88,
          borderRadius: 12,
          overflow: 'hidden',
          border: '2px solid #1e2230',
          flexShrink: 0,
          background: '#141720',
        }}>
          <img src={athlete.photo} alt={athlete.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Name & details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              color: '#f0f2f5',
              margin: 0,
              letterSpacing: '0.01em',
            }}>{athlete.name}</h2>
            <span style={{
              padding: '3px 10px',
              borderRadius: 6,
              background: athlete.status === 'active' ? 'rgba(198,241,53,0.12)' : athlete.status === 'injured' ? 'rgba(248,113,113,0.12)' : 'rgba(107,114,128,0.12)',
              color: athlete.status === 'active' ? LIME : athlete.status === 'injured' ? '#f87171' : '#6b7280',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {athlete.status === 'active' ? 'Активен' : athlete.status === 'injured' ? 'Травма' : 'Неактивен'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Возраст', val: `${athlete.age} лет` },
              { label: 'Разряд', val: athlete.grade },
              { label: 'Группа', val: athlete.group },
              { label: 'Специализация', val: athlete.gender === 'F' ? 'Семиборье' : 'Десятиборье' },
            ].map(f => (
              <div key={f.label}>
                <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}: </span>
                <span style={{ fontSize: 13, color: '#f0f2f5', fontWeight: 500 }}>{f.val}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
            "{athlete.coachComment}"
          </div>
        </div>

        {/* Physical stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, minWidth: 260 }}>
          {[
            { l: 'Рост', v: `${athlete.height} см` },
            { l: 'Вес', v: `${athlete.weight} кг` },
            { l: 'Размах', v: `${athlete.armSpan} см` },
            { l: 'Нога', v: `${athlete.legLength} см` },
            { l: 'Обувь', v: `${athlete.shoeSize} EU` },
            { l: 'С нами', v: athlete.trainingStart.slice(0, 4) },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center', padding: '8px', background: 'rgba(20,23,32,0.5)', borderRadius: 6 }}>
              <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{s.l}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: '#f0f2f5' }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(15,17,23,0.6)', borderRadius: 10, padding: 4, border: '1px solid #1e2230', width: 'fit-content' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 18px',
              borderRadius: 7,
              border: 'none',
              background: tab === t ? 'rgba(198,241,53,0.12)' : 'transparent',
              color: tab === t ? LIME : '#6b7280',
              fontWeight: tab === t ? 600 : 400,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.15s',
              borderBottom: tab === t ? `1.5px solid ${LIME}` : '1.5px solid transparent',
            }}
          >{t}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{
        background: 'rgba(15,17,23,0.8)',
        border: '1px solid #1e2230',
        borderRadius: 12,
        padding: '24px',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.25s ease',
      }}>
        {tab === 'Обзор' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', margin: '0 0 14px', textTransform: 'uppercase' }}>Контакты</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Телефон', value: athlete.phone },
                  { label: 'Родители', value: athlete.parents },
                  { label: 'Тел. родителей', value: athlete.parentPhone },
                  { label: 'Дата рождения', value: athlete.birthDate },
                  { label: 'Аллергии', value: athlete.allergies },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#6b7280', minWidth: 130 }}>{f.label}</span>
                    <span style={{ fontSize: 12, color: '#d1d5db' }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', margin: '0 0 14px', textTransform: 'uppercase' }}>Цели</h3>
              <div style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.7, padding: '12px 14px', background: 'rgba(20,23,32,0.5)', borderRadius: 8, border: '1px solid #1e2230' }}>
                {athlete.goals}
              </div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', margin: '20px 0 14px', textTransform: 'uppercase' }}>Любимая дисциплина</h3>
              <div style={{ fontSize: 14, color: LIME, fontWeight: 600 }}>{athlete.favoriteEvent}</div>
            </div>
          </div>
        )}
        {tab === 'Результаты' && <ResultsTab athlete={athlete} />}
        {tab === 'Медицина' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              <StatBadge label="Статус" value="Допущен" />
              <StatBadge label="Следующий осмотр" value="15.03.2025" />
              <StatBadge label="Травм за сезон" value={athlete.id === 'a5' ? '1' : '0'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', margin: '0 0 12px', textTransform: 'uppercase' }}>Медицинские данные</h3>
                {[
                  { label: 'Мед. ограничения', value: athlete.medicalNotes },
                  { label: 'Аллергии', value: athlete.allergies },
                  { label: 'Дата осмотра', value: '15.12.2024' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#6b7280', minWidth: 140 }}>{f.label}</span>
                    <span style={{ fontSize: 12, color: '#d1d5db' }}>{f.value}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', margin: '0 0 12px', textTransform: 'uppercase' }}>История травм</h3>
                {athlete.id === 'a4' ? (
                  <div style={{ padding: '12px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>Травма плеча</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Сентябрь 2022 — Январь 2023 · Восстановлен</div>
                  </div>
                ) : athlete.id === 'a5' ? (
                  <div style={{ padding: '12px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, color: '#f87171', fontWeight: 600 }}>Растяжение голеностопа</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Октябрь 2024 — в процессе реабилитации</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Травм не зафиксировано</div>
                )}
              </div>
            </div>
          </div>
        )}
        {tab === 'Многоборье' && <DecathlonTab athlete={athlete} />}
        {tab === 'Аналитика' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              <StatBadge label="Тренировок" value={String(results.filter(r => r.athleteId === athlete.id).length)} sub="результатов внесено" />
              <StatBadge label="Лучший месяц" value="Сен 2024" sub="по приросту" />
              <StatBadge label="Прогноз / 6 мес" value="+340" sub="очков десятиборья" />
              <StatBadge label="КМС выполнение" value="87%" sub="вероятность к концу сезона" />
            </div>
            <div style={{ padding: '16px', background: 'rgba(20,23,32,0.5)', border: '1px solid #1e2230', borderRadius: 10 }}>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Прогноз результата
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
                {[{ period: '1 месяц', val: '8 280' }, { period: '3 месяца', val: '8 450' }, { period: '6 месяцев', val: '8 650' }, { period: '1 год', val: '8 900' }].map(p => (
                  <div key={p.period} style={{ textAlign: 'center', padding: '14px', background: 'rgba(198,241,53,0.04)', border: '1px solid rgba(198,241,53,0.1)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>{p.period}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: LIME }}>{p.val}</div>
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>очков</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
