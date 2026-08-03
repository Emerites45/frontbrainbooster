import { STATUS_LABEL, initials, projectProgress, projectTeam } from "../../utils/dashboardHelpers";
import "../../pages/AdminDashboard.css";

/**
 * showDepartment / showTeam : désactivés par défaut, activés par les dashboards
 * qui en ont besoin (Admin voit tout, Scrum Master n'a pas besoin de la colonne
 * département vu qu'il n'en a qu'un seul).
 */
function ProjectsTable({
  title = "Projets",
  projects,
  tasks,
  users = [],
  departments = [],
  showDepartment = false,
  showTeam = false,
}) {
  const deptName = (id) => departments.find((d) => d.id === id)?.name ?? "—";
  const columnCount = 3 + (showDepartment ? 1 : 0) + (showTeam ? 1 : 0);

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>{title}</h2>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Projet</th>
            {showDepartment && <th>Département</th>}
            <th>Statut</th>
            <th>Progression</th>
            {showTeam && <th>Équipe</th>}
            <th>Échéance</th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="empty-state">Aucun projet.</td>
            </tr>
          )}
          {projects.map((p) => {
            const progress = projectProgress(p, tasks);
            const team = showTeam ? projectTeam(p, tasks, users) : [];
            return (
              <tr key={p.id}>
                <td className="project-name-cell">{p.name}</td>
                {showDepartment && <td>{deptName(p.departmentId)}</td>}
                <td>
                  <span className={`status-pill status-${p.status?.toLowerCase()}`}>
                    {STATUS_LABEL[p.status] ?? p.status?.replace("_", " ")}
                  </span>
                </td>
                <td>
                  <div className="progress-track" style={{ width: 100 }}>
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-light)" }}>{progress}%</span>
                </td>
                {showTeam && (
                  <td>
                    <div className="avatar-stack">
                      {team.slice(0, 3).map((u) => (
                        <span key={u.id} className="avatar-chip" title={`${u.firstName} ${u.lastName}`}>
                          {initials(u.firstName, u.lastName)}
                        </span>
                      ))}
                      {team.length > 3 && (
                        <span className="avatar-chip avatar-more">+{team.length - 3}</span>
                      )}
                      {team.length === 0 && <span className="empty-state">—</span>}
                    </div>
                  </td>
                )}
                <td>{p.endDate ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ProjectsTable;