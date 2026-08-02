import { useState, useEffect } from "react";
import { fetchUsers, fetchDepartments, createAdminUser } from "../api/api";
import "../AdminDashboard.css";
function computeStats(tasks) {
  const total = tasks.length;
  const termine = tasks.filter((t) => t.status === "TERMINE").length;
  const enRetard = tasks.filter(
    (t) => t.status !== "TERMINE" && t.dueDate && new Date(t.dueDate) < new Date(),
  ).length;
  const progression = total === 0 ? 0 : Math.round((termine / total) * 100);
  return { total, termine, enRetard, progression };
}

function DepartmentWorkload({ departments, tasks, projects }) {
  return (
    <div className="admin-card">
      <h2>Charge par département</h2>
      <div className="dept-workload-list">
        {departments.map((dept) => {
          const deptProjectIds = projects
            .filter((p) => p.departmentId === dept.id)
            .map((p) => p.id);
          const deptTasks = tasks.filter((t) => deptProjectIds.includes(t.projectId));
          const done = deptTasks.filter((t) => t.status === "TERMINE").length;
          const pct = deptTasks.length === 0 ? 0 : Math.round((done / deptTasks.length) * 100);

          return (
            <div key={dept.id} className="dept-workload-row">
              <div className="dept-workload-header">
                <span className="dept-name">{dept.name}</span>
                <span className="dept-count">
                  {done} / {deptTasks.length} tâches
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectsTable({ projects, departments }) {
  const deptName = (id) => departments.find((d) => d.id === id)?.name ?? "—";

  return (
    <div className="admin-card">
      <h2>Portefeuille de projets</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Projet</th>
            <th>Département</th>
            <th>Statut</th>
            <th>Échéance</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td className="project-name-cell">{p.name}</td>
              <td>{deptName(p.departmentId)}</td>
              <td>
                <span className={`status-pill status-${p.status?.toLowerCase()}`}>
                  {p.status?.replace("_", " ")}
                </span>
              </td>
              <td>{p.endDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentActivity({ actions }) {
  const recent = [...actions]
    .sort((a, b) => new Date(b.date_action) - new Date(a.date_action))
    .slice(0, 8);

  return (
    <div className="admin-card">
      <h2>Activité récente</h2>
      {recent.length === 0 ? (
        <p className="empty-state">Aucune activité pour l'instant.</p>
      ) : (
        <ul className="activity-list">
          {recent.map((a) => (
            <li key={a.id}>
              <strong>{a.nom_user}</strong>{" "}
              {a.type_action === "CREATION"
                ? "a créé une tâche"
                : a.type_action === "CHANGEMENT_STATUT"
                ? `a changé un statut (${a.ancienne_valeur} → ${a.nouvelle_valeur})`
                : `a modifié ${a.champ_modifie}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CreateUserModal({ departments, onClose, onCreate }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departmentRole, setDepartmentRole] = useState("MEMBER");
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const dept = departments.find((d) => d.id === Number(departmentId));
    try {
      await onCreate({
        firstName,
        lastName,
        email,
        departmentId: dept?.id ?? null,
        departmentName: dept?.name ?? null,
        departmentRole,
        globalRole: isGlobalAdmin ? "ADMIN" : null,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close">Fermer</button>
        <h2>Créer un utilisateur</h2>
        <p className="modal-subtitle">
          Un mot de passe temporaire sera envoyé par email. L'utilisateur devra le
          changer à sa première connexion.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prénom"
              required
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nom"
              required
            />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email professionnel"
            required
          />
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required
          >
            <option value="">Sélectionner un département</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={departmentRole}
            onChange={(e) => setDepartmentRole(e.target.value)}
          >
            <option value="MEMBER">Membre</option>
            <option value="SCRUM_MASTER">Scrum Master</option>
          </select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isGlobalAdmin}
              onChange={(e) => setIsGlobalAdmin(e.target.checked)}
            />
            Accès Administrateur global
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Création..." : "Créer l'utilisateur"}
          </button>
        </form>
      </div>
    </div>
  );
}

function UsersTable({ users, departments, onOpenCreate }) {
  const rolesLabel = (user) => {
    const labels = [];
    if (user.globalRoles?.includes("ADMIN")) labels.push("Admin");
    (user.departmentRoles || []).forEach((dr) => {
      const deptName = departments.find((d) => d.id === dr.departmentId)?.name ?? dr.departmentName;
      labels.push(`${dr.role === "SCRUM_MASTER" ? "Scrum Master" : "Membre"} · ${deptName}`);
    });
    return labels.length ? labels.join(", ") : "—";
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>Gestion des utilisateurs</h2>
        <button className="btn-primary-sm" onClick={onOpenCreate}>
          + Créer un utilisateur
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle(s)</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.email}</td>
              <td>{rolesLabel(u)}</td>
              <td>
                {u.mustChangePassword ? (
                  <span className="status-pill status-pending">En attente</span>
                ) : (
                  <span className="status-pill status-active">Actif</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminDashboardPage({ tasks, projects }) {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [actions] = useState([]); // remplacé par les vraies actions globales plus tard
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchDepartments()])
      .then(([usersData, deptData]) => {
        setUsers(usersData);
        setDepartments(deptData);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateUser(userData) {
    const newUser = await createAdminUser(userData);
    setUsers((prev) => [...prev, newUser]);
  }

  if (loading) return <p className="loading-text">Chargement du tableau de bord...</p>;

  const stats = computeStats(tasks);

  return (
    <div className="admin-dashboard">
      <h1>Tableau de bord — Administration</h1>
      <p className="dashboard-subtitle">Vue d'ensemble de toute l'organisation Aaprovidir.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total des tâches</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Terminées</h3>
          <p className="stat-number stat-positive">{stats.termine}</p>
        </div>
        <div className="stat-card">
          <h3>En retard</h3>
          <p className="stat-number stat-negative">{stats.enRetard}</p>
        </div>
        <div className="stat-card">
          <h3>Progression globale</h3>
          <p className="stat-number">{stats.progression}%</p>
        </div>
      </div>

      <div className="admin-grid">
        <DepartmentWorkload departments={departments} tasks={tasks} projects={projects} />
        <RecentActivity actions={actions} />
      </div>

      <ProjectsTable projects={projects} departments={departments} />

      <UsersTable
        users={users}
        departments={departments}
        onOpenCreate={() => setShowCreateModal(true)}
      />

      {showCreateModal && (
        <CreateUserModal
          departments={departments}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateUser}
        />
      )}
    </div>
  );
}

export default AdminDashboardPage;