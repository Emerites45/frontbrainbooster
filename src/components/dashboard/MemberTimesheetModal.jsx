import { useState, useEffect, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchTimesheetEntries, fetchWeeklyReport } from "../../api/timesheet.api";
import { getWeekStart, getWeekDays, toISODate, REGULAR_HOURS_TARGET } from "../../utils/dashboardHelpers";
import WeeklyHoursChart from "../timesheet/WeeklyHoursChart";

const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function MemberTimesheetModal({ user, projects, tasks, onClose }) {
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [entries, setEntries] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekStartIso = toISODate(weekStart);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchTimesheetEntries({ userId: user.id, weekStart: weekStartIso }),
      fetchWeeklyReport({ userId: user.id, weekStart: weekStartIso }),
    ]).then(([e, r]) => { setEntries(e); setReport(r); }).finally(() => setLoading(false));
  }, [weekStartIso, user.id]);

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
  const totalRegular = entries.reduce((s, e) => s + (Number(e.regularHours) || 0), 0);
  const totalOvertime = entries.reduce((s, e) => s + (Number(e.overtimeHours) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[720px] max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-7 pt-7 pb-5 border-b border-slate-50 flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-slate-900">{user.firstName} {user.lastName}</h2>
            <p className="text-[13px] text-slate-400 mt-0.5">Suivi hebdomadaire</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="px-7 py-5 space-y-5">
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => changeWeek(-1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronLeft size={15} /></button>
            <span className="text-[13px] font-medium text-slate-700">
              {weekDays[0].toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} – {weekDays[6].toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <button onClick={() => changeWeek(1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronRight size={15} /></button>
          </div>

          {loading ? (
            <p className="text-[13px] text-slate-400 text-center py-6">Chargement...</p>
          ) : (
            <>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/60">
                      {["Jour", "Projet", "Tâche", "Normales", "Sup.", "Total"].map((h) => (
                        <th key={h} className="text-left text-[10.5px] font-semibold uppercase tracking-wide text-slate-400 px-3 py-2.5">{h}</th>
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
                          <td className="px-3 py-2 text-[12.5px] font-medium text-slate-700">{DAY_LABELS[i]}</td>
                          <td className="px-3 py-2 text-[12px] text-slate-500">{entry?.projectId ? projectName(entry.projectId) : "—"}</td>
                          <td className="px-3 py-2 text-[12px] text-slate-500">{entry?.taskId ? taskTitle(entry.taskId) : "—"}</td>
                          <td className="px-3 py-2 text-[12.5px] text-slate-600">{entry?.regularHours ?? 0}</td>
                          <td className="px-3 py-2 text-[12.5px] text-slate-600">{entry?.overtimeHours ?? 0}</td>
                          <td className="px-3 py-2 text-[12.5px] font-medium text-slate-800">{total.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50/60">
                      <td colSpan={3} className="px-3 py-2.5 text-[12.5px] font-semibold text-slate-700 text-right">Total</td>
                      <td className="px-3 py-2.5 text-[12.5px] font-semibold text-slate-800">{totalRegular.toFixed(1)}</td>
                      <td className="px-3 py-2.5 text-[12.5px] font-semibold text-slate-800">{totalOvertime.toFixed(1)}</td>
                      <td className="px-3 py-2.5 text-[12.5px] font-semibold text-slate-900">{(totalRegular + totalOvertime).toFixed(1)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <WeeklyHoursChart days={weekDays.map(toISODate)} totalsByDate={totalsByDate} target={REGULAR_HOURS_TARGET} />

              {report && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[["difficulties", "Difficultés"], ["solutions", "Solutions proposées"], ["bilanPersonnel", "Bilan personnel"], ["observations", "Observations"]].map(([field, label]) => (
                    <div key={field}>
                      <p className="text-[11.5px] font-medium text-slate-400 mb-1">{label}</p>
                      <p className="text-[13px] text-slate-700">{report[field] || "—"}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberTimesheetModal;