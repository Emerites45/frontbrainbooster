import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FolderKanban, CheckSquare, User as UserIcon, X } from "lucide-react";
import { taskBoardPathForUser } from "../../utils/notify";

function GlobalSearchModal({ open, onClose, tasks = [], projects = [], users = [], currentUser }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const dataReady = Array.isArray(tasks) && Array.isArray(projects) && Array.isArray(users);

  const results = useMemo(() => {
    if (!query.trim()) return { projects: [], tasks: [], users: [] };
    const q = query.toLowerCase();
    return {
      projects: projects.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 5),
      tasks: tasks.filter((t) => t.title?.toLowerCase().includes(q)).slice(0, 5),
      users: users.filter((u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)).slice(0, 5),
    };
  }, [query, projects, tasks, users]);

  const totalResults = results.projects.length + results.tasks.length + results.users.length;

  const projectBasePath = currentUser?.globalRoles?.includes("ADMIN") ? "/admin/projects" : "/scrum-master/projects";
  const tasksBasePath = taskBoardPathForUser(currentUser);
  const usersBasePath = currentUser?.globalRoles?.includes("ADMIN") ? "/admin/users" : "/scrum-master/team";

  function go(path) {
    onClose();
    navigate(path);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[90] flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[560px] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher projets, tâches, utilisateurs..."
            className="flex-1 text-[14.5px] outline-none placeholder-slate-400"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {!dataReady ? (
            <p className="text-[13px] text-slate-400 text-center py-10">Chargement des données...</p>
          ) : !query.trim() ? (
            <p className="text-[13px] text-slate-400 text-center py-10">Commencez à taper pour rechercher.</p>
          ) : totalResults === 0 ? (
            <p className="text-[13px] text-slate-400 text-center py-10">Aucun résultat pour « {query} ».</p>
          ) : (
            <>
              {results.projects.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">Projets</div>
                  {results.projects.map((p) => (
                    <button key={p.id} onClick={() => go(projectBasePath)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50">
                      <FolderKanban size={15} className="text-blue-500 shrink-0" />
                      <span className="text-[13px] text-slate-700 truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.tasks.length > 0 && (
                <div className="py-2 border-t border-slate-50">
                  <div className="px-4 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">Tâches</div>
                  {results.tasks.map((t) => (
                    <button key={t.id} onClick={() => go(tasksBasePath)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50">
                      <CheckSquare size={15} className="text-green-500 shrink-0" />
                      <span className="text-[13px] text-slate-700 truncate">{t.title}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.users.length > 0 && (
                <div className="py-2 border-t border-slate-50">
                  <div className="px-4 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">Utilisateurs</div>
                  {results.users.map((u) => (
                    <button key={u.id} onClick={() => go(usersBasePath)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50">
                      <UserIcon size={15} className="text-purple-500 shrink-0" />
                      <span className="text-[13px] text-slate-700 truncate">{u.firstName} {u.lastName}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Échap pour fermer</span>
          <span>Ctrl/Cmd + K pour ouvrir</span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchModal;