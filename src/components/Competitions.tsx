import { useState, useEffect } from 'react'
import { IconPlus } from './Icons'
import { useAthletes } from '../contexts/Athletescontext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

const LIME = '#c6f135'

const levelColors: Record<string, string> = {
  city: '#60a5fa',
  district: '#a78bfa',
  region: '#fbbf24',
  republic: '#c6f135',
  school: '#f87171',
}
const levelLabels: Record<string, string> = {
  city: 'Город',
  district: 'Район',
  region: 'Область',
  republic: 'Республика',
  school: 'Школа',
}

const typeLabels: Record<string, string> = {
  indoor: 'Манеж',
  stadium: 'Стадион',
  cross: 'Бег по пересечённой местности',
  hall: 'Зал',
  street: 'Улица',
}

type CompType = 'indoor' | 'stadium' | 'cross' | 'hall' | 'street'
type CompLevel = 'city' | 'district' | 'region' | 'republic' | 'school'

interface Competition {
  id: string
  name: string
  date: string
  location: string
  organizer: string
  athlete_ids: string[]
  type: CompType
  level: CompLevel
}

export default function Competitions() {
  const { athletes } = useAthletes()
  const { coachProfile } = useAuth()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    name: '',
    date: '',
    location: '',
    organizer: '',
    type: 'stadium' as CompType,
    level: 'city' as CompLevel,
    selectedAthletes: [] as string[],
  })

  const fetchCompetitions = async () => {
    if (!coachProfile) {
      setCompetitions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('coach_id', coachProfile.id)
      .order('date', { ascending: true })
    if (error) {
      console.error('Ошибка загрузки соревнований:', error)
      setCompetitions([])
    } else {
      setCompetitions((data || []).map(c => ({
        id: c.id,
        name: c.name,
        date: c.date,
        location: c.location || '',
        organizer: c.organizer || '',
        athlete_ids: c.athlete_ids || [],
        type: c.type as CompType,
        level: c.level as CompLevel,
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCompetitions()
  }, [coachProfile])

  const handleAdd = async () => {
    if (!coachProfile) return
    if (!form.name.trim()) { alert('Укажите название соревнования'); return }
    if (!form.date) { alert('Укажите дату'); return }

    const { error } = await supabase.from('competitions').insert({
      coach_id: coachProfile.id,
      name: form.name.trim(),
      date: form.date,
      location: form.location.trim(),
      organizer: form.organizer.trim(),
      type: form.type,
      level: form.level,
      athlete_ids: form.selectedAthletes,
    })
    if (error) {
      alert('Ошибка добавления: ' + error.message)
      return
    }
    setShowModal(false)
    setForm({ name: '', date: '', location: '', organizer: '', type: 'stadium', level: 'city', selectedAthletes: [] })
    fetchCompetitions()
  }

  const toggleAthlete = (id: string) => {
    setForm(prev => ({
      ...prev,
      selectedAthletes: prev.selectedAthletes.includes(id)
        ? prev.selectedAthletes.filter(a => a !== id)
        : [...prev.selectedAthletes, id],
    }))
  }

  const today = new Date().toISOString().slice(0, 10)
  const past = competitions.filter(c => c.date < today).sort((a, b) => b.date.localeCompare(a.date))
  const upcoming = competitions.filter(c => c.date >= today).sort((a, b) => a.date.localeCompare(b.date))

  const renderCard = (c: Competition) => (
    <div
      key={c.id}
      style={{
        background: '#0f1115',
        border: '1px solid #1f2937',
        borderRadius: 14,
        padding: '16px 18px',
        marginBottom: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{c.name}</div>
          <div style={{ color: '#9ca3af', fontSize: 13 }}>
            {new Date(c.date).toLocaleDateString('ru-RU')} · {c.location}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span
            style={{
              background: levelColors[c.level] || '#374151',
              color: '#000',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 999,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            {levelLabels[c.level] || c.level}
          </span>
          <span
            style={{
              background: '#1f2937',
              color: '#e5e7eb',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
            }}
          >
            {typeLabels[c.type] || c.type}
          </span>
        </div>
      </div>
      {c.organizer && (
        <div style={{ color: '#9ca3af', fontSize: 13 }}>Организатор: {c.organizer}</div>
      )}
      {c.athlete_ids.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {c.athlete_ids.map(aid => {
            const a = athletes.find(x => x.id === aid)
            return a ? (
              <span key={aid} style={{ fontSize: 12, color: '#c6f135', background: '#1a2008', padding: '2px 8px', borderRadius: 6 }}>
                {a.nameShort}
              </span>
            ) : null
          })}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, margin: 0, letterSpacing: -0.5 }}>
            Соревнования
          </h1>
          <p style={{ color: '#9ca3af', margin: '6px 0 0' }}>Управление соревнованиями и заявками спортсменов</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
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
          <IconPlus /> Добавить
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
          {competitions.length === 0 && (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
              Нет соревнований. Нажмите «Добавить», чтобы создать первое.
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
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '40px 16px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#11131a',
              border: '1px solid #1f2937',
              borderRadius: 16,
              width: '100%',
              maxWidth: 520,
              maxHeight: 'calc(100vh - 80px)',
              overflowY: 'auto',
              padding: 24,
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 18px', fontSize: 22 }}>Новое соревнование</h3>

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
                  placeholder="Например, Первенство города"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Дата</label>
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
                <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Место проведения</label>
                <input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
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
                  placeholder="Город, адрес"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Организатор</label>
                <input
                  value={form.organizer}
                  onChange={e => setForm({ ...form, organizer: e.target.value })}
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
                  placeholder="ФИО или название организации"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Уровень</label>
                  <select
                    value={form.level}
                    onChange={e => setForm({ ...form, level: e.target.value as CompLevel })}
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
                  >
                    <option value="city">Город</option>
                    <option value="district">Район</option>
                    <option value="region">Область</option>
                    <option value="republic">Республика</option>
                    <option value="school">Школа</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>Тип</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as CompType })}
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
                  >
                    <option value="indoor">Манеж</option>
                    <option value="stadium">Стадион</option>
                    <option value="cross">Бег по пересечённой местности</option>
                    <option value="hall">Зал</option>
                    <option value="street">Улица</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>
                  Спортсмены ({form.selectedAthletes.length})
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', border: '1px solid #374151', borderRadius: 10, padding: 10 }}>
                  {athletes.length === 0 && <div style={{ color: '#6b7280', fontSize: 13 }}>Нет спортсменов</div>}
                  {athletes.map(a => {
                    const selected = form.selectedAthletes.includes(a.id)
                    return (
                      <label
                        key={a.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '6px 8px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          background: selected ? '#1a2008' : 'transparent',
                          border: selected ? '1px solid #c6f135' : '1px solid transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleAthlete(a.id)}
                          style={{ accentColor: LIME, width: 16, height: 16 }}
                        />
                        <span style={{ fontSize: 14 }}>
                          {a.nameShort}
                        </span>
                      </label>
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
                onClick={handleAdd}
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
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
