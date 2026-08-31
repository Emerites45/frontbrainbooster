import { apiClient } from "./client";

export async function fetchActions() {
  return apiClient("/actions");
}

export async function createAction(actionData) {
  return apiClient("/actions", {
    method: "POST",
    body: actionData,
  });
}