import { useState, useEffect } from "react";
import { fetchUsers, fetchDepartments, createAdminUser } from "../api/api";
import StatsGrid from "../components/dashboard/StatsGrid";
import WorkloadList from "../components/dashboard/WorkloadList";
import ProjectsTable from "../components/dashboard/ProjectsTable";
import RecentActivity from "../components/dashboard/RecentActivity";
import UsersTable from "../components/dashboard/UsersTable";
import CreateUserModal from "../components/dashboard/CreateUserModal";
import { computeTaskStats } from "../utils/dashboardHelpers";
import "./AdminDashboard.css";

function AdminDashboardPage({ tasks = [], projects = [], actions = [] }) {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
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

  const stats = computeTaskStats(tasks);

  const workloadRows = departments.map((dept) => {
    const deptProjectIds = projects.filter((p) => p.departmentId === dept.id).map((p) => p.id);
    const deptTasks = tasks.filter((t) => deptProjectIds.includes(t.projectId));
    const active = deptTasks.filter((t) => t.status !== "TERMINE").length;
    return {
      id: dept.id,
      name: dept.name,
      numerator: active,
      total: deptTasks.length,
      unitLabel: "tâches actives",
    };
  });

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Tableau de bord — Administration</h1>
          <p className="dashboard-subtitle">Vue d'ensemble de toute l'organisation Aaprovidir.</p>
        </div>
        <button className="btn-primary-sm">Exporter le rapport</button>
      </div>

      <StatsGrid
        items={[
          { label: "Tâches actives", value: stats.active },
          { label: "Terminées (7j)", value: stats.doneThisWeek, variant: "positive" },
          { label: "En retard", value: stats.overdue, variant: stats.overdue > 0 ? "negative" : undefined },
          { label: "Départements actifs", value: departments.length },
        ]}
      />

      <div className="admin-grid">
        <WorkloadList
          title="Charge par département"
          rows={workloadRows}
          emptyMessage="Aucune donnée de département disponible."
        />
        <RecentActivity actions={actions} />
      </div>

      <ProjectsTable
        title="Portefeuille de projets"
        projects={projects}
        tasks={tasks}
        users={users}
        departments={departments}
        showDepartment
        showTeam
      />

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