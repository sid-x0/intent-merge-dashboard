import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import ActivityTable from '../components/ActivityTable'

export default function DashboardPage({ session, membership, onLeave }) {
  const [conflicts, setConflicts] = useState([])
  const [newIds, setNewIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const orgId   = membership.org_id
  const orgName = membership.organizations?.name ?? 'Your Org'
  const email   = session.user.email
  const channelRef = useRef(null)

  useEffect(() => {
    fetchConflicts()
    subscribeToConflicts()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [orgId])

  async function fetchConflicts() {
    setLoading(true)
    const { data } = await supabase
      .from('conflicts')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(100)
    setConflicts(data ?? [])
    setLoading(false)
  }

  function subscribeToConflicts() {
    const channel = supabase
      .channel(`conflicts:${orgId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conflicts', filter: `org_id=eq.${orgId}` },
        (payload) => {
          const row = payload.new
          setConflicts(prev => [row, ...prev])
          setNewIds(prev => new Set([...prev, row.id]))
          setTimeout(() => {
            setNewIds(prev => { const s = new Set(prev); s.delete(row.id); return s })
          }, 2200)
        }
      )
      .subscribe()
    channelRef.current = channel
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  async function handleLeaveOrg() {
    if (!confirm(`Leave "${orgName}"?`)) return
    await supabase.from('memberships').delete()
      .eq('user_id', session.user.id).eq('org_id', orgId)
    onLeave()
  }

  return (
    <>
      <div className="mesh-bg"><div className="mesh-orb-mid" /></div>
      <div className="app-layout">

        {/* Floating Pill Navbar */}
        <nav className="navbar">
          <div className="navbar-brand">
            <div className="brand-icon" style={{ width: 30, height: 30, fontSize: '0.85rem' }}>IM</div>
            <span style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>Intent Merge</span>
          </div>
          <div className="navbar-right">
            <div className="navbar-org">
              <span className="org-dot" />
              {orgName}
            </div>
            <span className="navbar-email">{email}</span>
            <button id="leave-org-btn" className="btn btn-ghost" onClick={handleLeaveOrg}>Leave</button>
            <button id="sign-out-btn" className="btn btn-outline" onClick={handleSignOut} style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
              Sign Out
            </button>
          </div>
        </nav>

        {/* Content */}
        <main className="dash-content">
          <div className="dash-header fade-in">
            <h1>Developer Activity <span className="grad-text">Log</span></h1>
            <p className="dash-meta">
              Real-time conflict &amp; commit tracking for <strong style={{ color: 'var(--text-secondary)' }}>{orgName}</strong>
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '0.85rem' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--cyan)', borderColor: 'rgba(99,230,255,0.15)', width: 22, height: 22 }} />
              Loading activity…
            </div>
          ) : (
            <div className="fade-in">
              <ActivityTable items={conflicts} newIds={newIds} />
            </div>
          )}
        </main>

      </div>
    </>
  )
}
