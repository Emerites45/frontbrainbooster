import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, FolderPlus, FolderKanban, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { fetchDepartments, fetchUsers } from "../api/api";
import StatsGrid from "../components/dashboard/StatsGrid";
import ProjectsTable from "../components/dashboard/ProjectsTable";
import CreateProjectModal from "../components/dashboard/CreateProjectModal";
import { projectProgress } from "../utils/dashboardHelpers";


function AdminProjectsPage({ projects = [], tasks = [], onCreateProject }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    Promise.all([fetchDepartments(), fetchUsers()])
      .then(([deptData, usersData]) => {
        setDepartments(deptData);
        setUsers(usersData);
      })
      .finally(() => setLoading(false));
  }, []);

  // Ouvre le modal automatiquement si on arrive via le CTA de la sidebar
  // (/admin/projects?create=true), puis nettoie l'URL.
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowCreateModal(true);
      searchParams.delete("create");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status !== "TERMINE").length;
    const overdue = projects.filter(
      (p) => p.endDate && p.status !== "TERMINE" && new Date(p.endDate) < new Date()
    ).length;
    const avgProgress =
      total === 0
        ? 0
        : Math.round(projects.reduce((sum, p) => sum + projectProgress(p, tasks), 0) / total);
    return { total, active, overdue, avgProgress };
  }, [projects, tasks]);

  if (loading) {
    return <p className="text-[13.5px] text-slate-400 px-8 py-6">Chargement des projets...</p>;
  }

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900">Projets</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""} sur {projects.length}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2.5 transition-colors"
        >
          <FolderPlus size={15} />
          Nouveau projet
        </button>
      </div>

      <StatsGrid
        items={[
          { label: "Total projets", value: stats.total, icon: FolderKanban, accent: "#0B438C", accentBg: "#D0DCF0" },
          { label: "Actifs", value: stats.active, icon: CheckCircle2, accent: "#30A036", accentBg: "#D6F0D7" },
          { label: "En retard", value: stats.overdue, variant: stats.overdue > 0 ? "negative" : undefined, icon: AlertTriangle, accent: "#DC2626", accentBg: "#FEE2E2" },
          { label: "Progression moyenne", value: `${stats.avgProgress}%`, icon: TrendingUp, accent: "#2A9D8F", accentBg: "#C8F0EC" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 flex-1 min-w-[260px] bg-slate-50 border border-slate-100">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un projet..."
            className="bg-transparent text-[13px] outline-none w-full text-slate-700 placeholder-slate-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="A_FAIRE">À faire</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Terminé</option>
        </select>
      </div>

      <ProjectsTable
        projects={filteredProjects}
        tasks={tasks}
        users={users}
        departments={departments}
        showDepartment
        showTeam
      />

      {showCreateModal && (
        <CreateProjectModal
          departments={departments}
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreateProject}
        />
      )}
    </div>
  );
}

export default AdminProjectsPage;