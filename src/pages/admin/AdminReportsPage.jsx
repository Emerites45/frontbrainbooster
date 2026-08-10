import { useState } from "react";
import { Download, FolderKanban, CheckCircle2, TrendingUp } from "lucide-react";
import { projectProgress } from "../../utils/dashboardHelpers";
import StatsGrid from "../../components/dashboard/StatsGrid";
import ExportModal from "../../components/dashboard/ExportModal";

function AdminReportsPage({ projects = [], tasks = [], departments = [] }) {
  const [showExport, setShowExport] = useState(false);

  const totalProjects = projects.length;
  const doneTasks = tasks.filter((t) => t.status === "TERMINE").length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((doneTasks / tasks.length) * 100);
  const avgProgress =
    totalProjects === 0 ? 0 : Math.round(projects.reduce((sum, p) => sum + projectProgress(p, tasks), 0) / totalProjects);

  const deptRows = departments.map((dept) => {
    const deptProjects = projects.filter((p) => p.departmentId === dept.id);
    const deptProjectIds = deptProjects.map((p) => p.id);
    const deptTasks = tasks.filter((t) => deptProjectIds.includes(t.projectId));
    const deptDone = deptTasks.filter((t) => t.status === "TERMINE").length;
    const deptRate = deptTasks.length === 0 ? 0 : Math.round((deptDone / deptTasks.length) * 100);
    const deptAvgProgress =
      deptProjects.length === 0 ? 0 : Math.round(deptProjects.reduce((s, p) => s + projectProgress(p, tasks), 0) / deptProjects.length);
    return { dept: dept.name, projets: deptProjects.length, taches: deptTasks.length, tauxCompletion: `${deptRate}%`, progressionMoyenne: `${deptAvgProgress}%` };
  });

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900">Rapports</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Synthèse de l'activité par département.</p>
        </div>
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-medium px-4 py-2.5 transition-colors"
        >
          <Download size={15} />
          Exporter
        </button>
      </div>

      <StatsGrid
        items={[
          { label: "Projets totaux", value: totalProjects, icon: FolderKanban, accent: "#1D4ED8", accentBg: "#DBEAFE" },
          { label: "Taux de complétion", value: `${completionRate}%`, icon: CheckCircle2, accent: "#16A34A", accentBg: "#DCFCE7" },
          { label: "Progression moyenne", value: `${avgProgress}%`, icon: TrendingUp, accent: "#7C3AED", accentBg: "#EDE9FE" },
        ]}
      />

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="text-[14.5px] font-semibold text-slate-900">Synthèse par département</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/60">
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Département</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Projets</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Tâches</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Taux de complétion</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-5 py-3">Progression moyenne</th>
            </tr>
          </thead>
          <tbody>
            {deptRows.map((r, i) => (
              <tr key={r.dept} className={i !== deptRows.length - 1 ? "border-b border-slate-50" : ""}>
                <td className="px-5 py-3.5 text-[13.5px] font-medium text-slate-800">{r.dept}</td>
                <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{r.projets}</td>
                <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{r.taches}</td>
                <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{r.tauxCompletion}</td>
                <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{r.progressionMoyenne}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showExport && (
        <ExportModal data={deptRows} filenameBase="rapport-departements" onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}

export default AdminReportsPage;