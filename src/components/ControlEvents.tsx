import { useState, useEffect } from 'react'
import { IconPlus } from './Icons'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

const LIME = '#c6f135'

interface ControlEvent {
  id: string
  name: string
  date: string
  disciplines: string[]
  createdAt: string
}

const DISCIPLINE_GROUPS = [
  {
    name: 'Метания',
    items: ['Толкание гранаты 300г', 'Толкание гранаты 500г', 'Толкание гранаты 700г', 'Метание меча 150г'],
  },
  {
    name: 'Стрельба',
    items: ['Стрельба из пневматической винтовки'],
  },
  {
    name: 'Бег',
    items: ['Бег 60м', 'Бег 100м', 'Бег 200м', 'Бег 400м', 'Бег 800м', 'Бег 1000м', 'Бег 1500м', 'Бег 2000м', 'Бег 3000м'],
  },
  {
    name: 'Прыжки',
    items: ['Прыжки в длину с места', 'Прыжки в длину с разбега'],
  },
  {
    name: 'Плавание',
    items: ['Плавание 25м', 'Плавание 50м', 'Плавание 100м'],
  },
  {
    name: 'Сила / Гимнастика',
    items: ['Пресс', 'Приседания', 'Подтягивания', 'Отжимания', 'Прыжки на скакалке', 'Бурпи', 'Отжимания на брусьях/лавке'],
  },
]

const ALL_DISCIPLINES = DISCIPLINE_GROUPS.flatMap(g => g.items)

