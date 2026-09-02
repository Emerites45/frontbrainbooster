import { apiClient, getCurrentUser } from "./client";

export async function fetchComments(taskId) {
  return apiClient(`/comments?taskId=${taskId}`);
}

export async function createComment(taskId, content) {
  const currentUser = getCurrentUser();
  return apiClient("/comments", {
    method: "POST",
    body: {
      taskId,
      content,
      createdBy: currentUser?.id,
      authorName: `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim(),
    },
  });
}

export async function deleteComment(commentId) {
  await apiClient(`/comments/${commentId}`, {
    method: "DELETE",
  });
  return true;
}