import { useState, useMemo } from 'react'
import { useAthletes } from '../contexts/Athletescontext'
import { disciplineMeta } from '../lib/controlEventUtils'
import { IconPlus, IconTrash } from './Icons'
import Modal from './Modal'

const LIME = '#c6f135'

interface ControlEventLite {
  id: string
  name: string
  date: string
  disciplines: string[]
  athleteIds: string[]
}

export default function ControlEventResults({ event, onClose }: { event: ControlEventLite; onClose: () => void }) {
  const { athletes, results, addResult, deleteResult } = useAthletes()

  // Список спортсменов, которых показываем в таблице:
  // изначальные участники зачёта + все, кому уже вписан результат в этом зачёте
  // (на случай если результат внесли, а потом список участников поменяли).
  const resultAthleteIds = useMemo(
    () => new Set(results.filter(r => r.controlEventId === event.id).map(r => r.athleteId)),
    [results, event.id]
  )
  const [addedIds, setAddedIds] = useState<string[]>([])

  const visibleIds = useMemo(() => {
    const set = new Set<string>([...event.athleteIds, ...resultAthleteIds, ...addedIds])
    return set
  }, [event.athleteIds, resultAthleteIds, addedIds])

  const participants = athletes.filter(a => visibleIds.has(a.id))

  // Поиск для добавления нового спортсмена в таблицу
  const [search, setSearch] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const searchResults = search.trim()
    ? athletes.filter(
        a => !visibleIds.has(a.id) &&
          (a.name.toLowerCase().includes(search.toLowerCase()) ||
           a.nameShort.toLowerCase().includes(search.toLowerCase()))
      )
    : athletes.filter(a => !visibleIds.has(a.id))

  const addAthlete = (id: string) => {
    setAddedIds(prev => [...prev, id])
    setSearch('')
    setShowPicker(false)
  }

  const removeAthlete = (id: string) => {
    // убираем из таблицы только если у него ещё нет вписанных результатов
    if (resultAthleteIds.has(id)) return
    setAddedIds(prev => prev.filter(x => x !== id))
  }

  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const key = (athleteId: string, discipline: string) => `${athleteId}::${discipline}`
  const existing = (athleteId: string, discipline: string) =>
    results.find(r => r.controlEventId === event.id && r.athleteId === athleteId && r.discipline === discipline)

  const handleSave = async (athleteId: string, discipline: string) => {
    const k = key(athleteId, discipline)
    const raw = drafts[k]
    if (raw === undefined || raw.trim() === '') return
    const value = Number(raw.replace(',', '.'))
    if (isNaN(value)) return

    setSaving(k)
    const already = existing(athleteId, discipline)
    if (already) await deleteResult(already.id)
    await addResult({
      athleteId,
      date: event.date,
      discipline,
      result: raw.trim(),
      resultValue: value,
      location: event.name,
      type: 'test',
      controlEventId: event.id,
    })
    setSaving(null)
    setDrafts(prev => {
      const next = { ...prev }
      delete next[k]
      return next
    })
  }

  const filled = participants.reduce((s, a) => s + event.disciplines.filter(d => existing(a.id, d)).length, 0)
  const total = participants.length * event.disciplines.length

  return (
    <Modal onClose={onClose}>
      <div style={{ background: '#11131a', border: '1px solid #1f2937', borderRadius: 16, width: '100%', maxWidth: 960, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 22 }}>{event.name}</h3>
            <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
              {new Date(event.date).toLocaleDateString('ru-RU')} · {participants.length} спортсменов · {event.disciplines.length} дисциплин
            </div>
          </div>
          <div style={{ fontSize: 12, color: total > 0 && filled === total ? LIME : '#9ca3af' }}>
            Заполнено {filled}/{total}
          </div>
        </div>

        {/* Добавление спортсмена */}
        <div style={{ marginTop: 16, position: 'relative' }}>
          {!showPicker ? (
            <button
              onClick={() => setShowPicker(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(198,241,53,0.08)', border: '1px solid rgba(198,241,53,0.2)',
                color: LIME, borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer',
              }}
            >
              <IconPlus /> Добавить спортсмена
            </button>
          ) : (
            <div style={{ border: '1px solid #374151', borderRadius: 10, background: '#0f1115', padding: 10 }}>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск спортсмена..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', background: '#141720', border: '1px solid #1f2937', borderRadius: 6, color: '#fff', fontSize: 13, marginBottom: 8 }}
              />
              <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {searchResults.length === 0 && (
                  <div style={{ color: '#6b7280', fontSize: 12, padding: '6px 4px' }}>
                    {athletes.length === visibleIds.size ? 'Все спортсмены уже добавлены' : 'Ничего не найдено'}
                  </div>
                )}
                {searchResults.map(a => (
                  <button
                    key={a.id}
                    onClick={() => addAthlete(a.id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      textAlign: 'left', background: 'transparent', border: 'none',
                      color: '#e5e7eb', fontSize: 13, padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <span>{a.nameShort || a.name}</span>
                    <span style={{ color: '#6b7280', fontSize: 11 }}>{a.gender === 'M' ? 'М' : 'Ж'}</span>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  onClick={() => { setShowPicker(false); setSearch('') }}
                  style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer' }}
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>

        {participants.length === 0 ? (
          <div style={{ color: '#6b7280', padding: '30px 0', textAlign: 'center' }}>
            Пока нет спортсменов в таблице. Нажмите «Добавить спортсмена».
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 10px', color: '#6b7280', position: 'sticky', left: 0, background: '#11131a' }}>
                    Спортсмен
                  </th>
                  {event.disciplines.map(d => (
                    <th key={d} style={{ padding: '8px 10px', color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {d}
                      <div style={{ fontSize: 10, color: '#4b5563' }}>{disciplineMeta(d).unit}</div>
                    </th>
                  ))}
                  <th style={{ width: 32 }} />
                </tr>
              </thead>
              <tbody>
                {participants.map(a => {
                  const isOriginal = event.athleteIds.includes(a.id) || resultAthleteIds.has(a.id)
                  return (
                    <tr key={a.id} style={{ borderTop: '1px solid #1f2937' }}>
                      <td style={{ padding: '8px 10px', color: '#f0f2f5', fontWeight: 500, position: 'sticky', left: 0, background: '#11131a', whiteSpace: 'nowrap' }}>
                        {a.nameShort || a.name}
                        {!isOriginal && (
                          <span style={{ marginLeft: 6, fontSize: 9, color: LIME, background: 'rgba(198,241,53,0.1)', padding: '1px 6px', borderRadius: 4 }}>
                            добавлен
                          </span>
                        )}
                      </td>
                      {event.disciplines.map(d => {
                        const ex = existing(a.id, d)
                        const k = key(a.id, d)
                        return (
                          <td key={d} style={{ padding: '4px 6px' }}>
                            <input
                              value={drafts[k] ?? ex?.result ?? ''}
                              onChange={e => setDrafts(prev => ({ ...prev, [k]: e.target.value }))}
                              onBlur={() => handleSave(a.id, d)}
                              placeholder="—"
                              style={{
                                width: 68, padding: '6px 8px', textAlign: 'center',
                                background: ex ? 'rgba(198,241,53,0.06)' : '#0f1115',
                                border: `1px solid ${ex ? 'rgba(198,241,53,0.25)' : '#374151'}`,
                                borderRadius: 6, color: '#fff', fontSize: 13,
                                opacity: saving === k ? 0.5 : 1,
                              }}
                            />
                          </td>
                        )
                      })}
                      <td style={{ textAlign: 'center' }}>
                        {!isOriginal && (
                          <button
                            onClick={() => removeAthlete(a.id)}
                            title="Убрать из таблицы"
                            style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}
                          >
                            <IconTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} style={{ background: LIME, color: '#000', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>
            Готово
          </button>
        </div>
      </div>
    </Modal>
  )
}