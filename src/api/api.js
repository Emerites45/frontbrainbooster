const API_URL = import.meta.env.VITE_API_URL;

// --- UTILS ---
function getAuthHeader() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  return currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {};
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// --- AUTHENTICATION ---
export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Inscription échouée");
  }
  return response.text();
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Identifiants invalides");
  return response.json();
}

export async function requestPasswordReset(email) {
  const res = await fetch(
    `${API_URL}/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || "Impossible d'envoyer le code de vérification.");
  }
  const message = await res.text();
  return { success: true, message };
}

export async function resetPassword({ email, otp, newPassword }) {
  const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || "Impossible de réinitialiser le mot de passe.");
  }
  const message = await res.text();
  return { success: true, message };
}

// --- TASKS ---
export async function fetchTasks() {
  const response = await fetch(`${API_URL}/tasks`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

// --- PROJECTS ---
export async function fetchProjects() {
  const response = await fetch(`${API_URL}/projects`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function createProject(project) {
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function updateProject(projectId, updates) {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function deleteProject(projectId) {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.ok;
}

// --- USERS & DEPARTMENTS ---
export async function fetchUsers() {
  const response = await fetch(`${API_URL}/users`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function fetchDepartments() {
  const response = await fetch(`${API_URL}/departments`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function createAdminUser(userData) {
  const response = await fetch(`${API_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function updateUser(userId, updates) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

// Active/désactive un compte. Séparé de updateUser pour rester explicite dans
// les logs et permettre plus tard une route backend dédiée avec ses propres
// règles (ex: notification email, révocation de session).
export async function toggleUserActive(userId, active) {
  return updateUser(userId, { active });
}

// --- ACTIONS HISTORY ---
export async function fetchActions() {
  const response = await fetch(`${API_URL}/actions`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function createAction(actionData) {
  const response = await fetch(`${API_URL}/actions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(actionData),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

// --- ATTACHMENTS ---
export async function fetchAttachments({ taskId, projectId }) {
  const params = taskId ? `taskId=${taskId}` : `projectId=${projectId}`;
  const response = await fetch(`${API_URL}/attachments?${params}`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function uploadAttachment(taskId, file) {
  const currentUser = getCurrentUser();
  const fileData = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const response = await fetch(`${API_URL}/attachments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      taskId,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      fileData,
      uploadedBy: currentUser?.id,
    }),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function deleteAttachment(attachmentId) {
  const response = await fetch(`${API_URL}/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.ok;
}

// --- COMMENTS (tasks) ---
export async function fetchComments(taskId) {
  const response = await fetch(`${API_URL}/comments?taskId=${taskId}`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function createComment(taskId, content) {
  const currentUser = getCurrentUser();
  const response = await fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      taskId,
      content,
      createdBy: currentUser?.id,
      authorName: `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim(),
    }),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function deleteComment(commentId) {
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.ok;
}

// --- TIMESHEETS ---
export async function fetchTimesheetEntries({ userId, weekStart }) {
  const params = new URLSearchParams();
  if (userId) params.set("userId", userId);
  if (weekStart) params.set("weekStart", weekStart);
  const response = await fetch(`${API_URL}/timesheet-entries?${params}`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function saveTimesheetEntry(entry) {
  const response = await fetch(`${API_URL}/timesheet-entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

// --- WEEKLY REPORTS ---
export async function fetchWeeklyReport({ userId, weekStart }) {
  const response = await fetch(`${API_URL}/weekly-reports?userId=${userId}&weekStart=${weekStart}`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function saveWeeklyReport(report) {
  const response = await fetch(`${API_URL}/weekly-reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(report),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

// --- PERFORMANCE COMMENTS ---
export async function fetchPerformanceComments({ userId, weekStart }) {
  const response = await fetch(`${API_URL}/performance-comments?userId=${userId}&weekStart=${weekStart}`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function createPerformanceComment({ targetUserId, weekStart, content }) {
  const currentUser = getCurrentUser();
  const response = await fetch(`${API_URL}/performance-comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      targetUserId,
      weekStart,
      content,
      authorId: currentUser?.id,
      authorName: `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim(),
    }),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function fetchNotifications(userId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/notifications?userId=${userId}`, {
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function createNotification(data) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentUser?.token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function markNotificationRead(id) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/notifications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentUser?.token}` },
    body: JSON.stringify({ read: true }),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function markAllNotificationsRead(userId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentUser?.token}` },
    body: JSON.stringify({ userId }),
  });
  return response.ok;
}

export async function fetchAllWeeklyReports(userId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/weekly-reports?userId=${userId}`, {
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}