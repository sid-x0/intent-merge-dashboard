function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getInitials(name) {
  return name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

// Deterministic gradient per username
const GRADIENTS = [
  'linear-gradient(135deg,#63e6ff,#a855f7)',
  'linear-gradient(135deg,#22d3a5,#63e6ff)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#a855f7,#ec4899)',
  'linear-gradient(135deg,#22d3a5,#a855f7)',
  'linear-gradient(135deg,#63e6ff,#22d3a5)',
]
function avatarGrad(name) {
  let h = 0; for (let c of name) h = (h * 31 + c.charCodeAt(0)) % GRADIENTS.length
  return GRADIENTS[h]
}

export default function ActivityFeed({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="glass-panel feed-panel">
        <div className="panel-header">
          <span className="panel-title"><span className="live-dot" />Live Feed</span>
        </div>
        <div className="feed-empty">
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚡</div>
          No activity yet<br />
          <span style={{ fontSize: '0.78rem' }}>Events will appear here in real time</span>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel feed-panel">
      <div className="panel-header">
        <span className="panel-title"><span className="live-dot" />Live Feed</span>
        <span className="badge badge-cyan">{items.length}</span>
      </div>

      <div className="feed-list">
        {items.map((item, i) => (
          <div className="feed-item" key={item.id ?? i}>
            <div className="avatar avatar-md" style={{ background: avatarGrad(item.author) }}>
              {getInitials(item.author)}
            </div>
            <div className="feed-body">
                <div className="feed-text">
                  <span className="feed-author">@{item.author}</span>
                  {' '}
                  {item.event_type === 'prevented' ? '🛡️ prevented conflict in' : '✅ resolved conflict in'}
                  {' '}
                  <span className="feed-file">{item.file?.split('/').pop() ?? item.file}</span>
                </div>
                <div className="feed-meta">
                  <span className="feed-time">{formatTime(item.created_at)}</span>
                  {item.commit_hash ? <span className="feed-commit">{item.commit_hash.slice(0, 7)}</span> : null}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
