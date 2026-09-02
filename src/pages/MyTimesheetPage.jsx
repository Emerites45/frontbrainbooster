import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { fetchTimesheetEntries, saveTimesheetEntry } from "../api/api";
import { getWeekStart, getWeekDays, toISODate, getDefaultRegularHours } from "../utils/dashboardHelpers";
import WeeklyHoursChart from "../components/timesheet/WeeklyHoursChart";
import { REGULAR_HOURS_TARGET } from "../utils/dashboardHelpers";
import PerformanceCommentSection from "../components/analytics/PerformanceCommentSection";
import { showToast } from "../utils/toast";

const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const RETRO_FIELDS = [
  ["difficulties", "Difficultés majeures rencontrées"],
  ["solutions", "Solutions proposées"],
  ["bilanPersonnel", "Bilan personnel de la journée"],
  ["observations", "Observations"],
];

function emptyRow(iso) {
  return {
    date: iso, projectId: "", taskId: "", description: "",
    regularHours: getDefaultRegularHours(iso), overtimeHours: 0,
    difficulties: "", solutions: "", bilanPersonnel: "", observations: "",
  };
}

function MyTimesheetPage({ currentUser, tasks = [], projects = [] }) {
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState(null);
  const [savedDay, setSavedDay] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekStartIso = toISODate(weekStart);
  const myTasks = tasks.filter((t) => (t.assignments || []).some((a) => a.userId === currentUser?.id && !a.unassignedAt));

  useEffect(() => {
    setLoading(true);
    fetchTimesheetEntries({ userId: currentUser.id, weekStart: weekStartIso })
      .then((entries) => {
        const byDate = {};
        weekDays.forEach((d) => {
          const iso = toISODate(d);
          byDate[iso] = entries.find((e) => e.date === iso) || emptyRow(iso);
        });
        setRows(byDate);
      })
      .finally(() => setLoading(false));
  }, [weekStartIso]);

  function updateRow(iso, field, value) {
    setRows((prev) => ({ ...prev, [iso]: { ...prev[iso], [field]: value } }));
  }

  function changeWeek(delta) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  }
