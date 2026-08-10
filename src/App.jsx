import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/login/LoginPage";
import SignupPage from "./pages/signup/SignupPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/resetpassword/ForgotPasswordPage";
import ResetPasswordPage from "./pages/resetpassword/ResetPasswordPage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import ScrumMasterDashboardPage from "./pages/ScrumMasterDashboardPage";
import MemberDashboardPage from "./pages/MemberDashboardPage";

import BoardPage from "./pages/BoardPage";
import ProjectsPage from "./pages/ProjectsPage";

import MemberTasksPage from "./pages/MemberTasksPage";
import MemberProjectsPage from "./pages/MemberProjectsPage";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import MemberLayout from "./components/member/MemberLayout";

import {
  fetchTasks,
  fetchProjects,
  fetchUsers,
  fetchActions,
  createProject,
  createAction,
} from "./api/api";

import {
  normalizeAssignments,
} from "./utils/dashboardHelpers";

const NEXT_STATUS = {
  A_FAIRE: "EN_COURS",
  EN_COURS: "TERMINE",
  TERMINE: "A_FAIRE",
};

function generateActionId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function AppLayout({
  children,
  currentUser,
  onLogout,
}) {
  return (
    <>
      <Navbar
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {children}
    </>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [currentUser, setCurrentUser] =
    useState(() => {
      const saved =
        localStorage.getItem("currentUser");

      return saved
        ? JSON.parse(saved)
        : null;
    });

  /* =========================================================
     AUTH
  ========================================================= */

  function handleLogin(data) {
    const merged = {
      ...data.user,
      token: data.token,
    };

    localStorage.setItem(
      "currentUser",
      JSON.stringify(merged)
    );

    setCurrentUser(merged);
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  }

  /* =========================================================
     CHARGEMENT DES DONNÉES
  ========================================================= */

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetchTasks(),
      fetchProjects(),
      fetchUsers(),
      fetchActions(),
    ])
      .then(
        ([
          tasksData,
          projectsData,
          usersData,
          actionsData,
        ]) => {
          setTasks(tasksData);
          setProjects(projectsData);
          setUsers(usersData);
          setActions(actionsData);
        }
      )
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* =========================================================
     HISTORIQUE INTERNE
  ========================================================= */

  async function persistAction(action) {
    try {
      await createAction(action);
    } catch (err) {
      console.error(
        "Impossible d'enregistrer l'action :",
        err
      );
    }
  }

  /* =========================================================
     PROJETS
  ========================================================= */

  const handleCreateProject = async (
    projectData
  ) => {
    try {
      const newProject =
        await createProject(projectData);

      setProjects((prev) => [
        ...prev,
        newProject,
      ]);
    } catch (err) {
      alert(
        "Erreur lors de la création du projet"
      );
    }
  };

  const handleSelectProject = (
    projectId
  ) => {
    console.log(
      "Projet sélectionné :",
      projectId
    );
  };

  /* =========================================================
     VISIBILITÉ DES TÂCHES
  ========================================================= */

  function getVisibleTasks() {
    if (!currentUser) {
      return [];
    }

    const userIsAdmin =
      currentUser.globalRoles?.includes(
        "ADMIN"
      );

    if (userIsAdmin) {
      return tasks;
    }

    const myDeptRoles =
      currentUser.departmentRoles || [];

    const isScrumMasterOf = (
      deptId
    ) =>
      myDeptRoles.some(
        (departmentRole) =>
          departmentRole.departmentId ===
            deptId &&
          departmentRole.role ===
            "SCRUM_MASTER"
      );

    const isAssignedToMe = (
      task
    ) =>
      (task.assignments || []).some(
        (assignment) =>
          String(
            assignment.userId
          ) ===
            String(
              currentUser.id
            ) &&
          !assignment.unassignedAt
      );

    const isDirectlyVisible = (
      task
    ) => {
      const isScrumMaster =
        myDeptRoles.some(
          (departmentRole) =>
            departmentRole.role ===
            "SCRUM_MASTER"
        );

      if (isScrumMaster) {
        const project =
          projects.find(
            (project) =>
              String(project.id) ===
              String(task.projectId)
          );

        if (
          project &&
          isScrumMasterOf(
            project.departmentId
          )
        ) {
          return true;
        }
      }

      return isAssignedToMe(task);
    };

    const visibleIds = new Set(
      tasks
        .filter(isDirectlyVisible)
        .map((task) => task.id)
    );

    let changed = true;

    while (changed) {
      changed = false;

      tasks.forEach((task) => {
        if (
          visibleIds.has(task.id) &&
          task.parentTaskId &&
          !visibleIds.has(
            task.parentTaskId
          )
        ) {
          visibleIds.add(
            task.parentTaskId
          );

          changed = true;
        }

        if (
          task.parentTaskId &&
          visibleIds.has(
            task.parentTaskId
          ) &&
          !visibleIds.has(task.id)
        ) {
          visibleIds.add(task.id);

          changed = true;
        }
      });
    }

    return tasks.filter((task) =>
      visibleIds.has(task.id)
    );
  }

  const visibleTasks =
    getVisibleTasks();

  const isAdmin =
    currentUser?.globalRoles?.includes(
      "ADMIN"
    );

  const isScrumMaster =
    currentUser?.departmentRoles?.some(
      (departmentRole) =>
        departmentRole.role ===
        "SCRUM_MASTER"
    );

  /* =========================================================
     CHANGEMENT DE STATUT
  ========================================================= */

  function handleStatusChange(taskId) {
    const task = tasks.find(
      (task) =>
        String(task.id) ===
        String(taskId)
    );

    if (!task) {
      console.error(
        "Tâche introuvable :",
        taskId
      );

      return;
    }

    const ancienStatut =
      task.status;

    const nouveauStatut =
      NEXT_STATUS[ancienStatut];

    if (!nouveauStatut) {
      console.error(
        "Statut inconnu :",
        ancienStatut
      );

      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((currentTask) =>
        String(currentTask.id) ===
        String(taskId)
          ? {
              ...currentTask,
              status:
                nouveauStatut,
            }
          : currentTask
      )
    );

    const newAction = {
      id: generateActionId(),

      id_tache: taskId,

      id_user:
        currentUser?.email ??
        "inconnu",

      nom_user:
        currentUser?.firstName ??
        "Utilisateur",

      type_action:
        "CHANGEMENT_STATUT",

      champ_modifie:
        "statut",

      ancienne_valeur:
        ancienStatut,

      nouvelle_valeur:
        nouveauStatut,

      date_action:
        new Date().toISOString(),
    };

    setActions((prevActions) => [
      ...prevActions,
      newAction,
    ]);

    persistAction(newAction);
  }

  /* =========================================================
     CRÉATION D'UNE TÂCHE
  ========================================================= */

  function handleCreateTask(
    newTask
  ) {
    const normalized =
      normalizeAssignments(
        newTask.assignments,
        currentUser
      );

    const assignments =
      normalized.length > 0
        ? normalized
        : currentUser?.id
        ? [
            {
              userId:
                currentUser.id,

              assignedBy:
                currentUser.id,

              assignedAt:
                new Date().toISOString(),
            },
          ]
        : [];

    const taskWithMeta = {
      ...newTask,

      creatorId:
        currentUser?.id ??
        null,

      assignments,
    };

    setTasks((prevTasks) => [
      ...prevTasks,
      taskWithMeta,
    ]);

    const newAction = {
      id: generateActionId(),

      id_tache:
        taskWithMeta.id,

      id_user:
        currentUser?.email ??
        "inconnu",

      nom_user:
        currentUser?.firstName ??
        "Utilisateur",

      type_action:
        "CREATION",

      champ_modifie:
        null,

      ancienne_valeur:
        null,

      nouvelle_valeur:
        null,

      date_action:
        new Date().toISOString(),
    };

    setActions((prevActions) => [
      ...prevActions,
      newAction,
    ]);

    persistAction(newAction);
  }

  /* =========================================================
     CRÉATION D'UNE SOUS-TÂCHE
  ========================================================= */

  function handleCreateSubtask(
    parentTaskId,
    title,
    assignments
  ) {
    const parentTask =
      tasks.find(
        (task) =>
          String(task.id) ===
          String(parentTaskId)
      );

    if (!parentTask) {
      console.error(
        "Impossible de créer la sous-tâche : tâche parente introuvable."
      );

      return;
    }

    const cleanTitle =
      title?.trim();

    if (!cleanTitle) {
      console.error(
        "Impossible de créer la sous-tâche : le titre est obligatoire."
      );

      return;
    }

    handleCreateTask({
      id: Date.now(),

      title: cleanTitle,

      description: "",

      status: "A_FAIRE",

      parentTaskId:
        parentTask.id,

      projectId:
        parentTask.projectId,

      assignments,
    });
  }

  /* =========================================================
     MODIFICATION D'UNE TÂCHE
  ========================================================= */

  function handleEditTask(
    taskId,
    updatedFields
  ) {
    const task = tasks.find(
      (task) =>
        String(task.id) ===
        String(taskId)
    );

    if (!task) {
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map(
        (currentTask) =>
          String(
            currentTask.id
          ) ===
          String(taskId)
            ? {
                ...currentTask,
                ...updatedFields,
              }
            : currentTask
      )
    );

    const changedActions = [];

    if (
      updatedFields.title !==
        undefined &&
      updatedFields.title !==
        task.title
    ) {
      changedActions.push({
        champ_modifie:
          "titre",

        ancienne_valeur:
          task.title,

        nouvelle_valeur:
          updatedFields.title,
      });
    }

    if (
      updatedFields.description !==
        undefined &&
      updatedFields.description !==
        task.description
    ) {
      changedActions.push({
        champ_modifie:
          "description",

        ancienne_valeur:
          task.description,

        nouvelle_valeur:
          updatedFields.description,
      });
    }

    if (
      changedActions.length ===
      0
    ) {
      return;
    }

    const newActions =
      changedActions.map(
        (action) => ({
          id: generateActionId(),

          id_tache:
            taskId,

          id_user:
            currentUser?.email ??
            "inconnu",

          nom_user:
            currentUser?.firstName ??
            "Utilisateur",

          type_action:
            "MODIFICATION",

          ...action,

          date_action:
            new Date().toISOString(),
        })
      );

    setActions(
      (prevActions) => [
        ...prevActions,
        ...newActions,
      ]
    );

    newActions.forEach(
      persistAction
    );
  }

  /* =========================================================
     SUPPRESSION
  ========================================================= */

  function handleDeleteTask(
    taskId
  ) {
    setTasks((prevTasks) => {
      const idsToDelete =
        new Set([taskId]);

      let changed = true;

      while (changed) {
        changed = false;

        prevTasks.forEach(
          (task) => {
            if (
              task.parentTaskId &&
              idsToDelete.has(
                task.parentTaskId
              ) &&
              !idsToDelete.has(
                task.id
              )
            ) {
              idsToDelete.add(
                task.id
              );

              changed = true;
            }
          }
        );
      }

      return prevTasks.filter(
        (task) =>
          !idsToDelete.has(
            task.id
          )
      );
    });
  }

  /* =========================================================
     EMAIL
  ========================================================= */

  function handleVerify(code) {
    console.log(
      "Code entered:",
      code
    );
  }

  /* =========================================================
     ÉCRANS CHARGEMENT / ERREUR
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        Chargement...
      </div>
    );
  }

  if (error) {
    console.error(error);
  }

  /* =========================================================
     ROUTES
  ========================================================= */

  return (
    <BrowserRouter>
      <Routes>

        {/* ROUTES PUBLIQUES */}

        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={handleLogin}
            />
          }
        />

        <Route
          path="/signup"
          element={<SignupPage />}
        />

        <Route
          path="/reset-password"
          element={
            <ResetPasswordPage />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage />
          }
        />

        <Route
          path="/verify-email"
          element={
            <VerifyEmailPage
              onVerify={
                handleVerify
              }
            />
          }
        />

        {/* ROUTE RACINE */}

        <Route
          path="/"
          element={
            <ProtectedRoute
              isLoggedIn={
                !!currentUser
              }
            >
              {!isAdmin &&
              !isScrumMaster ? (
                <Navigate
                  to="/dashboard"
                  replace
                />
              ) : (
                <AppLayout
                  currentUser={
                    currentUser
                  }
                  onLogout={
                    handleLogout
                  }
                >
                  <BoardPage
                    tasks={
                      visibleTasks
                    }
                    users={users}
                    projects={
                      projects
                    }
                    currentUser={
                      currentUser
                    }
                    onStatusChange={
                      handleStatusChange
                    }
                    onTaskClick={
                      setSelectedTask
                    }
                    onCreateTask={
                      handleCreateTask
                    }
                  />
                </AppLayout>
              )}
            </ProtectedRoute>
          }
        />

        {/* PROJETS ADMIN / SCRUM */}

        <Route
          path="/projects"
          element={
            <ProtectedRoute
              isLoggedIn={
                !!currentUser
              }
            >
              <AppLayout
                currentUser={
                  currentUser
                }
                onLogout={
                  handleLogout
                }
              >
                <ProjectsPage
                  projects={
                    projects
                  }
                  onCreateProject={
                    handleCreateProject
                  }
                  onSelectProject={
                    handleSelectProject
                  }
                />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              isLoggedIn={
                !!currentUser
              }
            >
              {isAdmin ? (
                <AppLayout
                  currentUser={
                    currentUser
                  }
                  onLogout={
                    handleLogout
                  }
                >
                  <AdminDashboardPage
                    tasks={
                      visibleTasks
                    }
                    projects={
                      projects
                    }
                    actions={
                      actions
                    }
                  />
                </AppLayout>
              ) : isScrumMaster ? (
                <AppLayout
                  currentUser={
                    currentUser
                  }
                  onLogout={
                    handleLogout
                  }
                >
                  <ScrumMasterDashboardPage
                    tasks={
                      visibleTasks
                    }
                    projects={
                      projects
                    }
                    currentUser={
                      currentUser
                    }
                  />
                </AppLayout>
              ) : (
                <MemberLayout
                  currentUser={
                    currentUser
                  }
                  onLogout={
                    handleLogout
                  }
                >
                  <MemberDashboardPage
                    tasks={
                      visibleTasks
                    }
                    projects={
                      projects
                    }
                    currentUser={
                      currentUser
                    }
                  />
                </MemberLayout>
              )}
            </ProtectedRoute>
          }
        />

        {/* MES TÂCHES - MEMBER */}

        <Route
          path="/member/tasks"
          element={
            <ProtectedRoute
              isLoggedIn={
                !!currentUser
              }
            >
              <MemberLayout
                currentUser={
                  currentUser
                }
                onLogout={
                  handleLogout
                }
              >
                <MemberTasksPage
                  tasks={
                    visibleTasks
                  }
                  users={users}
                  projects={
                    projects
                  }
                  currentUser={
                    currentUser
                  }
                  onStatusChange={
                    handleStatusChange
                  }
                  onCreateSubtask={
                    handleCreateSubtask
                  }
                />
              </MemberLayout>
            </ProtectedRoute>
          }
        />

        {/* PROJETS - MEMBER */}

        <Route
          path="/member/projects"
          element={
            <ProtectedRoute
              isLoggedIn={
                !!currentUser
              }
            >
              <MemberLayout
                currentUser={
                  currentUser
                }
                onLogout={
                  handleLogout
                }
              >
                <MemberProjectsPage
                  currentUser={
                    currentUser
                  }
                  projects={
                    projects
                  }
                  tasks={
                    visibleTasks
                  }
                />
              </MemberLayout>
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;