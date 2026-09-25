import { useState, useEffect } from 'react'
import { IconPlus, IconChevron, IconTrash } from './Icons'
import { useAthletes } from '../contexts/Athletescontext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import DateInput from './DateInput'

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filterAthlete, setFilterAthlete] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

      const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'Скоростно-силовая',
    duration: 90,
    intensity: 'medium' as 'low' | 'medium' | 'high' | 'max',
    goal: '',
    notes: '',
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
    if (athletes.length === 0) {
      alert('Сначала добавьте спортсменов в разделе «Спортсмены»')
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
      athlete_ids: athletes.map(a => a.id),
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
    })
    fetchTrainings()
  }

  const toggleAttendance = async (trainingId: string, athleteId: string) => {
    const training = trainings.find(t => t.id === trainingId)
    if (!training) return
    const newAttended = training.attended_ids.includes(athleteId)
      ? training.attended_ids.filter(id => id !== athleteId)
      : [...training.attended_ids, athleteId]

    // Оптимистично обновляем UI сразу, чтобы чек-лист посещаемости реагировал мгновенно
    setTrainings(prev => prev.map(t => t.id === trainingId ? { ...t, attended_ids: newAttended } : t))

    const { error } = await supabase
      .from('trainings')
      .update({ attended_ids: newAttended })
      .eq('id', trainingId)

    if (error) {
      alert('Ошибка обновления посещаемости: ' + error.message)
      // откатываем на прежнее состояние, если запись не удалась
      setTrainings(prev => prev.map(t => t.id === trainingId ? training : t))
    }
  }

  const markAllPresent = async (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId)
    if (!training) return
    const newAttended = [...training.athlete_ids]
    setTrainings(prev => prev.map(t => t.id === trainingId ? { ...t, attended_ids: newAttended } : t))
    const { error } = await supabase.from('trainings').update({ attended_ids: newAttended }).eq('id', trainingId)
    if (error) {
      alert('Ошибка обновления посещаемости: ' + error.message)
      setTrainings(prev => prev.map(t => t.id === trainingId ? training : t))
    }
  }

  const clearAllPresent = async (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId)
    if (!training) return
    setTrainings(prev => prev.map(t => t.id === trainingId ? { ...t, attended_ids: [] } : t))
    const { error } = await supabase.from('trainings').update({ attended_ids: [] }).eq('id', trainingId)
    if (error) {
      alert('Ошибка обновления посещаемости: ' + error.message)
      setTrainings(prev => prev.map(t => t.id === trainingId ? training : t))
    }
  }
