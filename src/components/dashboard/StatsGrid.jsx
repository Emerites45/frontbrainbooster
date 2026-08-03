import "../../pages/AdminDashboard.css";

/**
 * items: [{ label, value, variant?: "positive" | "negative" }]
 */
function StatsGrid({ items }) {
  return (
    <div className="stats-row">
      {items.map((item) => (
        <div className="stat-card" key={item.label}>
          <span className="stat-label">{item.label}</span>
          <span className={`stat-value ${item.variant ? `stat-${item.variant}` : ""}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;