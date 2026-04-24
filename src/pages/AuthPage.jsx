import { useState } from 'react'
import { supabase } from '../supabase'

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
          setError('Email rate limit reached. In Supabase → Authentication → Settings, disable "Enable email confirmations" and try again.')
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
      <div className="mesh-bg"><div className="mesh-orb-mid" /></div>
      <div className="page-center">
        <div className="auth-box animate-in">

          {/* Brand */}
          <div className="auth-brand">
            <div className="brand-icon">IM</div>
            <span className="auth-brand-name grad-text">Intent Merge</span>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p>{mode === 'login' ? 'Sign in to your team workspace' : 'Start tracking developer activity'}</p>
          </div>

          {/* Card */}
          <div className="glass-card">
            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="auth-email">Email address</label>
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
          </div>

          {/* Toggle */}
          <div className="auth-toggle">
            {mode === 'login'
              ? <>No account? <button id="switch-to-signup" onClick={() => switchMode('signup')}>Sign up for free</button></>
              : <>Already have an account? <button id="switch-to-login" onClick={() => switchMode('login')}>Sign in</button></>
            }
          </div>

        </div>
      </div>
    </>
  )
}
