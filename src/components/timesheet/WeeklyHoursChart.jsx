function WeeklyHoursChart({ days, totalsByDate, target = 4 }) {
  const width = 560, height = 200, padding = 30;
  const maxVal = Math.max(target + 2, ...days.map((d) => totalsByDate[d] ?? 0));
  const stepX = (width - padding * 2) / (days.length - 1);
  const yFor = (val) => height - padding - (val / maxVal) * (height - padding * 2);

  const points = days.map((d, i) => ({ x: padding + i * stepX, y: yFor(totalsByDate[d] ?? 0), val: totalsByDate[d] ?? 0 }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const targetY = yFor(target);

  return (
    <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full">
      <line x1={padding} y1={targetY} x2={width - padding} y2={targetY} stroke="#1e3a8a" strokeDasharray="6 4" strokeWidth="1.5" />
      <path d={pathD} fill="none" stroke="#334155" strokeWidth="2" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="9" fill={p.val >= target ? "#86efac" : "#fca5a5"} stroke={p.val >= target ? "#16a34a" : "#dc2626"} strokeWidth="1.5" />
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="600" fill="#1e293b">{p.val.toFixed(1)}</text>
          <text x={p.x} y={height + 5} textAnchor="middle" fontSize="10" fill="#94a3b8">
            {new Date(days[i]).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default WeeklyHoursChart;