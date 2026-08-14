import TaskCard from "./TaskCard";
import { getAssigneeIds } from "../utils/dashboardHelpers";
import "../pages/Board.css";

function TaskColumn({ title, tasks, users, onStatusChange, onCardClick }) {
  return (
    <div className="board-column">
      <h2 className="board-column-title">
        <span>{title}</span>
        <span className="board-column-count">{tasks.length}</span>
      </h2>

      {tasks.length === 0 && <p className="board-column-empty">Aucune tâche.</p>}

      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          title={task.title}
          status={task.status}
          // ⚠️ task.assigneeIds n'existe plus : le format réel est task.assignments
          // (voir dashboardHelpers.js). getAssigneeIds() fait la conversion.
          assigneeIds={getAssigneeIds(task)}
          users={users}
          onStatusChange={() => onStatusChange(task.id)}
          onClick={() => onCardClick(task)}
        />
      ))}
    </div>
  );
}

export default TaskColumn;