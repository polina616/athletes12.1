import { useState } from 'react'
import { IconSearch, IconPlus, IconTrash } from './Icons'
import AthleteProfile from './AthleteProfile'
import { useAthletes, type Athlete, type NewAthleteInput } from '../contexts/AthletesContext'

const LIME = '#c6f135'

const statusColors: Record<string, string> = {
  active: '#c6f135',
  injured: '#f87171',
  inactive: '#6b7280',
}
const statusLabels: Record<string, string> = {
  active: 'Активен',
  injured: 'Травма',
  inactive: 'Неактивен',
}
const gradeColors: Record<string, string> = {
  'МС': '#a78bfa',
  'КМС': '#60a5fa',
  'I разряд': '#fbbf24',
  'II разряд': '#9ca3af',
}
const specializationLabels: Record<Athlete['specialization'], string> = {
  decathlon: 'Десятиборье',
  heptathlon: 'Семиборье',
  sprints: 'Спринт',
  jumps: 'Прыжки',
  throws: 'Метания',
  distance: 'Выносливость',
}

const emptyForm: NewAthleteInput & { nameShort: string; birthDate: string; grade: string; group: string } = {
  name: '', nameShort: '', birthDate: '', gender: 'M', grade: '', group: '', specialization: 'decathlon',
}

