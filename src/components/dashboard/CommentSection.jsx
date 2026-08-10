import { useState, useEffect } from "react";
import { Trash2, Send } from "lucide-react";
import { fetchComments, createComment, deleteComment } from "../../api/api";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  return `il y a ${Math.floor(diffH / 24)}j`;
}

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function CommentSection({ taskId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [taskId]);

  function load() {
    setLoading(true);
    fetchComments(taskId).then(setComments).finally(() => setLoading(false));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await createComment(taskId, text.trim());
      setText("");
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    await deleteComment(id);
    load();
  }

  const sorted = [...comments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div>
      {loading ? (
        <p className="text-[12.5px] text-slate-400">Chargement des commentaires...</p>
      ) : sorted.length === 0 ? (
        <p className="text-[13px] text-slate-400 mb-4">Aucun commentaire pour l'instant.</p>
      ) : (
        <ul className="space-y-3.5 mb-4">
          {sorted.map((c) => {
            const isMine = c.createdBy === currentUser?.id;
            return (
              <li key={c.id} className="flex items-start gap-2.5 group">
                <span className="flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-semibold w-7 h-7 shrink-0">
                  {initials(c.authorName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium text-slate-800">{c.authorName || "Utilisateur"}</span>
                    <span className="text-[11px] text-slate-400">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-[13px] text-slate-600 mt-0.5 break-words">{c.content}</p>
                </div>
                {isMine && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 rounded-lg border border-slate-200 text-[13px] px-3 py-2 outline-none focus:border-blue-400"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 shrink-0 transition-colors disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

export default CommentSection;