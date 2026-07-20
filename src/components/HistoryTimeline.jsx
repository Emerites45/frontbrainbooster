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
  if (action.type_action === 'CHANGEMENT_STATUT') {
    return `a changé le statut de ${action.ancienne_valeur} à ${action.nouvelle_valeur}`;
  }
  return `a modifié ${action.champ_modifie}`;
}

function HistoryTimeline({ actions }) {
  if (actions.length === 0) {
    return <p>Aucun historique pour cette tâche.</p>;
  }

  return (
    <ul>
      {actions.map(action => (
        <li key={action.id}>
          <strong>{action.nom_user}</strong> {libelleAction(action)}
          <br />
          <small>{formatTempsEcoule(action.date_action)}</small>
        </li>
      ))}
    </ul>
  );
}

export default HistoryTimeline;