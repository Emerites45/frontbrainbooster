import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ListChecks, CheckCircle2, AlertTriangle, Building2, Download, ArrowRight } from "lucide-react";
import { fetchUsers, fetchDepartments } from "../api/api";
import StatsGrid from "../components/dashboard/StatsGrid";
import WorkloadList from "../components/dashboard/WorkloadList";
import ProjectsTable from "../components/dashboard/ProjectsTable";
import RecentActivity from "../components/dashboard/RecentActivity";
import TodayWidget from "../components/dashboard/TodayWidget";
import { computeTaskStats } from "../utils/dashboardHelpers";

const PROJECTS_PREVIEW_LIMIT = 5;

function AdminDashboardPage({ tasks = [], projects = [], actions = [], currentUser }) {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchDepartments()])
      .then(([usersData, deptData]) => {
        setUsers(usersData);
        setDepartments(deptData);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = computeTaskStats(tasks, actions);

  const workloadRows = departments.map((dept) => {
    const deptProjectIds = projects.filter((p) => p.departmentId === dept.id).map((p) => p.id);
    const deptTasks = tasks.filter((t) => deptProjectIds.includes(t.projectId));
    const active = deptTasks.filter((t) => t.status !== "TERMINE").length;
    return { id: dept.id, name: dept.name, numerator: active, total: deptTasks.length, unitLabel: "tâches actives" };
  });

  const previewProjects = projects.slice(0, PROJECTS_PREVIEW_LIMIT);

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6">
      {/* Bandeau d'en-tête */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-7 sm:px-8 sm:py-8">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-white">Tableau de bord — Administration</h1>
            <p className="text-[13.5px] text-blue-100 mt-1">Vue d'ensemble de toute l'organisation Aaprovidir.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur text-white text-[13px] font-medium px-4 py-2.5 transition-colors">
            <Download size={15} />
            Exporter le rapport
          </button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <p className="text-[13.5px] text-slate-400 text-center py-6">Chargement des statistiques...</p>
      ) : (
        <StatsGrid
          items={[
            { label: "Tâches actives", value: stats.active, icon: ListChecks, accent: "#1D4ED8", accentBg: "#DBEAFE" },
            { label: "Terminées (7j)", value: stats.doneThisWeek, variant: "positive", icon: CheckCircle2, accent: "#16A34A", accentBg: "#DCFCE7" },
            { label: "En retard", value: stats.overdue, variant: stats.overdue > 0 ? "negative" : undefined, icon: AlertTriangle, accent: "#DC2626", accentBg: "#FEE2E2" },
            { label: "Départements actifs", value: departments.length, icon: Building2, accent: "#7C3AED", accentBg: "#EDE9FE" },
          ]}
        />
      )}

      {/* Charge + activité + à faire aujourd'hui */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WorkloadList
          title="Charge par département"
          rows={workloadRows}
          emptyMessage="Aucune donnée de département disponible."
        />
        <RecentActivity actions={actions} />
        <TodayWidget tasks={tasks} currentUser={currentUser} projects={projects} />
      </div>

      {/* Portefeuille de projets — aperçu limité, plus le tableau complet illisible */}
      {projects.length === 0 ? (
        <div className="surface-card rounded-xl">
          <p className="text-[13.5px] text-slate-400 text-center py-16">
            Aucun projet pour l'instant. Créez votre premier projet pour commencer à organiser le travail de votre équipe.
          </p>
        </div>
      ) : (
        <div>
          <ProjectsTable
            title="Portefeuille de projets"
            projects={previewProjects}
            tasks={tasks}
            users={users}
            departments={departments}
            showDepartment
            showTeam
          />
          {projects.length > PROJECTS_PREVIEW_LIMIT && (
            <div className="flex justify-end mt-2">
              <Link
                to="/admin/projects"
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-blue-600 hover:text-blue-700"
              >
                Voir les {projects.length} projets
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;