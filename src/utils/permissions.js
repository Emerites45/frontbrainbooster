// Helpers RBAC centralisés — à utiliser partout à la place de vérifications
// ad-hoc sur user.role. S'appuie sur le contrat /auth/login :
// user.globalRoles: string[]  (ex: ["ADMIN"]) OU user.role: string (ex: "ADMIN")
// user.departmentRoles: { departmentId, departmentName, role }[]

/**
 * L'utilisateur a-t-il ce rôle global (ex: "ADMIN") ?
 * Gère à la fois user.globalRoles (tableau) et user.role (chaîne simple).
 */
export function hasGlobalRole(user, role) {
  if (!user) return false;

  const hasInArray = (user.globalRoles || []).includes(role);
  const hasInSingleRole = user.role === role;

  return hasInArray || hasInSingleRole;
}

/**
 * L'utilisateur a-t-il ce rôle dans CE département précis ?
 * Exemple : hasDepartmentRole(user, 3, "SCRUM_MASTER")
 */
export function hasDepartmentRole(user, departmentId, role) {
  if (!user) return false;

  return (user.departmentRoles || []).some(
    (dr) => dr.departmentId === departmentId && dr.role === role
  );
}

/**
 * Vrai si l'utilisateur est Scrum Master d'AU MOINS un département.
 */
export function isScrumMasterAnywhere(user) {
  if (!user) return false;

  return (
    user.role === "SCRUM_MASTER" ||
    (user.departmentRoles || []).some((dr) => dr.role === "SCRUM_MASTER")
  );
}

/**
 * Vrai si l'utilisateur est simple Member d'AU MOINS un département.
 */
export function isMemberAnywhere(user) {
  if (!user) return false;

  return (
    user.role === "MEMBER" ||
    user.role === "USER" ||
    (user.departmentRoles || []).some((dr) => dr.role === "MEMBER")
  );
}

/**
 * Renvoie la liste des departmentId où l'utilisateur est Scrum Master.
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
 */
export function canAssignTask(assigner, targetUser) {
  if (hasGlobalRole(assigner, "ADMIN")) return true;

  const assignerDeptIds = scrumMasterDepartmentIds(assigner);
  if (assignerDeptIds.length === 0) return false;

  const targetDeptIds = (targetUser?.departmentRoles || []).map(
    (dr) => dr.departmentId
  );

  return targetDeptIds.some((id) => assignerDeptIds.includes(id));
}

/**
 * Raccourci pratique pour les gardes de route / affichage conditionnel.
 */
export function isAdmin(user) {
  return hasGlobalRole(user, "ADMIN");
}

/**
 * Vrai si l'utilisateur est Scrum Master d'au moins un département ou au niveau global.
 */
export function isScrumMaster(user) {
  return (
    user?.role === "SCRUM_MASTER" ||
    (user?.departmentRoles || []).some((dr) => dr.role === "SCRUM_MASTER")
  );
}

/**
 * Vrai si l'utilisateur est soit ADMIN soit SCRUM_MASTER.
 */
export function isAdminOrScrumMaster(user) {
  return isAdmin(user) || isScrumMaster(user);
}