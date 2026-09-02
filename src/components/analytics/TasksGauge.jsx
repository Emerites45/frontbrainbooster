const BANDS = [
  { max: 20, color: "#ef4444" },
  { max: 40, color: "#f97316" },
  { max: 60, color: "#a78bfa" },
  { max: 80, color: "#fdba74" },
  { max: 100, color: "#14b8a6" },
];

function describeArc(cx, cy, r, startAngle, endAngle) {
  const toXY = (angle) => {
    const rad = ((angle - 180) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const start = toXY(startAngle);
  const end = toXY(endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function TasksGauge({ percent }) {
  const hasData = percent !== null && percent !== undefined;
  const value = hasData ? Math.min(100, Math.max(0, percent)) : 0;
  const cx = 110, cy = 100, r = 80;
  const needleAngle = (value / 100) * 180;
  const needleRad = ((needleAngle - 180) * Math.PI) / 180;
  const needleX = cx + (r - 12) * Math.cos(needleRad);
  const needleY = cy + (r - 12) * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 130" className="w-full max-w-[240px]">
        {BANDS.map((band, i) => {
          const prevMax = i === 0 ? 0 : BANDS[i - 1].max;
          return (
            <path
              key={i}
              d={describeArc(cx, cy, r, (prevMax / 100) * 180, (band.max / 100) * 180)}
              stroke={band.color}
              strokeWidth="18"
              fill="none"
            />
          );
        })}
        {hasData && <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />}
        {hasData && <circle cx={cx} cy={cy} r="5" fill="#1e293b" />}
      </svg>
      <div className="text-center -mt-2">
        {hasData ? (
          <span className="text-[28px] font-bold text-slate-900">{value}%</span>
        ) : (
          <span className="text-[15px] text-slate-400">Sélectionnez un utilisateur</span>
        )}
      </div>
    </div>
  );
}

export default TasksGauge;