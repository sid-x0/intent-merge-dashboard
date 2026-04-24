import { useState } from 'react'
import { supabase } from '../supabase'

export default function OrgPage({ userId, onJoined }) {
  const [tab, setTab] = useState('create')
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    setError(''); setLoading(true)

    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name: orgName.trim() })
      .select()
      .single()

    if (orgErr) {
      setError(orgErr.message.includes('unique') ? 'An organization with that name already exists.' : orgErr.message)
      setLoading(false); return
    }

    const { data: membership, error: memErr } = await supabase
      .from('memberships')
      .insert({ user_id: userId, org_id: org.id })
      .select('*, organizations(*)')
      .single()

    if (memErr) setError(memErr.message)
    else onJoined(membership)
    setLoading(false)
  }

  async function handleJoin(e) {
    e.preventDefault()
    setError(''); setLoading(true)

    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .select('*')
      .ilike('name', orgName.trim())
      .single()

    if (orgErr || !org) {
      setError('No organization found with that name.'); setLoading(false); return
    }

    const { data: membership, error: memErr } = await supabase
      .from('memberships')
      .insert({ user_id: userId, org_id: org.id })
      .select('*, organizations(*)')
      .single()

    if (memErr) setError(memErr.message.includes('unique') ? 'You are already a member of this organization.' : memErr.message)
    else onJoined(membership)
    setLoading(false)
  }

  function switchTab(t) { setTab(t); setError(''); setOrgName('') }

  return (
    <>
      <div className="mesh-bg"><div className="mesh-orb-mid" /></div>
      <div className="page-center">
        <div className="org-box animate-in">

          {/* Brand */}
          <div className="auth-brand">
            <div className="brand-icon">A</div>
            <span className="auth-brand-name grad-text">Athernex</span>
          </div>

          {/* Header */}
          <div className="org-header">
            <h1>Set up your workspace</h1>
            <p>Create a new organization or join an existing one to start tracking activity</p>
          </div>

          {/* Card */}
          <div className="glass-card">
            {/* Tabs */}
            <div className="org-tabs">
              <button id="tab-create" className={`org-tab ${tab === 'create' ? 'active' : ''}`} onClick={() => switchTab('create')}>
                Create Organization
              </button>
              <button id="tab-join" className={`org-tab ${tab === 'join' ? 'active' : ''}`} onClick={() => switchTab('join')}>
                Join Organization
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={tab === 'create' ? handleCreate : handleJoin}>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label htmlFor="org-name-input">Organization Name</label>
                <input
                  id="org-name-input"
                  type="text"
                  placeholder={tab === 'create' ? 'e.g. Acme Engineering' : 'Enter exact organization name'}
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button id="org-submit-btn" type="submit" className="btn btn-primary btn-full" disabled={loading || !orgName.trim()}>
                {loading
                  ? <><div className="spinner" />{tab === 'create' ? 'Creating…' : 'Joining…'}</>
                  : tab === 'create' ? 'Create & Join' : 'Join Organization'
                }
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}
