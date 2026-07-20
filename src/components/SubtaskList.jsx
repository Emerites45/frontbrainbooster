import { useState } from "react";
import { MOCK_USERS } from "../constants/mockUsers";

function SubtaskList({ subtasks, onAddSubtask, onEditSubtask, onDeleteSubtask }) {
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddSubtask(title, assigneeId ? Number(assigneeId) : undefined);
    setTitle("");
    setAssigneeId("");
  }

  function startEdit(subtask) {
    setEditingId(subtask.id);
    setEditTitle(subtask.title);
  }

  function saveEdit(subtaskId) {
    onEditSubtask(subtaskId, { title: editTitle });
    setEditingId(null);
  }

  return (
    <div>
      {subtasks.length === 0 ? (
        <p>Aucune sous-tâche.</p>
      ) : (
        <ul>
          {subtasks.map((subtask) => (
            <li key={subtask.id}>
              {editingId === subtask.id ? (
                <>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  <button onClick={() => saveEdit(subtask.id)}>OK</button>
                </>
              ) : (
                <>
                  <input type="checkbox" checked={subtask.status === "TERMINE"} readOnly />
                  {subtask.title}
                  <button onClick={() => startEdit(subtask)}>Modifier</button>
                  <button onClick={() => onDeleteSubtask(subtask.id)}>Supprimer</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nouvelle sous-tâche"
        />
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
          <option value="">Assigner à moi-même</option>
          {MOCK_USERS.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
          ))}
        </select>
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default SubtaskList;