import { apiClient } from "./client";

export async function fetchProjects() {
  return apiClient("/projects");
}

export async function createProject(project) {
  return apiClient("/projects", {
    method: "POST",
    body: project,
  });
}

export async function updateProject(projectId, updates) {
  return apiClient(`/projects/${projectId}`, {
    method: "PATCH",
    body: updates,
  });
}

export async function deleteProject(projectId) {
  await apiClient(`/projects/${projectId}`, {
    method: "DELETE",
  });
  return true;
}