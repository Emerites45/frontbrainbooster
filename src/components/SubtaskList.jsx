import { useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";

function SubtaskList({ subtasks, users = [], onAddSubtask, onEditSubtask, onDeleteSubtask, onToggleStatus }) {
  const [title, setTitle] = useState("");
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddSubtask(title, assigneeIds);
    setTitle("");
    setAssigneeIds([]);
  }

  function toggleAssignee(userId) {
    setAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  function startEdit(subtask) {
    setEditingId(subtask.id);
    setEditTitle(subtask.title);
  }

  function saveEdit(subtaskId) {
    onEditSubtask(subtaskId, { title: editTitle });
    setEditingId(null);
  }

  function assigneeNames(subtask) {
    const ids = (subtask.assignments || []).map((a) => a.userId);
    if (ids.length === 0) return null;
    return ids
      .map((id) => users.find((u) => u.id === id))
      .filter(Boolean)
      .map((u) => `${u.firstName} ${u.lastName[0]}.`)
      .join(", ");
  }

  return (
    <div>
      {subtasks.length === 0 ? (
        <p className="text-[13px] text-slate-400 mb-4">Aucune sous-tâche.</p>
      ) : (
        <ul className="space-y-1.5 mb-4">
          {subtasks.map((subtask) => (
            <li
              key={subtask.id}
              className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg hover:bg-slate-50 group"
            >
              {editingId === subtask.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 rounded-md border border-slate-200 text-[13px] px-2 py-1 outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => saveEdit(subtask.id)}
                    className="text-blue-600 hover:text-blue-700 shrink-0"
                  >
                    <Check size={15} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onToggleStatus(subtask.id)}
                    className={`flex items-center justify-center w-4 h-4 rounded-full border shrink-0 transition-colors ${
                      subtask.status === "TERMINE" ? "bg-green-500 border-green-500" : "border-slate-300 hover:border-blue-400"
                    }`}
                    aria-label={subtask.status === "TERMINE" ? "Marquer comme non terminée" : "Marquer comme terminée"}
                  >
                    {subtask.status === "TERMINE" && <Check size={10} className="text-white" strokeWidth={3} />}
                  </button>
                  <span className="text-[13px] text-slate-700 flex-1 truncate">
                    {subtask.title}
                    {assigneeNames(subtask) && (
                      <span className="text-slate-400"> — {assigneeNames(subtask)}</span>
                    )}
                  </span>
                  <button
                    onClick={() => startEdit(subtask)}
                    className="text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDeleteSubtask(subtask.id)}
                    className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nouvelle sous-tâche"
          className="w-full rounded-lg border border-slate-200 text-[13px] px-3 py-2 outline-none focus:border-blue-400"
        />
        <div className="flex flex-wrap gap-2">
          {users.map((u) => (
            <label
              key={u.id}
              className={`flex items-center gap-1.5 text-[12px] rounded-full px-2.5 py-1 border cursor-pointer transition-colors ${
                assigneeIds.includes(u.id)
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <input
                type="checkbox"
                checked={assigneeIds.includes(u.id)}
                onChange={() => toggleAssignee(u.id)}
                className="hidden"
              />
              {u.firstName} {u.lastName}
            </label>
          ))}
        </div>
        {assigneeIds.length === 0 && (
          <p className="text-[11.5px] text-slate-400">
            Aucun assigné sélectionné → assignée à toi-même par défaut.
          </p>
        )}
        <button
          type="submit"
          className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12.5px] font-medium px-3.5 py-1.5 transition-colors"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}

export default SubtaskList;