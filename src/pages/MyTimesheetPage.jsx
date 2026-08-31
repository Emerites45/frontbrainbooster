import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchTimesheetEntries, saveTimesheetEntry, fetchWeeklyReport, saveWeeklyReport } from "../api/timesheet.api";
import { getWeekStart, getWeekDays, toISODate, REGULAR_HOURS_TARGET, getDefaultRegularHours } from "../utils/dashboardHelpers";
import WeeklyHoursChart from "../components/timesheet/WeeklyHoursChart";
import PerformanceCommentSection from "../components/analytics/PerformanceCommentSection";

const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function MyTimesheetPage({ currentUser, tasks = [], projects = [] }) {
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [rows, setRows] = useState({});
  const [report, setReport] = useState({ difficulties: "", solutions: "", bilanPersonnel: "", observations: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekStartIso = toISODate(weekStart);
  const myTasks = tasks.filter((t) => (t.assignments || []).some((a) => a.userId === currentUser?.id && !a.unassignedAt));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchTimesheetEntries({ userId: currentUser.id, weekStart: weekStartIso }),
      fetchWeeklyReport({ userId: currentUser.id, weekStart: weekStartIso }),
    ]).then(([entries, weeklyReport]) => {
      const byDate = {};
      weekDays.forEach((d) => {
        const iso = toISODate(d);
        byDate[iso] = entries.find((e) => e.date === iso) || {
          date: iso,
          projectId: "",
          taskId: "",
          description: "",
          regularHours: getDefaultRegularHours(iso),
          overtimeHours: 0,
        };
      });
      setRows(byDate);
      setReport(weeklyReport || { difficulties: "", solutions: "", bilanPersonnel: "", observations: "" });
    }).finally(() => setLoading(false));
  }, [weekStartIso]);

  function updateRow(iso, field, value) {
    setRows((prev) => ({ ...prev, [iso]: { ...prev[iso], [field]: value } }));
  }

  function changeWeek(delta) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  }

  async function handleSaveAll() {
    setSaving(true);
    try {
      await Promise.all(
        Object.values(rows).map((row) =>
          saveTimesheetEntry({
            ...row,
            userId: currentUser.id,
            description: row.description ?? "",
            regularHours: Number(row.regularHours) || 0,
            overtimeHours: Number(row.overtimeHours) || 0,
          })
        )
      );
      await saveWeeklyReport({ ...report, userId: currentUser.id, weekStart: weekStartIso });
    } finally {
      setSaving(false);
    }
  }

  const totalsByDate = {};
  weekDays.forEach((d) => {
    const iso = toISODate(d);
    const row = rows[iso];
    totalsByDate[iso] = row ? (Number(row.regularHours) || 0) + (Number(row.overtimeHours) || 0) : 0;
  });
  const totalRegular = Object.values(rows).reduce((s, r) => s + (Number(r.regularHours) || 0), 0);
  const totalOvertime = Object.values(rows).reduce((s, r) => s + (Number(r.overtimeHours) || 0), 0);

  if (loading) return <p className="text-[13.5px] text-slate-400 px-8 py-6">Chargement...</p>;

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900">Mon suivi hebdomadaire</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Renseignez vos heures et votre bilan de la semaine.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => changeWeek(-1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronLeft size={15} /></button>
          <span className="text-[13px] font-medium text-slate-700">
            {weekDays[0].toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} – {weekDays[6].toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <button onClick={() => changeWeek(1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronRight size={15} /></button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/60">
              {["Jour", "Date", "Projet", "Tâche", "Description", "Heures normales", "Heures sup.", "Total"].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekDays.map((d, i) => {
              const iso = toISODate(d);
              const row = rows[iso] || {};
              const dayProjectTasks = myTasks.filter((t) => !row.projectId || t.projectId === Number(row.projectId));
              const total = (Number(row.regularHours) || 0) + (Number(row.overtimeHours) || 0);
              return (
                <tr key={iso} className={i !== 6 ? "border-b border-slate-50" : ""}>
                  <td className="px-4 py-2.5 text-[13px] font-medium text-slate-700">{DAY_LABELS[i]}</td>
                  <td className="px-4 py-2.5 text-[12.5px] text-slate-400">{d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</td>
                  <td className="px-4 py-2.5">
                    <select value={row.projectId ?? ""} onChange={(e) => updateRow(iso, "projectId", e.target.value)} className="rounded-md border border-slate-200 text-[12.5px] px-2 py-1.5 outline-none w-full">
                      <option value="">—</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <select value={row.taskId ?? ""} onChange={(e) => updateRow(iso, "taskId", e.target.value)} className="rounded-md border border-slate-200 text-[12.5px] px-2 py-1.5 outline-none w-full">
                      <option value="">—</option>
                      {dayProjectTasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      value={row.description ?? ""}
                      onChange={(e) => updateRow(iso, "description", e.target.value)}
                      placeholder="Ce que j'ai fait..."
                      className="w-32 rounded-md border border-slate-200 text-[12px] px-2 py-1.5 outline-none"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input type="number" min="0" step="0.5" value={row.regularHours ?? 0} onChange={(e) => updateRow(iso, "regularHours", e.target.value)} className="w-16 rounded-md border border-slate-200 text-[12.5px] px-2 py-1.5 outline-none" />
                  </td>
                  <td className="px-4 py-2.5">
                    <input type="number" min="0" step="0.5" value={row.overtimeHours ?? 0} onChange={(e) => updateRow(iso, "overtimeHours", e.target.value)} className="w-16 rounded-md border border-slate-200 text-[12.5px] px-2 py-1.5 outline-none" />
                  </td>
                  <td className="px-4 py-2.5 text-[13px] font-medium text-slate-700">{total.toFixed(1)}</td>
                </tr>
              );
            })}
            <tr className="bg-slate-50/60">
              <td colSpan={5} className="px-4 py-3 text-[13px] font-semibold text-slate-700 text-right">Total</td>
              <td className="px-4 py-3 text-[13px] font-semibold text-slate-800">{totalRegular.toFixed(1)}</td>
              <td className="px-4 py-3 text-[13px] font-semibold text-slate-800">{totalOvertime.toFixed(1)}</td>
              <td className="px-4 py-3 text-[13px] font-semibold text-slate-900">{(totalRegular + totalOvertime).toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <h2 className="text-[14.5px] font-semibold text-slate-900 mb-4">Working Time</h2>
        <WeeklyHoursChart days={weekDays.map(toISODate)} totalsByDate={totalsByDate} target={REGULAR_HOURS_TARGET} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[["difficulties", "Difficultés majeures rencontrées"], ["solutions", "Solutions proposées"], ["bilanPersonnel", "Bilan personnel de fin de semaine"], ["observations", "Observations"]].map(([field, label]) => (
          <div key={field} className="bg-white rounded-xl border border-slate-100 p-4">
            <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">{label}</label>
            <textarea value={report[field] ?? ""} onChange={(e) => setReport((prev) => ({ ...prev, [field]: e.target.value }))} rows={3} className="w-full rounded-lg border border-slate-200 text-[13px] px-3 py-2 outline-none focus:border-blue-400 resize-none" />
          </div>
        ))}
      </div>

      <PerformanceCommentSection
        targetUserId={currentUser.id}
        weekStart={weekStartIso}
        currentUser={currentUser}
      />

      <button onClick={handleSaveAll} disabled={saving} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-medium px-5 py-2.5 transition-colors disabled:opacity-50">
        {saving ? "Enregistrement..." : "Enregistrer la semaine"}
      </button>
    </div>
  );
}

export default MyTimesheetPage;