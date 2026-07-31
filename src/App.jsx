import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TaskColumn from "./components/TaskColumn";
import TaskModal from "./components/TaskModal";
import LoginPage from "./pages/loginpage/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { fetchTasks, fetchProjects, createProject } from "./api/api";
import BoardPage from "./pages/boardpage/BoardPage";
import SignupPage from "./pages/signup/SignupPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProjectsPage from "./pages/projectpage/ProjectsPage"; // 1. Import de la nouvelle page
import Navbar from "./components/Navbar";
import VerifyEmailPage from "./pages/verifyEmail/VerifyEmailPage";
import ForgotPasswordPage from "./pages/mot_de_passe_oublie/ForgotPasswordPage";
import ResetPasswordPage from "./pages//resetpassword/ResetPasswordPage";

const NEXT_STATUS = {
  A_FAIRE: "EN_COURS",
  EN_COURS: "TERMINE",
  TERMINE: "A_FAIRE",
};

// Génère un id unique et robuste pour les entrées d'historique
// (évite toute collision, contrairement à Date.now() ou Date.now() + 1)
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
  const [projects, setProjects] = useState([]); // 2. State pour les projets
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

  // 3. Chargement initial des données (Tasks + Projects)
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

  // --- Handlers pour les Projets ---
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
    // Ici, vous pourriez naviguer vers / ou filtrer les tâches par projectId
  };

  // --- Logique des Tâches ---
  function getVisibleTasks() {
    if (!currentUser) return [];
    if (currentUser.role === "ADMIN") return tasks;

    const isDirectlyVisible = (t) => {
      if (currentUser.role === "SCRUM_MASTER") {
        return t.creatorId === currentUser.id || t.assigneeId === currentUser.id;
      }
      return t.assigneeId === currentUser.id; // MEMBER
    };

    const visibleIds = new Set(tasks.filter(isDirectlyVisible).map((t) => t.id));

    // On répète tant qu'un ajout a eu lieu, pour couvrir n'importe quelle profondeur
    let changed = true;
    while (changed) {
      changed = false;

      tasks.forEach((t) => {
        // Remonter : si l'enfant est visible, son parent doit l'être aussi
        if (visibleIds.has(t.id) && t.parentTaskId && !visibleIds.has(t.parentTaskId)) {
          visibleIds.add(t.parentTaskId);
          changed = true;
        }
        // Redescendre : si le parent est visible, l'enfant doit l'être aussi
        if (t.parentTaskId && visibleIds.has(t.parentTaskId) && !visibleIds.has(t.id)) {
          visibleIds.add(t.id);
          changed = true;
        }
      });
    }

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
        id: generateActionId(),
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
        id: generateActionId(),
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
    const task = tasks.find((t) => t.id === taskId); // récupère l'état AVANT modif
    if (!task) return; // garde défensive : id inconnu, on ne fait rien

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, ...updatedFields } : t)),
    );

    // On ne loggue que ce qui a RÉELLEMENT changé, champ par champ,
    // pour gérer aussi bien TaskModal (envoie title + description ensemble)
    // que SubtaskList (envoie seulement title).
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

    if (changedActions.length === 0) return; // rien n'a changé, pas de bruit dans l'historique

    setActions((prevActions) => [
      ...prevActions,
      ...changedActions.map((a) => ({
        id: generateActionId(),
        id_tache: taskId,
        id_user: currentUser?.email ?? "inconnu",
        nom_user: currentUser?.name ?? "Utilisateur",
        type_action: "MODIFICATION",
        ...a,
        date_action: new Date().toISOString(),
      })),
    ]);
  }

  function handleVerify(code) {
    console.log("Code entered:", code);
    // later: call backend to confirm, then navigate to /login or /
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
        {/* Route Tableau de Bord (Board) */}
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

        {/* 4. Nouvelle Route Projects */}
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

        <Route path="/verify-email" element={<VerifyEmailPage onVerify={handleVerify} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;