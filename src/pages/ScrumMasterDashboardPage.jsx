import { useState, useEffect } from "react";
import { fetchUsers } from "../api/api";
import StatsGrid from "../components/dashboard/StatsGrid";
import WorkloadList from "../components/dashboard/WorkloadList";
import ProjectsTable from "../components/dashboard/ProjectsTable";
import { computeTaskStats, getAssigneeIds } from "../utils/dashboardHelpers";

function ScrumMasterDashboardPage({ currentUser, tasks = [], projects = [] }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const myDeptRole = (currentUser.departmentRoles || []).find((dr) => dr.role === "SCRUM_MASTER");

  if (loading) return <p className="text-[13.5px] text-slate-400 px-8 py-6">Chargement du tableau de bord...</p>;
  if (error) return <p className="text-[13.5px] text-red-600 px-8 py-6">Erreur : {error}</p>;

  if (!myDeptRole) {
    return (
      <div className="px-8 py-6">
        <p className="text-[13.5px] text-slate-400">
          Aucun département Scrum Master n'est associé à votre compte pour le moment.
          Contactez un administrateur si cela ne devrait pas être le cas.
        </p>
      </div>
    );
  }

  const deptId = myDeptRole.departmentId;
  const deptName = myDeptRole.departmentName;
  const deptProjects = projects.filter((p) => p.departmentId === deptId);
  const deptProjectIds = deptProjects.map((p) => p.id);
  const deptTasks = tasks.filter((t) => deptProjectIds.includes(t.projectId));
  const teamMembers = users.filter(
    (u) => u.id !== currentUser.id && (u.departmentRoles || []).some((dr) => dr.departmentId === deptId)
  );
  const stats = computeTaskStats(deptTasks);
  const workloadRows = teamMembers.map((member) => {
    const memberTasks = deptTasks.filter((t) => getAssigneeIds(t).includes(member.id));
    const done = memberTasks.filter((t) => t.status === "TERMINE").length;
    return { id: member.id, name: `${member.firstName} ${member.lastName}`, numerator: done, total: memberTasks.length, unitLabel: "tâches terminées" };
  });

  return (
    <div className="px-8 py-6 space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-slate-900">Tableau de bord — {deptName}</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Vue d'ensemble de votre équipe et de vos projets.</p>
      </div>
      <StatsGrid
        items={[
          { label: "Tâches du département", value: stats.total },
          { label: "Terminées", value: stats.done, variant: "positive" },
          { label: "En retard", value: stats.overdue, variant: stats.overdue > 0 ? "negative" : undefined },
          { label: "Progression", value: `${stats.progression}%` },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkloadList title="Charge de l'équipe" rows={workloadRows} emptyMessage="Aucun autre membre dans ce département pour l'instant." />
        <ProjectsTable title="Projets du département" projects={deptProjects} tasks={deptTasks} />
      </div>
    </div>
  );
}

export default ScrumMasterDashboardPage;