import { useState } from "react";

function SubtaskList({ subtasks, onAddSubtask }) {
  const [title, setTitle] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddSubtask(title);
    setTitle("");
  }

  return (
    <div>
      {subtasks.length === 0 ? (
        <p>Aucune sous-tâche.</p>
      ) : (
        <ul>
          {subtasks.map((subtask) => (
            <li key={subtask.id}>
              <input
                type="checkbox"
                checked={subtask.status === "TERMINE"}
                readOnly
              />
              {subtask.title}
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
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default SubtaskList;
