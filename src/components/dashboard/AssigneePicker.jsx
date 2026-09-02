import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import Avatar from "../ui/Avatar";

function AssigneePicker({ users, selectedIds, onChange, maxHeight = 180 }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter((u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [query, users]);

  const selectedUsers = users.filter((u) => selectedIds.includes(u.id));

  function toggle(id) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  }

  return (
    <div>
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedUsers.map((u) => (
            <span key={u.id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full pl-1 pr-2 py-1 text-[12px] font-medium">
              <Avatar userId={u.id} firstName={u.firstName} lastName={u.lastName} size="xs" />
              {u.firstName} {u.lastName}
              <button type="button" onClick={() => toggle(u.id)} className="text-blue-400 hover:text-blue-700">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 mb-1.5">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un nom ou un email..."
          className="flex-1 text-[13px] outline-none placeholder-slate-400"
        />
      </div>
      <div className="border border-slate-100 rounded-lg overflow-y-auto" style={{ maxHeight }}>
        {filtered.length === 0 ? (
          <p className="text-[12.5px] text-slate-400 text-center py-4">Aucun résultat.</p>
        ) : (
          filtered.slice(0, 30).map((u) => {
            const checked = selectedIds.includes(u.id);
            return (
              <button
                type="button"
                key={u.id}
                onClick={() => toggle(u.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${checked ? "bg-blue-50" : "hover:bg-slate-50"}`}
              >
                <Avatar userId={u.id} firstName={u.firstName} lastName={u.lastName} size="xs" />
                <span className="text-[12.5px] text-slate-700 truncate">{u.firstName} {u.lastName}</span>
                {checked && <span className="ml-auto text-blue-600 text-[11px] font-semibold">✓</span>}
              </button>
            );
          })
        )}
        {filtered.length > 30 && <p className="text-[11px] text-slate-400 text-center py-2">+{filtered.length - 30} autres — affinez la recherche.</p>}
      </div>
    </div>
  );
}

export default AssigneePicker;