// Angle d'or : garantit une séparation visuelle maximale entre teintes
// consécutives, même avec beaucoup d'utilisateurs, sans jamais se répéter
// ni nécessiter de vérification de collision. Déterministe : le même
// utilisateur a toujours la même couleur, à chaque session, sur chaque écran.
const GOLDEN_ANGLE = 137.508;

export function userHue(userId) {
  const n = Number(userId) || 0;
  return Math.round((n * GOLDEN_ANGLE) % 360);
}

export function userGradient(userId) {
  const hue = userHue(userId);
  const hue2 = (hue + 25) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${hue2}, 75%, 45%))`;
}

// Pour les cas où on a juste besoin d'une couleur pleine (bordures, dots, etc.)
export function userColor(userId) {
  const hue = userHue(userId);
  return `hsl(${hue}, 70%, 50%)`;
}