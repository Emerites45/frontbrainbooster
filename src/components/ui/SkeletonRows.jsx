function SkeletonRows({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-none">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="h-3 rounded bg-slate-100" style={{ width: c === 0 ? "28%" : "14%" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="surface-card rounded-xl p-5 animate-pulse">
      <div className="h-3 w-20 bg-slate-100 rounded mb-3" />
      <div className="h-6 w-14 bg-slate-200 rounded" />
    </div>
  );
}

export default SkeletonRows;