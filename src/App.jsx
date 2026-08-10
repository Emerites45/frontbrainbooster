import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  fetchTasks,
  fetchProjects,
  fetchUsers,
  fetchActions,
  createProject,
  updateProject,
  deleteProject,
  createAction,
} from "./api/api";
import { normalizeAssignments } from "./utils/dashboardHelpers";
import BoardPage from "./pages/BoardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ScrumMasterDashboardPage from "./pages/ScrumMasterDashboardPage";
import MemberDashboardPage from "./pages/MemberDashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import Navbar from "./components/Navbar";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import ScrumMasterLayout from "./pages/scrum-master/ScrumMasterLayout";
import ScrumMasterProjectsPage from "./pages/scrum-master/ScrumMasterProjectsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminActivityPage from "./pages/admin/AdminActivityPage";
import AdminTeamPage from "./pages/admin/AdminTeamPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import ScrumMasterTeamPage from "./pages/scrum-master/ScrumMasterTeamPage";
import CalendarPage from "./pages/CalendarPage";
import ScrumMasterCalendarPage from "./pages/scrum-master/ScrumMasterCalendarPage";
import { isAdmin, isScrumMaster } from "./utils/permissions";

const NEXT_STATUS = {
  A_FAIRE: "EN_COURS",
  EN_COURS: "TERMINE",
  TERMINE: "A_FAIRE",
};

// Génère un id unique et robuste pour les entrées d'historique
function generateActionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function AppLayout({ children, currentUser, onLogout }) {
  return (
    <>
      <Navbar currentUser={currentUser} onLogout={onLogout} />
      {children}
    </>
  );
}

