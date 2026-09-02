import { apiClient } from "./client";

export async function fetchUsers() {
  return apiClient("/users");
}

export async function fetchDepartments() {
  return apiClient("/departments");
}

export async function createAdminUser(userData) {
  return apiClient("/admin/users", {
    method: "POST",
    body: userData,
  });
}

export async function updateUser(userId, updates) {
  return apiClient(`/users/${userId}`, {
    method: "PATCH",
    body: updates,
  });
}

export async function toggleUserActive(userId, active) {
  return updateUser(userId, { active });
}