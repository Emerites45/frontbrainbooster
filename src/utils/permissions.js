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
 *
 * Exemple :
 * hasDepartmentRole(user, 3, "SCRUM_MASTER")
 */
export function hasDepartmentRole(user, departmentId, role) {
  if (!user) return false;

  return (user.departmentRoles || []).some(
    (dr) => dr.departmentId === departmentId && dr.role === role
  );
}

/**
 * Vrai si l'utilisateur est Scrum Master d'AU MOINS un département
 * (peu importe lequel).
 *
 * Utile pour l'affichage conditionnel de menus.
 */
export function isScrumMasterAnywhere(user) {
  if (!user) return false;

  return (user.departmentRoles || []).some(
    (dr) => dr.role === "SCRUM_MASTER"
  );
}

/**
 * Vrai si l'utilisateur est simple Member d'AU MOINS un département.
 */
export function isMemberAnywhere(user) {
  if (!user) return false;

  return (user.departmentRoles || []).some(
    (dr) => dr.role === "MEMBER"
  );
}

/**
 * Renvoie la liste des departmentId où l'utilisateur est Scrum Master.
 *
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
 *
 * - il est Admin (peut créer n'importe où), ou
 * - il est Scrum Master de CE département précis.
 */
export function canCreateProject(user, departmentId) {
  if (hasGlobalRole(user, "ADMIN")) return true;

  return hasDepartmentRole(
    user,
    departmentId,
    "SCRUM_MASTER"
  );
}

/**
 * Un utilisateur (assigneur) peut-il assigner une tâche à targetUser ?
 *
 * - Admin : toujours oui, quel que soit le département de targetUser.
 *
 * - Scrum Master : uniquement si targetUser appartient à un département
 *   dont l'assigneur est Scrum Master.
 *
 * Règle métier :
 * "Un Scrum Master ne peut assigner qu'aux membres de son département."
 */
export function canAssignTask(assigner, targetUser) {
  // Admin peut assigner à n'importe quel utilisateur.
  if (hasGlobalRole(assigner, "ADMIN")) return true;

  // Récupérer les départements où l'assigneur est Scrum Master.
  const assignerDeptIds = scrumMasterDepartmentIds(assigner);

  // Si l'assigneur n'est Scrum Master d'aucun département,
  // il ne peut pas assigner de tâche.
  if (assignerDeptIds.length === 0) return false;

  // Récupérer les départements du targetUser.
  const targetDeptIds = (targetUser?.departmentRoles || []).map(
    (dr) => dr.departmentId
  );

  // Autorisé si les deux utilisateurs partagent au moins
  // un département dans lequel l'assigneur est Scrum Master.
  return targetDeptIds.some((id) => assignerDeptIds.includes(id));
}

/**
 * Raccourci pratique pour les gardes de route / affichage conditionnel.
 */
export function isAdmin(user) {
  return hasGlobalRole(user, "ADMIN");
}

/**
 * Vrai si l'utilisateur est Scrum Master d'au moins un département.
 */
export function isScrumMaster(user) {
  return (user?.departmentRoles || []).some(
    (dr) => dr.role === "SCRUM_MASTER"
  );
}

/**
 * Vrai si l'utilisateur est soit :
 *
 * - ADMIN au niveau global
 * - SCRUM_MASTER dans au moins un département
 *
 * Utile pour :
 * - les routes accessibles aux Admin/Scrum Master
 * - l'affichage conditionnel de menus
 * - les boutons réservés aux Admin/Scrum Master
 * - les composants protégés
 */
export function isAdminOrScrumMaster(user) {
  return (
    user?.globalRoles?.includes("ADMIN") ||
    (user?.departmentRoles || []).some(
      (dr) => dr.role === "SCRUM_MASTER"
    )
  );
}