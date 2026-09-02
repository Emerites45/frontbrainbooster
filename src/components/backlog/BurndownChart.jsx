function BurndownChart({ sprint, tasks }) {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const dayMs = 86400000;
  const totalDays = Math.max(1, Math.round((end - start) / dayMs));
  const totalPoints = tasks.reduce((s, t) => s + (Number(t.storyPoints) || 0), 0);

  const idealLine = Array.from({ length: totalDays + 1 }, (_, i) => totalPoints - (totalPoints / totalDays) * i);

  // Ligne réelle : points restants au jour J, basé sur task.dueDate comme proxy de "terminé ce jour-là"
  // faute d'un vrai horodatage de complétion par tâche dans le modèle actuel.
  const actualLine = Array.from({ length: totalDays + 1 }, (_, i) => {
    const dayDate = new Date(start.getTime() + i * dayMs);
    const doneByThen = tasks
      .filter((t) => t.status === "TERMINE" && t.dueDate && new Date(t.dueDate) <= dayDate)
      .reduce((s, t) => s + (Number(t.storyPoints) || 0), 0);
    return Math.max(0, totalPoints - doneByThen);
  });

  const width = 600, height = 220, padding = 36;
  const maxVal = Math.max(totalPoints, 1);
  const stepX = (width - padding * 2) / totalDays;
  const yFor = (v) => height - padding - (v / maxVal) * (height - padding * 2);

  const pathFor = (line) => line.map((v, i) => `${i === 0 ? "M" : "L"} ${padding + i * stepX} ${yFor(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full">
      <path d={pathFor(idealLine)} fill="none" stroke="#94a3b8" strokeDasharray="6 4" strokeWidth="1.5" />
      <path d={pathFor(actualLine)} fill="none" stroke="#0B438C" strokeWidth="2.5" />
      {actualLine.map((v, i) => (
        <circle key={i} cx={padding + i * stepX} cy={yFor(v)} r="3.5" fill="#0B438C" />
      ))}
      <text x={padding} y={16} fontSize="11" fill="#94a3b8">Points restants : {actualLine[actualLine.length - 1]?.toFixed(0)} / {totalPoints}</text>
      <text x={width - padding} y={16} textAnchor="end" fontSize="10" fill="#94a3b8">— Idéal ⎯ Réel</text>
    </svg>
  );
}

export default BurndownChart;