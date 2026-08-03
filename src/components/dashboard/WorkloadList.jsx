import "../../pages/AdminDashboard.css";

/**
 * rows: [{ id, name, numerator, total, unitLabel? }]
 * pct = numerator / total (le sens de numerator dépend de l'appelant :
 * "tâches actives" pour l'Admin, "tâches terminées" pour un Scrum Master, etc.)
 */
function WorkloadList({ title, rows, emptyMessage = "Aucune donnée disponible." }) {
  return (
    <div className="admin-card">
      <h2>{title}</h2>
      <div className="dept-workload-list">
        {rows.length === 0 && <p className="empty-state">{emptyMessage}</p>}
        {rows.map((row) => {
          const safeTotal = row.total || 0;
          const pct = safeTotal === 0 ? 0 : Math.round((row.numerator / safeTotal) * 100);
          return (
            <div key={row.id} className="dept-workload-row">
              <div className="dept-workload-header">
                <span className="dept-name">{row.name}</span>
                <span className="dept-count">
                  {row.numerator} / {row.total} {row.unitLabel ?? "tâches"}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WorkloadList;