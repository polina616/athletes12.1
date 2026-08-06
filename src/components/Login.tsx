import { useState } from 'react'

interface LoginProps {
  onLogin: (role: 'admin' | 'coach', name: string) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      if (email === 'admin@sport.ru' && password === 'admin') {
        onLogin('admin', 'Александр Белов')
      } else if (email === 'coach@sport.ru' && password === 'coach') {
        onLogin('coach', 'Сергей Морозов')
      } else {
        setError('Неверный email или пароль')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background mesh */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(198,241,53,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(198,241,53,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 440,
        margin: '0 24px',
        animation: 'fadeIn 0.4s ease forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}>
            <div style={{
              width: 44,
              height: 44,
              background: '#c6f135',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(198,241,53,0.3)',
            }}>
              <span style={{ fontSize: 22, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, color: '#080a0f' }}>Д</span>
            </div>
            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: '#f0f2f5',
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}>ДЕКАТЛОН PRO</div>
              <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
                Система управления многоборьем
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{
          background: 'rgba(15,17,23,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(42,48,64,0.8)',
          borderRadius: 16,
          padding: '36px 40px',
        }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: '#f0f2f5',
            margin: '0 0 6px 0',
          }}>Вход в систему</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 28px 0' }}>
            Введите учётные данные для доступа
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="coach@sport.ru"
                required
                style={{
                  width: '100%',
                  background: 'rgba(20,23,32,0.8)',
                  border: '1px solid rgba(42,48,64,0.8)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  color: '#f0f2f5',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: "'Inter', sans-serif",
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(198,241,53,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(42,48,64,0.8)'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  background: 'rgba(20,23,32,0.8)',
                  border: '1px solid rgba(42,48,64,0.8)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  color: '#f0f2f5',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: "'Inter', sans-serif",
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(198,241,53,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(42,48,64,0.8)'}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#f87171',
                fontSize: 13,
                marginBottom: 16,
              }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(198,241,53,0.5)' : '#c6f135',
                color: '#080a0f',
                border: 'none',
                borderRadius: 8,
                padding: '13px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 0 20px rgba(198,241,53,0.2)',
              }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: '12px 14px', background: 'rgba(198,241,53,0.04)', borderRadius: 8, border: '1px solid rgba(198,241,53,0.1)' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: '#9ca3af' }}>Тренер:</strong> coach@sport.ru / coach<br/>
              <strong style={{ color: '#9ca3af' }}>Администратор:</strong> admin@sport.ru / admin
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
