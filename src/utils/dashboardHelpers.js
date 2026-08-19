/* =========================================================
   STATUTS
========================================================= */

export const STATUS_LABEL = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINE: "Terminée",
};

/* =========================================================
   ASSIGNATIONS
========================================================= */

export function getAssigneeIds(
  task
) {
  if (
    !Array.isArray(
      task?.assignments
    )
  ) {
    return [];
  }

  const ids =
    task.assignments
      .map(
        (
          assignment
        ) =>
          assignment?.userId
      )
      .filter(
        (
          userId
        ) =>
          userId !==
            undefined &&
          userId !==
            null
      );

  return [
    ...new Map(
      ids.map(
        (
          userId
        ) => [
          String(
            userId
          ),
          userId,
        ]
      )
    ).values(),
  ];
}

/* =========================================================
   NOM UTILISATEUR
========================================================= */

export function getUserFullName(
  user
) {
  if (
    !user
  ) {
    return "Utilisateur";
  }

  const fullName =
    `${user.firstName ?? ""} ${
      user.lastName ?? ""
    }`.trim();

  return (
    fullName ||
    user.email ||
    "Utilisateur"
  );
}

/* =========================================================
   NOMS DES ASSIGNÉS
========================================================= */

export function getAssigneeNames(
  assigneeIds,
  users = []
) {
  if (
    !Array.isArray(
      assigneeIds
    ) ||
    assigneeIds.length ===
      0
  ) {
    return "Non assignée";
  }

  const names =
    assigneeIds
      .map(
        (
          userId
        ) =>
          users.find(
            (
              user
            ) =>
              String(
                user.id
              ) ===
              String(
                userId
              )
          )
      )
      .filter(
        Boolean
      )
      .map(
        getUserFullName
      );

  if (
    names.length ===
    0
  ) {
    return "Non assignée";
  }

  return names.join(
    ", "
  );
}

/* =========================================================
   TEMPS RELATIF
========================================================= */

/**
 * Compatibilité avec RecentActivity.jsx
 *
 * Exemples :
 *
 * "À l'instant"
 * "Il y a 4 min"
 * "Il y a 2 h"
 * "Il y a 3 jours"
 */
