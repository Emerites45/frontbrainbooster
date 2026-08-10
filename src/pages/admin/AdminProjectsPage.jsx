import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  FolderPlus,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import { fetchDepartments, fetchUsers } from "../../api/api";

import StatsGrid from "../../components/dashboard/StatsGrid";
import ProjectsTable from "../../components/dashboard/ProjectsTable";
import CreateProjectModal from "../../components/dashboard/CreateProjectModal";
import ProjectDetailModal from "../../components/dashboard/ProjectDetailModal";

import { projectProgress } from "../../utils/dashboardHelpers";
import { usePagination } from "../../hooks/usePagination";

function AdminProjectsPage({
  projects = [],
  tasks = [],
  actions = [],
  currentUser,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onCreateSubtask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ============================================
  // LOAD DEPARTMENTS + USERS
  // ============================================

  useEffect(() => {
    Promise.all([fetchDepartments(), fetchUsers()])
      .then(([deptData, usersData]) => {
        setDepartments(deptData);
        setUsers(usersData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ============================================
  // OPEN CREATE MODAL FROM ?create=true
  // ============================================

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowCreateModal(true);

      const params = new URLSearchParams(searchParams);
      params.delete("create");

      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // ============================================
  // EDIT
  // ============================================

  function handleEditClick(project) {
    setSelectedProject(null);
    setEditingProject(project);
  }

  // ============================================
  // DELETE
  // ============================================

  async function handleDeleteClick(projectId) {
    if (
      !window.confirm(
        "Supprimer ce projet ? Cette action est irréversible."
      )
    ) {
      return;
    }

    await onDeleteProject(projectId);
    setSelectedProject(null);
  }

  // ============================================
  // FILTER PROJECTS
  // ============================================

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  // ============================================
  // STATS
  // IMPORTANT: use FULL projects array
  // ============================================

  const stats = useMemo(() => {
    const total = projects.length;

    const active = projects.filter(
      (p) => p.status !== "TERMINE"
    ).length;

    const overdue = projects.filter(
      (p) =>
        p.endDate &&
        p.status !== "TERMINE" &&
        new Date(p.endDate) < new Date()
    ).length;

    const avgProgress =
      total === 0
        ? 0
        : Math.round(
            projects.reduce(
              (sum, p) => sum + projectProgress(p, tasks),
              0
            ) / total
          );

    return {
      total,
      active,
      overdue,
      avgProgress,
    };
  }, [projects, tasks]);

  // ============================================
  // PAGINATION
  // Filter FIRST → paginate SECOND
  // ============================================

  const {
    pageItems: pagedProjects,
    page,
    totalPages,
    rangeStart,
    rangeEnd,
    totalItems,
    goToPage,
  } = usePagination(filteredProjects, 10);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Chargement des projets...
      </div>
    );
  }

  // ============================================
  // UI
  // ============================================

  return (
    <div className="space-y-6">
      {/* ================================
          HEADER
      ================================= */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Projets
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {filteredProjects.length} projet
            {filteredProjects.length > 1 ? "s" : ""} sur{" "}
            {projects.length}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2.5 transition-colors"
        >
          <FolderPlus size={16} />
          Nouveau projet
        </button>
      </div>

      {/* ================================
          STATS
      ================================= */}

      <StatsGrid
        items={[
          {
            label: "Total projets",
            value: stats.total,
            icon: FolderKanban,
            accent: "#1D4ED8",
            accentBg: "#DBEAFE",
          },
          {
            label: "Actifs",
            value: stats.active,
            icon: CheckCircle2,
            accent: "#16A34A",
            accentBg: "#DCFCE7",
          },
          {
            label: "En retard",
            value: stats.overdue,
            variant:
              stats.overdue > 0 ? "negative" : undefined,
            icon: AlertTriangle,
            accent: "#DC2626",
            accentBg: "#FEE2E2",
          },
          {
            label: "Progression moyenne",
            value: `${stats.avgProgress}%`,
            icon: TrendingUp,
            accent: "#7C3AED",
            accentBg: "#EDE9FE",
          },
        ]}
      />

      {/* ================================
          SEARCH + FILTER
      ================================= */}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 flex-1 min-w-[260px] bg-slate-50 border border-slate-100">
          <Search
            size={16}
            className="text-slate-400 shrink-0"
          />

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
          className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none bg-white"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="A_FAIRE">À faire</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Terminé</option>
        </select>
      </div>

      {/* ================================
          PROJECT TABLE
      ================================= */}

      <ProjectsTable
        projects={pagedProjects}
        tasks={tasks}
        users={users}
        departments={departments}
        showDepartment
        showTeam
        onProjectClick={setSelectedProject}
        pagination={{
          page,
          totalPages,
          rangeStart,
          rangeEnd,
          totalItems,
          onPageChange: goToPage,
        }}
      />

      {/* ================================
          CREATE PROJECT MODAL
      ================================= */}

      {showCreateModal && (
        <CreateProjectModal
          departments={departments}
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreateProject}
        />
      )}

      {/* ================================
          PROJECT DETAILS
      ================================= */}

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          tasks={tasks}
          users={users}
          departments={departments}
          actions={actions}
          currentUser={currentUser}
          onClose={() => setSelectedProject(null)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onCreateSubtask={onCreateSubtask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onStatusChange={onStatusChange}
        />
      )}

      {/* ================================
          EDIT PROJECT
      ================================= */}

      {editingProject && (
        <CreateProjectModal
          project={editingProject}
          departments={departments}
          onClose={() => setEditingProject(null)}
          onEdit={onUpdateProject}
        />
      )}
    </div>
  );
}

export default AdminProjectsPage;