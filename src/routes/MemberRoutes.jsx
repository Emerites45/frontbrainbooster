import { Route } from "react-router-dom";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import MemberLayout from "../pages/member/MemberLayout";
import MemberDashboardPage from "../pages/MemberDashboardPage";
import CalendarPage from "../pages/CalendarPage";
import AdminProjectsPage from "../pages/admin/AdminProjectsPage";
import BoardPage from "../pages/BoardPage";
import UnderConstruction from "../components/UnderConstruction";
import { isMember } from "../utils/permissions";

export default function getMemberRoutes(dataHandlers) {
  const {
    currentUser,
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
      path="/member"
      element={
        <RoleProtectedRoute
          isLoggedIn={!!currentUser}
          user={currentUser}
          allowedCheck={isMember}
        >
          <MemberLayout
            currentUser={currentUser}
            onLogout={handleLogout}
            tasks={visibleTasks}
            projects={projects}
            users={users}
          />
        </RoleProtectedRoute>
      }
    >
      <Route
        path="dashboard"
        element={
          <MemberDashboardPage
            currentUser={currentUser}
            tasks={visibleTasks}
            projects={projects}
          />
        }
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
      {/* Réutilisation de AdminProjectsPage tel quel (Membre n'a pas le bouton
          "Créer un projet" dans sa sidebar). Flag ouvert : si un accès URL
          direct doit être bloqué pour les actions créer/éditer/supprimer,
          il faudra une prop readOnly sur AdminProjectsPage. */}
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
      <Route
        path="calendar"
        element={<CalendarPage tasks={visibleTasks} projects={projects} />}
      />
      {/* ParametresPage pas encore construite — placeholder comme côté Admin */}
      <Route
        path="settings"
        element={<UnderConstruction label="Paramètres" />}
      />
    </Route>
  );
}