import { CheckCircle2, ListChecks, AlertTriangle, TrendingUp } from "lucide-react";
import StatsGrid from "../components/dashboard/StatsGrid";
import MyTasksTable from "../components/dashboard/MyTasksTable";
import { computeTaskStats, getAssigneeIds } from "../utils/dashboardHelpers";

function MemberDashboardPage({ currentUser, tasks = [], projects = [] }) {
  const myTasks = tasks.filter((t) => getAssigneeIds(t).includes(currentUser.id));
  const stats = computeTaskStats(myTasks);

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-yellow-400 to-amber-500 px-6 py-7 sm:px-8 sm:py-8">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative">
          <h1 className="text-[22px] font-semibold text-slate-900">Bonjour {currentUser.firstName} 👋</h1>
          <p className="text-[13.5px] text-slate-800/80 mt-1">Vos tâches assignées et votre progression.</p>
        </div>
      </div>

      <StatsGrid
        items={[
          { label: "Mes tâches", value: stats.total, icon: ListChecks, accent: "#B45309", accentBg: "#FEF3C7" },
          { label: "Terminées", value: stats.done, variant: "positive", icon: CheckCircle2, accent: "#16A34A", accentBg: "#DCFCE7" },
          { label: "En retard", value: stats.overdue, variant: stats.overdue > 0 ? "negative" : undefined, icon: AlertTriangle, accent: "#DC2626", accentBg: "#FEE2E2" },
          { label: "Progression", value: `${stats.progression}%`, icon: TrendingUp, accent: "#7C3AED", accentBg: "#EDE9FE" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-card rounded-xl p-5 flex items-center justify-center min-h-40">
          <p className="text-[12.5px] text-slate-400">À venir</p>
        </div>
        <div className="surface-card rounded-xl p-5">
          <h2 className="text-[14.5px] font-semibold text-slate-900 mb-1">Progression</h2>
          <p className="text-[12.5px] text-slate-400 mb-4">Sur l'ensemble de vos tâches assignées.</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stats.progression}%` }} />
            </div>
            <span className="text-[15px] font-semibold text-slate-800 shrink-0">{stats.progression}%</span>
          </div>
        </div>
      </div>

      <MyTasksTable tasks={myTasks} projects={projects} />
    </div>
  );
}

export default MemberDashboardPage;