const ROWS = [
  { key: "todoTasks", label: "À faire", color: "bg-amber-400" },
  { key: "inProgressTasks", label: "En cours", color: "bg-blue-500" },
  { key: "completedTasks", label: "Terminées", color: "bg-green-500" },
];

function TaskStatusBreakdown({ analytics }) {
  if (!analytics) {
    return <p className="text-[13px] text-slate-400 text-center py-10">Sélectionnez un utilisateur pour voir la répartition.</p>;
  }
  if (analytics.totalTasks === 0) {
    return <p className="text-[13px] text-slate-400 text-center py-10">Aucune tâche assignée à cet utilisateur.</p>;
  }
  return (
    <div className="space-y-4">
      {ROWS.map((row) => {
        const count = analytics[row.key];
        const pct = Math.round((count / analytics.totalTasks) * 100);
        return (
          <div key={row.key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12.5px] text-slate-600">{row.label}</span>
              <span className="text-[12px] text-slate-400">{count} · {pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TaskStatusBreakdown;