import { STATUS_LABEL, getAssigneeNames } from "../utils/dashboardHelpers";
import "../pages/AdminDashboard.css";
import "../pages/Board.css";

function TaskCard({ title, status, assigneeIds = [], users = [], onStatusChange, onClick }) {
  function handleStatusClick(e) {
    e.stopPropagation();
    onStatusChange();
  }

  return (
    <div className="task-card" onClick={onClick}>
      <h3 className="task-card-title">{title}</h3>
      <span className={`status-pill status-${status?.toLowerCase()}`}>
        {STATUS_LABEL[status] ?? status}
      </span>
      <p className="task-card-meta">👤 {getAssigneeNames(assigneeIds, users)}</p>
      <div className="task-card-footer">
        <button className="btn-status" onClick={handleStatusClick}>
          Changer statut
        </button>
      </div>
    </div>
  );
}

export default TaskCard;