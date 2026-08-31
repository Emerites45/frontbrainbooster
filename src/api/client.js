const API_URL = import.meta.env.VITE_API_URL;

export function getAuthHeader() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  return currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {};
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

export async function apiClient(endpoint, { body, headers, ...customConfig } = {}) {
  const config = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeader(),
      ...headers,
    },
  };

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || `Erreur API: ${response.status}`);
  }

  // Si la réponse n'a pas de contenu (ex: DELETE 204), on retourne la réponse ok
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}