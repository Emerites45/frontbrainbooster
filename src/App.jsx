import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TaskColumn from "./components/TaskColumn";
import TaskModal from "./components/TaskModal";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { fetchTasks } from "./api/api";
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

  function handleStatusChange(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    const ancienStatut = task.status;
    const nouveauStatut = NEXT_STATUS[ancienStatut];

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: nouveauStatut } : t)),
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
  setTasks((prevTasks) => [...prevTasks, newTask]);

  setActions((prevActions) => [
    ...prevActions,
    {
      id: Date.now() + 1,
      id_tache: newTask.id,
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
                  tasks={tasks}
                  loading={loading}
                  error={error}
                  selectedTask={selectedTask}
                  setSelectedTask={setSelectedTask}
                  actions={actions}
                  onStatusChange={handleStatusChange}
                  onCreateTask={handleCreateTask}
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
                <DashboardPage tasks={tasks} />
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