import { useState, useEffect } from 'react'
import { IconPlus } from './Icons'
import { useAthletes } from '../contexts/Athletescontext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

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

interface Training {
  id: string
  date: string
  type: string
  duration: number
  intensity: 'low' | 'medium' | 'high' | 'max'
  goal: string
  athlete_ids: string[]
  attended_ids: string[]
  notes: string
}

export default function Training() {
  const { athletes } = useAthletes()
  const { coachProfile } = useAuth()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year] = useState(new Date().getFullYear())
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'Скоростно-силовая',
    duration: 90,
    intensity: 'medium' as 'low' | 'medium' | 'high' | 'max',
    goal: '',
    notes: '',
    selectedAthletes: [] as string[],
  })

  const fetchTrainings = async () => {
    if (!coachProfile) {
      setTrainings([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('trainings')
      .select('*')
      .eq('coach_id', coachProfile.id)
      .order('date', { ascending: false })
    if (error) {
      console.error('Ошибка загрузки тренировок:', error)
      setTrainings([])
    } else {
      setTrainings((data || []).map(t => ({
        id: t.id,
        date: t.date,
        type: t.type,
        duration: t.duration,
        intensity: t.intensity,
        goal: t.goal || '',
        athlete_ids: t.athlete_ids || [],
        attended_ids: t.attended_ids || [],
        notes: t.notes || '',
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTrainings()
  }, [coachProfile])

  const handleAddTraining = async () => {
    if (!coachProfile) return
    if (!form.goal.trim()) {
      alert('Укажите цель тренировки')
      return
    }
    if (form.selectedAthletes.length === 0) {
      alert('Выберите хотя бы одного спортсмена')
      return
    }
    const { error } = await supabase.from('trainings').insert({
      coach_id: coachProfile.id,
      date: form.date,
      type: form.type,
      duration: form.duration,
      intensity: form.intensity,
      goal: form.goal.trim(),
      notes: form.notes.trim(),
      athlete_ids: form.selectedAthletes,
      attended_ids: [],
    })
    if (error) {
      alert('Ошибка добавления: ' + error.message)
      return
    }
    setShowModal(false)
    setForm({
      date: new Date().toISOString().slice(0, 10),
      type: 'Скоростно-силовая',
      duration: 90,
      intensity: 'medium',
      goal: '',
      notes: '',
      selectedAthletes: [],
    })
    fetchTrainings()
  }

  const toggleAttendance = async (trainingId: string, athleteId: string) => {
    const training = trainings.find(t => t.id === trainingId)
    if (!training) return
    const newAttended = training.attended_ids.includes(athleteId)
      ? training.attended_ids.filter(id => id !== athleteId)
      : [...training.attended_ids, athleteId]

    const { error } = await supabase
      .from('trainings')
      .update({ attended_ids: newAttended })
      .eq('id', trainingId)

    if (error) {
      alert('Ошибка обновления: ' + error.message)
      return
    }
    setTrainings(prev => prev.map(t => t.id === trainingId ? { ...t, attended_ids: newAttended } : t))
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (firstDay + 6) % 7

  const selected = trainings.find(t => t.id === selectedTraining)

  const monthTrainings = trainings.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const totalHours = Math.round(monthTrainings.reduce((s, t) => s + t.duration, 0) / 60)
  const avgAttendance = monthTrainings.length > 0
    ? Math.round(monthTrainings.reduce((s, t) => s + (t.attended_ids.length / Math.max(1, t.athlete_ids.length) * 100), 0) / monthTrainings.length)
    : 0

  return (
    <div style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', margin: 0, letterSpacing: '0.01em' }}>
            ТРЕНИРОВКИ
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
            {trainings.length} тренировок {avgAttendance > 0 ? `· ${avgAttendance}% средняя посещаемость` : ''}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
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
          }}
        >
          <IconPlus /> Добавить тренировку
        </button>
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
                  {selected.athlete_ids.map(id => {
                    const a = athletes.find(x => x.id === id)
                    const attended = selected.attended_ids.includes(id)
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(20,23,32,0.5)', borderRadius: 6 }}>
                        <span style={{ fontSize: 12, color: '#d1d5db' }}>{a?.nameShort || a?.name || '—'}</span>
                        <button
                          onClick={() => toggleAttendance(selected.id, id)}
                          style={{
                            fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 700,
                            background: attended ? 'rgba(198,241,53,0.12)' : 'rgba(248,113,113,0.1)',
                            color: attended ? LIME : '#f87171',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >{attended ? 'Был' : 'Отсутствовал'}</button>
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
                { l: 'Тренировок', v: monthTrainings.length },
                { l: 'Часов', v: totalHours },
                { l: 'Посещаемость', v: `${avgAttendance}%` },
                { l: 'Высок. нагр.', v: monthTrainings.filter(t => t.intensity === 'high' || t.intensity === 'max').length },
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
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>
        ) : trainings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            У вас пока нет тренировок. Нажмите «Добавить тренировку», чтобы создать первую.
          </div>
        ) : (
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
                  <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{t.athlete_ids.length}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: '#1e2230', borderRadius: 2, maxWidth: 80 }}>
                        <div style={{
                          height: '100%',
                          width: `${(t.attended_ids.length / Math.max(1, t.athlete_ids.length)) * 100}%`,
                          background: LIME, borderRadius: 2,
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>
                        {t.attended_ids.length}/{t.athlete_ids.length}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.goal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Модалка добавления тренировки */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: '#141720', border: '1px solid #1e2230', borderRadius: 16,
            padding: '32px', maxWidth: 520, width: '100%', maxHeight: '85vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, color: '#f0f2f5', margin: '0 0 16px' }}>
              Новая тренировка
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Дата *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Тип</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                >
                  {['Скоростно-силовая', 'Техническая', 'Прыжковая', 'Метания', 'ОФП', 'Восстановительная'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Длительность (мин)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                  min={15}
                  max={300}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Интенсивность</label>
                <select
                  value={form.intensity}
                  onChange={e => setForm({ ...form, intensity: e.target.value as any })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                >
                  {Object.entries(intensityLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Цель *</label>
              <input
                value={form.goal}
                onChange={e => setForm({ ...form, goal: e.target.value })}
                placeholder="Например: Развитие стартовой скорости"
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Заметки</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Дополнительные заметки..."
                rows={2}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Спортсмены *</label>
              {athletes.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: 12 }}>Сначала добавьте спортсменов в разделе «Спортсмены»</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                  {athletes.map(a => (
                    <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', background: form.selectedAthletes.includes(a.id) ? 'rgba(198,241,53,0.08)' : 'transparent', border: `1px solid ${form.selectedAthletes.includes(a.id) ? 'rgba(198,241,53,0.2)' : '#1e2230'}` }}>
                      <input
                        type="checkbox"
                        checked={form.selectedAthletes.includes(a.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setForm({ ...form, selectedAthletes: [...form.selectedAthletes, a.id] })
                          } else {
                            setForm({ ...form, selectedAthletes: form.selectedAthletes.filter(id => id !== a.id) })
                          }
                        }}
                        style={{ accentColor: LIME }}
                      />
                      <span style={{ fontSize: 12, color: '#d1d5db' }}>{a.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #1e2230', borderRadius: 6, color: '#9ca3af', cursor: 'pointer' }}>
                Отмена
              </button>
              <button
                onClick={handleAddTraining}
                disabled={athletes.length === 0}
                style={{
                  padding: '8px 16px',
                  background: athletes.length === 0 ? 'rgba(198,241,53,0.3)' : '#c6f135',
                  border: 'none', borderRadius: 6, color: '#080a0f', fontWeight: 600,
                  cursor: athletes.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}