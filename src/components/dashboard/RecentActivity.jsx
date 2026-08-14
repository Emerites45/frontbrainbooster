import { STATUS_LABEL, timeAgo } from "../../utils/dashboardHelpers";
import "../../pages/AdminDashboard.css";

function RecentActivity({ actions, limit = 8 }) {
  const recent = [...actions]
    .sort((a, b) => new Date(b.date_action) - new Date(a.date_action))
    .slice(0, limit);

  return (
    <div className="admin-card">
      <h2>Activité récente</h2>
      {recent.length === 0 ? (
        <p className="empty-state">Aucune activité pour l'instant.</p>
      ) : (
        <ul className="activity-list">
          {recent.map((a) => (
            <li key={a.id}>
              <strong>{a.nom_user}</strong>{" "}
              {a.type_action === "CREATION"
                ? "a créé une tâche"
                : a.type_action === "CHANGEMENT_STATUT"
                ? `a changé le statut → ${STATUS_LABEL[a.nouvelle_valeur] ?? a.nouvelle_valeur}`
                : `a modifié ${a.champ_modifie}`}
              <br />
              <span className="activity-time">{timeAgo(a.date_action)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentActivity;