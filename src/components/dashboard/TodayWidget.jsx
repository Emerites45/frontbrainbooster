import { CheckCircle2, Clock } from "lucide-react";

function TodayWidget({ tasks = [], currentUser, projects = [] }) {
  const today = new Date().toISOString().slice(0, 10);
  const myTasks = tasks.filter((t) => (t.assignments || []).some((a) => a.userId === currentUser?.id && !a.unassignedAt) && t.status !== "TERMINE");
  const dueToday = myTasks.filter((t) => t.dueDate === today);
  const overdue = myTasks.filter((t) => t.dueDate && t.dueDate < today);
  const others = myTasks.filter((t) => t.dueDate !== today && !(t.dueDate && t.dueDate < today)).slice(0, 5);

  const projectName = (id) => projects.find((p) => p.id === id)?.name ?? "—";

  const sections = [
    { label: "En retard", items: overdue, color: "text-red-600" },
    { label: "Aujourd'hui", items: dueToday, color: "text-blue-600" },
    { label: "À suivre", items: others, color: "text-slate-500" },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="surface-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-slate-400" />
        <h2 className="text-[14.5px] font-semibold text-slate-900">À faire aujourd'hui</h2>
      </div>
      {sections.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle2 size={24} className="text-green-400 mx-auto mb-2" />
          <p className="text-[13px] text-slate-400">Rien d'urgent pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.label}>
              <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${s.color}`}>{s.label}</p>
              <ul className="space-y-1.5">
                {s.items.map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-[13px]">
                    <span className="text-slate-700 truncate">{t.title}</span>
                    <span className="text-slate-400 text-[11px] shrink-0 ml-2">{projectName(t.projectId)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TodayWidget;