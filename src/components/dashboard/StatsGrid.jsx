function StatsGrid({ items }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="bg-white rounded-xl border border-slate-100 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {item.label}
              </span>
              {Icon && (
                <span
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{
                    width: 30,
                    height: 30,
                    color: item.accent ?? "#1e3a5f",
                    backgroundColor: item.accentBg ?? "#eef0f3",
                  }}
                >
                  <Icon size={15} strokeWidth={2.3} />
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-[26px] font-semibold leading-none ${
                  item.variant === "positive"
                    ? "text-green-600"
                    : item.variant === "negative"
                    ? "text-red-600"
                    : "text-slate-900"
                }`}
              >
                {item.value}
              </span>
            </div>
            {item.hint && (
              <div className="text-[11px] text-slate-400 mt-1.5">{item.hint}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StatsGrid;