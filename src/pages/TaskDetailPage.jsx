import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, Lock } from "lucide-react";
import SubtaskList from "../components/SubtaskList";
import CommentSection from "../components/dashboard/CommentSection";
import AttachmentList from "../components/dashboard/AttachmentList";
import TaskDependencyPicker from "../components/dashboard/TaskDependencyPicker";
import AssigneePicker from "../components/dashboard/AssigneePicker";
import TaskTypeBadge from "../components/dashboard/TaskTypeBadge";
import HistoryTimeline from "../components/HistoryTimeline";
import { STATUS_LABEL, getAssigneeIds } from "../utils/dashboardHelpers";

const STATUS_BADGE = {
  A_FAIRE: "bg-amber-50 text-amber-700",
  EN_COURS: "bg-blue-50 text-blue-700",
  TERMINE: "bg-green-50 text-green-700",
};

function TaskDetailPage({ tasks = [], projects = [], users = [], actions = [], currentUser, onEditTask, onDeleteTask, onCreateSubtask, onStatusChange }) {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");

  const task = tasks.find((t) => String(t.id) === taskId);
  const project = projects.find((p) => String(p.id) === projectId);

  if (!task) {
    return (
      <div className="px-8 py-16 text-center">
        <p className="text-[14px] text-slate-500">Cette tâche n'existe pas ou a été supprimée.</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-[13px] font-medium text-blue-600 hover:text-blue-700">← Retour</button>
      </div>
    );
  }

  const subtasks = tasks.filter((t) => t.parentTaskId === task.id);
  const taskActions = actions.filter((a) => String(a.id_tache) === String(task.id));
  const assigneeIds = getAssigneeIds(task);
  const blockedByIds = task.blockedByTaskIds || [];
  const blockingTasks = tasks.filter((t) => blockedByIds.includes(t.id));
  const blocksTasks = tasks.filter((t) => (t.blockedByTaskIds || []).includes(task.id));
  const isBlocked = blockingTasks.some((t) => t.status !== "TERMINE");

  function startEdit() {
    setTitleDraft(task.title);
    setDescDraft(task.description ?? "");
    setIsEditing(true);
  }

  function saveEdit() {
    onEditTask(task.id, { title: titleDraft, description: descDraft });
    setIsEditing(false);
  }

  function handleDelete() {
    if (!window.confirm("Supprimer cette tâche et ses sous-tâches ?")) return;
    onDeleteTask(task.id);
    navigate(project ? `/admin/projects` : "/");
  }

  return (
    <div className="px-4 sm:px-8 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[12.5px] text-slate-400 hover:text-slate-600 mb-4">
        <ArrowLeft size={14} />
        {project ? project.name : "Retour"}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Colonne principale */}
        <div className="space-y-6 min-w-0">
          <div className="surface-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <TaskTypeBadge type={task.type} />
              {task.storyPoints && (
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center">{task.storyPoints}</span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  className="w-full text-[22px] font-semibold text-slate-900 outline-none border-b border-slate-200 focus:border-blue-400 pb-1"
                />
                <textarea
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400 resize-none"
                />
                <div className="flex items-center gap-3">
                  <button onClick={saveEdit} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2">Enregistrer</button>
                  <button onClick={() => setIsEditing(false)} className="text-[13px] text-slate-500 hover:text-slate-700">Annuler</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="text-[22px] font-semibold text-slate-900">{task.title}</h1>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={startEdit} className="text-slate-400 hover:text-blue-600" aria-label="Modifier"><Pencil size={16} /></button>
                    <button onClick={handleDelete} className="text-slate-400 hover:text-red-600" aria-label="Supprimer"><Trash2 size={16} /></button>
                  </div>
                </div>
                {task.description && <p className="text-[13.5px] text-slate-600 whitespace-pre-wrap">{task.description}</p>}
              </>
            )}

            {isBlocked && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-[12.5px]">
                <Lock size={13} />
                Bloquée par {blockingTasks.filter((t) => t.status !== "TERMINE").length} tâche(s) non terminée(s)
              </div>
            )}
          </div>

          <div className="surface-card rounded-xl p-6">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Sous-tâches</h2>
            <SubtaskList
              subtasks={subtasks}
              users={users}
              onAddSubtask={(title, assignees) => onCreateSubtask(task.id, title, assignees)}
              onEditSubtask={onEditTask}
              onDeleteSubtask={onDeleteTask}
              onToggleStatus={onStatusChange}
            />
          </div>

          <div className="surface-card rounded-xl p-6">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Fichiers</h2>
            <AttachmentList taskId={task.id} />
          </div>

          <div className="surface-card rounded-xl p-6">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Commentaires</h2>
            <CommentSection taskId={task.id} currentUser={currentUser} assigneeIds={assigneeIds} taskTitle={task.title} recipientUsers={users} />
          </div>

          <div className="surface-card rounded-xl p-6">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Historique</h2>
            <HistoryTimeline actions={taskActions} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="surface-card rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Statut</p>
            <span className={`inline-flex items-center rounded-full text-[12px] font-semibold px-3 py-1 ${STATUS_BADGE[task.status] ?? "bg-slate-100 text-slate-600"}`}>
              {STATUS_LABEL[task.status] ?? task.status}
            </span>
            <button onClick={() => onStatusChange(task.id)} className="block mt-2 text-[12px] font-medium text-blue-600 hover:text-blue-700">
              Changer le statut →
            </button>
          </div>

          <div className="surface-card rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Assigné(s)</p>
            <AssigneePicker
              users={users}
              selectedIds={assigneeIds}
              onChange={(ids) => onEditTask(task.id, { assignments: ids })}
              maxHeight={160}
            />
          </div>

          <div className="surface-card rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Dates</p>
            <div className="space-y-2 text-[12.5px]">
              <div className="flex justify-between"><span className="text-slate-400">Début</span><span className="text-slate-700">{task.startDate ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Échéance</span><span className="text-slate-700">{task.dueDate ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Fin</span><span className="text-slate-700">{task.endDate ?? "—"}</span></div>
            </div>
          </div>

          <div className="surface-card rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Dépendances</p>
            <p className="text-[11px] text-slate-400 mb-2">Bloquée par :</p>
            <TaskDependencyPicker
              allTasks={tasks}
              currentTaskId={task.id}
              selectedIds={blockedByIds}
              onChange={(ids) => onEditTask(task.id, { blockedByTaskIds: ids })}
            />
            {blocksTasks.length > 0 && (
              <p className="text-[11px] text-slate-400 mt-3">Bloque : {blocksTasks.map((t) => t.title).join(", ")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailPage;