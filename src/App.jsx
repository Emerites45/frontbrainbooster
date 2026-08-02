import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { fetchTasks, fetchProjects, createProject } from "./api/api";
import BoardPage from "./pages/BoardPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import Navbar from "./components/Navbar";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

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

function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
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
    Promise.all([fetchTasks(), fetchProjects()])
      .then(([tasksData, projectsData]) => {
        setTasks(tasksData);
        setProjects(projectsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      setProjects((prev) => [...prev, newProject]);
    } catch (err) {
      alert("Erreur lors de la création du projet");
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
      myDeptRoles.some((dr) => dr.departmentId === deptId && dr.role === "SCRUM_MASTER");

    const isAssignedToMe = (t) => (t.assigneeIds || []).includes(currentUser.id);

    const isDirectlyVisible = (t) => {
      if (myDeptRoles.some((dr) => dr.role === "SCRUM_MASTER")) {
        const project = projects.find((p) => p.id === t.projectId);
        if (project && isScrumMasterOf(project.departmentId)) return true;
      }
      return isAssignedToMe(t);
    };

    const visibleIds = new Set(tasks.filter(isDirectlyVisible).map((t) => t.id));

    let changed = true;
    while (changed) {
      changed = false;
      tasks.forEach((t) => {
        if (visibleIds.has(t.id) && t.parentTaskId && !visibleIds.has(t.parentTaskId)) {
          visibleIds.add(t.parentTaskId);
          changed = true;
        }
        if (t.parentTaskId && visibleIds.has(t.parentTaskId) && !visibleIds.has(t.id)) {
          visibleIds.add(t.id);
          changed = true;
        }
      });
    }

    return tasks.filter((t) => visibleIds.has(t.id));
  }

  const visibleTasks = getVisibleTasks();
  const isAdmin = currentUser?.globalRoles?.includes("ADMIN");

  function handleStatusChange(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    const ancienStatut = task.status;
    const nouveauStatut = NEXT_STATUS[ancienStatut];

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: nouveauStatut } : t,
      ),
    );

    setActions((prevActions) => [
      ...prevActions,
      {
        id: generateActionId(),
        id_tache: taskId,
        id_user: currentUser?.email ?? "inconnu",
        nom_user: currentUser?.firstName ?? "Utilisateur",
        type_action: "CHANGEMENT_STATUT",
        champ_modifie: "statut",
        ancienne_valeur: ancienStatut,
        nouvelle_valeur: nouveauStatut,
        date_action: new Date().toISOString(),
      },
    ]);
  }

  function handleCreateTask(newTask) {
    const taskWithMeta = {
      ...newTask,
      creatorId: currentUser?.id ?? null,
      assigneeIds: newTask.assigneeIds ?? (currentUser?.id ? [currentUser.id] : []),
    };

    setTasks((prevTasks) => [...prevTasks, taskWithMeta]);

    setActions((prevActions) => [
      ...prevActions,
      {
        id: generateActionId(),
        id_tache: taskWithMeta.id,
        id_user: currentUser?.email ?? "inconnu",
        nom_user: currentUser?.firstName ?? "Utilisateur",
        type_action: "CREATION",
        champ_modifie: null,
        ancienne_valeur: null,
        nouvelle_valeur: null,
        date_action: new Date().toISOString(),
      },
    ]);
  }

  function handleCreateSubtask(parentTaskId, title, assigneeIds) {
    handleCreateTask({
      id: Date.now(),
      title,
      description: "",
      status: "A_FAIRE",
      parentTaskId,
      assigneeIds,
    });
  }

  function handleEditTask(taskId, updatedFields) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, ...updatedFields } : t)),
    );

    const changedActions = [];

    if (updatedFields.title !== undefined && updatedFields.title !== task.title) {
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

    setActions((prevActions) => [
      ...prevActions,
      ...changedActions.map((a) => ({
        id: generateActionId(),
        id_tache: taskId,
        id_user: currentUser?.email ?? "inconnu",
        nom_user: currentUser?.firstName ?? "Utilisateur",
        type_action: "MODIFICATION",
        ...a,
        date_action: new Date().toISOString(),
      })),
    ]);
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
          if (t.parentTaskId && idsToDelete.has(t.parentTaskId) && !idsToDelete.has(t.id)) {
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
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={!!currentUser}>
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <BoardPage
                  tasks={visibleTasks}
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
              </AppLayout>
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
        {/* Route unique /dashboard : Admin voit AdminDashboardPage, tout le monde
            d'autre voit encore l'ancien DashboardPage générique en attendant que
            les dashboards Scrum Master / Membre soient codés (prochaines étapes F4). */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={!!currentUser}>
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                {isAdmin ? (
                  <AdminDashboardPage tasks={visibleTasks} projects={projects} />
                ) : (
                  <DashboardPage tasks={visibleTasks} />
                )}
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/verify-email" element={<VerifyEmailPage onVerify={handleVerify} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;