import { Route } from "react-router-dom";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import CalendarPage from "../pages/CalendarPage";
import AdminProjectsPage from "../pages/admin/AdminProjectsPage";
import AdminTeamPage from "../pages/admin/AdminTeamPage";
import TeamEvaluationPage from "../pages/admin/TeamEvaluationPage";
import BoardPage from "../pages/BoardPage";
import AdminActivityPage from "../pages/admin/AdminActivityPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import UnderConstruction from "../components/UnderConstruction";
import { isAdmin } from "../utils/permissions";

export default function getAdminRoutes(dataHandlers) {
  const {
    currentUser,
    isAdminUser, // <-- Récupération du booléen du contexte d'authentification
    handleLogout,
    visibleTasks,
    projects,
    actions,
    users,
    loading,
    error,
    selectedTask,
    setSelectedTask,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleCreateSubtask,
    handleEditTask,
    handleDeleteTask,
    handleStatusChange,
    handleCreateTask,
  } = dataHandlers;

  return (
    <Route
      path="/admin"
      element={
        <RoleProtectedRoute
          isLoggedIn={!!currentUser}
          user={currentUser}
          // Utilise en priorité isAdminUser du context, avec replis sur la fonction et l'objet
          allowedCheck={(user) =>
            isAdminUser ||
            isAdmin(user) ||
            user?.role === "ADMIN" ||
            user?.role === "admin"
          }
        >
          <AdminLayout currentUser={currentUser} onLogout={handleLogout} />
        </RoleProtectedRoute>
      }
    >
      <Route
        path="dashboard"
        element={
          <AdminDashboardPage
            tasks={visibleTasks}
            projects={projects}
            actions={actions}
          />
        }
      />
      <Route path="users" element={<AdminUsersPage />} />
      <Route
        path="calendar"
        element={<CalendarPage tasks={visibleTasks} projects={projects} />}
      />
      <Route
        path="projects"
        element={
          <AdminProjectsPage
            projects={projects}
            tasks={visibleTasks}
            actions={actions}
            currentUser={currentUser}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onCreateSubtask={handleCreateSubtask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        }
      />
      <Route path="teams" element={<AdminTeamPage tasks={visibleTasks} />} />
      <Route
        path="team-evaluation"
        element={<TeamEvaluationPage tasks={visibleTasks} />}
      />
      <Route
        path="tasks"
        element={
          <BoardPage
            tasks={visibleTasks}
            users={users}
            projects={projects}
            currentUser={currentUser}
            loading={loading}
            error={error}
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
            actions={actions}
            onStatusChange={handleStatusChange}
            onCreateTask={handleCreateTask}
            onCreateSubtask={handleCreateSubtask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        }
      />
      <Route
        path="activity"
        element={
          <AdminActivityPage
            actions={actions}
            tasks={visibleTasks}
            projects={projects}
          />
        }
      />
      <Route
        path="reports"
        element={
          <AdminReportsPage
            projects={projects}
            tasks={visibleTasks}
            departments={dataHandlers.departments}
          />
        }
      />
      <Route
        path="settings"
        element={<UnderConstruction label="Paramètres" />}
      />
    </Route>
  );
}