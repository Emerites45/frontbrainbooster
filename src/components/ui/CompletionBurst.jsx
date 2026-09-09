import { useEffect, useState } from "react";

const COLORS = ["#0B438C", "#20A036", "#FFDE21", "#66B86B"];

function CompletionBurst({ trigger }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      angle: (i / 8) * 360,
      color: COLORS[i % COLORS.length],
    }));
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 500);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: p.color,
            animation: "confetti-pop 0.5s ease-out forwards",
            transform: `rotate(${p.angle}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default CompletionBurst;