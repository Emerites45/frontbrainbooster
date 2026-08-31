import { apiClient } from "./client";

export async function fetchTasks() {
  return apiClient("/tasks");
}