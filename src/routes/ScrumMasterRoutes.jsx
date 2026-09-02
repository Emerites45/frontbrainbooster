import { Route } from "react-router-dom";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import ScrumMasterLayout from "../pages/scrum-master/ScrumMasterLayout";
import ScrumMasterDashboardPage from "../pages/ScrumMasterDashboardPage";
import ScrumMasterCalendarPage from "../pages/scrum-master/ScrumMasterCalendarPage";
import ScrumMasterProjectsPage from "../pages/scrum-master/ScrumMasterProjectsPage";
import BoardPage from "../pages/BoardPage";
import ScrumMasterTeamPage from "../pages/scrum-master/ScrumMasterTeamPage";
import ScrumMasterActivityPage from "../pages/scrum-master/ScrumMasterActivityPage";
import { isScrumMaster } from "../utils/permissions";

export default function getScrumMasterRoutes(dataHandlers) {
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
      path="/scrum-master"
      element={
        <RoleProtectedRoute
          isLoggedIn={!!currentUser}
          user={currentUser}
          allowedCheck={isScrumMaster}
        >
          <ScrumMasterLayout currentUser={currentUser} onLogout={handleLogout} />
        </RoleProtectedRoute>
      }
    >
      <Route
        path="dashboard"
        element={
          <ScrumMasterDashboardPage
            tasks={visibleTasks}
            projects={projects}
            currentUser={currentUser}
          />
        }
      />
      <Route
        path="calendar"
        element={
          <ScrumMasterCalendarPage
            currentUser={currentUser}
            projects={projects}
            tasks={visibleTasks}
          />
        }
      />
      <Route
        path="projects"
        element={
          <ScrumMasterProjectsPage
            currentUser={currentUser}
            projects={projects}
            tasks={visibleTasks}
            actions={actions}
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
        path="team"
        element={
          <ScrumMasterTeamPage
            currentUser={currentUser}
            tasks={visibleTasks}
          />
        }
      />
      <Route
        path="activity"
        element={
          <ScrumMasterActivityPage
            currentUser={currentUser}
            actions={actions}
            tasks={visibleTasks}
            projects={projects}
          />
        }
      />
    </Route>
  );
}