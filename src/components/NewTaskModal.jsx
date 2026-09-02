import { useState } from "react";
import { X } from "lucide-react";
import AssigneePicker from "../components/dashboard/AssigneePicker";

function NewTaskModal({ onClose, onCreate, users = [], projects = [], currentUser }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("MOYENNE");
  const [type, setType] = useState("TACHE");

  const isAdmin = currentUser?.globalRoles?.includes("ADMIN");
  const myScrumMasterDept = (currentUser?.departmentRoles || []).find(
    (dr) => dr.role === "SCRUM_MASTER"
  );

  const availableProjects = isAdmin
    ? projects
    : myScrumMasterDept
    ? projects.filter((p) => p.departmentId === myScrumMasterDept.departmentId)
    : [];

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    onCreate({
      id: Date.now(),
      title,
      description,
      status: "A_FAIRE",
      projectId: Number(projectId),
      assignments: assigneeIds,
      dueDate: dueDate || null,
      priority,
      type,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-[460px] max-h-[85vh] overflow-y-auto p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-[17px] font-semibold text-slate-900">Nouvelle tâche</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la tâche"
            autoFocus
            className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400 resize-none"
          />

          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
          >
            <option value="">Sélectionner un projet</option>
            {availableProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {availableProjects.length === 0 && (
            <p className="text-[12px] text-amber-600">
              Aucun projet disponible{!isAdmin ? " dans votre département" : ""}.
            </p>
          )}

          {/* Three-column horizontal layout for Metadata */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11.5px] text-slate-400 mb-1 block">
                Type de tâche
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
              >
                <option value="TACHE">Tâche</option>
                <option value="BUG">Bug</option>
                <option value="STORY">User Story</option>
              </select>
            </div>

            <div>
              <label className="text-[11.5px] text-slate-400 mb-1 block">Échéance (optionnel)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-[11.5px] text-slate-400 mb-1 block">Priorité</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
              >
                <option value="BASSE">Basse</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute</option>
                <option value="CRITIQUE">Critique</option>
              </select>
            </div>
          </div>

          <fieldset>
            <legend className="text-[12px] font-medium text-slate-500 mb-2">
              Assigner à (plusieurs possibles)
            </legend>

            {users.length === 0 ? (
              <p className="text-[12.5px] text-slate-400">Chargement des utilisateurs...</p>
            ) : (
              <AssigneePicker
                users={users}
                selectedIds={assigneeIds}
                onChange={setAssigneeIds}
              />
            )}
          </fieldset>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-medium py-2.5 mt-1 transition-colors"
          >
            Créer
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewTaskModal;