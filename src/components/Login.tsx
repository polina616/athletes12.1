import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import athleteImg from '@/imports/images-removebg-preview.png'

function getFriendlyErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)

  if (message.includes('Invalid login credentials')) {
    return 'Неверный email или пароль'
  }
  if (message.includes('Email not confirmed')) {
    return 'Email не подтверждён. Проверьте почту и перейдите по ссылке подтверждения.'
  }
  if (message.includes('User already registered')) {
    return 'Пользователь с таким email уже зарегистрирован'
  }
  if (message.includes('Password should be at least')) {
    return 'Пароль слишком короткий (минимум 6 символов)'
  }
  if (message.includes('rate limit') || message.includes('Too many requests')) {
    return 'Слишком много попыток. Подождите немного и попробуйте снова.'
  }
  if (message.includes('signups are disabled') || message.includes('Signups not allowed')) {
    return 'Регистрация новых пользователей временно отключена'
  }
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Не удалось подключиться к серверу. Проверьте интернет-соединение.'
  }
  return `Ошибка: ${message}`
}

export default function Login() {
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password, name)
        setInfo('Регистрация прошла успешно! Проверьте почту, чтобы подтвердить email, затем войдите.')
        setMode('signin')
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080a0f',
      display: 'flex',
      alignItems: 'stretch',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Left hero panel ── */}
      <div style={{
        flex: '1 1 55%',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #080a0f 0%, #0c1008 60%, #111a06 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(198,241,53,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(198,241,53,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute',
          bottom: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(198,241,53,0.18) 0%, rgba(198,241,53,0.06) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: 0,
            top: `${20 + i * 14}%`,
            height: 1,
            width: `${30 + i * 8}%`,
            background: `linear-gradient(90deg, transparent, rgba(198,241,53,${0.06 + i * 0.02}), transparent)`,
            pointerEvents: 'none',
          }} />
        ))}

        <img
          src={athleteImg}
          alt="Бегун"
          style={{
            position: 'relative',
            zIndex: 2,
            width: '82%',
            maxWidth: 520,
            height: 'auto',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            marginBottom: 0,
            filter:
              'brightness(0) saturate(100%) invert(88%) sepia(60%) saturate(600%) hue-rotate(29deg) brightness(1.05)',
            // @ts-ignore
            WebkitFilter:
              'brightness(0) saturate(100%) invert(88%) sepia(60%) saturate(600%) hue-rotate(29deg) brightness(1.05)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent 5%, rgba(198,241,53,0.5) 30%, rgba(198,241,53,0.8) 50%, rgba(198,241,53,0.5) 70%, transparent 95%)',
          zIndex: 3,
        }} />

        <div style={{
          position: 'absolute',
          top: 40,
          left: 40,
          right: 40,
          zIndex: 4,
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(198,241,53,0.6)',
            marginBottom: 10,
          }}>Декатлон PRO</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 38,
            fontWeight: 900,
            lineHeight: 1.08,
            color: '#f0f2f5',
            letterSpacing: '0.01em',
          }}>
            ПРОФЕССИОНАЛЬНАЯ<br />
            <span style={{ color: '#c6f135' }}>АНАЛИТИКА</span><br />
            МНОГОБОРЬЯ
          </div>
          <div style={{ marginTop: 14, fontSize: 13, color: '#4b5563', maxWidth: 320, lineHeight: 1.6 }}>
            Полное досье спортсменов, расчёт очков World Athletics, прогноз результатов и командная аналитика.
          </div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div style={{
        flex: '0 0 420px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 36px',
        background: '#0f1117',
        borderLeft: '1px solid #1e2230',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #c6f135, rgba(198,241,53,0.3), transparent)',
        }} />

        <div style={{ width: '100%', animation: 'fadeIn 0.5s ease forwards' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{
              width: 44, height: 44,
              background: '#c6f135',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(198,241,53,0.3)',
              flexShrink: 0,
            }}>
              <img
                src={athleteImg}
                alt=""
                style={{
                  width: 26, height: 26,
                  filter: 'brightness(0)',
                  objectFit: 'contain',
                }}
              />
            </div>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: '#f0f2f5', letterSpacing: '0.04em', lineHeight: 1 }}>
                ДЕКАТЛОН <span style={{ color: '#c6f135' }}>PRO</span>
              </div>
              <div style={{ fontSize: 10, color: '#4b5563', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>
                Coach Platform
              </div>
            </div>
          </div>

          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 30,
            fontWeight: 800,
            color: '#f0f2f5',
            margin: '0 0 4px',
            letterSpacing: '0.01em',
          }}>{mode === 'signin' ? 'Вход в систему' : 'Регистрация тренера'}</h2>
          <p style={{ color: '#4b5563', fontSize: 13, margin: '0 0 28px', lineHeight: 1.5 }}>
            {mode === 'signin'
              ? 'Введите учётные данные для доступа к платформе'
              : 'Создайте аккаунт тренера, чтобы начать работу'}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Имя
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Сергей Морозов"
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(8,10,15,0.8)',
                    border: '1px solid #1e2230',
                    borderRadius: 8,
                    padding: '12px 14px',
                    color: '#f0f2f5',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(198,241,53,0.5)'}
                  onBlur={e => e.target.style.borderColor = '#1e2230'}
                />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="coach@sport.ru"
                required
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(8,10,15,0.8)',
                  border: '1px solid #1e2230',
                  borderRadius: 8,
                  padding: '12px 14px',
                  color: '#f0f2f5',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(198,241,53,0.5)'}
                onBlur={e => e.target.style.borderColor = '#1e2230'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(8,10,15,0.8)',
                  border: '1px solid #1e2230',
                  borderRadius: 8,
                  padding: '12px 14px',
                  color: '#f0f2f5',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(198,241,53,0.5)'}
                onBlur={e => e.target.style.borderColor = '#1e2230'}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: 8, padding: '10px 14px',
                color: '#f87171', fontSize: 13, marginBottom: 16,
              }}>{error}</div>
            )}

            {info && (
              <div style={{
                background: 'rgba(198,241,53,0.08)',
                border: '1px solid rgba(198,241,53,0.25)',
                borderRadius: 8, padding: '10px 14px',
                color: '#c6f135', fontSize: 13, marginBottom: 16,
              }}>{info}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(198,241,53,0.45)' : '#c6f135',
                color: '#080a0f',
                border: 'none', borderRadius: 8,
                padding: '13px',
                fontSize: 15, fontWeight: 800,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 0 24px rgba(198,241,53,0.25)',
              }}
            >
              {loading ? 'Подождите...' : mode === 'signin' ? 'Войти в систему' : 'Зарегистрироваться'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); setInfo('') }}
            style={{
              width: '100%',
              marginTop: 16,
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              padding: '8px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#c6f135'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#6b7280'}
          >
            {mode === 'signin' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  )
}