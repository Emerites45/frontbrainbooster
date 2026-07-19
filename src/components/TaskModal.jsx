import SubtaskList from "./SubtaskList";
import HistoryTimeline from "./HistoryTimeline";

function TaskModal({ task, allTasks, actions, onClose }) {
  const subtasks = allTasks.filter((t) => String(t.parentTaskId) === String(task.id));
  const taskActions = actions.filter((a) => String(a.id_tache) === String(task.id));

  console.log("actions reçues :", actions);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}>Fermer</button>
        <h2>{task.title}</h2>
        <p>Statut : {task.status}</p>
        <p>{task.description}</p>

        <h3>Sous-tâches</h3>
        <SubtaskList subtasks={subtasks} />

        <h3>Historique</h3>
        <HistoryTimeline actions={taskActions} />
      </div>
    </div>
  );
}

export default TaskModal;