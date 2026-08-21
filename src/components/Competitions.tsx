import { useState, useEffect } from 'react'
import { IconPlus } from './Icons'
import { useAthletes } from '../contexts/Athletescontext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

const LIME = '#c6f135'

const levelColors: Record<string, string> = {
  regional: '#60a5fa',
  national: '#a78bfa',
  international: '#c6f135',
}
const levelLabels: Record<string, string> = {
  regional: 'Регион',
  national: 'Россия',
  international: 'Международный',
}

interface Competition {
  id: string
  name: string
  date: string
  location: string
  organizer: string
  athlete_ids: string[]
  type: 'indoor' | 'outdoor' | 'road'
  level: 'regional' | 'national' | 'international'
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
    type: 'outdoor' as 'indoor' | 'outdoor' | 'road',
    level: 'regional' as 'regional' | 'national' | 'international',
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
        type: c.type,
        level: c.level,
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
    setForm({ name: '', date: '', location: '', organizer: '', type: 'outdoor', level: 'regional', selectedAthletes: [] })
    fetchCompetitions()
  }

  const today = new Date().toISOString().slice(0, 10)
  const past = competitions.filter(c => c.date < today).sort((a, b) => b.date.localeCompare(a.date))
  const upcoming = competitions.filter(c => c.date >= today).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', margin: 0, letterSpacing: '0.01em' }}>
            СОРЕВНОВАНИЯ
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
            {competitions.length} соревнований · {upcoming.length} предстоит
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
          <IconPlus /> Создать
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#6b7280', padding: '60px 0', textAlign: 'center' }}>Загрузка...</div>
      ) : (
        <>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
              Предстоящие
            </div>
            {upcoming.length === 0 ? (
              <div style={{ color: '#6b7280', padding: '20px', background: 'rgba(15,17,23,0.5)', borderRadius: 10, border: '1px dashed #1e2230' }}>
                Нет предстоящих соревнований. Создайте первое.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
                {upcoming.map(c => <CompCard key={c.id} comp={c} athletes={athletes} isUpcoming />)}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
              Прошедшие
            </div>
            {past.length === 0 ? (
              <div style={{ color: '#6b7280', padding: '20px', background: 'rgba(15,17,23,0.5)', borderRadius: 10, border: '1px dashed #1e2230' }}>
                Нет прошедших соревнований.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
                {past.map(c => <CompCard key={c.id} comp={c} athletes={athletes} />)}
              </div>
            )}
          </div>
        </>
      )}

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
              Новое соревнование
            </h2>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Название *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Чемпионат города"
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
              />
            </div>

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
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Место проведения</label>
                <input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="Москва, Лужники"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Организатор</label>
              <input
                value={form.organizer}
                onChange={e => setForm({ ...form, organizer: e.target.value })}
                placeholder="Федерация лёгкой атлетики"
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Тип</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as any })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                >
                  <option value="outdoor">Улица</option>
                  <option value="indoor">Зал</option>
                  <option value="road">Шоссе</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Уровень</label>
                <select
                  value={form.level}
                  onChange={e => setForm({ ...form, level: e.target.value as any })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                >
                  <option value="regional">Регион</option>
                  <option value="national">Россия</option>
                  <option value="international">Международный</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Участники</label>
              {athletes.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: 12 }}>Сначала добавьте спортсменов</div>
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
                onClick={handleAdd}
                style={{ padding: '8px 16px', background: '#c6f135', border: 'none', borderRadius: 6, color: '#080a0f', fontWeight: 600, cursor: 'pointer' }}
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CompCard({ comp, athletes, isUpcoming = false }: { comp: Competition; athletes: { id: string; nameShort: string; photo: string }[]; isUpcoming?: boolean }) {
  const compAthletes = comp.athlete_ids.map(id => athletes.find(a => a.id === id)).filter(Boolean)

  return (
    <div style={{
      background: 'rgba(15,17,23,0.8)',
      border: `1px solid ${isUpcoming ? 'rgba(198,241,53,0.2)' : '#1e2230'}`,
      borderRadius: 12,
      padding: '20px',
      backdropFilter: 'blur(12px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {isUpcoming && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${levelColors[comp.level]}, transparent)`,
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f2f5', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.02em' }}>
            {comp.name}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {comp.date} · {comp.location}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <span style={{
            fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 700,
            background: `${levelColors[comp.level]}18`,
            color: levelColors[comp.level],
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>{levelLabels[comp.level]}</span>
          <span style={{
            fontSize: 10, padding: '3px 8px', borderRadius: 4,
            background: 'rgba(107,114,128,0.15)',
            color: '#9ca3af',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{comp.type === 'indoor' ? 'Зал' : comp.type === 'road' ? 'Шоссе' : 'Улица'}</span>
        </div>
      </div>

      {comp.organizer && (
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>
          Организатор: {comp.organizer}
        </div>
      )}

      <div style={{ borderTop: '1px solid #1e2230', paddingTop: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Участники ({compAthletes.length})
        </div>
        {compAthletes.length === 0 ? (
          <div style={{ fontSize: 12, color: '#4b5563' }}>Спортсмены не выбраны</div>
        ) : (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {compAthletes.map(a => a && (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: 'rgba(20,23,32,0.7)', borderRadius: 5, border: '1px solid #1e2230' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', overflow: 'hidden', background: '#141720', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#c6f135', fontWeight: 700 }}>
                  {a.nameShort?.[0] || '?'}
                </div>
                <span style={{ fontSize: 11, color: '#d1d5db' }}>{a.nameShort}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isUpcoming && (
        <button style={{
          marginTop: 12,
          width: '100%',
          padding: '8px',
          background: 'rgba(20,23,32,0.6)',
          border: '1px solid #1e2230',
          borderRadius: 6,
          color: '#6b7280',
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0f2f5'; (e.currentTarget as HTMLElement).style.borderColor = '#2a3040' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.borderColor = '#1e2230' }}
        >Просмотреть протокол</button>
      )}
      {isUpcoming && (
        <button style={{
          marginTop: 12,
          width: '100%',
          padding: '8px',
          background: 'rgba(198,241,53,0.08)',
          border: `1px solid rgba(198,241,53,0.2)`,
          borderRadius: 6,
          color: LIME,
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          transition: 'all 0.15s',
        }}>Внести заявку</button>
      )}
    </div>
  )
}