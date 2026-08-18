import { useState } from "react";
import { X } from "lucide-react";

function CreateProjectModal({ departments, project, onClose, onCreate, onEdit }) {
  const isEditMode = Boolean(project);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [departmentIds, setDepartmentIds] = useState(
    project?.departmentIds?.length
      ? project.departmentIds.map(String)
      : project?.departmentId
      ? [String(project.departmentId)]
      : []
  );
  const [status, setStatus] = useState(project?.status ?? "A_FAIRE");
  const [startDate, setStartDate] = useState(project?.startDate ?? "");
  const [endDate, setEndDate] = useState(project?.endDate ?? "");
  const [submitting, setSubmitting] = useState(false);

  function toggleDept(id) {
    setDepartmentIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const selectedDepts = departments.filter((d) => departmentIds.includes(String(d.id)));
    const payload = {
      name,
      description,
      departmentIds: selectedDepts.map((d) => d.id),
      departmentId: selectedDepts[0]?.id ?? null, // conservé pour compatibilité avec l'ancien code
      startDate: startDate || null,
      endDate: endDate || null,
    };
    try {
      if (isEditMode) {
        await onEdit(project.id, { ...payload, status });
      } else {
        await onCreate({ ...payload, status: "A_FAIRE" });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-[440px] max-h-[85vh] overflow-y-auto p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-[17px] font-semibold text-slate-900">
            {isEditMode ? "Modifier le projet" : "Nouveau projet"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-slate-400 mb-5">
          {isEditMode
            ? "Les modifications sont visibles immédiatement dans le portefeuille."
            : "Le projet apparaîtra dans le portefeuille dès sa création."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du projet"
            required
            className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optionnel)"
            rows={3}
            className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400 resize-none"
          />

          <fieldset>
            <legend className="text-[12px] font-medium text-slate-500 mb-2">Départements concernés</legend>
            <div className="flex flex-wrap gap-2">
              {departments.map((d) => {
                const checked = departmentIds.includes(String(d.id));
                return (
                  <label
                    key={d.id}
                    className={`flex items-center gap-1.5 text-[12px] rounded-full px-2.5 py-1.5 border cursor-pointer transition-colors ${
                      checked
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDept(String(d.id))}
                      className="hidden"
                    />
                    {d.name}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {isEditMode && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
            >
              <option value="A_FAIRE">À faire</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
            </select>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11.5px] text-slate-400 mb-1 block">Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11.5px] text-slate-400 mb-1 block">Échéance</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-medium py-2.5 mt-2 transition-colors disabled:opacity-50"
          >
            {submitting ? "Enregistrement..." : isEditMode ? "Enregistrer" : "Créer le projet"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;