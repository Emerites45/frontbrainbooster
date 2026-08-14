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
    `${API_URL}/auth/login`,
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

  return response.json();
}

export async function createTask(taskData) {
  const response = await fetch(
    `${API_URL}/tasks`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(taskData),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur création tâche : ${response.status}`
    );
  }

  return response.json();
}

export async function updateTask(
  taskId,
  updates
) {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erreur modification tâche : ${response.status}`
    );
  }

  return response.json();
}
