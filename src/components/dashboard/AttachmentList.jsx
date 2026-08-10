import { useState, useEffect } from "react";
import { Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { fetchAttachments, uploadAttachment, deleteAttachment } from "../../api/api";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function AttachmentList({ taskId, projectId, readOnly = false }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
  }, [taskId, projectId]);

  function load() {
    setLoading(true);
    fetchAttachments({ taskId, projectId })
      .then(setAttachments)
      .finally(() => setLoading(false));
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file || !taskId) return;
    setUploading(true);
    try {
      await uploadAttachment(taskId, file);
      load();
    } catch (err) {
      alert("Erreur lors de l'envoi du fichier : " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce fichier ?")) return;
    await deleteAttachment(id);
    load();
  }

  if (loading) return <p className="text-[12.5px] text-slate-400">Chargement des fichiers...</p>;

  return (
    <div>
      {attachments.length === 0 ? (
        <p className="text-[13px] text-slate-400 mb-3">Aucun fichier pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center gap-2.5 rounded-lg border border-slate-100 p-2.5 group">
              {a.mimeType?.startsWith("image/") ? (
                <img src={a.fileData} alt={a.fileName} className="w-9 h-9 rounded object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-slate-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <a href={a.fileData} download={a.fileName} className="text-[12px] font-medium text-slate-700 truncate block hover:text-blue-600">
                  {a.fileName}
                </a>
                <span className="text-[10.5px] text-slate-400">{formatSize(a.fileSize)}</span>
              </div>
              {!readOnly && (
                <button onClick={() => handleDelete(a.id)} className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && taskId && (
        <label className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
          <Paperclip size={13} />
          {uploading ? "Envoi..." : "Ajouter un fichier"}
          <input type="file" onChange={handleFileChange} className="hidden" disabled={uploading} />
        </label>
      )}
    </div>
  );
}

export default AttachmentList;