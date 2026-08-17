import StatsGrid from "../components/dashboard/StatsGrid";
import MyTasksTable from "../components/dashboard/MyTasksTable";
import { computeTaskStats, getAssigneeIds } from "../utils/dashboardHelpers";
import "./AdminDashboard.css";

function MemberDashboardPage({ currentUser, tasks = [], projects = [] }) {
  const myTasks = tasks.filter((t) => getAssigneeIds(t).includes(currentUser.id));
  const stats = computeTaskStats(myTasks);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Bonjour {currentUser.firstName}</h1>
          <p className="dashboard-subtitle">Vos tâches assignées et votre progression.</p>
        </div>
      </div>

      <StatsGrid
        items={[
          { label: "Mes tâches", value: stats.total },
          { label: "Terminées", value: stats.done, variant: "positive" },
          { label: "En retard", value: stats.overdue, variant: stats.overdue > 0 ? "negative" : undefined },
          { label: "Progression", value: `${stats.progression}%` },
        ]}
      />

      <MyTasksTable tasks={myTasks} projects={projects} />
    </div>
  );
}

export default MemberDashboardPage;