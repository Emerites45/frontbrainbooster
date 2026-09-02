import { apiClient, getCurrentUser } from "./client";

export async function fetchPerformanceComments({ userId, weekStart }) {
  return apiClient(`/performance-comments?userId=${userId}&weekStart=${weekStart}`);
}

export async function createPerformanceComment({ targetUserId, weekStart, content }) {
  const currentUser = getCurrentUser();
  return apiClient("/performance-comments", {
    method: "POST",
    body: {
      targetUserId,
      weekStart,
      content,
      authorId: currentUser?.id,
      authorName: `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim(),
    },
  });
}