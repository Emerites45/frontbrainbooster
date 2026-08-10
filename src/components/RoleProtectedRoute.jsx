import { Navigate } from "react-router-dom";

/**
 * Variante de ProtectedRoute qui ajoute une vérification de rôle en plus
 * de l'auth. Deux niveaux de redirection distincts :
 * - pas connecté du tout          -> /login
 * - connecté mais rôle insuffisant -> / (board), pas d'accès à /admin/*
 *
 * allowedCheck : fonction (user) => boolean, ex. isAdmin depuis
 * utils/permissions.js. On ne code aucune logique de rôle ici : ce composant
 * reste un simple garde, la règle métier vit dans permissions.js.
 */
function RoleProtectedRoute({ isLoggedIn, user, allowedCheck, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (typeof allowedCheck === "function" && !allowedCheck(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleProtectedRoute;