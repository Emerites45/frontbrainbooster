const STATUS_LABEL = { BELOW: "En dessous de l'objectif", REACHED: "Objectif atteint", EXCEEDED: "Objectif dépassé", NONE: "Aucun objectif configuré" };
const STATUS_COLOR = { BELOW: "bg-amber-500", REACHED: "bg-green-500", EXCEEDED: "bg-blue-500", NONE: "bg-slate-300" };
const STATUS_TEXT = { BELOW: "text-amber-700 bg-amber-50", REACHED: "text-green-700 bg-green-50", EXCEEDED: "text-blue-700 bg-blue-50", NONE: "text-slate-500 bg-slate-100" };

function ObjectifProgress({ analytics }) {
  if (!analytics) {
    return <p className="text-[13px] text-slate-400 text-center py-10">Sélectionnez un utilisateur pour voir l'objectif.</p>;
  }
  const { totalHours, weeklyTarget, remainingHours, targetCompletionRate, targetStatus } = analytics;
  const pct = Math.min(100, targetCompletionRate);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[13px] text-slate-500">Temps travaillé</span>
        <span className="text-[13px] font-semibold text-slate-800">{totalHours.toFixed(1)}h / {weeklyTarget}h</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${STATUS_COLOR[targetStatus]}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className={`inline-flex items-center rounded-full text-[11px] font-semibold px-2.5 py-1 ${STATUS_TEXT[targetStatus]}`}>
          {STATUS_LABEL[targetStatus]}
        </span>
        <span className="text-[12px] text-slate-400">
          {targetStatus === "EXCEEDED" ? `Dépassé de ${(totalHours - weeklyTarget).toFixed(1)}h` : `${remainingHours.toFixed(1)}h restantes`}
        </span>
      </div>
    </div>
  );
}

export default ObjectifProgress;
