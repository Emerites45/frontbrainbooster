export const STATUS_LABEL = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
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

export function computeTaskStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "TERMINE").length;
  const active = tasks.filter((t) => t.status !== "TERMINE").length;
  const overdue = tasks.filter(
    (t) => t.status !== "TERMINE" && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const doneThisWeek = tasks.filter(
    (t) => t.status === "TERMINE" && t.endDate && new Date(t.endDate) >= sevenDaysAgo
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