import { useState } from "react";
import SubtaskList from "./SubtaskList";
import HistoryTimeline from "./HistoryTimeline";

function TaskModal({ task, allTasks, actions, onClose, onCreateSubtask, onEditTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  const subtasks = allTasks.filter((t) => String(t.parentTaskId) === String(task.id));
  const taskActions = actions.filter((a) => String(a.id_tache) === String(task.id));

  function handleSave() {
    onEditTask(task.id, { title, description });
    setIsEditing(false);
  }

  function handleDelete() {
    if (window.confirm("Supprimer cette tâche et ses sous-tâches ?")) {
      onDeleteTask(task.id);
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}>Fermer</button>

        {isEditing ? (
          <>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            <button onClick={handleSave}>Enregistrer</button>
            <button onClick={() => setIsEditing(false)}>Annuler</button>
          </>
        ) : (
          <>
            <h2>{task.title}</h2>
            <p>Statut : {task.status}</p>
            <p>{task.description}</p>
            <button onClick={() => setIsEditing(true)}>Modifier</button>
            <button onClick={handleDelete}>Supprimer</button>
          </>
        )}

        <h3>Sous-tâches</h3>
        <SubtaskList
          subtasks={subtasks}
          onAddSubtask={(title, assigneeId) => onCreateSubtask(task.id, title, assigneeId)}
          onEditSubtask={onEditTask}
          onDeleteSubtask={onDeleteTask}
        />

        <h3>Historique</h3>
        <HistoryTimeline actions={taskActions} />
      </div>
    </div>
  );
}

export default TaskModal;
