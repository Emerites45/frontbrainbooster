import { STATUS_LABEL, getAssigneeNames } from "../utils/dashboardHelpers";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/dashboard/Pagination";

const STATUS_STYLES = {
  A_FAIRE: "bg-amber-50 text-amber-700",
  EN_COURS: "bg-blue-50 text-blue-700",
  TERMINE: "bg-green-50 text-green-700",
};
const PRIORITY_DOT = {
  BASSE: "bg-slate-300",
  MOYENNE: "bg-blue-400",
  HAUTE: "bg-orange-400",
  CRITIQUE: "bg-red-500",
};

function TasksTable({ tasks, projects, users, onRowClick }) {
  const projectName = (id) => projects.find((p) => p.id === id)?.name ?? "—";
  const { pageItems, page, totalPages, rangeStart, rangeEnd, totalItems, goToPage } = usePagination(tasks, 10);

  return (
    <div className="surface-card rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/60">
            <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Titre</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Projet</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Statut</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Priorité</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Assigné(s)</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Échéance</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.length === 0 && (
            <tr><td colSpan={6} className="text-center text-[13px] text-slate-400 py-10">Aucune tâche ne correspond à ces filtres.</td></tr>
          )}
          {pageItems.map((t, i) => (
            <tr
              key={t.id}
              onClick={() => onRowClick(t)}
              className={`cursor-pointer hover:bg-slate-50/60 ${i !== pageItems.length - 1 ? "border-b border-slate-50" : ""}`}
            >
              <td className="px-5 py-3.5 text-[13.5px] font-medium text-slate-800">{t.title}</td>
              <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{projectName(t.projectId)}</td>
              <td className="px-5 py-3.5">
                <span className={`inline-flex items-center rounded-full text-[11px] font-semibold px-2.5 py-1 ${STATUS_STYLES[t.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </td>
              <td className="px-5 py-3.5">
                {t.priority && <span className={`inline-block w-2 h-2 rounded-full ${PRIORITY_DOT[t.priority] ?? "bg-slate-300"}`} title={t.priority} />}
              </td>
              <td className="px-5 py-3.5 text-[13px] text-slate-500 max-w-[160px] truncate">
                {getAssigneeNames(t.assignments?.map((a) => a.userId) ?? [], users) || "—"}
              </td>
              <td className="px-5 py-3.5 text-[13px] text-slate-500">{t.dueDate ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} rangeStart={rangeStart} rangeEnd={rangeEnd} totalItems={totalItems} onPageChange={goToPage} itemLabel="tâches" />
    </div>
  );
}

export default TasksTable;