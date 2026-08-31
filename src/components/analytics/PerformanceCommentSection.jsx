import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { fetchPerformanceComments, createPerformanceComment } from "../../api/analytics.api";
function timeAgo(iso) {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  return `il y a ${Math.floor(diffH / 24)}j`;
}

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function PerformanceCommentSection({ targetUserId, weekStart, currentUser, readOnlyLabel }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [targetUserId, weekStart]);

  function load() {
    if (!targetUserId) return;
    setLoading(true);
    fetchPerformanceComments({ userId: targetUserId, weekStart }).then(setComments).finally(() => setLoading(false));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await createPerformanceComment({ targetUserId, weekStart, content: text.trim() });
      setText("");
      load();
    } finally {
      setSubmitting(false);
    }
  }

  const sorted = [...comments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <h2 className="text-[14.5px] font-semibold text-slate-900 mb-4">Commentaires{readOnlyLabel ? ` — ${readOnlyLabel}` : ""}</h2>
      {loading ? (
        <p className="text-[12.5px] text-slate-400">Chargement...</p>
      ) : sorted.length === 0 ? (
        <p className="text-[13px] text-slate-400 mb-4">Aucun commentaire pour cette semaine.</p>
      ) : (
        <ul className="space-y-3.5 mb-4">
          {sorted.map((c) => (
            <li key={c.id} className="flex items-start gap-2.5">
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
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ajouter un commentaire pour cette semaine..."
          className="flex-1 rounded-lg border border-slate-200 text-[13px] px-3 py-2 outline-none focus:border-blue-400"
        />
        <button type="submit" disabled={submitting || !text.trim()} className="flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 shrink-0 transition-colors disabled:opacity-40">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

export default PerformanceCommentSection;