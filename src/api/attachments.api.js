import { apiClient, getCurrentUser } from "./client";

export async function fetchAttachments({ taskId, projectId }) {
  const params = taskId ? `taskId=${taskId}` : `projectId=${projectId}`;
  return apiClient(`/attachments?${params}`);
}

export async function uploadAttachment(taskId, file) {
  const currentUser = getCurrentUser();
  const fileData = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return apiClient("/attachments", {
    method: "POST",
    body: {
      taskId,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      fileData,
      uploadedBy: currentUser?.id,
    },
  });
}

export async function deleteAttachment(attachmentId) {
  await apiClient(`/attachments/${attachmentId}`, {
    method: "DELETE",
  });
  return true;
}