function TaskCard({ title, status, onStatusChange, onClick }) {
  function handleStatusClick(e) {
    e.stopPropagation(); // empêche le clic de "remonter" jusqu'à onClick de la carte
    onStatusChange();
  }

  return (
    <div className="task-card" onClick={onClick}>
      <h3>{title}</h3>
      <span>{status}</span>
      <button onClick={handleStatusClick}>Changer statut</button>
    </div>
  );
}

export default TaskCard;