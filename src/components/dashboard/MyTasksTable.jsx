import { STATUS_LABEL } from "../../utils/dashboardHelpers";

const STATUS_STYLES = {
  A_FAIRE: "bg-amber-50 text-amber-700",
  EN_COURS: "bg-blue-50 text-blue-700",
  TERMINE: "bg-green-50 text-green-700",
};

function MyTasksTable({ tasks, projects, title = "Mes tâches" }) {
  const projectName = (id) => projects.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="surface-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50">
        <h2 className="text-[14.5px] font-semibold text-slate-900">{title}</h2>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/60">
            <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Tâche</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Projet</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Statut</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Échéance</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-[13px] text-slate-400 py-10">
                Aucune tâche assignée pour l'instant.
              </td>
            </tr>
          )}
          {tasks.map((t, i) => (
            <tr key={t.id} className={i !== tasks.length - 1 ? "border-b border-slate-50" : ""}>
              <td className="px-5 py-3.5 text-[13.5px] font-medium text-slate-800">{t.title}</td>
              <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{projectName(t.projectId)}</td>
              <td className="px-5 py-3.5">
                <span
                  className={`inline-flex items-center rounded-full text-[11px] font-semibold px-2.5 py-1 ${
                    STATUS_STYLES[t.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </td>
              <td className="px-5 py-3.5 text-[13px] text-slate-500">{t.dueDate ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyTasksTable;