import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password, name)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 440, margin: '0 24px' }}>
        <div style={{ background: 'rgba(15,17,23,0.85)', border: '1px solid rgba(42,48,64,0.8)', borderRadius: 16, padding: '36px 40px' }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, color: '#f0f2f5', margin: '0 0 24px' }}>
            {mode === 'signin' ? 'Вход в систему' : 'Регистрация тренера'}
          </h2>
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Имя тренера"
                required
                style={{ width: '100%', marginBottom: 12, padding: '12px 14px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 8, color: '#f0f2f5' }}
              />
            )}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ width: '100%', marginBottom: 12, padding: '12px 14px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 8, color: '#f0f2f5' }}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', marginBottom: 20, padding: '12px 14px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 8, color: '#f0f2f5' }}
            />
            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: '#c6f135', color: '#080a0f', border: 'none', borderRadius: 8, padding: '13px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Загрузка...' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>
          <button
            onClick={() => setMode(m => (m === 'signin' ? 'signup' : 'signin'))}
            style={{ marginTop: 16, background: 'transparent', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer' }}
          >
            {mode === 'signin' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  )
}