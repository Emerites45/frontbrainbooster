import { STATUS_LABEL } from "../../utils/dashboardHelpers";
import "../../pages/AdminDashboard.css";

function MyTasksTable({ tasks, projects, title = "Mes tâches" }) {
  const projectName = (id) => projects.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>{title}</h2>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Tâche</th>
            <th>Projet</th>
            <th>Statut</th>
            <th>Échéance</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 && (
            <tr>
              <td colSpan={4} className="empty-state">Aucune tâche assignée pour l'instant.</td>
            </tr>
          )}
          {tasks.map((t) => (
            <tr key={t.id}>
              <td className="project-name-cell">{t.title}</td>
              <td>{projectName(t.projectId)}</td>
              <td>
                <span className={`status-pill status-${t.status?.toLowerCase()}`}>
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </td>
              <td>{t.dueDate ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyTasksTable;