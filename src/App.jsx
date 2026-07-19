import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TaskColumn from "./components/TaskColumn";
import TaskModal from "./components/TaskModal";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { fetchTasks, fetchProjects, createProject } from "./api/api"; 
import BoardPage from "./pages/BoardPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import Navbar from "./components/Navbar";

const NEXT_STATUS = {
  A_FAIRE: "EN_COURS",
  EN_COURS: "TERMINE",
  TERMINE: "A_FAIRE",
};

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
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  function handleLogin(data) {
    localStorage.setItem("currentUser", JSON.stringify(data));
    setCurrentUser(data);
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  }

  useEffect(() => {
    fetchTasks()
      .then((data) => setTasks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function getVisibleTasks() {
    if (!currentUser) return [];
    if (currentUser.role === "ADMIN") return tasks;

    const isDirectlyVisible = (t) => {
      if (currentUser.role === "SCRUM_MASTER") {
        return t.creatorId === currentUser.id || t.assigneeId === currentUser.id;
      }
      return t.assigneeId === currentUser.id; // MEMBER
    };

    const visibleIds = new Set(
      tasks.filter(isDirectlyVisible).map((t) => t.id),
    );

    tasks.forEach((t) => {
      if (visibleIds.has(t.id) && t.parentTaskId) {
        visibleIds.add(t.parentTaskId);
      }
    });

    tasks.forEach((t) => {
      if (t.parentTaskId && visibleIds.has(t.parentTaskId)) {
        visibleIds.add(t.id);
      }
    });

    return tasks.filter((t) => visibleIds.has(t.id));
  }
  const visibleTasks = getVisibleTasks();

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
        id: Date.now(),
        id_tache: taskId,
        id_user: currentUser?.email ?? "inconnu",
        nom_user: currentUser?.name ?? "Utilisateur",
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
      assigneeId: newTask.assigneeId ?? currentUser?.id ?? null,
    };

    setTasks((prevTasks) => [...prevTasks, taskWithMeta]);

    setActions((prevActions) => [
      ...prevActions,
      {
        id: Date.now() + 1,
        id_tache: taskWithMeta.id,
        id_user: currentUser?.email ?? "inconnu",
        nom_user: currentUser?.name ?? "Utilisateur",
        type_action: "CREATION",
        champ_modifie: null,
        ancienne_valeur: null,
        nouvelle_valeur: null,
        date_action: new Date().toISOString(),
      },
    ]);
  }

  function handleCreateSubtask(parentTaskId, title, assigneeId) {
    handleCreateTask({
      id: Date.now(),
      title,
      description: "",
      status: "A_FAIRE",
      parentTaskId,
      assigneeId,
    });
  }

  function handleEditTask(taskId, updatedFields) {
    const task = tasks.find((t) => t.id === taskId);

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, ...updatedFields } : t)),
    );

    setActions((prevActions) => [
      ...prevActions,
      {
        id: Date.now(),
        id_tache: taskId,
        id_user: currentUser?.email ?? "inconnu",
        nom_user: currentUser?.name ?? "Utilisateur",
        type_action: "MODIFICATION",
        champ_modifie: "titre/description",
        ancienne_valeur: task.title,
        nouvelle_valeur: updatedFields.title,
        date_action: new Date().toISOString(),
      },
    ]);
  }

  function handleDeleteTask(taskId) {
    setTasks((prevTasks) =>
      prevTasks.filter((t) => t.id !== taskId && t.parentTaskId !== taskId),
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignupPage />} />

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
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={!!currentUser}>
              <AppLayout currentUser={currentUser} onLogout={handleLogout}>
                <DashboardPage tasks={visibleTasks} />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
