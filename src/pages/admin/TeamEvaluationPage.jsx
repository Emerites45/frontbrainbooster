import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchUsers, fetchDepartments, fetchTimesheetEntries } from "../../api/api";
import { getWeekStart, getWeekDays, toISODate } from "../../utils/dashboardHelpers";

function TeamEvaluationPage({ tasks = [] }) {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekStartIso = toISODate(weekStart);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchDepartments()]).then(([u, d]) => { setUsers(u); setDepartments(d); });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTimesheetEntries({ weekStart: weekStartIso }).then(setEntries).finally(() => setLoading(false));
  }, [weekStartIso]);

  function changeWeek(delta) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  }

  const members = useMemo(() => {
    return users.filter((u) => {
      if (u.globalRoles?.includes("ADMIN")) return false;
      if (deptFilter === "ALL") return true;
      return (u.departmentRoles || []).some((dr) => dr.departmentId === Number(deptFilter));
    });
  }, [users, deptFilter]);

  const rows = members.map((u) => {
    const userTasks = tasks.filter((t) => (t.assignments || []).some((a) => a.userId === u.id && !a.unassignedAt));
    const completed = userTasks.filter((t) => t.status === "TERMINE").length;
    const completionRate = userTasks.length === 0 ? 0 : Math.round((completed / userTasks.length) * 100);

    const userEntries = entries.filter((e) => e.userId === u.id);
    const totalHours = userEntries.reduce((s, e) => s + (Number(e.regularHours) || 0) + (Number(e.overtimeHours) || 0), 0);
    const target = 22; // 4h × 5j + 2h samedi
    const targetRate = target === 0 ? 0 : Math.round((totalHours / target) * 100);
    const dept = (u.departmentRoles || [])[0]?.departmentName ?? "—";

    return { user: u, dept, totalTasks: userTasks.length, completed, completionRate, totalHours, targetRate };
  });

  const avgCompletion = rows.length === 0 ? 0 : Math.round(rows.reduce((s, r) => s + r.completionRate, 0) / rows.length);
  const avgTarget = rows.length === 0 ? 0 : Math.round(rows.reduce((s, r) => s + r.targetRate, 0) / rows.length);

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900">Évaluation par équipe</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Charge et complétion des tâches, membre par membre.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => changeWeek(-1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronLeft size={15} /></button>
          <span className="text-[13px] font-medium text-slate-700">
            {getWeekDays(weekStart)[0].toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} – {getWeekDays(weekStart)[6].toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
          </span>
          <button onClick={() => changeWeek(1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronRight size={15} /></button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none">
          <option value="ALL">Tous les départements</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <span className="text-[12.5px] text-slate-400">Moy. complétion tâches : {avgCompletion}% · Moy. objectif atteint : {avgTarget}%</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/60">
              {["Membre", "Département", "Tâches", "Terminées", "% Complétion", "Heures", "% Objectif"].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center text-[13px] text-slate-400 py-10">Chargement...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-[13px] text-slate-400 py-10">Aucun membre.</td></tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.user.id} className={i !== rows.length - 1 ? "border-b border-slate-50" : ""}>
                  <td className="px-4 py-3 text-[13px] font-medium text-slate-800">{r.user.firstName} {r.user.lastName}</td>
                  <td className="px-4 py-3 text-[12.5px] text-slate-500">{r.dept}</td>
                  <td className="px-4 py-3 text-[12.5px] text-slate-600">{r.totalTasks}</td>
                  <td className="px-4 py-3 text-[12.5px] text-slate-600">{r.completed}</td>
                  <td className="px-4 py-3 text-[12.5px] font-medium text-slate-700">{r.completionRate}%</td>
                  <td className="px-4 py-3 text-[12.5px] text-slate-600">{r.totalHours.toFixed(1)}h</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.targetRate >= 100 ? "bg-green-50 text-green-700" : r.targetRate >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                      {r.targetRate}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeamEvaluationPage;