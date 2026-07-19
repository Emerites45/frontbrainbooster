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
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: nom, email, password }),
  });
  if (!response.ok) throw new Error("Inscription échouée");
  return response.json();
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Identifiants invalides");
  return response.json();
}