import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import AuthPage from './pages/AuthPage'
import OrgPage from './pages/OrgPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  const [session, setSession] = useState(null)
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchMembership(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchMembership(session.user.id)
      else {
        setMembership(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchMembership(userId) {
    setLoading(true)
    const { data } = await supabase
      .from('memberships')
      .select('*, organizations(*)')
      .eq('user_id', userId)
      .single()
    setMembership(data || null)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading Athernex…</span>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={!session ? <AuthPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/org"
          element={
            !session ? <Navigate to="/auth" replace /> :
            membership ? <Navigate to="/" replace /> :
            <OrgPage userId={session.user.id} onJoined={(m) => setMembership(m)} />
          }
        />
        <Route
          path="/"
          element={
            !session ? <Navigate to="/auth" replace /> :
            !membership ? <Navigate to="/org" replace /> :
            <DashboardPage session={session} membership={membership} onLeave={() => setMembership(null)} />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
