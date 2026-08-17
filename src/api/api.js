const API_URL = import.meta.env.VITE_API_URL;

/* =========================================================
   HELPERS
========================================================= */

function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem("currentUser")
    );
  } catch {
    return null;
  }
}

function getAuthHeaders() {
  const currentUser = getCurrentUser();

  return {
    Authorization:
      `Bearer ${currentUser?.token ?? ""}`,
  };
}

/* =========================================================
   TASKS
========================================================= */

export async function fetchTasks() {
  const response = await fetch(
    `${API_URL}/tasks`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur API: ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   AUTH - SIGNUP
========================================================= */

export async function registerUser(
  userData
) {
  const response = await fetch(
    `${API_URL}/api/v1/auth/signup`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(userData),
    }
  );

  if (!response.ok) {
    const errorMessage =
      await response.text();

    throw new Error(
      errorMessage ||
        "Inscription échouée"
    );
  }

  return response.text();
}

/* =========================================================
   AUTH - LOGIN
========================================================= */

export async function loginUser(
  email,
  password
) {
  const response = await fetch(
    `${API_URL}/api/v1/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          email,
          password,
        }),
    }
  );

  if (!response.ok) {
    const errorMessage =
      await response.text();

    throw new Error(
      errorMessage ||
        "Identifiants invalides"
    );
  }

  return response.json();
}

/* =========================================================
   PROJECTS
========================================================= */

export async function fetchProjects() {
  const response = await fetch(
    `${API_URL}/projects`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur API: ${response.status}`
    );
  }

  return response.json();
}

export async function createProject(
  project
) {
  const response = await fetch(
    `${API_URL}/projects`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        ...getAuthHeaders(),
      },

      body:
        JSON.stringify(project),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur API: ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   PASSWORD RESET
========================================================= */

export async function requestPasswordReset(
  email
) {
  const response = await fetch(
    `${API_URL}/api/v1/auth/forgot-password?email=${encodeURIComponent(
      email
    )}`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorMessage =
      await response.text();

    throw new Error(
      errorMessage ||
        "Impossible d'envoyer le code de vérification."
    );
  }

  const message =
    await response.text();

  return {
    success: true,
    message,
  };
}

export async function resetPassword({
  email,
  otp,
  newPassword,
}) {
  const response = await fetch(
    `${API_URL}/api/v1/auth/reset-password`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          email,
          otp,
          newPassword,
        }),
    }
  );

  if (!response.ok) {
    const errorMessage =
      await response.text();

    throw new Error(
      errorMessage ||
        "Impossible de réinitialiser le mot de passe."
    );
  }

  const message =
    await response.text();

  return {
    success: true,
    message,
  };
}

/* =========================================================
   USERS
========================================================= */

export async function fetchUsers() {
  const response = await fetch(
    `${API_URL}/users`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur API: ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   DEPARTMENTS
========================================================= */

export async function fetchDepartments() {
  const response = await fetch(
    `${API_URL}/departments`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur API: ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   ADMIN - CREATE USER
========================================================= */

export async function createAdminUser(
  userData
) {
  const response = await fetch(
    `${API_URL}/admin/users`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        ...getAuthHeaders(),
      },

      body:
        JSON.stringify(userData),
    }
  );

  if (!response.ok) {
    const errorMessage =
      await response.text();

    throw new Error(
      errorMessage ||
        `Erreur API: ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   ACTION HISTORY
========================================================= */

export async function fetchActions() {
  const response = await fetch(
    `${API_URL}/actions`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur API: ${response.status}`
    );
  }

  return response.json();
}

export async function createAction(
  actionData
) {
  const response = await fetch(
    `${API_URL}/actions`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        ...getAuthHeaders(),
      },

      body:
        JSON.stringify(
          actionData
        ),
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(
      `Erreur API: ${response.status}`
    );
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
