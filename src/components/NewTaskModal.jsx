import { useState } from "react";
import "../pages/AdminDashboard.css";
import "../pages/Board.css";

/**
 * NewTaskModal
 * Props :
 * - users: [{ id, firstName, lastName, globalRoles: [], departmentRoles: [...] }]
 * - projects: [{ id, name, departmentId, ... }]
 * - currentUser: utilisateur connecté — sert à savoir si on scope les projets
 *   proposés (Scrum Master -> uniquement les projets de son département ;
 *   Admin -> tous les projets).
 * - onCreate(taskData) : appelé avec `projectId` + `assignments` (tableau
 *   d'IDs bruts — normalisé en objets TASK_ASSIGNMENT dans App.jsx).
 */
function NewTaskModal({ onClose, onCreate, users = [], projects = [], currentUser }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeIds, setAssigneeIds] = useState([]);

  const isAdmin = currentUser?.globalRoles?.includes("ADMIN");
  const myScrumMasterDept = (currentUser?.departmentRoles || []).find(
    (dr) => dr.role === "SCRUM_MASTER"
  );

  // Admin voit tous les projets ; Scrum Master ne voit que ceux de son département ;
  // un Membre ne devrait jamais atteindre ce composant (bouton masqué dans BoardPage),
  // mais par sécurité on ne lui montre rien si jamais il y arrivait quand même.
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
      // Tableau d'IDs bruts — normalisé en objets TASK_ASSIGNMENT dans App.jsx.
      assignments: assigneeIds,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>Fermer</button>
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

          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          >
            <option value="">Sélectionner un projet</option>
            {availableProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {availableProjects.length === 0 && (
            <p className="assignee-empty">
              Aucun projet disponible{!isAdmin ? " dans votre département" : ""}.
            </p>
          )}

          <fieldset className="assignee-fieldset">
            <legend className="assignee-legend">Assigner à (plusieurs possibles)</legend>

            {users.length === 0 && (
              <p className="assignee-empty">Chargement des utilisateurs...</p>
            )}

            {users.map((u) => {
              const roleLabel = u.globalRoles?.[0] ?? u.departmentRoles?.[0]?.role ?? "MEMBER";
              const deptLabel = u.departmentRoles?.[0]?.departmentName;
              return (
                <label key={u.id} className="assignee-option">
                  <input
                    type="checkbox"
                    checked={assigneeIds.includes(u.id)}
                    onChange={() => handleAssigneeToggle(u.id)}
                  />
                  <span>
                    {u.firstName} {u.lastName} ({roleLabel}
                    {deptLabel ? ` — ${deptLabel}` : ""})
                  </span>
                </label>
              );
            })}
          </fieldset>

          <button type="submit" className="btn-new-task">Créer</button>
        </form>
      </div>
    </div>
  );
}

export default NewTaskModal;