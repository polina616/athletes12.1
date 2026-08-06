import { useState } from 'react'
import { trainings, athletes } from '../data/mockData'

const LIME = '#c6f135'

const intensityColors: Record<string, string> = {
  low: '#60a5fa',
  medium: '#fbbf24',
  high: '#f97316',
  max: '#f87171',
}
const intensityLabels: Record<string, string> = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
  max: 'Макс',
}

const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

export default function Training() {
  const [month, setMonth] = useState(9) // October index
  const [year] = useState(2024)
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (firstDay + 6) % 7

  const selected = trainings.find(t => t.id === selectedTraining)

  return (
    <div style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', margin: 0, letterSpacing: '0.01em' }}>
            ТРЕНИРОВКИ
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>{trainings.length} тренировок · 88% средняя посещаемость</p>
        </div>
        <button style={{
          padding: '10px 18px',
          background: LIME,
          border: 'none',
          borderRadius: 8,
          color: '#080a0f',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: '0 0 16px rgba(198,241,53,0.2)',
        }}>+ Добавить тренировку</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Calendar */}
        <div style={{
          background: 'rgba(15,17,23,0.8)',
          border: '1px solid #1e2230',
          borderRadius: 12,
          padding: '20px',
          backdropFilter: 'blur(12px)',
        }}>
          {/* Month nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button
              onClick={() => setMonth(m => Math.max(0, m - 1))}
              style={{ background: 'rgba(20,23,32,0.8)', border: '1px solid #1e2230', borderRadius: 6, padding: '6px 12px', color: '#9ca3af', cursor: 'pointer', fontFamily: "'Inter'" }}
            >←</button>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em' }}>
              {months[month].toUpperCase()} {year}
            </div>
            <button
              onClick={() => setMonth(m => Math.min(11, m + 1))}
              style={{ background: 'rgba(20,23,32,0.8)', border: '1px solid #1e2230', borderRadius: 6, padding: '6px 12px', color: '#9ca3af', cursor: 'pointer', fontFamily: "'Inter'" }}
            >→</button>
          </div>

          {/* Days of week header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {daysOfWeek.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayTrainings = trainings.filter(t => t.date === dateStr)
              const hasTraining = dayTrainings.length > 0
              const t = dayTrainings[0]

              return (
                <div
                  key={day}
                  onClick={() => hasTraining && setSelectedTraining(t.id)}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    background: hasTraining ? `${intensityColors[t.intensity]}15` : 'transparent',
                    border: `1px solid ${hasTraining ? `${intensityColors[t.intensity]}40` : '#1e2230'}`,
                    cursor: hasTraining ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                    position: 'relative',
                    padding: '4px',
                  }}
                >
                  <span style={{
                    fontSize: 13,
                    fontWeight: hasTraining ? 700 : 400,
                    color: hasTraining ? '#f0f2f5' : '#4b5563',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{day}</span>
                  {hasTraining && (
                    <div style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: intensityColors[t.intensity],
                      marginTop: 2,
                    }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: '1px solid #1e2230' }}>
            {Object.entries(intensityColors).map(([key, color]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 11, color: '#6b7280' }}>{intensityLabels[key]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Selected training detail */}
          {selected ? (
            <div style={{
              background: 'rgba(15,17,23,0.8)',
              border: '1px solid #1e2230',
              borderRadius: 12,
              padding: '20px',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#f0f2f5', marginBottom: 2 }}>{selected.type}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{selected.date} · {selected.duration} мин</div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                  background: `${intensityColors[selected.intensity]}18`,
                  color: intensityColors[selected.intensity],
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{intensityLabels[selected.intensity]}</span>
              </div>

              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14, padding: '10px', background: 'rgba(20,23,32,0.5)', borderRadius: 6 }}>
                <strong style={{ color: '#6b7280' }}>Цель:</strong> {selected.goal}
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Посещаемость</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.athletes.map(id => {
                    const a = athletes.find(x => x.id === id)
                    const attended = selected.attended.includes(id)
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(20,23,32,0.5)', borderRadius: 6 }}>
                        <span style={{ fontSize: 12, color: '#d1d5db' }}>{a?.name}</span>
                        <span style={{
                          fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 700,
                          background: attended ? 'rgba(198,241,53,0.12)' : 'rgba(248,113,113,0.1)',
                          color: attended ? LIME : '#f87171',
                        }}>{attended ? 'Был' : 'Отсутствовал'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {selected.notes && (
                <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', padding: '8px 10px', borderLeft: `2px solid ${LIME}`, paddingLeft: 12 }}>
                  {selected.notes}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: 'rgba(15,17,23,0.6)',
              border: '1px dashed #1e2230',
              borderRadius: 12,
              padding: '30px 20px',
              textAlign: 'center',
              color: '#4b5563',
              fontSize: 13,
            }}>
              Выберите тренировку на календаре
            </div>
          )}

          {/* Stats */}
          <div style={{
            background: 'rgba(15,17,23,0.8)',
            border: '1px solid #1e2230',
            borderRadius: 12,
            padding: '20px',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 14 }}>
              СТАТИСТИКА МЕСЯЦА
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { l: 'Тренировок', v: trainings.length },
                { l: 'Часов', v: Math.round(trainings.reduce((s, t) => s + t.duration, 0) / 60) },
                { l: 'Посещаемость', v: '88%' },
                { l: 'Высок. нагр.', v: trainings.filter(t => t.intensity === 'high' || t.intensity === 'max').length },
              ].map(s => (
                <div key={s.l} style={{ padding: '10px', background: 'rgba(20,23,32,0.5)', borderRadius: 7, textAlign: 'center' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: LIME }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Training list */}
      <div style={{
        marginTop: 20,
        background: 'rgba(15,17,23,0.8)',
        border: '1px solid #1e2230',
        borderRadius: 12,
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2230' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em' }}>ЖУРНАЛ ТРЕНИРОВОК</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2230' }}>
              {['Дата', 'Тип', 'Длительность', 'Интенсивность', 'Спортсменов', 'Посещаемость', 'Цель'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trainings.map((t, i) => (
              <tr
                key={t.id}
                onClick={() => setSelectedTraining(t.id)}
                style={{
                  borderBottom: i < trainings.length - 1 ? '1px solid rgba(30,34,48,0.5)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", color: '#9ca3af', fontSize: 12 }}>{t.date}</td>
                <td style={{ padding: '12px 16px', color: '#f0f2f5', fontWeight: 500 }}>{t.type}</td>
                <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{t.duration} мин</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 600,
                    background: `${intensityColors[t.intensity]}18`,
                    color: intensityColors[t.intensity],
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>{intensityLabels[t.intensity]}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{t.athletes.length}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: '#1e2230', borderRadius: 2, maxWidth: 80 }}>
                      <div style={{
                        height: '100%',
                        width: `${(t.attended.length / t.athletes.length) * 100}%`,
                        background: LIME, borderRadius: 2,
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>
                      {t.attended.length}/{t.athletes.length}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.goal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
