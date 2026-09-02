import { apiClient } from "./client";

export async function registerUser(userData) {
  return apiClient("/api/v1/auth/signup", {
    method: "POST",
    body: userData,
  });
}

export async function loginUser(email, password) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Identifiants invalides");
  return response.json();
}

export async function requestPasswordReset(email) {
  const message = await apiClient(
    `/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`,
    { method: "POST" }
  );
  return { success: true, message };
}

export async function resetPassword({ email, otp, newPassword }) {
  const message = await apiClient("/api/v1/auth/reset-password", {
    method: "POST",
    body: { email, otp, newPassword },
  });
  return { success: true, message };
}