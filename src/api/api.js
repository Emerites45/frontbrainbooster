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
export async function registerUser(nom, email, password) {
  const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: nom, email, password }),
  });
  if (!response.ok) throw new Error("Inscription échouée");
  return response.json();
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
  // MOCK — actif automatiquement en dev (npm run dev)
  if (import.meta.env.DEV) {
    console.log("Mock: envoi du code à", email);
    await new Promise((r) => setTimeout(r, 800));

    if (!email.includes("@")) {
      throw new Error("Email invalide");
    }

    return { success: true, message: "Code envoyé (mock)" };
  }

  // API réelle — utilisée automatiquement en build de prod (npm run build)
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Impossible d'envoyer le code de vérification.");
  }

  return res.json();
}
export async function resetPassword({ email, otp, newPassword }) {
  if (import.meta.env.DEV) {
    console.log("Mock: reset password pour", email, "otp:", otp);
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, message: "Mot de passe réinitialisé (mock)" };
  }

  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  if (!res.ok) {
    throw new Error("Impossible de réinitialiser le mot de passe.");
  }

  return res.json();
}