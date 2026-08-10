import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import TaskColumn from "../components/TaskColumn";
import TaskModal from "../components/TaskModal";
import NewTaskModal from "../components/NewTaskModal";
import TasksTable from "./TasksTable";

function BoardPage({
  tasks = [],
  users = [],
  projects = [],
  currentUser,
  loading,
  error,
  selectedTask,
  setSelectedTask,
  actions,
  onStatusChange,
  onCreateTask,
  onCreateSubtask,
  onEditTask,
  onDeleteTask,
}) {
  // =========================================================
  // HOOKS — ALL HOOKS MUST COME BEFORE ANY EARLY RETURN
  // =========================================================

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [view, setView] = useState("KANBAN");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // =========================================================
  // PERMISSIONS / HELPERS
  // =========================================================

  const isAdmin = currentUser?.globalRoles?.includes("ADMIN");

  const isScrumMaster = currentUser?.departmentRoles?.some(
    (dr) => dr.role === "SCRUM_MASTER"
  );

  const canCreateTask = isAdmin || isScrumMaster;

  const isAssignedToMe = (task) =>
    (task.assignments || []).some(
      (assignment) =>
        assignment.userId === currentUser?.id &&
        !assignment.unassignedAt
    );

  const isLate = (task) =>
    task.dueDate &&
    task.status !== "TERMINE" &&
    new Date(task.dueDate) < new Date();

  // =========================================================
  // FILTERED TASKS
  // =========================================================

  const searchedTasks = useMemo(() => {
    let result = tasks.filter((task) => !task.parentTaskId);

    // Filter: assigned to me
    if (activeFilter === "MINE") {
      result = result.filter(isAssignedToMe);
    }

    // Filter: late tasks
    if (activeFilter === "LATE") {
      result = result.filter(isLate);
    }

    // Filter: priority
    if (priorityFilter !== "ALL") {
      result = result.filter(
        (task) => task.priority === priorityFilter
      );
    }

    // Search by title
    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter((task) =>
        task.title?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [tasks, activeFilter, priorityFilter, search]);

  // =========================================================
  // EARLY RETURNS
  // IMPORTANT: These come AFTER ALL HOOKS
  // =========================================================

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Chargement des tâches...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">
        Erreur : {error}
      </div>
    );
  }

  // =========================================================
  // TASK GROUPS
  // =========================================================

  const aFaire = searchedTasks.filter(
    (task) => task.status === "A_FAIRE"
  );

  const enCours = searchedTasks.filter(
    (task) => task.status === "EN_COURS"
  );

  const termine = searchedTasks.filter(
    (task) => task.status === "TERMINE"
  );

  // =========================================================
  // FILTER TABS
  // =========================================================

  const FILTERS = [
    {
      key: "ALL",
      label: "Toutes les tâches",
    },
    {
      key: "MINE",
      label: "Assignées à moi",
    },
    {
      key: "LATE",
      label: "En retard",
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <div className="p-6">
        {/* =====================================================
            TITLE / HEADER
        ===================================================== */}

        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Tâches
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Suivi des tâches par statut.
            </p>
          </div>

          {canCreateTask && (
            <button
              type="button"
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2.5 transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Nouvelle tâche
            </button>
          )}
        </div>

        {/* =====================================================
            FILTERS + VIEW TOGGLE
        ===================================================== */}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Filter tabs */}

          <div className="inline-flex items-center rounded-xl p-1 bg-slate-100">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  activeFilter === filter.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* View toggle */}

          <div className="inline-flex items-center rounded-lg border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => setView("KANBAN")}
              className={`px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
                view === "KANBAN"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Kanban
            </button>

            <button
              type="button"
              onClick={() => setView("TABLE")}
              className={`px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
                view === "TABLE"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Tableau
            </button>
          </div>
        </div>

        {/* =====================================================
            SEARCH + PRIORITY FILTER
        ===================================================== */}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}

          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 flex-1 min-w-[240px] bg-slate-50 border border-slate-100">
            <Search
              size={16}
              className="text-slate-400 shrink-0"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une tâche..."
              className="bg-transparent text-[13px] outline-none w-full text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Priority */}

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value)
            }
            className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none bg-white"
          >
            <option value="ALL">Toutes priorités</option>
            <option value="CRITIQUE">Critique</option>
            <option value="HAUTE">Haute</option>
            <option value="MOYENNE">Moyenne</option>
            <option value="BASSE">Basse</option>
          </select>
        </div>

        {/* =====================================================
            TASK CONTENT
        ===================================================== */}

        {view === "KANBAN" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <TaskColumn
              title="À faire"
              tasks={aFaire}
              users={users}
              onStatusChange={onStatusChange}
              onCardClick={setSelectedTask}
            />

            <TaskColumn
              title="En cours"
              tasks={enCours}
              users={users}
              onStatusChange={onStatusChange}
              onCardClick={setSelectedTask}
            />

            <TaskColumn
              title="Terminé"
              tasks={termine}
              users={users}
              onStatusChange={onStatusChange}
              onCardClick={setSelectedTask}
            />
          </div>
        ) : (
          <TasksTable
            tasks={searchedTasks}
            projects={projects}
            users={users}
            onRowClick={setSelectedTask}
          />
        )}
      </div>

      {/* =======================================================
          TASK MODAL
      ======================================================= */}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          allTasks={tasks}
          users={users}
          actions={actions}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onCreateSubtask={onCreateSubtask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      )}

      {/* =======================================================
          NEW TASK MODAL
      ======================================================= */}

      {showNewTaskModal && canCreateTask && (
        <NewTaskModal
          users={users}
          projects={projects}
          currentUser={currentUser}
          onClose={() => setShowNewTaskModal(false)}
          onCreate={onCreateTask}
        />
      )}
    </>
  );
}

export default BoardPage;