/* =========================================================
   CONFIGURATION API
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

const API_BASE_URL =
  `${API_URL}/api/v1`;

/* =========================================================
   TOKEN
========================================================= */

/**
 * Récupère le token actuellement
 * enregistré dans localStorage.
 *
 * Pour le moment ton application stocke
 * encore l'utilisateur complet dans :
 *
 * currentUser
 *
 * avec :
 * {
 *   ...user,
 *   token
 * }
 *
 * Nous gardons donc cette structure
 * jusqu'à la prochaine étape App.jsx.
 */
export function getAuthToken() {
  try {
    const savedUser =
      localStorage.getItem(
        "currentUser"
      );

    if (!savedUser) {
      return null;
    }

    const parsedUser =
      JSON.parse(savedUser);

    return (
      parsedUser?.token ??
      null
    );
  } catch (error) {
    console.error(
      "Impossible de lire le token :",
      error
    );

    return null;
  }
}

/* =========================================================
   HEADERS
========================================================= */

function buildHeaders({
  authenticated = true,
  hasBody = false,
} = {}) {
  const headers = {
    Accept: "application/json",
  };

  if (hasBody) {
    headers[
      "Content-Type"
    ] = "application/json";
  }

  if (authenticated) {
    const token =
      getAuthToken();

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }
  }

  return headers;
}

/* =========================================================
   ERREURS
========================================================= */

/**
 * Le backend utilise normalement :
 *
 * {
 *   "message": "..."
 * }
 *
 * Cette fonction permet donc d'avoir
 * des erreurs cohérentes dans tout le
 * frontend.
 */
async function getErrorMessage(
  response
) {
  try {
    const data =
      await response.json();

    if (
      data?.message
    ) {
      return data.message;
    }
  } catch {
    // La réponse n'est peut-être
    // pas du JSON.
  }

  switch (
    response.status
  ) {
    case 400:
      return "La requête envoyée est invalide.";

    case 401:
      return "Votre session est invalide ou a expiré.";

    case 403:
      return "Vous n'êtes pas autorisé à effectuer cette action.";

    case 404:
      return "L'inscription publique est actuellement désactivée. Contactez un administrateur pour obtenir un compte.";

    case 409:
      return "Un conflit empêche cette opération.";

    case 500:
      return "Une erreur interne est survenue sur le serveur.";

    default:
      return `Erreur HTTP ${response.status}.`;
  }
}

/* =========================================================
   REQUÊTE GÉNÉRIQUE
========================================================= */

async function apiRequest(
  endpoint,
  options = {}
) {
  const {
    method = "GET",
    body,
    authenticated = true,
  } = options;

  const hasBody =
    body !== undefined &&
    body !== null;

  let response;

  try {
    response =
      await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          method,

          headers:
            buildHeaders({
              authenticated,
              hasBody,
            }),

          ...(hasBody
            ? {
                body:
                  JSON.stringify(
                    body
                  ),
              }
            : {}),
        }
      );
  } catch (error) {
    console.error(
      "Erreur réseau API :",
      error
    );

    throw new Error(
      "Impossible de contacter le serveur. Vérifiez que le backend est démarré."
    );
  }

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response
      );

    const error =
      new Error(message);

    error.status =
      response.status;

    throw error;
  }

  /*
   * Certains endpoints DELETE
   * renvoient volontairement 204
   * sans contenu.
   */
  if (
    response.status ===
    204
  ) {
    return null;
  }

  /*
   * Certains serveurs peuvent
   * éventuellement renvoyer une
   * réponse vide même avec 200.
   */
  const contentType =
    response.headers.get(
      "content-type"
    );

  if (
    !contentType ||
    !contentType.includes(
      "application/json"
    )
  ) {
    return null;
  }

  return response.json();
}

/* =========================================================
   AUTH
========================================================= */

/**
 * POST /api/v1/auth/login
 */
export async function loginUser(
  email,
  password
) {
  return apiRequest(
    "/auth/login",
    {
      method: "POST",

      authenticated:
        false,

      body: {
        email:
          email.trim(),

        password,
      },
    }
  );
}

/**
 * POST /api/v1/auth/signup
 *
 * Le backend attend :
 *
 * {
 *   firstName,
 *   lastName,
 *   email,
 *   password
 * }
 */
export async function registerUser(
  userData
) {
  /*
   * Compatibilité temporaire avec
   * ton SignupPage actuel qui
   * transmet encore :
   *
   * {
   *   name,
   *   email,
   *   password
   * }
   *
   * Nous modifierons SignupPage
   * à une prochaine étape.
   */
  let firstName =
    userData?.firstName ??
    "";

  let lastName =
    userData?.lastName ??
    "";

  if (
    !firstName &&
    userData?.name
  ) {
    const parts =
      String(
        userData.name
      )
        .trim()
        .split(/\s+/);

    firstName =
      parts.shift() ??
      "";

    lastName =
      parts.join(" ");
  }

  return apiRequest(
    "/auth/signup",
    {
      method: "POST",

      authenticated:
        false,

      body: {
        firstName,
        lastName,

        email:
          userData?.email?.trim(),

        password:
          userData?.password,
      },
    }
  );
}

/**
 * POST /api/v1/auth/change-password
 *
 * Body :
 * {
 *   userId,
 *   newPassword
 * }
 */
export async function changePassword({
  userId,
  newPassword,
}) {
  return apiRequest(
    "/auth/change-password",
    {
      method: "POST",

      body: {
        userId,
        newPassword,
      },
    }
  );
}

/**
 * GET /api/v1/auth/me
 */
export async function fetchCurrentUser() {
  return apiRequest(
    "/auth/me"
  );
}

/* =========================================================
   AUTH - ANCIENNES ROUTES NON CONFIRMÉES
========================================================= */

/**
 * ATTENTION :
 *
 * Les endpoints forgot-password
 * et reset-password ne figurent pas
 * dans le contrat API reçu.
 *
 * Nous gardons ces fonctions seulement
 * pour empêcher les pages existantes
 * de casser pendant la migration.
 *
 * Elles devront être confirmées
 * par l'équipe backend.
 */

/* =========================================================
   MOT DE PASSE OUBLIÉ
   ENDPOINT À CONFIRMER AVEC LE BACKEND
========================================================= */

/**
 * Ton frontend existant utilise encore
 * requestPasswordReset().
 *
 * L'endpoint /auth/forgot-password
 * n'apparaît pas dans le contrat API
 * officiel reçu.
 *
 * Nous gardons donc cette fonction
 * temporairement pour que le frontend
 * continue de compiler.
 */
export async function requestPasswordReset(
  email
) {
  return apiRequest(
    "/auth/forgot-password",
    {
      method: "POST",

      authenticated:
        false,

      body: {
        email:
          email?.trim(),
      },
    }
  );
}

/**
 * Alias temporaire.
 *
 * Permet également d'utiliser
 * forgotPassword() si un autre
 * composant l'appelle.
 */
export async function forgotPassword(
  email
) {
  return requestPasswordReset(
    email
  );
}

export async function resetPassword(
  {
    email,
    otp,
    newPassword,
  }
) {
  return apiRequest(
    "/auth/reset-password",
    {
      method: "POST",

      authenticated:
        false,

      body: {
        email,
        otp,
        newPassword,
      },
    }
  );
}

/* =========================================================
   USERS
========================================================= */

/**
 * GET /api/v1/users
 *
 * Option :
 * ?departmentId=1
 */
export async function fetchUsers(
  departmentId = null
) {
  const query =
    departmentId !== null &&
    departmentId !== undefined
      ? `?departmentId=${encodeURIComponent(
          departmentId
        )}`
      : "";

  return apiRequest(
    `/users${query}`
  );
}

/**
 * GET /api/v1/users/{id}
 */
export async function fetchUserById(
  userId
) {
  return apiRequest(
    `/users/${encodeURIComponent(
      userId
    )}`
  );
}

/**
 * POST /api/v1/users
 */
export async function createUser(
  userData
) {
  return apiRequest(
    "/users",
    {
      method: "POST",

      body: userData,
    }
  );
}

/**
 * Compatibilité avec ton
 * AdminDashboardPage actuel.
 *
 * Ton fichier importe encore :
 *
 * createAdminUser()
 *
 * mais le nouveau contrat utilise :
 *
 * POST /api/v1/users
 */
export async function createAdminUser(
  userData
) {
  return createUser(
    userData
  );
}

/**
 * PATCH /api/v1/users/{id}
 */
export async function updateUser(
  userId,
  updatedFields
) {
  return apiRequest(
    `/users/${encodeURIComponent(
      userId
    )}`,
    {
      method: "PATCH",

      body:
        updatedFields,
    }
  );
}

/**
 * PATCH /api/v1/users/{id}/status
 */
export async function updateUserStatus(
  userId,
  status
) {
  return apiRequest(
    `/users/${encodeURIComponent(
      userId
    )}/status`,
    {
      method: "PATCH",

      body: {
        status,
      },
    }
  );
}

/* =========================================================
   DEPARTMENTS
========================================================= */

/**
 * GET /api/v1/departments
 */
export async function fetchDepartments() {
  return apiRequest(
    "/departments"
  );
}

/**
 * GET /api/v1/departments/{id}
 */
export async function fetchDepartmentById(
  departmentId
) {
  return apiRequest(
    `/departments/${encodeURIComponent(
      departmentId
    )}`
  );
}

/**
 * GET /api/v1/departments/{id}/users
 */
export async function fetchDepartmentUsers(
  departmentId
) {
  return apiRequest(
    `/departments/${encodeURIComponent(
      departmentId
    )}/users`
  );
}

/* =========================================================
   PROJECTS
========================================================= */

/**
 * GET /api/v1/projects
 *
 * Options :
 *
 * {
 *   departmentId,
 *   status
 * }
 */
export async function fetchProjects(
  filters = {}
) {
  const params =
    new URLSearchParams();

  if (
    filters?.departmentId !==
      undefined &&
    filters?.departmentId !==
      null
  ) {
    params.set(
      "departmentId",
      filters.departmentId
    );
  }

  if (
    filters?.status
  ) {
    params.set(
      "status",
      filters.status
    );
  }

  const query =
    params.toString();

  return apiRequest(
    `/projects${
      query
        ? `?${query}`
        : ""
    }`
  );
}

/**
 * GET /api/v1/projects/{id}
 */
export async function fetchProjectById(
  projectId
) {
  return apiRequest(
    `/projects/${encodeURIComponent(
      projectId
    )}`
  );
}

/**
 * POST /api/v1/projects
 */
export async function createProject(
  projectData
) {
  return apiRequest(
    "/projects",
    {
      method: "POST",

      body:
        projectData,
    }
  );
}

/**
 * PATCH /api/v1/projects/{id}
 */
export async function updateProject(
  projectId,
  updatedFields
) {
  return apiRequest(
    `/projects/${encodeURIComponent(
      projectId
    )}`,
    {
      method: "PATCH",

      body:
        updatedFields,
    }
  );
}

/**
 * DELETE /api/v1/projects/{id}
 */
export async function deleteProject(
  projectId
) {
  return apiRequest(
    `/projects/${encodeURIComponent(
      projectId
    )}`,
    {
      method:
        "DELETE",
    }
  );
}

/**
 * GET /api/v1/projects/{id}/tasks
 */
export async function fetchProjectTasks(
  projectId
) {
  return apiRequest(
    `/projects/${encodeURIComponent(
      projectId
    )}/tasks`
  );
}

/* =========================================================
   TASKS
========================================================= */

/**
 * GET /api/v1/tasks
 *
 * Filtres disponibles :
 *
 * projectId
 * status
 * assigneeId
 */
export async function fetchTasks(
  filters = {}
) {
  const params =
    new URLSearchParams();

  if (
    filters?.projectId !==
      undefined &&
    filters?.projectId !==
      null
  ) {
    params.set(
      "projectId",
      filters.projectId
    );
  }

  if (
    filters?.status
  ) {
    params.set(
      "status",
      filters.status
    );
  }

  if (
    filters?.assigneeId !==
      undefined &&
    filters?.assigneeId !==
      null
  ) {
    params.set(
      "assigneeId",
      filters.assigneeId
    );
  }

  const query =
    params.toString();

  return apiRequest(
    `/tasks${
      query
        ? `?${query}`
        : ""
    }`
  );
}

/**
 * GET /api/v1/tasks/{id}
 */
export async function fetchTaskById(
  taskId
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}`
  );
}

/**
 * POST /api/v1/tasks
 */
export async function createTask(
  taskData
) {
  return apiRequest(
    "/tasks",
    {
      method: "POST",

      body:
        taskData,
    }
  );
}

/**
 * PATCH /api/v1/tasks/{id}
 */
export async function updateTask(
  taskId,
  updatedFields
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}`,
    {
      method: "PATCH",

      body:
        updatedFields,
    }
  );
}

/**
 * DELETE /api/v1/tasks/{id}
 */
export async function deleteTask(
  taskId
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}`,
    {
      method:
        "DELETE",
    }
  );
}

/**
 * PATCH /api/v1/tasks/{id}/status
 */
export async function updateTaskStatus(
  taskId,
  status
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}/status`,
    {
      method: "PATCH",

      body: {
        status,
      },
    }
  );
}

/* =========================================================
   ASSIGNMENTS
========================================================= */

/**
 * GET /api/v1/tasks/{id}/assignees
 */
export async function fetchTaskAssignees(
  taskId
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}/assignees`
  );
}

/**
 * POST /api/v1/tasks/{id}/assignees
 *
 * assignedAt n'est PAS envoyé.
 *
 * Il est généré par le serveur.
 */
export async function assignUserToTask(
  taskId,
  {
    userId,
    assignedBy,
  }
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}/assignees`,
    {
      method: "POST",

      body: {
        userId,
        assignedBy,
      },
    }
  );
}

/**
 * DELETE
 * /api/v1/tasks/{id}/assignees/{userId}
 */
export async function removeTaskAssignee(
  taskId,
  userId
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}/assignees/${encodeURIComponent(
      userId
    )}`,
    {
      method:
        "DELETE",
    }
  );
}

/* =========================================================
   SUBTASKS
========================================================= */

/**
 * GET /api/v1/tasks/{id}/subtasks
 */
export async function fetchSubtasks(
  taskId
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}/subtasks`
  );
}

/**
 * POST /api/v1/tasks/{id}/subtasks
 *
 * Le backend force lui-même
 * parentTaskId = taskId.
 */
export async function createSubtask(
  taskId,
  subtaskData
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}/subtasks`,
    {
      method: "POST",

      body:
        subtaskData,
    }
  );
}

/* =========================================================
   COMMENTS
========================================================= */

/**
 * GET /api/v1/tasks/{id}/comments
 */
export async function fetchTaskComments(
  taskId
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}/comments`
  );
}

/**
 * POST /api/v1/tasks/{id}/comments
 */
export async function createTaskComment(
  taskId,
  {
    authorId,
    content,
  }
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}/comments`,
    {
      method: "POST",

      body: {
        authorId,
        content,
      },
    }
  );
}

/**
 * DELETE /api/v1/comments/{id}
 */
export async function deleteComment(
  commentId
) {
  return apiRequest(
    `/comments/${encodeURIComponent(
      commentId
    )}`,
    {
      method:
        "DELETE",
    }
  );
}

/* =========================================================
   ATTACHMENTS
========================================================= */

/**
 * GET /api/v1/tasks/{id}/attachments
 */
export async function fetchTaskAttachments(
  taskId
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}/attachments`
  );
}

/**
 * POST /api/v1/tasks/{id}/attachments
 *
 * Attention :
 * le contrat actuel parle de JSON
 * avec une URL déjà disponible.
 *
 * Ce n'est donc pas encore un upload
 * multipart de fichier.
 */
export async function createTaskAttachment(
  taskId,
  {
    fileName,
    url,
    uploadedBy,
  }
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}/attachments`,
    {
      method: "POST",

      body: {
        fileName,
        url,
        uploadedBy,
      },
    }
  );
}

/**
 * DELETE /api/v1/attachments/{id}
 */
export async function deleteAttachment(
  attachmentId
) {
  return apiRequest(
    `/attachments/${encodeURIComponent(
      attachmentId
    )}`,
    {
      method:
        "DELETE",
    }
  );
}

/* =========================================================
   HISTORY
========================================================= */

/**
 * GET /api/v1/tasks/{id}/history
 */
export async function fetchTaskHistory(
  taskId
) {
  return apiRequest(
    `/tasks/${encodeURIComponent(
      taskId
    )}/history`
  );
}

/**
 * GET /api/v1/projects/{id}/history
 */
export async function fetchProjectHistory(
  projectId
) {
  return apiRequest(
    `/projects/${encodeURIComponent(
      projectId
    )}/history`
  );
}

/* =========================================================
   COMPATIBILITÉ TEMPORAIRE - ACTIONS
========================================================= */

/**
 * IMPORTANT :
 *
 * Ton ancien App.jsx utilise encore :
 *
 * fetchActions()
 * createAction()
 *
 * Mais le nouveau contrat backend
 * ne fournit AUCUN :
 *
 * GET /actions
 * POST /actions
 *
 * Nous évitons donc volontairement
 * d'appeler un endpoint inexistant.
 *
 * Ces deux fonctions seront supprimées
 * lorsque nous adapterons App.jsx
 * et les notifications au vrai modèle
 * HistoryEntry.
 */

export async function fetchActions() {
  return [];
}

export async function createAction(
  action
) {
  /*
   * Compatibilité temporaire
   * uniquement côté frontend.
   */
  return action;
}

/* =========================================================
   EXPORT CONFIG
========================================================= */

export {
  API_URL,
  API_BASE_URL,
};