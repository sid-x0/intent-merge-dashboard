import { useState } from 'react'
import { supabase } from '../supabase'

const LogoIcon = () => (
  <div className="logo-icon">
    <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  </div>
)

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('email rate')) {
          setError('Email rate limit reached. In Supabase → Auth → Settings, disable "Enable email confirmations" and try again.')
        } else {
          setError(error.message)
        }
      } else {
        setSuccess('Account created! You can now sign in.')
      }
    }
    setLoading(false)
  }

  function switchMode(m) {
    setMode(m); setError(''); setSuccess('')
    setEmail(''); setPassword('')
  }

  return (
    <>
      <div className="ambient-bg" />
      <div className="page-center">
        <div className="auth-box animate-in">

          <div className="auth-brand">
            <LogoIcon />
            <span className="logo-name">Intent Merge</span>
          </div>

          <div className="card">
            <div className="auth-heading">
              <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p>{mode === 'login' ? 'Sign in to your workspace' : 'Start tracking developer activity'}</p>
            </div>

            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button id="auth-submit-btn" type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading
                  ? <><div className="spinner" />{mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                  : mode === 'login' ? 'Sign In' : 'Create Account'
                }
              </button>
            </form>

            <div className="auth-toggle">
              {mode === 'login'
                ? <>Don't have an account? <button id="switch-to-signup" onClick={() => switchMode('signup')}>Create one</button></>
                : <>Already have an account? <button id="switch-to-login" onClick={() => switchMode('login')}>Sign in</button></>
              }
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
