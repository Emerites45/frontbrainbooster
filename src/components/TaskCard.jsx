import { getUserName } from "../constants/mockUsers";

function TaskCard({ title, status, assigneeId, onStatusChange, onClick }) {
  function handleStatusClick(e) {
    e.stopPropagation();
    onStatusChange();
  }

  return (
    <div className="task-card" onClick={onClick}>
      <h3>{title}</h3>
      <span>{status}</span>
      <p style={{ fontSize: "13px", color: "#6b6b6b", margin: "4px 0" }}>
        👤 {getUserName(assigneeId)}
      </p>
      <button onClick={handleStatusClick}>Changer statut</button>
    </div>
  );
}

export default TaskCard;