export default function Athletes() {
  const { athletes, loading, addAthlete, deleteAthlete } = useAthletes()
  const [search, setSearch] = useState('')
  const [filterGender, setFilterGender] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSpec, setFilterSpec] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(emptyForm)

  if (selectedId) {
    return <AthleteProfile athleteId={selectedId} onBack={() => setSelectedId(null)} />
  }

  const filtered = athletes.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.grade.toLowerCase().includes(q) || a.group.toLowerCase().includes(q)
    const matchGender = filterGender === 'all' || a.gender === filterGender
    const matchStatus = filterStatus === 'all' || a.status === filterStatus
    const matchSpec = filterSpec === 'all' || a.specialization === filterSpec
    return matchSearch && matchGender && matchStatus && matchSpec
  })

  const closeModal = () => {
    setShowModal(false)
    setForm(emptyForm)
    setFormError('')
  }

  const handleAdd = async () => {
    if (!form.name.trim()) {
      setFormError('Укажите имя спортсмена')
      return
    }
    setSaving(true)
    setFormError('')
    const { error } = await addAthlete({
      name: form.name.trim(),
      nameShort: form.nameShort.trim() || undefined,
      birthDate: form.birthDate || undefined,
      gender: form.gender,
      grade: form.grade.trim() || undefined,
      group: form.group.trim() || undefined,
      specialization: form.specialization,
    })
    setSaving(false)
    if (error) {
      setFormError('Ошибка добавления: ' + error)
      return
    }
    closeModal()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить спортсмена "${name}"? Это действие необратимо — вместе с ним удалятся все его результаты.`)) return
    const { error } = await deleteAthlete(id)
    if (error) alert('Ошибка удаления: ' + error)
  }

  return (
    <div style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', margin: 0, letterSpacing: '0.01em' }}>
            СПОРТСМЕНЫ
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
            {athletes.length} спортсменов · {athletes.filter(a => a.status === 'active').length} активных
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
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
          }}>
          <IconPlus /> Добавить
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '16px',
        background: 'rgba(15,17,23,0.7)',
        border: '1px solid #1e2230',
        borderRadius: 10,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }}>
            <IconSearch />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск спортсмена..."
            style={{
              width: '100%',
              background: 'rgba(20,23,32,0.8)',
              border: '1px solid #1e2230',
              borderRadius: 7,
              padding: '9px 12px 9px 34px',
              color: '#f0f2f5',
              fontSize: 13,
              outline: 'none',
              fontFamily: "'Inter', sans-serif",
              boxSizing: 'border-box',
            }}
          />
        </div>

        {[
          { label: 'Пол', val: filterGender, set: setFilterGender, opts: [['all', 'Все'], ['M', 'Муж'], ['F', 'Жен']] },
          { label: 'Статус', val: filterStatus, set: setFilterStatus, opts: [['all', 'Все'], ['active', 'Активен'], ['injured', 'Травма'], ['inactive', 'Неактивен']] },
          { label: 'Специализация', val: filterSpec, set: setFilterSpec, opts: [['all', 'Все'], ['decathlon', 'Десятиборье'], ['heptathlon', 'Семиборье'], ['sprints', 'Спринт']] },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>{f.label}:</span>
            {f.opts.map(([v, l]) => (
              <button
                key={v}
                onClick={() => f.set(v)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 5,
                  border: '1px solid',
                  borderColor: f.val === v ? LIME : '#1e2230',
                  background: f.val === v ? 'rgba(198,241,53,0.1)' : 'transparent',
                  color: f.val === v ? LIME : '#9ca3af',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: f.val === v ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >{l}</button>
            ))}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#6b7280', padding: '60px 0', textAlign: 'center' }}>Загрузка...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(a => (
            <AthleteCard key={a.id} athlete={a} onClick={() => setSelectedId(a.id)} onDelete={() => handleDelete(a.id, a.name)} />
          ))}
          {athletes.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              У вас пока нет спортсменов. Нажмите «Добавить», чтобы завести первого.
            </div>
          )}
          {athletes.length > 0 && filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              Спортсменов не найдено
            </div>
          )}
        </div>
      )}

      {/* Модалка добавления спортсмена */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: '#141720', border: '1px solid #1e2230', borderRadius: 16,
              padding: '32px', maxWidth: 440, width: '100%', maxHeight: '85vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, color: '#f0f2f5', margin: '0 0 16px' }}>
              Новый спортсмен
            </h2>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>ФИО *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Иванов Иван Иванович"
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Короткое имя (для карточек)</label>
              <input
                value={form.nameShort}
                onChange={e => setForm({ ...form, nameShort: e.target.value })}
                placeholder="И. Иванов"
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Дата рождения</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={e => setForm({ ...form, birthDate: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Пол</label>
                <select
                  value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value as 'M' | 'F' })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                >
                  <option value="M">Мужской</option>
                  <option value="F">Женский</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Разряд</label>
                <input
                  value={form.grade}
                  onChange={e => setForm({ ...form, grade: e.target.value })}
                  placeholder="КМС, I разряд..."
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Группа</label>
                <input
                  value={form.group}
                  onChange={e => setForm({ ...form, group: e.target.value })}
                  placeholder="Основная, Юниоры..."
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Специализация</label>
              <select
                value={form.specialization}
                onChange={e => setForm({ ...form, specialization: e.target.value as Athlete['specialization'] })}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
              >
                {(Object.keys(specializationLabels) as Athlete['specialization'][]).map(k => (
                  <option key={k} value={k}>{specializationLabels[k]}</option>
                ))}
              </select>
            </div>

            {formError && (
              <div style={{
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 16,
              }}>{formError}</div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #1e2230', borderRadius: 6, color: '#9ca3af', cursor: 'pointer' }}>
                Отмена
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  background: saving ? 'rgba(198,241,53,0.5)' : '#c6f135',
                  border: 'none', borderRadius: 6, color: '#080a0f', fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Сохранение...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AthleteCard({ athlete, onClick, onDelete }: { athlete: Athlete; onClick: () => void; onDelete: () => void }) {
  const [hov, setHov] = useState(false)
  const initials = athlete.name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('')

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(20,23,32,0.95)' : 'rgba(15,17,23,0.8)',
        border: `1px solid ${hov ? '#2a3040' : '#1e2230'}`,
        borderRadius: 12,
        padding: '20px',
        transition: 'all 0.2s',
        backdropFilter: 'blur(12px)',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: hov ? `linear-gradient(90deg, ${statusColors[athlete.status]}, transparent)` : 'transparent',
        transition: 'all 0.3s',
      }} />

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="Удалить спортсмена"
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 2,
          background: hov ? 'rgba(248,113,113,0.12)' : 'transparent',
          border: hov ? '1px solid rgba(248,113,113,0.3)' : '1px solid transparent',
          borderRadius: 6, width: 28, height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: hov ? '#f87171' : '#4b5563',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        <IconTrash />
      </button>

      <div onClick={onClick} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 60, height: 60, borderRadius: 10, overflow: 'hidden',
              border: '2px solid #1e2230', background: '#141720',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {athlete.photo ? (
                <img src={athlete.photo} alt={athlete.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 18, fontWeight: 700, color: '#c6f135', fontFamily: "'Barlow Condensed', sans-serif" }}>{initials}</span>
              )}
            </div>
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 12, height: 12, borderRadius: '50%',
              background: statusColors[athlete.status],
              border: '2px solid #0f1117',
            }} />
          </div>
          <div style={{ flex: 1, paddingRight: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#f0f2f5', marginBottom: 2 }}>{athlete.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
              {athlete.birthDate ? `${athlete.birthDate.slice(0, 4)} · ` : ''}{athlete.gender === 'M' ? 'Муж' : 'Жен'}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {athlete.grade && (
                <span style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                  background: `${gradeColors[athlete.grade] || '#6b7280'}18`,
                  color: gradeColors[athlete.grade] || '#6b7280',
                }}>{athlete.grade}</span>
              )}
              {athlete.group && (
                <span style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 4,
                  background: 'rgba(107,114,128,0.15)',
                  color: '#9ca3af',
                }}>{athlete.group}</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { l: 'Рост', v: athlete.height ? `${athlete.height}см` : '—' },
            { l: 'Вес', v: athlete.weight ? `${athlete.weight}кг` : '—' },
            { l: 'Специал.', v: specializationLabels[athlete.specialization] },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center', padding: '7px', background: 'rgba(20,23,32,0.5)', borderRadius: 6 }}>
              <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{s.l}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: '#d1d5db' }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #1e2230', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{athlete.favoriteEvent || 'Дисциплина не указана'}</span>
          <span style={{
            fontSize: 11,
            color: statusColors[athlete.status],
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>{statusLabels[athlete.status]}</span>
        </div>
      </div>
    </div>
  )
}