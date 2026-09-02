import { useState, useEffect, useMemo } from "react";
import { fetchTimesheetEntries, fetchWeeklyReport } from "../api/timesheet.api";
import { getWeekDays, toISODate, REGULAR_HOURS_TARGET } from "../utils/dashboardHelpers";

const WEEKLY_TARGET_DEFAULT = REGULAR_HOURS_TARGET * 7; // 28h — TODO Sprint 3: rendre configurable par utilisateur

export function useUserPerformance(userId, weekStart, tasks = []) {
  const [entries, setEntries] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekStartIso = toISODate(weekStart);

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setReport(null);
      return;
    }
    setLoading(true);
    Promise.all([
      fetchTimesheetEntries({ userId, weekStart: weekStartIso }),
      fetchWeeklyReport({ userId, weekStart: weekStartIso }),
    ])
      .then(([e, r]) => { setEntries(e); setReport(r); })
      .finally(() => setLoading(false));
  }, [userId, weekStartIso]);

  const userTasks = useMemo(
    () => (userId ? tasks.filter((t) => (t.assignments || []).some((a) => a.userId === userId && !a.unassignedAt)) : []),
    [tasks, userId]
  );

  const analytics = useMemo(() => {
    if (!userId) return null;

    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter((t) => t.status === "TERMINE").length;
    const inProgressTasks = userTasks.filter((t) => t.status === "EN_COURS").length;
    const todoTasks = userTasks.filter((t) => t.status === "A_FAIRE").length;
    const taskCompletionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const regularHours = entries.reduce((s, e) => s + (Number(e.regularHours) || 0), 0);
    const overtimeHours = entries.reduce((s, e) => s + (Number(e.overtimeHours) || 0), 0);
    const totalHours = regularHours + overtimeHours;

    const weeklyTarget = WEEKLY_TARGET_DEFAULT;
    const remainingHours = Math.max(0, weeklyTarget - totalHours);
    const targetCompletionRate = weeklyTarget === 0 ? 0 : Math.round((totalHours / weeklyTarget) * 100);
    const targetStatus =
      weeklyTarget === 0 ? "NONE" : totalHours > weeklyTarget ? "EXCEEDED" : totalHours === weeklyTarget ? "REACHED" : "BELOW";

    const dailyWorkingTime = weekDays.map((d) => {
      const iso = toISODate(d);
      const entry = entries.find((e) => e.date === iso);
      return { date: iso, hours: entry ? (Number(entry.regularHours) || 0) + (Number(entry.overtimeHours) || 0) : 0 };
    });

    return {
      totalTasks, completedTasks, inProgressTasks, todoTasks, taskCompletionRate,
      regularHours, overtimeHours, totalHours,
      weeklyTarget, remainingHours, targetCompletionRate, targetStatus,
      dailyWorkingTime, dailyTarget: REGULAR_HOURS_TARGET,
    };
  }, [userId, userTasks, entries, weekDays]);

  return { entries, report, userTasks, analytics, loading };
}