export default function ControlEvents() {
  const { coachProfile } = useAuth()
  const [events, setEvents] = useState<ControlEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: 'День зачет',
    date: '',
    disciplines: [] as string[],
  })

  const fetchEvents = async () => {
    if (!coachProfile) {
      setEvents([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('control_events')
      .select('*')
      .eq('coach_id', coachProfile.id)
      .order('date', { ascending: false })
    if (error) {
      console.error('Ошибка загрузки зачетов:', error)
      setEvents([])
    } else {
      setEvents((data || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        date: e.date || '',
        disciplines: Array.isArray(e.disciplines) ? e.disciplines : [],
        createdAt: e.created_at,
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [coachProfile])

  const openCreate = () => {
    setEditingId(null)
    setForm({ name: 'День зачет', date: new Date().toISOString().slice(0, 10), disciplines: [] })
    setShowModal(true)
  }

  const openEdit = (evt: ControlEvent) => {
    setEditingId(evt.id)
    setForm({ name: evt.name, date: evt.date, disciplines: [...evt.disciplines] })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!coachProfile) return
    if (!form.name.trim()) { alert('Укажите название'); return }

    if (editingId) {
      const { error } = await supabase
        .from('control_events')
        .update({
          name: form.name.trim(),
          date: form.date || null,
          disciplines: form.disciplines,
        })
        .eq('id', editingId)
        .eq('coach_id', coachProfile.id)
      if (error) { alert('Ошибка сохранения: ' + error.message); return }
    } else {
      const { error } = await supabase.from('control_events').insert({
        coach_id: coachProfile.id,
        name: form.name.trim(),
        date: form.date || null,
        disciplines: form.disciplines,
      })
      if (error) { alert('Ошибка создания: ' + error.message); return }
    }

    setShowModal(false)
    setEditingId(null)
    setForm({ name: 'День зачет', date: '', disciplines: [] })
    fetchEvents()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот зачет?')) return
    if (!coachProfile) return
    const { error } = await supabase
      .from('control_events')
      .delete()
      .eq('id', id)
      .eq('coach_id', coachProfile.id)
    if (error) { alert('Ошибка удаления: ' + error.message); return }
    fetchEvents()
  }

  const toggleDiscipline = (d: string) => {
    setForm(prev => ({
      ...prev,
      disciplines: prev.disciplines.includes(d)
        ? prev.disciplines.filter(x => x !== d)
        : [...prev.disciplines, d],
    }))
  }

  const selectAllInGroup = (items: string[]) => {
    setForm(prev => {
      const newDisciplines = new Set(prev.disciplines)
      const allSelected = items.every(d => newDisciplines.has(d))
      if (allSelected) {
        items.forEach(d => newDisciplines.delete(d))
      } else {
        items.forEach(d => newDisciplines.add(d))
      }
      return { ...prev, disciplines: Array.from(newDisciplines) }
    })
  }

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = events.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  const past = events.filter(e => e.date < today).sort((a, b) => b.date.localeCompare(a.date))

  const renderCard = (evt: ControlEvent) => (
    <div
      key={evt.id}
      onClick={() => openEdit(evt)}
      style={{
        background: '#0f1115',
        border: '1px solid #1f2937',
        borderRadius: 14,
        padding: '16px 18px',
        marginBottom: 12,
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2a3040' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1f2937' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{evt.name}</div>
          <div style={{ color: '#9ca3af', fontSize: 13 }}>
            {evt.date ? new Date(evt.date).toLocaleDateString('ru-RU') : 'Без даты'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#6b7280', background: '#1a1d26', padding: '3px 10px', borderRadius: 999 }}>
            {evt.disciplines.length} дисциплин
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(evt.id) }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: 12,
              padding: 4,
            }}
            title="Удалить"
          >
            ✕
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {evt.disciplines.map(d => (
          <span key={d} style={{ fontSize: 11, color: '#c6f135', background: '#1a2008', padding: '3px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>
            {d}
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, margin: 0, letterSpacing: -0.5 }}>
            Контрольные зачеты
          </h1>
          <p style={{ color: '#9ca3af', margin: '6px 0 0' }}>Создание и управление контрольными мероприятиями</p>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: LIME,
            color: '#000',
            border: 'none',
            borderRadius: 10,
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconPlus /> Создать зачет
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#9ca3af' }}>Загрузка…</div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <h2 style={{ fontSize: 18, margin: '24px 0 12px', color: '#e5e7eb' }}>Предстоящие</h2>
              {upcoming.map(renderCard)}
            </>
          )}
          {past.length > 0 && (
            <>
              <h2 style={{ fontSize: 18, margin: '24px 0 12px', color: '#9ca3af' }}>Прошедшие</h2>
              {past.map(renderCard)}
            </>
          )}
          {events.length === 0 && (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
              Нет контрольных зачетов. Нажмите «Создать зачет», чтобы добавить первый.
            </div>
          )}
        </>
      )}

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '16px 16px 40px',
            }}
          >
            <div
              style={{
                background: '#11131a',
                border: '1px solid #1f2937',
                borderRadius: 16,
                width: '100%',
                maxWidth: 560,
                padding: 24,
              }}
              onClick={e => e.stopPropagation()}
            >
            <h3 style={{ margin: '0 0 18px', fontSize: 22 }}>
              {editingId ? 'Редактировать зачет' : 'Новый контрольный зачет'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Название</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#0f1115',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Дата проведения</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#0f1115',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 13, color: '#9ca3af' }}>
                    Дисциплины ({form.disciplines.length})
                  </label>
                  <button
                    onClick={() => setForm(prev => ({ ...prev, disciplines: [] }))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#6b7280',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Сбросить
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {DISCIPLINE_GROUPS.map(group => {
                    const groupSelected = group.items.filter(d => form.disciplines.includes(d))
                    const allSelected = groupSelected.length === group.items.length
                    return (
                      <div key={group.name}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8,
                            cursor: 'pointer',
                          }}
                          onClick={() => selectAllInGroup(group.items)}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>{group.name}</span>
                          <span style={{ fontSize: 11, color: allSelected ? LIME : '#6b7280' }}>
                            {allSelected ? 'Все' : `${groupSelected.length}/${group.items.length}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {group.items.map(d => {
                            const selected = form.disciplines.includes(d)
                            return (
                              <button
                                key={d}
                                onClick={() => toggleDiscipline(d)}
                                style={{
                                  fontSize: 12,
                                  padding: '6px 12px',
                                  borderRadius: 8,
                                  border: selected ? '1px solid #c6f135' : '1px solid #374151',
                                  background: selected ? '#1a2008' : '#0f1115',
                                  color: selected ? '#c6f135' : '#9ca3af',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {d}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #374151',
                    color: '#e5e7eb',
                    borderRadius: 10,
                    padding: '10px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    background: LIME,
                    color: '#000',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 20px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {editingId ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}