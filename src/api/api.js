const API_URL = import.meta.env.VITE_API_URL;
export async function fetchTasks() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${currentUser?.token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }
  return response.json();
}
export async function registerUser(userData) {
  // userData est l'objet { nom, email, password } envoyé depuis SignupPage.jsx
  const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(userData), // Envoie directement { nom, email, password }
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Inscription échouée");
  }

  // Comme le backend renvoie une chaîne texte (String), on lit avec .text()
  return response.text();
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Identifiants invalides");
  return response.json();
}
export async function fetchProjects() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/projects`, {
    headers: { Authorization: `Bearer ${currentUser?.token}` },
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function createProject(project) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentUser?.token}`,
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
  return response.json();
}

export async function requestPasswordReset(email) {
  // On passe l'email dans l'URL avec ?email=...
  const res = await fetch(
    `${API_URL}/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || "Impossible d'envoyer le code de vérification.");
  }

  // Le backend renvoie une String, donc res.text()
  const message = await res.text();
  return { success: true, message };
}
export async function resetPassword({ email, otp, newPassword }) {
  const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  if (!res.ok) {
    // Récupère le vrai message d'erreur envoyé par Spring Boot s'il existe
    const errorMsg = await res.text();
    throw new Error(errorMsg || "Impossible de réinitialiser le mot de passe.");
  }

  // Comme le backend renvoie ResponseEntity<String>, on lit la réponse avec res.text()
  const message = await res.text();
  return { success: true, message };
}