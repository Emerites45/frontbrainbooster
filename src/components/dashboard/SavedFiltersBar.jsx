import { useState } from "react";
import { Bookmark, Plus, X } from "lucide-react";
import { useSavedFilters } from "../../hooks/useSavedFilters";

function SavedFiltersBar({ pageKey, currentFilters, onApply }) {
  const { presets, savePreset, deletePreset } = useSavedFilters(pageKey);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [name, setName] = useState("");

  function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;
    savePreset(name.trim(), currentFilters);
    setName("");
    setShowSaveInput(false);
  }

  if (presets.length === 0 && !showSaveInput) {
    return (
      <button
        onClick={() => setShowSaveInput(true)}
        className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-blue-600"
      >
        <Bookmark size={13} />
        Enregistrer ce filtre
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {presets.map((p) => (
        <span key={p.name} className="flex items-center gap-1.5 bg-slate-100 text-slate-600 rounded-full pl-2.5 pr-1.5 py-1 text-[11.5px]">
          <button onClick={() => onApply(p.filters)} className="hover:text-blue-600 font-medium">
            {p.name}
          </button>
          <button onClick={() => deletePreset(p.name)} className="text-slate-400 hover:text-red-600">
            <X size={11} />
          </button>
        </span>
      ))}

      {showSaveInput ? (
        <form onSubmit={handleSave} className="flex items-center gap-1.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => !name && setShowSaveInput(false)}
            placeholder="Nom du filtre..."
            className="text-[12px] rounded-lg border border-slate-200 px-2 py-1 outline-none focus:border-blue-400 w-32"
          />
          <button type="submit" className="text-blue-600 hover:text-blue-700"><Plus size={14} /></button>
        </form>
      ) : (
        <button onClick={() => setShowSaveInput(true)} className="flex items-center gap-1 text-[11.5px] text-slate-400 hover:text-blue-600">
          <Bookmark size={12} />
          Enregistrer
        </button>
      )}
    </div>
  );
}

export default SavedFiltersBar;