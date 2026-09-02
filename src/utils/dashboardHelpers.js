export const STATUS_LABEL = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
};

export const TASK_TYPE_LABEL = {
  TACHE: "Tâche",
  BUG: "Bug",
  USER_STORY: "User Story",
  EPIC: "Epic",
  MILESTONE: "Jalon",
};

export const SPRINT_STATUS_LABEL = {
  PLANNED: "Planifié",
  ACTIVE: "En cours",
  CLOSED: "Clôturé",
};

export function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}
export function initials(firstName, lastName) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}
// Format TASK_ASSIGNMENT déduit du MCD validé par Franck (voir contrat-api-auth.md
// pour ce qui est réellement confirmé par écrit par Joel/Verdream — ça ne couvrait
// que /auth/login, pas l'assignation de tâches) :
// task.assignments = [{ userId, assignedBy, assignedAt, unassignedAt? }]
// unassignedAt présent = la personne a été retirée, on l'exclut des listes actives.
export function getAssigneeIds(task) {
  return (task.assignments || [])
    .filter((a) => !a.unassignedAt)
    .map((a) => a.userId);
}
// Convertit une liste d'IDs assignés en noms lisibles, pour l'affichage
// (cartes de tâche, détail de tâche). Centralisé ici pour éviter la
// duplication qu'il y avait entre TaskCard.jsx et TaskModal.jsx.
export function getAssigneeNames(userIds = [], users = []) {
  if (!userIds.length) return "Non assigné";
  return userIds
    .map((id) => {
      const u = users.find((usr) => usr.id === id);
      return u ? `${u.firstName} ${u.lastName}` : `#${id}`;
    })
    .join(", ");
}
// Filet de sécurité : certains formulaires (NewTaskModal, SubtaskList) peuvent
// encore produire un simple tableau d'IDs bruts au lieu d'objets enrichis.
// Cette fonction accepte les deux formats en entrée et renvoie toujours des
// objets conformes à TASK_ASSIGNMENT, pour que getAssigneeIds() ne casse jamais
// en aval peu importe ce qui arrive en amont.
export function normalizeAssignments(input, currentUser) {
  if (!Array.isArray(input) || input.length === 0) return [];
  const now = new Date().toISOString();
  return input.map((item) => {
    if (item && typeof item === "object" && "userId" in item) {
      return item; // déjà au format enrichi
    }
    // sinon on suppose que c'est un ID brut (number ou string)
    return { userId: item, assignedBy: currentUser?.id ?? null, assignedAt: now };
  });
}
// On utilise le journal d'actions (source de vérité datée par événement)
// plutôt que task.endDate, qui n'est jamais mis à jour au moment du passage
// à TERMINE (voir handleStatusChange dans App.jsx) et ne reflète donc pas
// la date réelle de complétion — juste la date planifiée à la création.
export function computeTaskStats(tasks, actions = []) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "TERMINE").length;
  const active = tasks.filter((t) => t.status !== "TERMINE").length;
  const overdue = tasks.filter(
    (t) => t.status !== "TERMINE" && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const doneThisWeek = actions.filter(
    (a) =>
      a.type_action === "CHANGEMENT_STATUT" &&
      a.nouvelle_valeur === "TERMINE" &&
      new Date(a.date_action) >= sevenDaysAgo
  ).length;
  const progression = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, active, overdue, doneThisWeek, progression };
}
export function projectProgress(project, tasks) {
  const pTasks = tasks.filter((t) => t.projectId === project.id);
  if (pTasks.length === 0) return 0;
  const done = pTasks.filter((t) => t.status === "TERMINE").length;
  return Math.round((done / pTasks.length) * 100);
}
export function projectTeam(project, tasks, users) {
  const pTasks = tasks.filter((t) => t.projectId === project.id);
  const ids = [...new Set(pTasks.flatMap((t) => getAssigneeIds(t)))];
  return ids.map((id) => users.find((u) => u.id === id)).filter(Boolean);
}
export const REGULAR_HOURS_TARGET = 4;

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

export function toISODate(date) {
  return date.toISOString().slice(0, 10);
}
export function getDefaultRegularHours(date) {
  const day = new Date(date).getDay(); // 0=dimanche, 6=samedi
  if (day === 0) return 0;
  if (day === 6) return 2;
  return 4;
}
export function projectDepartmentIds(project) {
  if (Array.isArray(project.departmentIds) && project.departmentIds.length) return project.departmentIds;
  if (project.departmentId) return [project.departmentId];
  return [];
}

// =========================================================
// BACKLOG / SPRINTS (Phase C)
// =========================================================

// Tâches du backlog d'un projet : pas encore assignées à un sprint,
// et pas des sous-tâches (celles-ci suivent leur tâche parente).
export function backlogTasks(projectId, tasks) {
  return tasks.filter(
    (t) => t.projectId === projectId && !t.sprintId && !t.parentTaskId
  );
}

// Tâches d'un sprint donné.
export function sprintTasks(sprint, tasks) {
  return tasks.filter((t) => t.sprintId === sprint.id);
}

// Somme des story points d'un ensemble de tâches (0 si non renseigné).
export function sumStoryPoints(tasks) {
  return tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
}

// Vélocité : points des tâches TERMINE dans le sprint / points totaux planifiés.
export function sprintVelocity(sprint, tasks) {
  const sTasks = sprintTasks(sprint, tasks);
  const totalPoints = sumStoryPoints(sTasks);
  const donePoints = sumStoryPoints(sTasks.filter((t) => t.status === "TERMINE"));
  return {
    totalPoints,
    donePoints,
    percent: totalPoints === 0 ? 0 : Math.round((donePoints / totalPoints) * 100),
  };
}

// Données de burndown : points restants par jour du sprint, calculés à partir
// de l'historique d'actions (même logique que computeTaskStats — la date de
// complétion vient de l'action CHANGEMENT_STATUT, pas d'un champ statique).
export function burndownData(sprint, tasks, actions = []) {
  const sTasks = sprintTasks(sprint, tasks);
  const sTaskIds = new Set(sTasks.map((t) => t.id));
  const totalPoints = sumStoryPoints(sTasks);

  const pointsById = Object.fromEntries(sTasks.map((t) => [t.id, t.storyPoints || 0]));

  const completions = actions
    .filter(
      (a) =>
        a.type_action === "CHANGEMENT_STATUT" &&
        a.nouvelle_valeur === "TERMINE" &&
        sTaskIds.has(a.id_tache)
    )
    .map((a) => ({ date: a.date_action.slice(0, 10), points: pointsById[a.id_tache] || 0 }));

  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const days = [];
  let remaining = totalPoints;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = toISODate(d);
    const doneToday = completions
      .filter((c) => c.date === iso)
      .reduce((sum, c) => sum + c.points, 0);
    remaining -= doneToday;
    days.push({ date: iso, remaining: Math.max(remaining, 0) });
  }

  return { totalPoints, days };
}

// Tâches bloquantes / bloquées, pour badges et alertes dashboard.
export function blockingTasks(task, allTasks) {
  return (task.blockedBy || [])
    .map((id) => allTasks.find((t) => t.id === id))
    .filter(Boolean);
}

export function isBlocked(task, allTasks) {
  return blockingTasks(task, allTasks).some((b) => b.status !== "TERMINE");
}

export function describeAction(action, users = [], tasks = []) {
  if (!action) return "Action inconnue";
  
  // Find user name if userId exists
  const user = users.find(u => u.id === action.userId);
  const userName = user ? `${user.firstName} ${user.lastName}` : "Un utilisateur";
  
  // Find task name if taskId exists
  const task = tasks.find(t => t.id === action.taskId);
  const taskName = task ? `"${task.title}"` : `la tâche #${action.taskId}`;

  switch (action.type_action || action.type) {
    case "CHANGEMENT_STATUT":
      const statusLabel = STATUS_LABEL[action.nouvelle_valeur] || action.nouvelle_valeur;
      return `${userName} a passé ${taskName} à "${statusLabel}"`;
    case "CREATION_TACHE":
      return `${userName} a créé ${taskName}`;
    case "ASSIGNATION":
      return `${userName} a assigné ${taskName}`;
    default:
      return action.description || `${userName} a effectué une action`;
  }
}