async function handleSaveDay(iso) {
  setSavingDay(iso);

  try {
    const row = rows[iso];

    const saved = await saveTimesheetEntry({
      ...row,
      userId: currentUser.id,
      regularHours: Number(row.regularHours) || 0,
      overtimeHours: Number(row.overtimeHours) || 0,
    });

    setRows((prev) => ({
      ...prev,
      [iso]: saved,
    }));

    setSavedDay(iso);

    showToast({
      type: "success",
      message: "Journée enregistrée",
    });

    setTimeout(() => {
      setSavedDay((d) =>
        d === iso ? null : d
      );
    }, 2000);
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement de la journée :",
      error
    );

    showToast({
      type: "error",
      message: "Impossible d'enregistrer la journée",
    });
  } finally {
    setSavingDay(null);
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
          <h1 className="text-[20px] font-semibold text-slate-900">Mon suivi journalier</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Remplissez vos heures et votre bilan chaque jour — enregistrez au fur et à mesure.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => changeWeek(-1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronLeft size={15} /></button>
          <span className="text-[13px] font-medium text-slate-700">
            {weekDays[0].toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} – {weekDays[6].toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <button onClick={() => changeWeek(1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronRight size={15} /></button>
        </div>
      </div>

      <div className="surface-card rounded-xl overflow-hidden">
        {weekDays.map((d, i) => {
          const iso = toISODate(d);
          const row = rows[iso] || emptyRow(iso);
          const dayProjectTasks = myTasks.filter((t) => !row.projectId || t.projectId === Number(row.projectId));
          const total = (Number(row.regularHours) || 0) + (Number(row.overtimeHours) || 0);
          const isExpanded = expandedDay === iso;
          const hasRetro = RETRO_FIELDS.some(([f]) => row[f]?.trim());

          return (
            <div key={iso} className={i !== 6 ? "border-b border-slate-100" : ""}>
              <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
                <div className="w-[90px] shrink-0">
                  <div className="text-[13px] font-medium text-slate-700">{DAY_LABELS[i]}</div>
                  <div className="text-[11px] text-slate-400">{d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</div>
                </div>
                <select value={row.projectId ?? ""} onChange={(e) => updateRow(iso, "projectId", e.target.value)} className="rounded-md border border-slate-200 text-[12.5px] px-2 py-1.5 outline-none w-32">
                  <option value="">Projet —</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={row.taskId ?? ""} onChange={(e) => updateRow(iso, "taskId", e.target.value)} className="rounded-md border border-slate-200 text-[12.5px] px-2 py-1.5 outline-none w-36">
                  <option value="">Tâche —</option>
                  {dayProjectTasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
                <input type="text" value={row.description ?? ""} onChange={(e) => updateRow(iso, "description", e.target.value)} placeholder="Ce que j'ai fait..." className="flex-1 min-w-[140px] rounded-md border border-slate-200 text-[12.5px] px-2 py-1.5 outline-none" />
                <div className="flex items-center gap-1.5">
                  <input type="number" min="0" step="0.5" value={row.regularHours ?? 0} onChange={(e) => updateRow(iso, "regularHours", e.target.value)} className="w-14 rounded-md border border-slate-200 text-[12.5px] px-2 py-1.5 outline-none text-center" title="Heures normales" />
                  <span className="text-[11px] text-slate-300">+</span>
                  <input type="number" min="0" step="0.5" value={row.overtimeHours ?? 0} onChange={(e) => updateRow(iso, "overtimeHours", e.target.value)} className="w-14 rounded-md border border-slate-200 text-[12.5px] px-2 py-1.5 outline-none text-center" title="Heures sup." />
                  <span className="text-[13px] font-medium text-slate-700 w-10 text-right">{total.toFixed(1)}h</span>
                </div>
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : iso)}
                  className={`flex items-center gap-1 text-[12px] font-medium px-2 py-1.5 rounded-md transition-colors ${hasRetro ? "text-blue-600" : "text-slate-400"} hover:bg-slate-50`}
                >
                  Bilan
                  <ChevronDown size={13} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                <button
                  onClick={() => handleSaveDay(iso)}
                  disabled={savingDay === iso}
                  className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {savingDay === iso ? "..." : savedDay === iso ? "✓" : "Enregistrer"}
                </button>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/60">
                  {RETRO_FIELDS.map(([field, label]) => (
                    <div key={field}>
                      <label className="text-[11px] font-medium text-slate-500 mb-1 block">{label}</label>
                      <textarea
                        value={row[field] ?? ""}
                        onChange={(e) => updateRow(iso, field, e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 bg-white text-[12.5px] px-3 py-2 outline-none focus:border-blue-400 resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="flex items-center justify-end gap-6 px-4 py-3 bg-slate-50/80 text-[13px]">
          <span className="text-slate-500">Total normales : <strong className="text-slate-800">{totalRegular.toFixed(1)}h</strong></span>
          <span className="text-slate-500">Total sup. : <strong className="text-slate-800">{totalOvertime.toFixed(1)}h</strong></span>
          <span className="text-slate-500">Total : <strong className="text-slate-900">{(totalRegular + totalOvertime).toFixed(1)}h</strong></span>
        </div>
      </div>

      <div className="surface-card rounded-xl p-5">
        <h2 className="text-[14.5px] font-semibold text-slate-900 mb-4">Working Time</h2>
        <WeeklyHoursChart days={weekDays.map(toISODate)} totalsByDate={totalsByDate} target={REGULAR_HOURS_TARGET} />
      </div>

      <PerformanceCommentSection targetUserId={currentUser.id} weekStart={weekStartIso} currentUser={currentUser} />
    </div>
  );
}

export default MyTimesheetPage;