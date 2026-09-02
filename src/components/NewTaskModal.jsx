import { useState } from "react";
import { X } from "lucide-react";


function NewTaskModal({ onClose, onCreate, users = [], projects = [], currentUser }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("MOYENNE");


  const isAdmin = currentUser?.globalRoles?.includes("ADMIN");
  const myScrumMasterDept = (currentUser?.departmentRoles || []).find(
    (dr) => dr.role === "SCRUM_MASTER"
  );


  const availableProjects = isAdmin
    ? projects
    : myScrumMasterDept
    ? projects.filter((p) => p.departmentId === myScrumMasterDept.departmentId)
    : [];


  function handleAssigneeToggle(userId) {
    setAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }


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


          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11.5px] text-slate-400 mb-1 block">Échéance (optionnel)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex-1">
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


            {users.length === 0 && (
              <p className="text-[12.5px] text-slate-400">Chargement des utilisateurs...</p>
            )}


            <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto">
              {users.map((u) => {
                const roleLabel = u.globalRoles?.[0] ?? u.departmentRoles?.[0]?.role ?? "MEMBER";
                const deptLabel = u.departmentRoles?.[0]?.departmentName;
                const checked = assigneeIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className={`flex items-center gap-1.5 text-[12px] rounded-full px-2.5 py-1.5 border cursor-pointer transition-colors ${
                      checked
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleAssigneeToggle(u.id)}
                      className="hidden"
                    />
                    {u.firstName} {u.lastName}
                    {deptLabel && <span className="text-slate-400"> · {deptLabel}</span>}
                  </label>
                );
              })}
            </div>
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