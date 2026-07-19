function DashboardPage({ tasks }) {
  const rootTasks = tasks.filter((t) => !t.parentTaskId);
  const total = rootTasks.length;

  const aFaire = rootTasks.filter((t) => t.status === "A_FAIRE").length;
  const enCours = rootTasks.filter((t) => t.status === "EN_COURS").length;
  const termine = rootTasks.filter((t) => t.status === "TERMINE").length;

  const pourcentageTermine =
    total === 0 ? 0 : Math.round((termine / total) * 100);

  return (
    <div className="dashboard-page" style={{ padding: "24px 40px" }}>
      <h1>Tableau de bord</h1>

      <div className="stats-grid" style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div className="stat-card" style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
          <h3>Total des tâches</h3>
          <p className="stat-number" style={{ fontSize: "24px", fontWeight: "bold" }}>{total}</p>
        </div>
        <div className="stat-card" style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
          <h3>À faire</h3>
          <p className="stat-number" style={{ fontSize: "24px", fontWeight: "bold" }}>{aFaire}</p>
        </div>
        <div className="stat-card" style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
          <h3>En cours</h3>
          <p className="stat-number" style={{ fontSize: "24px", fontWeight: "bold" }}>{enCours}</p>
        </div>
        <div className="stat-card" style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
          <h3>Terminé</h3>
          <p className="stat-number" style={{ fontSize: "24px", fontWeight: "bold" }}>{termine}</p>
        </div>
        <div className="stat-card" style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
          <h3>Progression</h3>
          <p className="stat-number" style={{ fontSize: "24px", fontWeight: "bold" }}>{pourcentageTermine}%</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
