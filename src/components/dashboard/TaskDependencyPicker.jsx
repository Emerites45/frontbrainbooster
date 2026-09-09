import { useState, useMemo } from "react";
import { Search, X, Link2 } from "lucide-react";

function TaskDependencyPicker({ allTasks, currentTaskId, selectedIds, onChange }) {
  const [query, setQuery] = useState("");
  const candidates = allTasks.filter((t) => t.id !== currentTaskId);

  const filtered = useMemo(() => {
    if (!query.trim()) return candidates;
    const q = query.toLowerCase();
    return candidates.filter((t) => t.title?.toLowerCase().includes(q));
  }, [query, candidates]);

  const selectedTasks = candidates.filter((t) => selectedIds.includes(t.id));

  function toggle(id) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  }

  return (
    <div>
      {selectedTasks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTasks.map((t) => (
            <span key={t.id} className="flex items-center gap-1.5 bg-red-50 text-red-700 rounded-full pl-2 pr-1.5 py-1 text-[11.5px] font-medium">
              <Link2 size={10} />
              {t.title}
              <button type="button" onClick={() => toggle(t.id)} className="text-red-400 hover:text-red-700">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 mb-1.5">
        <Search size={13} className="text-slate-400 shrink-0" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une tâche..." className="flex-1 text-[12.5px] outline-none placeholder-slate-400" />
      </div>
      <div className="border border-slate-100 rounded-lg overflow-y-auto max-h-[140px]">
        {filtered.slice(0, 30).map((t) => {
          const checked = selectedIds.includes(t.id);
          return (
            <button key={t.id} type="button" onClick={() => toggle(t.id)} className={`w-full flex items-center justify-between px-3 py-2 text-left text-[12px] ${checked ? "bg-red-50" : "hover:bg-slate-50"}`}>
              <span className="truncate text-slate-700">{t.title}</span>
              {checked && <span className="text-red-600 font-semibold">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TaskDependencyPicker;