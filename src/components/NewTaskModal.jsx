import { useState } from "react";

function NewTaskModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      id: Date.now(),
      title,
      description,
      status: "A_FAIRE",
      assigneeId: assigneeId ? Number(assigneeId) : undefined,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}>Fermer</button>
        <h2>Nouvelle tâche</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la tâche"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Assigner à moi-même</option>
            <option value="1">Marcus Chen (ADMIN)</option>
            <option value="2">Alex Rivera (SCRUM_MASTER)</option>
            <option value="3">Sarah Jenkins (MEMBER)</option>
          </select>
          <button type="submit">Créer</button>
        </form>
      </div>
    </div>
  );
}

export default NewTaskModal;