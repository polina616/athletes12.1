import { useAuth } from './contexts/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Athletes from './components/Athletes';
import AthleteProfile from './components/AthleteProfile';
import Training from './components/Training';
import Competitions from './components/Competitions';
import Analytics from './components/Analytics';
import Disciplines from './components/Disciplines';
import { IconSearch, IconBell } from './components/Icons';
import ControlEvents from './components/ControlEvents';

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid #1e2230',
        borderTopColor: '#c6f135',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ color: '#6b7280', fontSize: 14 }}>Восстановление сессии…</div>
    </div>
  );
}

export default function App() {
  const { user, coachProfile, loading, signOut } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !coachProfile) {
    return <Login />;
  }

  const role: 'admin' | 'coach' = 'coach';
  const displayName = coachProfile.name;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080a0f' }}>
      <Sidebar
        userName={displayName}
        role={role}
        onLogout={signOut}
        notifications={3}
      />

      <main style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{
          height: 56,
          borderBottom: '1px solid #1e2230',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 24px',
          gap: 12,
          background: 'rgba(8,10,15,0.9)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ position: 'relative', flex: '0 1 280px' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }}>
              <IconSearch />
            </span>
            <input
              placeholder="Поиск..."
              style={{
                width: '100%',
                background: 'rgba(15,17,23,0.8)',
                border: '1px solid #1e2230',
                borderRadius: 7,
                padding: '7px 12px 7px 32px',
                color: '#f0f2f5',
                fontSize: 12,
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button style={{
            position: 'relative',
            background: 'rgba(15,17,23,0.8)',
            border: '1px solid #1e2230',
            borderRadius: 8,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6b7280',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0f2f5'; (e.currentTarget as HTMLElement).style.borderColor = '#2a3040' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.borderColor = '#1e2230' }}
          >
            <IconBell />
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 7, height: 7, borderRadius: '50%',
              background: '#c6f135',
              border: '1.5px solid #080a0f',
            }} />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: 'rgba(15,17,23,0.8)',
            border: '1px solid #1e2230',
            borderRadius: 8,
          }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2a3040, #1e2230)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#c6f135',
            }}>
              {(user.user_metadata?.name ?? '')
                .split(' ')
                .filter(Boolean)
                .map((w: string) => w[0])
                .join('')
                .slice(0, 2) || '??'}
            </div>
            <span style={{ fontSize: 12, color: '#d1d5db', fontWeight: 500 }}>
              {user.user_metadata?.name ?? coachProfile?.name ?? 'Без имени'}
            </span>
            <span style={{
              fontSize: 9,
              padding: '2px 6px',
              borderRadius: 3,
              background: user.role === 'admin' ? 'rgba(248,113,113,0.12)' : 'rgba(198,241,53,0.1)',
              color: user.role === 'admin' ? '#f87171' : '#c6f135',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}>{user.role === 'admin' ? 'Админ' : 'Тренер'}</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '28px 28px 40px', maxWidth: 1400 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/athletes" element={<Athletes />} />
            <Route path="/athlete/:id" element={<AthleteProfile />} />
            <Route path="/training" element={<Training />} />
            <Route path="/control-events" element={<ControlEvents />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/disciplines" element={<Disciplines />} />
            <Route path="/settings" element={<SettingsPlaceholder />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function SettingsPlaceholder() {
  return (
    <div style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', margin: '0 0 24px', letterSpacing: '0.01em' }}>
        НАСТРОЙКИ
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {['Дисциплины', 'Возрастные категории', 'Разряды', 'Коэффициенты ИААФ', 'Внешний вид', 'Уведомления', 'Резервные копии', 'Управление тренерами'].map(s => (
          <div key={s} style={{
            background: 'rgba(15,17,23,0.8)',
            border: '1px solid #1e2230',
            borderRadius: 10,
            padding: '18px 20px',
            backdropFilter: 'blur(12px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#2a3040'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1e2230'}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(198,241,53,0.08)', border: '1px solid rgba(198,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              ⚙
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f2f5' }}>{s}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Настроить</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}