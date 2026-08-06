import { competitions, athletes } from '../data/mockData'

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

export default function Competitions() {
  const past = competitions.filter(c => c.date < '2025-01-01').sort((a, b) => b.date.localeCompare(a.date))
  const upcoming = competitions.filter(c => c.date >= '2025-01-01').sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', margin: 0, letterSpacing: '0.01em' }}>
            СОРЕВНОВАНИЯ
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>{competitions.length} соревнований · {upcoming.length} предстоит</p>
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
        }}>+ Создать</button>
      </div>

      {/* Upcoming */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
          Предстоящие
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
          {upcoming.map(c => <CompCard key={c.id} comp={c} isUpcoming />)}
        </div>
      </div>

      {/* Past */}
      <div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
          Прошедшие
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
          {past.map(c => <CompCard key={c.id} comp={c} />)}
        </div>
      </div>
    </div>
  )
}

function CompCard({ comp, isUpcoming = false }: { comp: typeof competitions[0]; isUpcoming?: boolean }) {
  const compAthletes = comp.athletes.map(id => athletes.find(a => a.id === id)).filter(Boolean)

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
          }}>{comp.type === 'indoor' ? 'Зал' : 'Улица'}</span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>
        Организатор: {comp.organizer}
      </div>

      <div style={{ borderTop: '1px solid #1e2230', paddingTop: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Участники ({compAthletes.length})
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {compAthletes.map(a => a && (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: 'rgba(20,23,32,0.7)', borderRadius: 5, border: '1px solid #1e2230' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', overflow: 'hidden', background: '#141720' }}>
                <img src={a.photo} alt={a.nameShort} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: 11, color: '#d1d5db' }}>{a.nameShort}</span>
            </div>
          ))}
        </div>
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
