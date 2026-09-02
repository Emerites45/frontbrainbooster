import { useState, useEffect } from "react";
import { Plus, X, Flag, CheckCircle2 } from "lucide-react";
import { fetchSprints, createSprint, updateSprint } from "../../api/api";
import TaskTypeBadge from "../../components/dashboard/TaskTypeBadge";
import BurndownChart from "../../components/backlog/BurndownChart";

function BacklogPage({ projects = [], tasks = [], onEditTask }) {
  const [projectId, setProjectId] = useState("");
  const [sprints, setSprints] = useState([]);
  const [activeSprintId, setActiveSprintId] = useState("");
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [newSprint, setNewSprint] = useState({ name: "", startDate: "", endDate: "", goal: "" });

  useEffect(() => {
    if (!projectId) { setSprints([]); return; }
    fetchSprints({ projectId }).then((s) => {
      setSprints(s);
      const active = s.find((sp) => sp.status === "ACTIVE");
      setActiveSprintId(active ? String(active.id) : "");
    });
  }, [projectId]);

  const projectTasks = tasks.filter((t) => String(t.projectId) === String(projectId) && !t.parentTaskId);
  const backlogTasks = projectTasks.filter((t) => !t.sprintId);
  const activeSprint = sprints.find((s) => String(s.id) === activeSprintId);
  const sprintTasks = activeSprintId ? projectTasks.filter((t) => String(t.sprintId) === activeSprintId) : [];

  const totalPoints = sprintTasks.reduce((s, t) => s + (Number(t.storyPoints) || 0), 0);
  const donePoints = sprintTasks.filter((t) => t.status === "TERMINE").reduce((s, t) => s + (Number(t.storyPoints) || 0), 0);

  async function handleCreateSprint(e) {
    e.preventDefault();
    try {
      // Pas de "status" envoyé volontairement : le serveur applique le défaut ACTIVE
      // et refuse la création si un sprint ACTIVE existe déjà sur ce projet (409).
      const sprint = await createSprint({ ...newSprint, projectId: Number(projectId) });
      setSprints((prev) => [...prev, sprint]);
      setActiveSprintId(String(sprint.id));
      setShowCreateSprint(false);
      setNewSprint({ name: "", startDate: "", endDate: "", goal: "" });
    } catch (err) {
      alert(err.message || "Impossible de créer le sprint.");
    }
  }

  async function handleCloseSprint() {
    if (!activeSprint) return;
    if (!window.confirm(`Clôturer "${activeSprint.name}" ? Les tâches non terminées repasseront au backlog.`)) return;

    await updateSprint(activeSprint.id, { status: "CLOSED" });

    // Fix : détache réellement sprintId des tâches non terminées, sinon elles
    // disparaissent à la fois du sprint clôturé ET du backlog — bug signalé.
    const unfinished = sprintTasks.filter((t) => t.status !== "TERMINE");
    unfinished.forEach((t) => onEditTask(t.id, { sprintId: null }));

    setSprints((prev) => prev.map((s) => (s.id === activeSprint.id ? { ...s, status: "CLOSED" } : s)));
    setActiveSprintId("");
  }

  function moveToSprint(taskId) {
    if (!activeSprintId) { alert("Sélectionnez ou créez un sprint actif d'abord."); return; }
    onEditTask(taskId, { sprintId: Number(activeSprintId) });
  }

  function moveToBacklog(taskId) {
    onEditTask(taskId, { sprintId: null });
  }

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900">Backlog</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Backlog produit et gestion des sprints, projet par projet.</p>
        </div>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none">
          <option value="">Sélectionner un projet</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {!projectId ? (
        <p className="text-[13.5px] text-slate-400 text-center py-16">Sélectionnez un projet pour voir son backlog.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="surface-card rounded-xl">
            <div className="px-5 py-4 border-b border-slate-50">
              <h2 className="text-[14.5px] font-semibold text-slate-900">Backlog produit · {backlogTasks.length}</h2>
            </div>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
              {backlogTasks.length === 0 ? (
                <p className="text-[13px] text-slate-400 text-center py-8">Backlog vide.</p>
              ) : (
                backlogTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5 px-4 py-3">
                    <TaskTypeBadge type={t.type} size="xs" />
                    <span className="flex-1 text-[13px] text-slate-700 truncate">{t.title}</span>
                    {t.storyPoints && <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0">{t.storyPoints}</span>}
                    <button onClick={() => moveToSprint(t.id)} className="text-[11.5px] font-medium text-blue-600 hover:text-blue-700 shrink-0">→ Sprint</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="surface-card rounded-xl">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-[14.5px] font-semibold text-slate-900">
                  {activeSprint ? activeSprint.name : "Aucun sprint actif"}
                </h2>
                {activeSprint && <p className="text-[11.5px] text-slate-400 mt-0.5">{activeSprint.startDate} → {activeSprint.endDate}</p>}
              </div>
              <div className="flex items-center gap-2">
                {activeSprint && (
                  <button onClick={handleCloseSprint} className="flex items-center gap-1 text-[11.5px] font-medium text-slate-500 hover:text-red-600">
                    <Flag size={12} /> Clôturer
                  </button>
                )}
                <button
                  onClick={() => setShowCreateSprint(true)}
                  disabled={!!activeSprint}
                  title={activeSprint ? "Clôturez le sprint actif avant d'en créer un nouveau" : undefined}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-[11.5px] font-medium px-2.5 py-1.5"
                >
                  <Plus size={12} /> Nouveau sprint
                </button>
              </div>
            </div>

            {activeSprint && (
              <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-4 text-[12px] text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> {donePoints} / {totalPoints} points</span>
              </div>
            )}

            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
              {!activeSprint ? (
                <p className="text-[13px] text-slate-400 text-center py-8">Créez un sprint pour commencer à y affecter des tâches.</p>
              ) : sprintTasks.length === 0 ? (
                <p className="text-[13px] text-slate-400 text-center py-8">Aucune tâche dans ce sprint.</p>
              ) : (
                sprintTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5 px-4 py-3">
                    <TaskTypeBadge type={t.type} size="xs" />
                    <span className={`flex-1 text-[13px] truncate ${t.status === "TERMINE" ? "text-slate-400 line-through" : "text-slate-700"}`}>{t.title}</span>
                    {t.storyPoints && <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0">{t.storyPoints}</span>}
                    <button onClick={() => moveToBacklog(t.id)} className="text-[11.5px] font-medium text-slate-400 hover:text-slate-600 shrink-0">← Backlog</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeSprint && sprintTasks.length > 0 && (
        <div className="surface-card rounded-xl p-5">
          <h2 className="text-[14.5px] font-semibold text-slate-900 mb-4">Burndown — {activeSprint.name}</h2>
          <BurndownChart sprint={activeSprint} tasks={sprintTasks} />
        </div>
      )}

      {showCreateSprint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateSprint(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-slate-900">Nouveau sprint</h3>
              <button onClick={() => setShowCreateSprint(false)}><X size={16} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateSprint} className="space-y-3">
              <input required value={newSprint.name} onChange={(e) => setNewSprint((p) => ({ ...p, name: e.target.value }))} placeholder="Nom du sprint (ex: Sprint 3)" className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400" />
              <div className="flex gap-3">
                <input required type="date" value={newSprint.startDate} onChange={(e) => setNewSprint((p) => ({ ...p, startDate: e.target.value }))} className="flex-1 rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400" />
                <input required type="date" value={newSprint.endDate} onChange={(e) => setNewSprint((p) => ({ ...p, endDate: e.target.value }))} className="flex-1 rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400" />
              </div>
              <textarea value={newSprint.goal} onChange={(e) => setNewSprint((p) => ({ ...p, goal: e.target.value }))} placeholder="Objectif du sprint (optionnel)" rows={2} className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400 resize-none" />
              <button type="submit" className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-medium py-2.5">Créer le sprint</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BacklogPage;