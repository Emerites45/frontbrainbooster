// Utilise la variable d'environnement ou l'URL Render en fallback si elle est undefined
const RAW_URL = import.meta.env.VITE_API_URL || "https://backbrainbooster.onrender.com";

// Nettoie le slash final s'il existe pour éviter les doubles slashes (ex: //auth/login)
const API_URL = RAW_URL.replace(/\/$/, "");
export async function fetchTasks() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${currentUser?.token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }
  return response.json();
}
export async function registerUser(nom, email, password) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: nom, email, password }),
  });
  if (!response.ok) throw new Error("Inscription échouée");
  return response.json();
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Identifiants invalides");
  return response.json();
}
export async function fetchProjects() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/projects`, {
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function createProject(project) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentUser?.token}`,
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function requestPasswordReset(email) {
  // MOCK — actif automatiquement en dev (npm run dev)
  if (import.meta.env.DEV) {
    console.log("Mock: envoi du code à", email);
    await new Promise((r) => setTimeout(r, 800));

    if (!email.includes("@")) {
      throw new Error("Email invalide");
    }

    return { success: true, message: "Code envoyé (mock)" };
  }

  // API réelle — utilisée automatiquement en build de prod (npm run build)
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Impossible d'envoyer le code de vérification.");
  }

  return res.json();
}
export async function resetPassword({ email, otp, newPassword }) {
  if (import.meta.env.DEV) {
    console.log("Mock: reset password pour", email, "otp:", otp);
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, message: "Mot de passe réinitialisé (mock)" };
  }

  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  if (!res.ok) {
    throw new Error("Impossible de réinitialiser le mot de passe.");
  }

  return res.json();
}

export async function fetchUsers() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function fetchDepartments() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/departments`, {
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function createAdminUser(userData) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentUser?.token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function updateUser(userId, updates) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentUser?.token}`,
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

// --- Journal d'actions (ACTION_HISTORY) — F5 ---
export async function fetchActions() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/actions`, {
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function createAction(actionData) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/actions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentUser?.token}`,
    },
    body: JSON.stringify(actionData),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function updateProject(projectId, updates) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentUser?.token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function deleteProject(projectId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.ok;
}


export async function fetchAttachments({ taskId, projectId }) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const params = taskId ? `taskId=${taskId}` : `projectId=${projectId}`;
  const response = await fetch(`${API_URL}/attachments?${params}`, {
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function uploadAttachment(taskId, file) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const fileData = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const response = await fetch(`${API_URL}/attachments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentUser?.token}` },
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
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.ok;
}

export async function fetchComments(taskId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/comments?taskId=${taskId}`, {
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function createComment(taskId, content) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentUser?.token}` },
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
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.ok;
}