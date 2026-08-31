function WorkloadList({ title, rows, emptyMessage = "Aucune donnée disponible." }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <h2 className="text-[14.5px] font-semibold text-slate-900 mb-4">{title}</h2>
      <div className="space-y-4">
        {rows.length === 0 && (
          <p className="text-[13px] text-slate-400">{emptyMessage}</p>
        )}
        {rows.map((row) => {
          const safeTotal = row.total || 0;
          const pct = safeTotal === 0 ? 0 : Math.round((row.numerator / safeTotal) * 100);
          return (
            <div key={row.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-slate-700">{row.name}</span>
                <span className="text-[12px] text-slate-400">
                  {row.numerator} / {row.total} {row.unitLabel ?? "tâches"}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WorkloadList;