function UnderConstruction({ label }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">🚧</div>
        <h1 className="text-2xl font-semibold text-gray-900">{label}</h1>
        <p className="mt-2 text-gray-500">
          Cette section est en cours de développement et sera disponible dans un
          prochain sprint.
        </p>
        <span className="mt-5 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
          TODO — Prochain sprint
        </span>
      </div>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  function handleLogin(data) {
    const merged = { ...data.user, token: data.token };
    localStorage.setItem("currentUser", JSON.stringify(merged));
    setCurrentUser(merged);
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTasks(), fetchProjects(), fetchUsers(), fetchActions()])
      .then(([tasksData, projectsData, usersData, actionsData]) => {
        setTasks(tasksData);
        setProjects(projectsData);
        setUsers(usersData);
        setActions(actionsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Persiste une entrée d'historique côté mock-server, en plus de la mise à
  // jour optimiste locale déjà faite par l'appelant. Échec silencieux (juste
  // loggé) : on ne bloque jamais l'UI pour un souci d'historique — l'action
  // métier elle-même (changement de statut, création...) a déjà réussi.
  async function persistAction(action) {
    try {
      await createAction(action);
    } catch (err) {
      console.error(
        "Impossible d'enregistrer l'action dans l'historique :",
        err,
      );
    }
  }

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      setProjects((prev) => [...prev, newProject]);
    } catch (err) {
      alert("Erreur lors de la création du projet");
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      const updated = await updateProject(projectId, updates);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updated } : p)),
      );
    } catch (err) {
      alert("Erreur lors de la modification du projet");
      throw err;
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      alert("Erreur lors de la suppression du projet");
    }
  };

  const handleSelectProject = (projectId) => {
    console.log("Projet sélectionné :", projectId);
  };

  function getVisibleTasks() {
    if (!currentUser) return [];

    const isAdmin = currentUser.globalRoles?.includes("ADMIN");
    if (isAdmin) return tasks;

    const myDeptRoles = currentUser.departmentRoles || [];
    const isScrumMasterOf = (deptId) =>
      myDeptRoles.some(
        (dr) => dr.departmentId === deptId && dr.role === "SCRUM_MASTER",
      );

    // Format TASK_ASSIGNMENT : task.assignments = [{ userId, assignedBy, assignedAt, unassignedAt? }]
    // ⚠️ Ce format colle à la table TASK_ASSIGNMENT du MCD validé par Franck, mais n'a
    // pas fait l'objet d'une confirmation écrite explicite de Joel/Verdream (contrairement
    // au format de /auth/login qui, lui, est bien acté dans contrat-api-auth.md).
    const isAssignedToMe = (t) =>
      (t.assignments || []).some(
        (a) => a.userId === currentUser.id && !a.unassignedAt,
      );

    const isDirectlyVisible = (t) => {
      if (myDeptRoles.some((dr) => dr.role === "SCRUM_MASTER")) {
        const project = projects.find((p) => p.id === t.projectId);
        if (project && isScrumMasterOf(project.departmentId)) return true;
      }
      return isAssignedToMe(t);
    };

    const visibleIds = new Set(
      tasks.filter(isDirectlyVisible).map((t) => t.id),
    );

    let changed = true;
    while (changed) {
      changed = false;
      tasks.forEach((t) => {
        if (
          visibleIds.has(t.id) &&
          t.parentTaskId &&
          !visibleIds.has(t.parentTaskId)
        ) {
          visibleIds.add(t.parentTaskId);
          changed = true;
        }
        if (
          t.parentTaskId &&
          visibleIds.has(t.parentTaskId) &&
          !visibleIds.has(t.id)
        ) {
          visibleIds.add(t.id);
          changed = true;
        }
      });
    }

    return tasks.filter((t) => visibleIds.has(t.id));
  }

  const visibleTasks = getVisibleTasks();
  const isAdminUser = currentUser?.globalRoles?.includes("ADMIN");
  const isScrumMasterUser = currentUser?.departmentRoles?.some(
    (dr) => dr.role === "SCRUM_MASTER",
  );

  function handleStatusChange(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    const ancienStatut = task.status;
    const nouveauStatut = NEXT_STATUS[ancienStatut];

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: nouveauStatut } : t,
      ),
    );

    const newAction = {
      id: generateActionId(),
      id_tache: taskId,
      id_user: currentUser?.email ?? "inconnu",
      nom_user: currentUser?.firstName ?? "Utilisateur",
      type_action: "CHANGEMENT_STATUT",
      champ_modifie: "statut",
      ancienne_valeur: ancienStatut,
      nouvelle_valeur: nouveauStatut,
      date_action: new Date().toISOString(),
    };

    setActions((prevActions) => [...prevActions, newAction]);
    persistAction(newAction);
  }

  function handleCreateTask(newTask) {
    // normalizeAssignments accepte aussi bien un tableau d'objets enrichis
    // qu'un simple tableau d'IDs (cas de NewTaskModal / SubtaskList) — on ne
    // suppose jamais que ce qui arrive ici respecte déjà le format attendu.
    const normalized = normalizeAssignments(newTask.assignments, currentUser);
    const assignments =
      normalized.length > 0
        ? normalized
        : currentUser?.id
          ? [
              {
                userId: currentUser.id,
                assignedBy: currentUser.id,
                assignedAt: new Date().toISOString(),
              },
            ]
          : [];

    const taskWithMeta = {
      ...newTask,
      creatorId: currentUser?.id ?? null,
      assignments,
    };

    setTasks((prevTasks) => [...prevTasks, taskWithMeta]);

    const newAction = {
      id: generateActionId(),
      id_tache: taskWithMeta.id,
      id_user: currentUser?.email ?? "inconnu",
      nom_user: currentUser?.firstName ?? "Utilisateur",
      type_action: "CREATION",
      champ_modifie: null,
      ancienne_valeur: null,
      nouvelle_valeur: null,
      date_action: new Date().toISOString(),
    };

    setActions((prevActions) => [...prevActions, newAction]);
    persistAction(newAction);
  }

  function handleCreateSubtask(parentTaskId, title, assignments) {
    handleCreateTask({
      id: Date.now(),
      title,
      description: "",
      status: "A_FAIRE",
      parentTaskId,
      assignments,
    });
  }

  function handleEditTask(taskId, updatedFields) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, ...updatedFields } : t)),
    );

    const changedActions = [];

    if (
      updatedFields.title !== undefined &&
      updatedFields.title !== task.title
    ) {
      changedActions.push({
        champ_modifie: "titre",
        ancienne_valeur: task.title,
        nouvelle_valeur: updatedFields.title,
      });
    }

    if (
      updatedFields.description !== undefined &&
      updatedFields.description !== task.description
    ) {
      changedActions.push({
        champ_modifie: "description",
        ancienne_valeur: task.description,
        nouvelle_valeur: updatedFields.description,
      });
    }

    if (changedActions.length === 0) return;

    const newActions = changedActions.map((a) => ({
      id: generateActionId(),
      id_tache: taskId,
      id_user: currentUser?.email ?? "inconnu",
      nom_user: currentUser?.firstName ?? "Utilisateur",
      type_action: "MODIFICATION",
      ...a,
      date_action: new Date().toISOString(),
    }));

    setActions((prevActions) => [...prevActions, ...newActions]);
    newActions.forEach(persistAction);
  }

  function handleVerify(code) {
    console.log("Code entered:", code);
  }

  function handleDeleteTask(taskId) {
    setTasks((prevTasks) => {
      const idsToDelete = new Set([taskId]);
      let changed = true;
      while (changed) {
        changed = false;
        prevTasks.forEach((t) => {
          if (
            t.parentTaskId &&
            idsToDelete.has(t.parentTaskId) &&
            !idsToDelete.has(t.id)
          ) {
            idsToDelete.add(t.id);
            changed = true;
          }
        });
      }
      return prevTasks.filter((t) => !idsToDelete.has(t.id));
    });
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={!!currentUser}>
              <Navigate
                to={
                  isAdminUser
                    ? "/admin/tasks"
                    : isScrumMasterUser
                      ? "/scrum-master/tasks"
                      : "/dashboard"
                }
                replace
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute isLoggedIn={!!currentUser}>
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <ProjectsPage
                  projects={projects}
                  onCreateProject={handleCreateProject}
                  onSelectProject={handleSelectProject}
                />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        {/* Route unique /dashboard : chaque rôle voit sa propre vue. */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={!!currentUser}>
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                {isAdminUser ? (
                  <AdminDashboardPage
                    tasks={visibleTasks}
                    projects={projects}
                    actions={actions}
                  />
                ) : isScrumMasterUser ? (
                  <ScrumMasterDashboardPage
                    tasks={visibleTasks}
                    projects={projects}
                    currentUser={currentUser}
                  />
                ) : (
                  <MemberDashboardPage
                    tasks={visibleTasks}
                    projects={projects}
                    currentUser={currentUser}
                  />
                )}
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/verify-email"
          element={<VerifyEmailPage onVerify={handleVerify} />}
        />

        {/* Groupe de routes /admin/* — protégé par rôle ADMIN uniquement.
            AdminLayout fournit Sidebar + Topbar communes à toutes les pages
            enfants via <Outlet />. */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute
              isLoggedIn={!!currentUser}
              user={currentUser}
              allowedCheck={isAdmin}
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
          <Route
            path="teams"
            element={<AdminTeamPage tasks={visibleTasks} />}
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
              <AdminReportsPage projects={projects} tasks={visibleTasks} />
            }
          />
          <Route
            path="settings"
            element={<UnderConstruction label="Paramètres" />}
          />
        </Route>

        {/* Groupe de routes /scrum-master/* — protégé par rôle SCRUM_MASTER uniquement.
            ScrumMasterLayout fournit Sidebar + Topbar communes à toutes les pages
            enfants via <Outlet />. */}
        <Route
          path="/scrum-master"
          element={
            <RoleProtectedRoute
              isLoggedIn={!!currentUser}
              user={currentUser}
              allowedCheck={isScrumMaster}
            >
              <ScrumMasterLayout
                currentUser={currentUser}
                onLogout={handleLogout}
              />
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
            element={<UnderConstruction label="Journal d'activité" />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
