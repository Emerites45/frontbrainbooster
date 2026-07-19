function DashboardPage({ tasks }) {
  const rootTasks = tasks.filter((t) => !t.parentTaskId);
  const total = rootTasks.length;

  const aFaire = rootTasks.filter((t) => t.status === "A_FAIRE").length;
  const enCours = rootTasks.filter((t) => t.status === "EN_COURS").length;
  const termine = rootTasks.filter((t) => t.status === "TERMINE").length;

  const pourcentageTermine =
    total === 0 ? 0 : Math.round((termine / total) * 100);

  return (
    <div className="dashboard-page">
      <h1>Tableau de bord</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total des tâches</h3>
          <p className="stat-number">{total}</p>
        </div>
        <div className="stat-card">
          <h3>À faire</h3>
          <p className="stat-number">{aFaire}</p>
        </div>
        <div className="stat-card">
          <h3>En cours</h3>
          <p className="stat-number">{enCours}</p>
        </div>
        <div className="stat-card">
          <h3>Terminé</h3>
          <p className="stat-number">{termine}</p>
        </div>
        <div className="stat-card">
          <h3>Progression</h3>
          <p className="stat-number">{pourcentageTermine}%</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
