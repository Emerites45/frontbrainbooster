function formatTempsEcoule(dateAction) {
  const diffMs = Date.now() - new Date(dateAction).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  return `il y a ${Math.floor(diffH / 24)}j`;
}

function libelleAction(action) {
  if (action.type_action === "CHANGEMENT_STATUT") {
    return `a changé le statut de ${action.ancienne_valeur} à ${action.nouvelle_valeur}`;
  }
  return `a modifié ${action.champ_modifie}`;
}

function HistoryTimeline({ actions }) {
  if (actions.length === 0) {
    return <p className="text-[13px] text-slate-400">Aucun historique pour cette tâche.</p>;
  }

  return (
    <ul className="relative space-y-4 before:absolute before:inset-y-0 before:left-[3px] before:w-px before:bg-slate-100">
      {actions.map((action) => (
        <li key={action.id} className="relative pl-5">
          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          <p className="text-[13px] text-slate-700 leading-snug">
            <span className="font-medium text-slate-900">{action.nom_user}</span>{" "}
            {libelleAction(action)}
          </p>
          <span className="text-[11px] text-slate-400">{formatTempsEcoule(action.date_action)}</span>
        </li>
      ))}
    </ul>
  );
}

export default HistoryTimeline;