export function timeAgo(
  value
) {
  if (
    !value
  ) {
    return "";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const now =
    new Date();

  const differenceMs =
    now.getTime() -
    date.getTime();

  /*
   * Si la date est dans le futur,
   * on évite d'afficher une valeur
   * négative.
   */
  if (
    differenceMs <
    0
  ) {
    return "À l'instant";
  }

  const seconds =
    Math.floor(
      differenceMs /
        1000
    );

  if (
    seconds <
    60
  ) {
    return "À l'instant";
  }

  const minutes =
    Math.floor(
      seconds /
        60
    );

  if (
    minutes <
    60
  ) {
    return `Il y a ${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes /
        60
    );

  if (
    hours <
    24
  ) {
    return `Il y a ${hours} h`;
  }

  const days =
    Math.floor(
      hours /
        24
    );

  if (
    days <
    7
  ) {
    return `Il y a ${days} jour${
      days > 1
        ? "s"
        : ""
    }`;
  }

  const weeks =
    Math.floor(
      days /
        7
    );

  if (
    weeks <
    5
  ) {
    return `Il y a ${weeks} semaine${
      weeks > 1
        ? "s"
        : ""
    }`;
  }

  const months =
    Math.floor(
      days /
        30
    );

  if (
    months <
    12
  ) {
    return `Il y a ${months} mois`;
  }

  const years =
    Math.floor(
      days /
        365
    );

  return `Il y a ${years} an${
    years > 1
      ? "s"
      : ""
  }`;
}

/* =========================================================
   TÂCHE EN RETARD
========================================================= */

/**
 * EN_RETARD n'est PAS un statut backend.
 *
 * On calcule uniquement l'information
 * depuis dueDate.
 */
export function isTaskOverdue(
  task
) {
  if (
    !task?.dueDate ||
    task.status ===
      "TERMINE"
  ) {
    return false;
  }

  const dueDate =
    new Date(
      task.dueDate
    );

  if (
    Number.isNaN(
      dueDate.getTime()
    )
  ) {
    return false;
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  dueDate.setHours(
    0,
    0,
    0,
    0
  );

  return (
    dueDate <
    today
  );
}

/* =========================================================
   STATISTIQUES DES TÂCHES
========================================================= */

export function computeTaskStats(
  tasks = []
) {
  const safeTasks =
    Array.isArray(
      tasks
    )
      ? tasks
      : [];

  const total =
    safeTasks.length;

  const todo =
    safeTasks.filter(
      (
        task
      ) =>
        task.status ===
        "A_FAIRE"
    ).length;

  const inProgress =
    safeTasks.filter(
      (
        task
      ) =>
        task.status ===
        "EN_COURS"
    ).length;

  const done =
    safeTasks.filter(
      (
        task
      ) =>
        task.status ===
        "TERMINE"
    ).length;

  const overdue =
    safeTasks.filter(
      isTaskOverdue
    ).length;

  const progression =
    total ===
    0
      ? 0
      : Math.round(
          (
            done /
            total
          ) *
            100
        );

  return {
    total,
    todo,
    inProgress,
    done,
    overdue,
    progression,
  };
}

/* =========================================================
   PROGRESSION D'UN PROJET
========================================================= */

export function projectProgress(
  project,
  tasks = []
) {
  if (
    !project?.id
  ) {
    return 0;
  }

  const projectTasks =
    tasks.filter(
      (
        task
      ) =>
        String(
          task.projectId
        ) ===
          String(
            project.id
          ) &&
        (
          task.parentTaskId ===
            null ||
          task.parentTaskId ===
            undefined
        )
    );

  if (
    projectTasks.length ===
    0
  ) {
    return 0;
  }

  const completedTasks =
    projectTasks.filter(
      (
        task
      ) =>
        task.status ===
        "TERMINE"
    ).length;

  return Math.round(
    (
      completedTasks /
      projectTasks.length
    ) *
      100
  );
}

/* =========================================================
   ÉQUIPE D'UN PROJET
========================================================= */

export function projectTeam(
  project,
  tasks = [],
  users = []
) {
  if (
    !project?.id
  ) {
    return [];
  }

  const projectTasks =
    tasks.filter(
      (
        task
      ) =>
        String(
          task.projectId
        ) ===
        String(
          project.id
        )
    );

  const userIds =
    new Set();

  projectTasks.forEach(
    (
      task
    ) => {
      getAssigneeIds(
        task
      ).forEach(
        (
          userId
        ) => {
          userIds.add(
            String(
              userId
            )
          );
        }
      );
    }
  );

  return users.filter(
    (
      user
    ) =>
      userIds.has(
        String(
          user.id
        )
      )
  );
}

/* =========================================================
   INITIALES
========================================================= */

export function initials(
  firstName,
  lastName
) {
  const first =
    String(
      firstName ??
        ""
    )
      .trim()
      .charAt(
        0
      )
      .toUpperCase();

  const last =
    String(
      lastName ??
        ""
    )
      .trim()
      .charAt(
        0
      )
      .toUpperCase();

  const result =
    `${first}${last}`;

  return (
    result ||
    "?"
  );
}

/* =========================================================
   NORMALISATION TEMPORAIRE DES ASSIGNATIONS
========================================================= */

/**
 * Fonction conservée pour compatibilité
 * avec d'anciens composants.
 *
 * Elle ne génère plus assignedAt.
 */
export function normalizeAssignments(
  assignments,
  currentUser = null
) {
  if (
    !Array.isArray(
      assignments
    )
  ) {
    return [];
  }

  const assignedBy =
    currentUser?.id ??
    null;

  const normalized =
    assignments
      .map(
        (
          assignment
        ) => {
          if (
            typeof assignment ===
              "number" ||
            typeof assignment ===
              "string"
          ) {
            return {
              userId:
                assignment,

              assignedBy,
            };
          }

          if (
            assignment &&
            typeof assignment ===
              "object" &&
            assignment.userId !==
              undefined &&
            assignment.userId !==
              null
          ) {
            return {
              userId:
                assignment.userId,

              assignedBy:
                assignment.assignedBy ??
                assignedBy,
            };
          }

          return null;
        }
      )
      .filter(
        Boolean
      );

  return [
    ...new Map(
      normalized.map(
        (
          assignment
        ) => [
          String(
            assignment.userId
          ),
          assignment,
        ]
      )
    ).values(),
  ];
}