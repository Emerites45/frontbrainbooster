import { useState } from "react";
import SubtaskList from "./SubtaskList";
import HistoryTimeline from "./HistoryTimeline";
import { getAssigneeIds, getAssigneeNames, STATUS_LABEL } from "../utils/dashboardHelpers";
import "../pages/AdminDashboard.css";
import "../pages/Board.css";

function TaskModal({ task, allTasks, users = [], actions, onClose, onCreateSubtask, onEditTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  const subtasks = allTasks.filter((t) => String(t.parentTaskId) === String(task.id));
  const taskActions = actions.filter((a) => String(a.id_tache) === String(task.id));
  // ⚠️ task.assigneeIds n'existe plus : le format réel est task.assignments.
  const assigneeIds = getAssigneeIds(task);

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
        <button className="modal-close" onClick={onClose}>Fermer</button>

        {isEditing ? (
          <>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="task-detail-actions">
              <button className="btn-primary-sm" onClick={handleSave}>Enregistrer</button>
              <button className="btn-status" onClick={() => setIsEditing(false)}>Annuler</button>
            </div>
          </>
        ) : (
          <>
            <h2>{task.title}</h2>
            <span className={`status-pill status-${task.status?.toLowerCase()}`}>
              {STATUS_LABEL[task.status] ?? task.status}
            </span>
            <p>{task.description}</p>
            <p className="task-detail-meta">
              👤 Assigné(s) : {getAssigneeNames(assigneeIds, users)}
            </p>
            <div className="task-detail-actions">
              <button className="btn-status" onClick={() => setIsEditing(true)}>Modifier</button>
              <button className="btn-status" onClick={handleDelete}>Supprimer</button>
            </div>
          </>
        )}

        <h3>Sous-tâches</h3>
        <SubtaskList
          subtasks={subtasks}
          users={users}
          // ⚠️ Le second paramètre reçu ici (nommé "assignees" plus bas) doit être
          // normalisé côté App.jsx (handleCreateTask -> normalizeAssignments) avant
          // stockage, peu importe si SubtaskList envoie des IDs bruts ou des objets
          // enrichis. Vérifie quand même le format que SubtaskList produit réellement.
          onAddSubtask={(subtaskTitle, assignees) => onCreateSubtask(task.id, subtaskTitle, assignees)}
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