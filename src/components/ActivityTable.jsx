function formatTime(ts) {
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getInitials(name) {
  return name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

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

export default function ActivityTable({ items, newIds }) {
  if (!items || items.length === 0) {
    return (
      <div className="glass-panel table-panel">
        <div className="panel-header">
          <span className="panel-title">Activity Log</span>
        </div>
        <div className="table-empty">
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>📋</div>
          No events recorded yet
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel table-panel">
      <div className="panel-header">
        <span className="panel-title">Activity Log</span>
        <span className="badge badge-success">{items.length} events</span>
      </div>

      <div className="table-scroll">
        <table className="activity-table">
          <thead>
            <tr>
              <th>User</th>
              <th>File</th>
              <th>Commit</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id ?? i} className={newIds?.has(item.id) ? 'row-new' : ''}>
                <td>
                  <div className="user-cell">
                    <div className="avatar avatar-sm" style={{ background: avatarGrad(item.author) }}>
                      {getInitials(item.author)}
                    </div>
                    <span className="user-name">{item.author}</span>
                  </div>
                </td>
                <td><span className="file-cell" title={item.file}>{item.file}</span></td>
                <td><span className="commit-pill">{item.commit_hash.slice(0, 7)}</span></td>
                <td><span className="time-cell">{formatTime(item.created_at)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
