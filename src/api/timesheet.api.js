import { apiClient } from "./client";

export async function fetchTimesheetEntries({ userId, weekStart }) {
  const params = new URLSearchParams();
  if (userId) params.set("userId", userId);
  if (weekStart) params.set("weekStart", weekStart);
  return apiClient(`/timesheet-entries?${params}`);
}

export async function saveTimesheetEntry(entry) {
  return apiClient("/timesheet-entries", {
    method: "POST",
    body: entry,
  });
}

export async function fetchWeeklyReport({ userId, weekStart }) {
  return apiClient(`/weekly-reports?userId=${userId}&weekStart=${weekStart}`);
}

export async function saveWeeklyReport(report) {
  return apiClient("/weekly-reports", {
    method: "POST",
    body: report,
  });
}