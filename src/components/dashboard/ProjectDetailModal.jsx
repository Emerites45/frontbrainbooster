import { useState } from "react";
import {
  X,
  Calendar,
  Users as UsersIcon,
  Pencil,
  Trash2,
  Paperclip,
} from "lucide-react";

import TaskModal from "../TaskModal";
import AttachmentList from "./AttachmentList";

import {
  STATUS_LABEL,
  initials,
  projectProgress,
  projectTeam,
} from "../../utils/dashboardHelpers";

const STATUS_STYLES = {
  A_FAIRE: "bg-amber-50 text-amber-700",
  EN_COURS: "bg-blue-50 text-blue-700",
  TERMINE: "bg-green-50 text-green-700",
};

const STATUS_DOT = {
  A_FAIRE: "bg-amber-400",
  EN_COURS: "bg-blue-500",
  TERMINE: "bg-green-500",
};

function TaskNode({
  task,
  allTasks,
  users,
  level,
  onTaskClick,
}) {
  const children = allTasks.filter(
    (t) => String(t.parentTaskId) === String(task.id)
  );

  const assignedUsers = (task.assignments || [])
    .filter((a) => !a.unassignedAt)
    .map((a) => users.find((u) => u.id === a.userId))
    .filter(Boolean);

  const names = assignedUsers
    .map((u) => u.firstName)
    .join(", ");

  return (
    <div style={{ paddingLeft: level > 0 ? 24 : 0 }}>
      {level > 0 && (
        <div className="border-l border-slate-100" />
      )}

      <div
        className="flex items-center justify-between gap-3 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 rounded-md px-1 -mx-1 transition-colors"
        onClick={() => onTaskClick(task)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              STATUS_DOT[task.status] ?? "bg-slate-300"
            }`}
          />

          <span
            className={`truncate ${
              level === 0
                ? "text-[13.5px] font-medium text-slate-800"
                : "text-[13px] text-slate-600"
            }`}
          >
            {task.title}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11.5px] text-slate-400 hidden sm:block">
            {names || "Non assigné"}
          </span>

          <span
            className={`inline-flex items-center rounded-full text-[10.5px] font-semibold px-2 py-0.5 ${
              STATUS_STYLES[task.status] ??
              "bg-slate-100 text-slate-600"
            }`}
          >
            {STATUS_LABEL[task.status] ?? task.status}
          </span>
        </div>
      </div>

      {children.map((child) => (
        <TaskNode
          key={child.id}
          task={child}
          allTasks={allTasks}
          users={users}
          level={level + 1}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
}

function ProjectDetailModal({
  project,
  tasks,
  users,
  departments = [],
  actions = [],
  currentUser,
  onClose,
  onEdit,
  onDelete,
  onCreateSubtask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) {
  const [openTask, setOpenTask] = useState(null);
  const [showFiles, setShowFiles] = useState(false);

  const projectTasks = tasks.filter(
    (t) => String(t.projectId) === String(project.id)
  );

  const rootTasks = projectTasks.filter(
    (t) => !t.parentTaskId
  );

  const progress = projectProgress(project, tasks);
  const team = projectTeam(project, tasks, users);

  const deptName =
    departments.find(
      (d) => String(d.id) === String(project.departmentId)
    )?.name ?? "—";

  return (
    <>
      {/* ================================
          PROJECT DETAIL MODAL
      ================================= */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <div
          className="max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ================================
              PROJECT HEADER
          ================================= */}
          <div className="px-7 pt-6 pb-5 border-b border-slate-50">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-[17px] font-semibold text-slate-900 truncate">
                  {project.name}
                </h2>

                <p className="mt-1 text-[12.5px] text-slate-500">
                  {deptName}
                </p>
              </div>

              {/* Header actions */}
              <div className="flex shrink-0 items-center gap-1">
                {/* Files */}
                <button
                  type="button"
                  onClick={() => setShowFiles(true)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  aria-label="Fichiers du projet"
                  title="Fichiers du projet"
                >
                  <Paperclip size={16} />
                </button>

                {/* Edit */}
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(project)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    aria-label="Modifier le projet"
                    title="Modifier le projet"
                  >
                    <Pencil size={16} />
                  </button>
                )}

                {/* Delete */}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(project.id)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Supprimer le projet"
                    title="Supprimer le projet"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {/* Close */}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Fermer"
                  title="Fermer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <p className="mb-4 mt-4 text-[13px] text-slate-500">
                {project.description}
              </p>
            )}

            {/* Metadata */}
            <div className="mb-4 flex flex-wrap items-center gap-4 text-[12.5px] text-slate-500">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  STATUS_STYLES[project.status] ??
                  "bg-slate-100 text-slate-600"
                }`}
              >
                {STATUS_LABEL[project.status] ??
                  project.status}
              </span>

              {project.endDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  Échéance : {project.endDate}
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <UsersIcon size={13} />
                {team.length} membre
                {team.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="shrink-0 text-[12px] text-slate-500">
                {progress}%
              </span>
            </div>

            {/* Team */}
            {team.length > 0 && (
              <div className="mt-4 flex items-center">
                {team.map((user, idx) => (
                  <span
                    key={user.id}
                    title={`${user.firstName} ${user.lastName}`}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-[10.5px] font-semibold text-white ${
                      idx !== 0 ? "-ml-2" : ""
                    }`}
                  >
                    {initials(user.firstName, user.lastName)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ================================
              TASKS
          ================================= */}
          <div className="px-7 py-5">
            <h3 className="mb-2 text-[13px] font-semibold text-slate-900">
              Tâches ({projectTasks.length})
            </h3>

            {rootTasks.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-slate-400">
                Aucune tâche pour ce projet.
              </p>
            ) : (
              <div>
                {rootTasks.map((task) => (
                  <TaskNode
                    key={task.id}
                    task={task}
                    allTasks={projectTasks}
                    users={users}
                    level={0}
                    onTaskClick={setOpenTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================
          TASK MODAL
      ================================= */}
      {openTask && (
        <TaskModal
          task={openTask}
          allTasks={projectTasks}
          users={users}
          actions={actions.filter(
            (action) =>
              String(action.id_tache) === String(openTask.id) ||
              projectTasks.some(
                (task) =>
                  String(task.id) === String(action.id_tache)
              )
          )}
          currentUser={currentUser}
          onClose={() => setOpenTask(null)}
          onCreateSubtask={onCreateSubtask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      )}

      {/* ================================
          PROJECT FILES MODAL
      ================================= */}
      {showFiles && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowFiles(false)}
        >
          <div
            className="w-full max-w-[420px] max-h-[75vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Files header */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">
                  Fichiers du projet
                </h3>

                <p className="mt-1 text-[12px] text-slate-400">
                  Fichiers associés aux tâches de ce projet
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFiles(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Fermer les fichiers"
              >
                <X size={17} />
              </button>
            </div>

            {/* Aggregated project attachments */}
            <AttachmentList
              projectId={project.id}
              readOnly
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectDetailModal;