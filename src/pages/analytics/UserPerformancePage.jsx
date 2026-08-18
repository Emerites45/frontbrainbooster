import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { fetchUsers } from "../../api/api";
import { useUserPerformance } from "../../hooks/useUserPerformance";
import { getWeekStart, getWeekDays, toISODate } from "../../utils/dashboardHelpers";
import StatsGrid from "../../components/dashboard/StatsGrid";
import WeeklyHoursChart from "../../components/timesheet/WeeklyHoursChart";
import TasksGauge from "../../components/analytics/TasksGauge";
import ObjectifProgress from "../../components/analytics/ObjectifProgress";
import TaskStatusBreakdown from "../../components/analytics/TaskStatusBreakdown";
import PerformanceCommentSection from "../../components/analytics/PerformanceCommentSection";

const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function UserPerformancePage({ tasks = [], projects = [], currentUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [weekStart, setWeekStart] = useState(getWeekStart());

  useEffect(() => { fetchUsers().then(setUsers); }, []);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekStartIso = toISODate(weekStart);
  const numericUserId = selectedUserId ? Number(selectedUserId) : null;
  const { entries, report, analytics, loading } = useUserPerformance(numericUserId, weekStart, tasks);
  const selectedUser = users.find((u) => u.id === numericUserId);

  function changeWeek(delta) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  }

  const projectName = (id) => projects.find((p) => p.id === Number(id))?.name ?? "—";
  const taskTitle = (id) => tasks.find((t) => t.id === Number(id))?.title ?? "—";

  const totalsByDate = {};
  weekDays.forEach((d) => {
    const iso = toISODate(d);
    const entry = entries.find((e) => e.date === iso);
    totalsByDate[iso] = entry ? (Number(entry.regularHours) || 0) + (Number(entry.overtimeHours) || 0) : 0;
  });

  return (
    <div className="px-8 py-6 space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-slate-900">User Performance Analytics</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Temps de travail, complétion des tâches et objectifs pour un utilisateur sélectionné.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 bg-slate-50 border border-slate-100 min-w-[240px]">
          <User size={15} className="text-slate-400 shrink-0" />
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="bg-transparent text-[13px] outline-none w-full text-slate-700"
          >
            <option value="">Sélectionner un utilisateur</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
            ))}
          </select>
        </div>

        {selectedUserId && (
          <div className="flex items-center gap-2">
            <button onClick={() => changeWeek(-1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
              <ChevronLeft size={15} />
            </button>
            <span className="text-[13px] font-medium text-slate-700">
              {weekDays[0].toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} – {weekDays[6].toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <button onClick={() => changeWeek(1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {!selectedUserId ? (
        <div className="bg-white rounded-xl border border-slate-100 py-20 flex flex-col items-center justify-center text-center px-6">
          <User size={32} className="text-slate-300 mb-3" />
          <p className="text-[14px] font-medium text-slate-600">Sélectionnez un utilisateur pour voir ses statistiques</p>
          <p className="text-[13px] text-slate-400 mt-1 max-w-[360px]">
            Temps de travail, taux de complétion des tâches, objectifs hebdomadaires et bilan personnel.
          </p>
        </div>
      ) : loading ? (
        <p className="text-[13.5px] text-slate-400 text-center py-10">Chargement des données de {selectedUser?.firstName}...</p>
      ) : (
        <>
          <StatsGrid
            items={[
              { label: "Tâches totales", value: analytics.totalTasks },
              { label: "Tâches terminées", value: analytics.completedTasks, variant: "positive" },
              { label: "% Tâches faites", value: `${analytics.taskCompletionRate}%` },
              { label: "Temps travaillé", value: `${analytics.totalHours.toFixed(1)}h` },
              { label: "Objectif", value: `${analytics.weeklyTarget}h` },
              { label: "Complétion objectif", value: `${analytics.targetCompletionRate}%`, variant: analytics.targetStatus === "BELOW" ? "negative" : "positive" },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-[14.5px] font-semibold text-slate-900 mb-4">Working Time</h2>
              <WeeklyHoursChart days={weekDays.map(toISODate)} totalsByDate={totalsByDate} target={analytics.dailyTarget} />
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-[14.5px] font-semibold text-slate-900 mb-4">Objectif Time</h2>
              <ObjectifProgress analytics={analytics} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-[14.5px] font-semibold text-slate-900 mb-2">% Tasks Done</h2>
              <TasksGauge percent={analytics.totalTasks === 0 ? null : analytics.taskCompletionRate} />
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-[14.5px] font-semibold text-slate-900 mb-4">Répartition des tâches</h2>
              <TaskStatusBreakdown analytics={analytics} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50">
              <h2 className="text-[14.5px] font-semibold text-slate-900">Weekly Time Log</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/60">
                  {["Jour", "Date", "Projet", "Tâche", "Normales", "Sup.", "Total"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekDays.map((d, i) => {
                  const iso = toISODate(d);
                  const entry = entries.find((e) => e.date === iso);
                  const total = entry ? (Number(entry.regularHours) || 0) + (Number(entry.overtimeHours) || 0) : 0;
                  return (
                    <tr key={iso} className={i !== 6 ? "border-b border-slate-50" : ""}>
                      <td className="px-4 py-2.5 text-[13px] font-medium text-slate-700">{DAY_LABELS[i]}</td>
                      <td className="px-4 py-2.5 text-[12.5px] text-slate-400">{d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</td>
                      <td className="px-4 py-2.5 text-[12.5px] text-slate-600">{entry?.projectId ? projectName(entry.projectId) : "—"}</td>
                      <td className="px-4 py-2.5 text-[12.5px] text-slate-600">{entry?.taskId ? taskTitle(entry.taskId) : "—"}</td>
                      <td className="px-4 py-2.5 text-[12.5px] text-slate-600">{entry?.regularHours ?? 0}</td>
                      <td className="px-4 py-2.5 text-[12.5px] text-slate-600">{entry?.overtimeHours ?? 0}</td>
                      <td className="px-4 py-2.5 text-[13px] font-medium text-slate-800">{total.toFixed(1)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50/60">
                  <td colSpan={4} className="px-4 py-3 text-[13px] font-semibold text-slate-700 text-right">Total</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-slate-800">{analytics.regularHours.toFixed(1)}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-slate-800">{analytics.overtimeHours.toFixed(1)}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-slate-900">{analytics.totalHours.toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-[14.5px] font-semibold text-slate-900 mb-4">Weekly Retrospective</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[["difficulties", "Difficultés majeures rencontrées"], ["observations", "Observations (Target)"], ["solutions", "Solutions proposées"], ["bilanPersonnel", "Bilan personnel de fin de semaine"]].map(([field, label]) => (
                <div key={field}>
                  <p className="text-[11.5px] font-medium text-slate-400 mb-1.5">{label}</p>
                  <p className="text-[13px] text-slate-700 whitespace-pre-wrap">{report?.[field] || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          <PerformanceCommentSection
            targetUserId={numericUserId}
            weekStart={weekStartIso}
            currentUser={currentUser}
          />
        </>
      )}
    </div>
  );
}

export default UserPerformancePage;