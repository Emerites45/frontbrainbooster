import { useState } from "react";
import { X } from "lucide-react";

function NewSprintModal({ projectId, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState(20);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;

    onCreate({
      projectId,
      name: name.trim(),
      goal: goal.trim(),
      startDate,
      endDate,
      status: "PLANNED",
      storyPointsCapacity: Number(capacity) || 0,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl w-full max-w-[480px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-900">Nouveau sprint</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12.5px] font-medium text-slate-600 mb-1.5">
              Nom du sprint
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sprint 2 — Contrats export"
              required
              className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-slate-600 mb-1.5">
              Objectif (optionnel)
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12.5px] font-medium text-slate-600 mb-1.5">
                Début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 text-[13px] px-3 py-2 outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-slate-600 mb-1.5">
                Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
                className="w-full rounded-lg border border-slate-200 text-[13px] px-3 py-2 outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-slate-600 mb-1.5">
              Capacité (story points)
            </label>
            <input
              type="number"
              min="0"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full rounded-lg border border-slate-200 text-[13px] px-3 py-2 outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] text-slate-500 hover:text-slate-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 transition-colors"
          >
            Créer le sprint
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewSprintModal;