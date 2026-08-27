import { createNotification } from "../api/api";

// Détermine où renvoyer l'utilisateur en cliquant sur la notification,
// selon son rôle — cohérent avec la logique déjà utilisée pour la
// redirection racine "/" dans App.jsx.
export function taskBoardPathForUser(user) {
  if (user?.globalRoles?.includes("ADMIN")) return "/admin/tasks";
  if (user?.departmentRoles?.some((dr) => dr.role === "SCRUM_MASTER")) return "/scrum-master/tasks";
  return "/dashboard";
}

// Envoie une notification à plusieurs utilisateurs à la fois, en excluant
// l'auteur de l'action (on ne se notifie jamais soi-même). Échec silencieux
// par notification — même logique que persistAction : on ne bloque jamais
// l'UI pour un souci de notification.
export async function notifyUsers(userIds, { type, title, message, link }, excludeUserId) {
  const targets = [...new Set(userIds)].filter((id) => id !== excludeUserId);
  await Promise.all(
    targets.map((userId) =>
      createNotification({ userId, type, title, message, link }).catch((err) =>
        console.error("Notification non envoyée :", err)
      )
    )
  );
}