const deleteTraining = async (trainingId: string) => {
  if (!confirm('Удалить эту тренировку? Данные о посещаемости будут потеряны.')) return
  const prev = trainings
  // Оптимистично убираем из UI сразу
  setTrainings(p => p.filter(t => t.id !== trainingId))
  if (selectedTraining === trainingId) setSelectedTraining(null)

  const { error } = await supabase.from('trainings').delete().eq('id', trainingId)
  if (error) {
    alert('Ошибка удаления: ' + error.message)
    setTrainings(prev) // откатываем при ошибке
  }
}
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (firstDay + 6) % 7

  const monthTrainings = trainings.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const totalHours = Math.round(monthTrainings.reduce((s, t) => s + t.duration, 0) / 60)
  const avgAttendance = monthTrainings.length > 0
    ? Math.round(monthTrainings.reduce((s, t) => s + (t.attended_ids.length / Math.max(1, t.athlete_ids.length) * 100), 0) / monthTrainings.length)
    : 0
    const trainingTypes = ['Скоростно-силовая', 'Техническая', 'Прыжковая', 'Метания', 'ОФП', 'Восстановительная']

  const filteredTrainings = trainings.filter(t => {
    const matchesAthlete = filterAthlete === 'all' || t.athlete_ids.includes(filterAthlete)
    const matchesType = filterType === 'all' || t.type === filterType
    return matchesAthlete && matchesType
  })  

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,17,23,0.8)',
    border: '1px solid #1e2230',
    borderRadius: 12,
    backdropFilter: 'blur(12px)',
  }
  const handleDayClick = (dateStr: string, dayTrainings: Training[]) => {
    if (dayTrainings.length === 0) return
    if (dayTrainings.length === 1) {
      // Одна тренировка в этот день — сразу открываем её в журнале
      setSelectedDate(null)
      setSelectedTraining(prev => prev === dayTrainings[0].id ? null : dayTrainings[0].id)
    } else {
      // Несколько тренировок — показываем список для выбора
      setSelectedTraining(null)
      setSelectedDate(prev => prev === dateStr ? null : dateStr)
    }
  }
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* ===== Журнал тренировок (основная область, на месте бывшего календаря) ===== */}
        <div style={{ ...panelStyle, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2230', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em' }}>
              ЖУРНАЛ ТРЕНИРОВОК
              {filteredTrainings.length !== trainings.length && (
                <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 400, marginLeft: 8, letterSpacing: 0 }}>
                  {filteredTrainings.length} из {trainings.length}
                </span>
              )}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={filterAthlete}
                onChange={e => setFilterAthlete(e.target.value)}
                style={{ padding: '6px 10px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5', fontSize: 12, maxWidth: 160 }}
              >
                <option value="all">Все спортсмены</option>
                {athletes.map(a => (
                  <option key={a.id} value={a.id}>{a.nameShort || a.name}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{ padding: '6px 10px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5', fontSize: 12, maxWidth: 160 }}
              >
                <option value="all">Все типы</option>
                {trainingTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {(filterAthlete !== 'all' || filterType !== 'all') && (
                <button
                  onClick={() => { setFilterAthlete('all'); setFilterType('all') }}
                  style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #1e2230', borderRadius: 6, color: '#6b7280', fontSize: 12, cursor: 'pointer' }}
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>

                    {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>
          ) : trainings.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              У вас пока нет тренировок. Нажмите «Добавить тренировку», чтобы создать первую.
            </div>
          ) : filteredTrainings.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              По выбранным фильтрам тренировок не найдено.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e2230' }}>
                  {['', 'Дата', 'Тип', 'Длит.', 'Интенс.', 'Спортсменов', 'Посещаемость', 'Цель'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTrainings.map((t, i) => {
                  const isOpen = selectedTraining === t.id
                  return (
                    <>
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTraining(isOpen ? null : t.id)}
                        style={{
                          borderBottom: isOpen ? 'none' : (i < filteredTrainings.length - 1 ? '1px solid rgba(30,34,48,0.5)' : 'none'),
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          background: isOpen ? 'rgba(198,241,53,0.04)' : 'transparent',
                        }}
                        onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <td style={{ padding: '12px 4px 12px 12px', color: '#6b7280', width: 20 }}>
                          <span style={{ display: 'inline-flex', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                            <IconChevron dir="right" />
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#9ca3af', fontSize: 12, whiteSpace: 'nowrap' }}>{t.date}</td>
                        <td style={{ padding: '12px', color: '#f0f2f5', fontWeight: 500 }}>{t.type}</td>
                        <td style={{ padding: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{t.duration} мин</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 600,
                            background: `${intensityColors[t.intensity]}18`,
                            color: intensityColors[t.intensity],
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                          }}>{intensityLabels[t.intensity]}</span>
                        </td>
                        <td style={{ padding: '12px', color: '#9ca3af' }}>{t.athlete_ids.length}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 4, background: '#1e2230', borderRadius: 2, maxWidth: 80 }}>
                              <div style={{
                                height: '100%',
                                width: `${t.athlete_ids.length > 0 ? (t.attended_ids.length / t.athlete_ids.length) * 100 : 0}%`,
                                background: LIME, borderRadius: 2,
                              }} />
                            </div>
                            <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>
                              {t.attended_ids.length}/{t.athlete_ids.length}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.goal}</td>
                      </tr>

                      {isOpen && (
  <tr style={{ borderBottom: i < filteredTrainings.length - 1 ? '1px solid rgba(30,34,48,0.5)' : 'none' }}>
    <td colSpan={8} style={{ padding: '0 16px 20px 40px', background: 'rgba(198,241,53,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, marginBottom: -4 }}>
        <button
          onClick={(e) => { e.stopPropagation(); deleteTraining(t.id) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', background: 'transparent',
            border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6,
            color: '#f87171', fontSize: 11, cursor: 'pointer',
          }}
        >
          <IconTrash /> Удалить тренировку
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 4 }}>
                             
                              <div>
                                <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Цель</div>
                                <div style={{ fontSize: 13, color: '#d1d5db', marginBottom: 12, padding: '10px', background: 'rgba(20,23,32,0.5)', borderRadius: 6 }}>
                                  {t.goal || '—'}
                                </div>
                                {t.notes && (
                                  <>
                                    <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Заметки</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', padding: '8px 10px', borderLeft: `2px solid ${LIME}` }}>
                                      {t.notes}
                                    </div>
                                  </>
                                )}
                              </div>

                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Посещаемость ({t.attended_ids.length}/{t.athlete_ids.length})
                                  </span>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                      onClick={() => markAllPresent(t.id)}
                                      style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(198,241,53,0.08)', border: '1px solid rgba(198,241,53,0.2)', color: LIME, cursor: 'pointer', fontWeight: 600 }}
                                    >
                                      Все были
                                    </button>
                                    <button
                                      onClick={() => clearAllPresent(t.id)}
                                      style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'transparent', border: '1px solid #1e2230', color: '#6b7280', cursor: 'pointer' }}
                                    >
                                      Сбросить
                                    </button>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                                  {t.athlete_ids.length === 0 && (
                                    <div style={{ color: '#6b7280', fontSize: 12 }}>К тренировке не привязаны спортсмены</div>
                                  )}
                                  {t.athlete_ids.map(id => {
                                    const a = athletes.find(x => x.id === id)
                                    const attended = t.attended_ids.includes(id)
                                    return (
                                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(20,23,32,0.5)', borderRadius: 6 }}>
                                        <span style={{ fontSize: 12, color: '#d1d5db' }}>{a?.nameShort || a?.name || '—'}</span>
                                        <button
                                          onClick={() => toggleAttendance(t.id, id)}
                                          style={{
                                            fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 700,
                                            background: attended ? 'rgba(198,241,53,0.12)' : 'rgba(248,113,113,0.1)',
                                            color: attended ? LIME : '#f87171',
                                            border: 'none',
                                            cursor: 'pointer',
                                            minWidth: 92,
                                          }}
                                        >{attended ? '✓ Был' : 'Отсутствовал'}</button>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ===== Правая колонка: компактный календарь + статистика ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Компактный календарь */}
                    {/* Компактный календарь */}
          <div style={{ ...panelStyle, padding: '14px 14px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <button
                onClick={() => { setMonth(m => Math.max(0, m - 1)); setSelectedDate(null) }}
                style={{ background: 'rgba(20,23,32,0.8)', border: '1px solid #1e2230', borderRadius: 5, padding: '3px 8px', color: '#9ca3af', cursor: 'pointer', fontFamily: "'Inter'", fontSize: 12 }}
              >←</button>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em' }}>
                {months[month].toUpperCase()} {year}
              </div>
              <button
                onClick={() => { setMonth(m => Math.min(11, m + 1)); setSelectedDate(null) }}
                style={{ background: 'rgba(20,23,32,0.8)', border: '1px solid #1e2230', borderRadius: 5, padding: '3px 8px', color: '#9ca3af', cursor: 'pointer', fontFamily: "'Inter'", fontSize: 12 }}
              >→</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
              {daysOfWeek.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 9, color: '#6b7280', textTransform: 'uppercase', padding: '2px' }}>
                  {d[0]}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayTrainings = trainings.filter(t => t.date === dateStr)
                const hasTraining = dayTrainings.length > 0
                const isDateSelected = selectedDate === dateStr
                const isSingleSelected = dayTrainings.length === 1 && selectedTraining === dayTrainings[0].id

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(dateStr, dayTrainings)}
                    title={hasTraining ? dayTrainings.map(t => `${t.type} · ${intensityLabels[t.intensity]}`).join('\n') : undefined}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      borderRadius: 5,
                      background: (isDateSelected || isSingleSelected) ? 'rgba(198,241,53,0.12)' : 'transparent',
                      border: `1px solid ${(isDateSelected || isSingleSelected) ? 'rgba(198,241,53,0.5)' : '#1e2230'}`,
                      cursor: hasTraining ? 'pointer' : 'default',
                      transition: 'all 0.15s',
                      padding: '2px',
                    }}
                  >
                    <span style={{
                      fontSize: 11,
                      fontWeight: hasTraining ? 700 : 400,
                      color: hasTraining ? '#f0f2f5' : '#4b5563',
                      fontFamily: "'JetBrains Mono', monospace",
                      lineHeight: 1,
                    }}>
                      {day}
                    </span>
                    {hasTraining && (
                      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '100%' }}>
                        {dayTrainings.slice(0, 4).map(t => (
                          <span
                            key={t.id}
                            style={{
                              width: 4, height: 4, borderRadius: '50%',
                              background: intensityColors[t.intensity],
                              flexShrink: 0,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Список тренировок выбранного дня, если их несколько */}
            {selectedDate && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #1e2230', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                  {new Date(selectedDate).toLocaleDateString('ru-RU')} · {trainings.filter(t => t.date === selectedDate).length} тренировки
                </div>
                {trainings.filter(t => t.date === selectedDate).map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTraining(prev => prev === t.id ? null : t.id); setSelectedDate(null) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 8px', borderRadius: 6, textAlign: 'left',
                      background: selectedTraining === t.id ? 'rgba(198,241,53,0.08)' : 'rgba(20,23,32,0.6)',
                      border: `1px solid ${selectedTraining === t.id ? 'rgba(198,241,53,0.25)' : '#1e2230'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: intensityColors[t.intensity], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#f0f2f5', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.type}</span>
                    <span style={{ fontSize: 10, color: '#6b7280' }}>{t.duration}м</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Статистика месяца */}
          <div style={{ ...panelStyle, padding: '20px' }}>
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
                <DateInput value={form.date} onChange={v => setForm({ ...form, date: v })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
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

                        <div style={{
              marginBottom: 20, padding: '10px 14px', borderRadius: 8,
              background: athletes.length === 0 ? 'rgba(248,113,113,0.08)' : 'rgba(198,241,53,0.06)',
              border: `1px solid ${athletes.length === 0 ? 'rgba(248,113,113,0.2)' : 'rgba(198,241,53,0.15)'}`,
              fontSize: 12,
              color: athletes.length === 0 ? '#f87171' : '#9ca3af',
            }}>
              {athletes.length === 0
                ? 'Сначала добавьте спортсменов в разделе «Спортсмены»'
                : `В тренировку будут включены все спортсмены (${athletes.length}). Отметить, кто присутствовал, можно будет в журнале тренировок.`}
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
