import { STATUS_LABEL, timeAgo } from "../../utils/dashboardHelpers";

function RecentActivity({ actions, limit = 8 }) {
  const recent = [...actions]
    .sort((a, b) => new Date(b.date_action) - new Date(a.date_action))
    .slice(0, limit);

  return (
    <div className="surface-card rounded-xl p-5">
      <h2 className="text-[14.5px] font-semibold text-slate-900 mb-4">Activité récente</h2>
      {recent.length === 0 ? (
        <p className="text-[13px] text-slate-400">Aucune activité pour l'instant.</p>
      ) : (
        <ul className="space-y-4">
          {recent.map((a) => (
            <li key={a.id} className="flex gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <div>
                <p className="text-[13px] text-slate-700 leading-snug">
                  <span className="font-medium text-slate-900">{a.nom_user}</span>{" "}
                  {a.type_action === "CREATION"
                    ? "a créé une tâche"
                    : a.type_action === "CHANGEMENT_STATUT"
                    ? `a changé le statut → ${STATUS_LABEL[a.nouvelle_valeur] ?? a.nouvelle_valeur}`
                    : `a modifié ${a.champ_modifie}`}
                </p>
                <span className="text-[11px] text-slate-400">{timeAgo(a.date_action)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentActivity;