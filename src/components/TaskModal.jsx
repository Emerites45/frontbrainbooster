import { useState } from "react";
import { X, Pencil, Trash2 } from "lucide-react";

import SubtaskList from "./SubtaskList";
import HistoryTimeline from "./HistoryTimeline";
import AttachmentList from "./dashboard/AttachmentList";
import CommentSection from "./dashboard/CommentSection";

import {
  getAssigneeIds,
  getAssigneeNames,
  STATUS_LABEL,
} from "../utils/dashboardHelpers";

const STATUS_STYLES = {
  A_FAIRE: "bg-amber-50 text-amber-700",
  EN_COURS: "bg-blue-50 text-blue-700",
  TERMINE: "bg-green-50 text-green-700",
};

function TaskModal({
  task,
  allTasks = [],
  users = [],
  actions = [],
  currentUser,
  onClose,
  onCreateSubtask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title ?? "");
  const [description, setDescription] = useState(
    task.description ?? ""
  );

  // =========================================================
  // DATA
  // =========================================================

  const subtasks = allTasks.filter(
    (t) => String(t.parentTaskId) === String(task.id)
  );

  const taskActions = actions.filter(
    (a) => String(a.id_tache) === String(task.id)
  );

  const assigneeIds = getAssigneeIds(task);

  // =========================================================
  // HANDLERS
  // =========================================================

  function handleSave() {
    onEditTask(task.id, {
      title,
      description,
    });

    setIsEditing(false);
  }

  function handleDelete() {
    if (
      window.confirm(
        "Supprimer cette tâche et ses sous-tâches ?"
      )
    ) {
      onDeleteTask(task.id);
      onClose();
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[560px] max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="px-7 py-5 border-b border-slate-100">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 text-[15px] font-medium px-3.5 py-2.5 outline-none focus:border-blue-400"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400 resize-none"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 transition-colors"
                >
                  Enregistrer
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTitle(task.title ?? "");
                    setDescription(task.description ?? "");
                    setIsEditing(false);
                  }}
                  className="text-[13px] text-slate-500 hover:text-slate-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Title + actions */}

              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[17px] font-semibold text-slate-900">
                  {task.title}
                </h2>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                    aria-label="Modifier"
                    title="Modifier"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    aria-label="Supprimer"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label="Fermer"
                    title="Fermer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Status */}

              <div className="mt-3">
                <span
                  className={`inline-flex items-center rounded-full text-[11px] font-semibold px-2.5 py-1 ${
                    STATUS_STYLES[task.status] ??
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {STATUS_LABEL[task.status] ?? task.status}
                </span>
              </div>

              {/* Description */}

              {task.description && (
                <p className="mt-3 text-[13.5px] leading-6 text-slate-600 whitespace-pre-wrap">
                  {task.description}
                </p>
              )}

              {/* Assignees */}

              <p className="mt-3 text-[13px] text-slate-500">
                <span className="font-medium text-slate-700">
                  Assigné(s) :
                </span>{" "}
                {getAssigneeNames(assigneeIds, users) || "—"}
              </p>
            </>
          )}
        </div>

        {/* =====================================================
            SOUS-TÂCHES
        ===================================================== */}

        <div className="px-7 py-5 border-b border-slate-50">
          <h3 className="text-[13px] font-semibold text-slate-900 mb-3">
            Sous-tâches
          </h3>

          <SubtaskList
            subtasks={subtasks}
            users={users}
            onAddSubtask={(subtaskTitle, assignees) =>
              onCreateSubtask(
                task.id,
                subtaskTitle,
                assignees
              )
            }
            onEditSubtask={onEditTask}
            onDeleteSubtask={onDeleteTask}
            onToggleStatus={onStatusChange}
          />
        </div>

        {/* =====================================================
            COMMENTAIRES
        ===================================================== */}

        <div className="px-7 py-5 border-b border-slate-50">
          <h3 className="text-[13px] font-semibold text-slate-900 mb-3">
            Commentaires
          </h3>

          <CommentSection
            taskId={task.id}
            currentUser={currentUser}
            assigneeIds={assigneeIds}
            taskTitle={task.title}
            recipientUsers={users}
          />
        </div>

        {/* =====================================================
            FICHIERS / ATTACHMENTS
        ===================================================== */}

        <div className="px-7 py-5 border-b border-slate-50">
          <h3 className="text-[13px] font-semibold text-slate-900 mb-3">
            Fichiers
          </h3>

          <AttachmentList taskId={task.id} />
        </div>

        {/* =====================================================
            HISTORIQUE
        ===================================================== */}

        <div className="px-7 py-5">
          <h3 className="text-[13px] font-semibold text-slate-900 mb-3">
            Historique
          </h3>

          <HistoryTimeline actions={taskActions} />
        </div>
      </div>
    </div>
  );
}

export default TaskModal;