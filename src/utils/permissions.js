// Helpers RBAC centralisés — à utiliser partout à la place de vérifications
// ad-hoc sur user.role. S'appuie sur le contrat /auth/login :
// user.globalRoles: string[]  (ex: ["ADMIN"])
// user.departmentRoles: { departmentId, departmentName, role }[]

/**
 * L'utilisateur a-t-il ce rôle global (ex: "ADMIN") ?
 */
export function hasGlobalRole(user, role) {
  if (!user) return false;
  return (user.globalRoles || []).includes(role);
}

/**
 * L'utilisateur a-t-il ce rôle dans CE département précis ?
 * (ex: hasDepartmentRole(user, 3, "SCRUM_MASTER"))
 */
export function hasDepartmentRole(user, departmentId, role) {
  if (!user) return false;
  return (user.departmentRoles || []).some(
    (dr) => dr.departmentId === departmentId && dr.role === role
  );
}

/**
 * Vrai si l'utilisateur est Scrum Master d'AU MOINS un département
 * (peu importe lequel) — utile pour l'affichage conditionnel de menus.
 */
export function isScrumMasterAnywhere(user) {
  if (!user) return false;
  return (user.departmentRoles || []).some((dr) => dr.role === "SCRUM_MASTER");
}

/**
 * Vrai si l'utilisateur est simple Member d'AU MOINS un département.
 */
export function isMemberAnywhere(user) {
  if (!user) return false;
  return (user.departmentRoles || []).some((dr) => dr.role === "MEMBER");
}

/**
 * Renvoie la liste des departmentId où l'utilisateur est Scrum Master.
 * Pratique pour filtrer des projets/tâches par département autorisé.
 */
export function scrumMasterDepartmentIds(user) {
  if (!user) return [];
  return (user.departmentRoles || [])
    .filter((dr) => dr.role === "SCRUM_MASTER")
    .map((dr) => dr.departmentId);
}

/**
 * Un utilisateur peut créer un projet pour ce département si :
 * - il est Admin (peut créer n'importe où), ou
 * - il est Scrum Master de CE département précis.
 */
export function canCreateProject(user, departmentId) {
  if (hasGlobalRole(user, "ADMIN")) return true;
  return hasDepartmentRole(user, departmentId, "SCRUM_MASTER");
}

/**
 * Un utilisateur (assigneur) peut-il assigner une tâche à targetUser ?
 * - Admin : toujours oui, quel que soit le département de targetUser.
 * - Scrum Master : uniquement si targetUser appartient à un département
 *   dont l'assigneur est Scrum Master (règle métier confirmée dans le brief :
 *   "un Scrum Master ne peut assigner qu'aux membres de son département").
 */
export function canAssignTask(assigner, targetUser) {
  if (hasGlobalRole(assigner, "ADMIN")) return true;

  const assignerDeptIds = scrumMasterDepartmentIds(assigner);
  if (assignerDeptIds.length === 0) return false;

  const targetDeptIds = (targetUser?.departmentRoles || []).map((dr) => dr.departmentId);
  return targetDeptIds.some((id) => assignerDeptIds.includes(id));
}

/**
 * Raccourci pratique pour les gardes de route / affichage conditionnel.
 */
export function isAdmin(user) {
  return hasGlobalRole(user, "ADMIN");
}
export function isScrumMaster(user) {
  return (user?.departmentRoles || []).some((dr) => dr.role === "SCRUM_MASTER");
}