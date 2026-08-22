import { Link, useLocation } from 'react-router-dom';
import { IconDash, IconAthletes, IconCalendar, IconTrophy, IconChart, IconSettings, IconLogout } from './Icons'
import athleteImg from '@/imports/images-removebg-preview.png'

const navItems = [
  { path: '/dashboard', label: 'Панель управления', Icon: IconDash },
  { path: '/athletes', label: 'Спортсмены', Icon: IconAthletes },
  { path: '/training', label: 'Тренировки', Icon: IconCalendar },
  { path: '/control-events', label: 'Контрольные зачеты', Icon: IconTrophy },
  { path: '/analytics', label: 'Аналитика', Icon: IconChart },
  { path: '/settings', label: 'Настройки', Icon: IconSettings },
]

interface SidebarProps {
  userName: string;
  role: 'admin' | 'coach';
  onLogout: () => void;
  notifications?: number;
}

export default function Sidebar({ userName, role, onLogout, notifications = 3 }: SidebarProps) {
  const location = useLocation();

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: '#0f1117',
      borderRight: '1px solid #1e2230',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
    }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e2230' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            background: '#c6f135',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(198,241,53,0.25)',
          }}>
            <span style={{ fontSize: 18, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, color: '#080a0f' }}>Д</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, color: '#f0f2f5', letterSpacing: '0.02em', lineHeight: 1 }}>
              ДЕКАТЛОН
            </div>
            <div style={{ fontSize: 9, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PRO SYSTEM</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', height: 130, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(198,241,53,0.04) 100%)',
        }} />
        <img
          src={athleteImg}
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            height: 140,
            width: 'auto',
            filter: 'brightness(0) saturate(100%) invert(88%) sepia(60%) saturate(600%) hue-rotate(29deg) brightness(1.05)',
            opacity: 0.18,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </div>

      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navItems.map(({ path, label, Icon }) => {
          const active = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 16px',
                background: active ? 'rgba(198,241,53,0.08)' : 'transparent',
                border: 'none',
                borderLeft: active ? '3px solid #c6f135' : '3px solid transparent',
                color: active ? '#c6f135' : '#6b7280',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.15s',
                fontFamily: "'Inter', sans-serif",
                position: 'relative',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = '#d1d5db'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.background = 'transparent' } }}
            >
              <Icon />
              <span>{label}</span>
              {path === '/dashboard' && notifications > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#c6f135',
                  color: '#080a0f',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 10,
                  padding: '1px 6px',
                  minWidth: 18,
                  textAlign: 'center',
                }}>{notifications}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid #1e2230' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34,
            height: 34,
            background: 'linear-gradient(135deg, #374151, #1e2230)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: '#c6f135',
            flexShrink: 0,
          }}>
            {userName.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f2f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {role === 'admin' ? 'Администратор' : 'Тренер'}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid rgba(42,48,64,0.6)',
            borderRadius: 6,
            color: '#6b7280',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.3)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,48,64,0.6)' }}
        >
          <IconLogout />
          Выход
        </button>
      </div>
    </aside>
  )
}
