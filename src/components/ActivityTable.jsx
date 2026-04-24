function formatTime(ts) {
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getInitials(name) {
  return name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

const COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6']
function avatarColor(name) {
  let h = 0; for (let c of name) h = (h * 31 + c.charCodeAt(0)) % COLORS.length
  return COLORS[h]
}

export default function ActivityTable({ items, newIds }) {
  if (!items || items.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">
            <span className="live-dot" />
            Activity Log
          </span>
        </div>
        <div className="table-empty">
          No events recorded yet.<br />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Activity will appear here in real time.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">
          <span className="live-dot" />
          Activity Log
        </span>
        <span className="badge badge-count">{items.length} events</span>
      </div>

      <div className="table-scroll">
        <table className="activity-table">
          <thead>
            <tr>
              <th>User</th>
              <th>File</th>
              <th>Type</th>
              <th>Source</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id ?? i} className={newIds?.has(item.id) ? 'row-new' : ''}>
                <td>
                  <div className="user-cell">
                    <div className="avatar avatar-sm" style={{ background: avatarColor(item.author) }}>
                      {getInitials(item.author)}
                    </div>
                    <span className="user-name">{item.author}</span>
                  </div>
                </td>
                <td><span className="file-cell" title={item.file}>{item.file}</span></td>
                <td>
                  <span className={`event-type-badge event-${item.event_type || 'resolved'}`}>
                    {item.event_type === 'prevented' ? '🛡️ Prevented' : '✅ Resolved'}
                  </span>
                </td>
                <td><span className="source-pill">{(item.source || 'vscode').replace('github-pr-', 'gh-')}</span></td>
                <td><span className="time-cell">{formatTime(item.created_at)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
