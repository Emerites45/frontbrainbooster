import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import TaskColumn from "./components/TaskColumn";
import TaskModal from "./components/TaskModal";
import StatusConfirmModal from "./components/StatusConfirmModal";
import TeamEvaluationPage from "./pages/admin/TeamEvaluationPage";
import LoginPage from "./pages/login/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

import {
  fetchTasks,
  fetchProjects,
  fetchUsers,
  fetchActions,
  fetchDepartments,
  createProject,
  updateProject,
  deleteProject,
  createAction,
  updateUser,
} from "./api/api";

import { normalizeAssignments } from "./utils/dashboardHelpers";
import {
  notifyUsers,
  taskBoardPathForUser,
} from "./utils/notify";

// --- Toasts (Phase A) ---
import ToastContainer from "./components/ui/ToastContainer";
import { showToast } from "./utils/toast";

import BoardPage from "./pages/BoardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ScrumMasterDashboardPage from "./pages/ScrumMasterDashboardPage";
import MemberDashboardPage from "./pages/MemberDashboardPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import BacklogPage from "./pages/admin/BacklogPage";
import Navbar from "./components/Navbar";
import ParametresPage from "./pages/ParametresPage";
import NotificationsPage from "./pages/NotificationsPage";
import InternReportPage from "./pages/admin/InternReportPage";

import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/resetpassword/ForgotPasswordPage";
import ResetPasswordPage from "./pages/resetpassword/ResetPasswordPage";

import RoleProtectedRoute from "./components/RoleProtectedRoute";

import AdminLayout from "./pages/admin/AdminLayout";

import ScrumMasterLayout from "./pages/scrum-master/ScrumMasterLayout";

import ScrumMasterProjectsPage from "./pages/scrum-master/ScrumMasterProjectsPage";
import ScrumMasterActivityPage from "./pages/scrum-master/ScrumMasterActivityPage";

import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminActivityPage from "./pages/admin/AdminActivityPage";
import AdminTeamPage from "./pages/admin/AdminTeamPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";

import ScrumMasterTeamPage from "./pages/scrum-master/ScrumMasterTeamPage";
import ScrumMasterTeamEvaluationPage from "./pages/scrum-master/ScrumMasterTeamEvaluationPage";

import CalendarPage from "./pages/CalendarPage";
import ScrumMasterCalendarPage from "./pages/scrum-master/ScrumMasterCalendarPage";

import MyTimesheetPage from "./pages/MyTimesheetPage";

// User Performance Analytics
import UserPerformancePage from "./pages/analytics/UserPerformancePage";
import ArchivesPage from "./pages/admin/ArchivesPage";
// RBAC helpers
import {
  isAdmin,
  isScrumMaster,
  isAdminOrScrumMaster,
} from "./utils/permissions";


// Génère un id unique et robuste pour les entrées d'historique
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


function UnderConstruction({ label }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">
          🚧
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">
          {label}
        </h1>

        <p className="mt-2 text-gray-500">
          Cette section est en cours de développement et sera disponible
          dans un prochain sprint.
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
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [statusChangeTask, setStatusChangeTask] = useState(null);


  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");

    return saved
      ? JSON.parse(saved)
      : null;
  });


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


  const handleUpdateProfile = async (updates) => {
    try {
      const updated = await updateUser(
        currentUser.id,
        updates
      );

      const merged = {
        ...currentUser,
        ...updated,
      };

      localStorage.setItem(
        "currentUser",
        JSON.stringify(merged)
      );

      setCurrentUser(merged);

      // Keep the team/user list synchronized too.
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === currentUser.id
            ? {
                ...user,
                ...updated,
              }
            : user
        )
      );

      showToast({ type: "success", message: "Profil mis à jour" });
    } catch (err) {
      showToast({
        type: "error",
        message: "Erreur lors de la mise à jour du profil",
      });

      throw err;
    }
  };


  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetchTasks(),
      fetchProjects(),
      fetchUsers(),
      fetchActions(),
      fetchDepartments(),
    ])
      .then(
        ([
          tasksData,
          projectsData,
          usersData,
          actionsData,
          departmentsData,
        ]) => {
          setTasks(tasksData);
          setProjects(projectsData);
          setUsers(usersData);
          setActions(actionsData);
          setDepartments(departmentsData);
        }
      )
      .catch((err) => {
        setError(err.message);
        showToast({
          type: "error",
          message: "Erreur lors du chargement des données",
        });
      })
      .finally(() =>
        setLoading(false)
      );
  }, []);


  // Persiste une entrée d'historique côté mock-server,
  // en plus de la mise à jour optimiste locale déjà faite par l'appelant.
  // Échec silencieux : on ne bloque jamais l'UI pour un souci d'historique.
  async function persistAction(action) {
    try {
      await createAction(action);
    } catch (err) {
      console.error(
        "Impossible d'enregistrer l'action dans l'historique :",
        err
      );
    }
  }


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

      showToast({ type: "success", message: "Projet créé" });
    } catch (err) {
      showToast({
        type: "error",
        message: "Erreur lors de la création du projet",
      });
    }
  };


  const handleUpdateProject = async (
    projectId,
    updates
  ) => {
    try {
      const updated =
        await updateProject(
          projectId,
          updates
        );

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                ...updated,
              }
            : p
        )
      );

      showToast({ type: "success", message: "Projet mis à jour" });
    } catch (err) {
      showToast({
        type: "error",
        message: "Erreur lors de la modification du projet",
      });

      throw err;
    }
  };


  const handleDeleteProject = async (
    projectId
  ) => {
    try {
      await deleteProject(projectId);

      setProjects((prev) =>
        prev.filter(
          (p) => p.id !== projectId
        )
      );

      showToast({ type: "success", message: "Projet supprimé" });
    } catch (err) {
      showToast({
        type: "error",
        message: "Erreur lors de la suppression du projet",
      });
    }
  };
const handleRestoreTask = (id, status) =>
  handleEditTask(id, { archived: false, status });

const handleRestoreProject = (id, status) =>
  handleUpdateProject(id, { archived: false, status });

  const handleSelectProject = (
    projectId
  ) => {
    console.log(
      "Projet sélectionné :",
      projectId
    );
  };


  function getVisibleTasks() {
    if (!currentUser) return [];

    const isAdminUser =
      currentUser.globalRoles?.includes(
        "ADMIN"
      );

    if (isAdminUser) return tasks;

    const myDeptRoles =
      currentUser.departmentRoles || [];

    const isScrumMasterOf = (deptId) =>
      myDeptRoles.some(
        (dr) =>
          dr.departmentId === deptId &&
          dr.role === "SCRUM_MASTER"
      );


    const isAssignedToMe = (t) =>
      (t.assignments || []).some(
        (a) =>
          a.userId === currentUser.id &&
          !a.unassignedAt
      );


    const isDirectlyVisible = (t) => {
      if (
        myDeptRoles.some(
          (dr) =>
            dr.role === "SCRUM_MASTER"
        )
      ) {
        const project = projects.find(
          (p) => p.id === t.projectId
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

      return isAssignedToMe(t);
    };


    const visibleIds = new Set(
      tasks
        .filter(isDirectlyVisible)
        .map((t) => t.id)
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
          visibleIds.add(
            t.parentTaskId
          );

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


    return tasks.filter((t) =>
      visibleIds.has(t.id)
    );
  }


  const visibleTasks =
    getVisibleTasks();


  const isAdminUser =
    currentUser?.globalRoles?.includes(
      "ADMIN"
    );


  const isScrumMasterUser =
    currentUser?.departmentRoles?.some(
      (dr) =>
        dr.role === "SCRUM_MASTER"
    );


  // Ouvre le modal de confirmation au lieu de changer le statut immédiatement
  function handleStatusChange(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setStatusChangeTask(task);
  }

  // Nombre de sous-tâches directes d'une tâche qui ne sont pas encore terminées.
  // Réutilisé pour bloquer à la fois le passage à « Terminé » et l'archivage.
  function getUnfinishedSubtasksCount(taskId) {
    return tasks.filter(
      (t) => t.parentTaskId === taskId && t.status !== "TERMINE"
    ).length;
  }

  // Appelée quand l'utilisateur confirme son choix dans le modal
  function handleConfirmStatusChange(action) {
    if (!statusChangeTask) return;
    const taskId = statusChangeTask.id;

    if (action === "ARCHIVE") {
      const unfinished = getUnfinishedSubtasksCount(taskId);

      if (unfinished > 0) {
        showToast({
          type: "error",
          message: `Impossible d'archiver : ${unfinished} sous-tâche(s) pas encore terminée(s).`,
        });
        return;
      }

      handleEditTask(taskId, { archived: true });
    } else {
      applyStatusChange(taskId, action);
    }

    setStatusChangeTask(null);
  }

  // La logique de changement de statut d'origine, inchangée à part le paramètre
  // nouveauStatut qui est maintenant explicite (choisi par l'utilisateur)
  // au lieu d'être calculé automatiquement via NEXT_STATUS.
  function applyStatusChange(taskId, nouveauStatut) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const ancienStatut = task.status;

    // Garde-fou : impossible de passer une tâche à TERMINE
    // si l'une de ses sous-tâches directes n'est pas elle-même terminée.
    if (nouveauStatut === "TERMINE") {
      const unfinished = getUnfinishedSubtasksCount(taskId);

      if (unfinished > 0) {
        showToast({
          type: "error",
          message: `Impossible de terminer cette tâche : ${unfinished} sous-tâche(s) encore en cours.`,
        });
        return;
      }
    }

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: nouveauStatut } : t
      )
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

    const assignedUserIds = (task.assignments || [])
      .filter((a) => !a.unassignedAt)
      .map((a) => a.userId);

    const assignedUsers = users.filter((u) => assignedUserIds.includes(u.id));

    notifyUsers(
      assignedUserIds,
      {
        type: "STATUS_CHANGE",
        title: "Statut de tâche modifié",
        message: `« ${task.title} » est passée à ${nouveauStatut
          .replace("_", " ")
          .toLowerCase()}`,
        link: assignedUsers[0] ? taskBoardPathForUser(assignedUsers[0]) : "/",
      },
      currentUser?.id
    );
  }


  function handleCreateTask(newTask) {
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
        currentUser?.id ?? null,
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
      type_action: "CREATION",
      champ_modifie: null,
      ancienne_valeur: null,
      nouvelle_valeur: null,
      date_action:
        new Date().toISOString(),
    };


    setActions((prevActions) => [
      ...prevActions,
      newAction,
    ]);

    persistAction(newAction);


    const assignedUserIds =
      assignments.map(
        (a) => a.userId
      );

    const assignedUsers =
      users.filter((u) =>
        assignedUserIds.includes(
          u.id
        )
      );


    assignedUsers.forEach((u) => {
      notifyUsers(
        [u.id],
        {
          type: "TASK_ASSIGNED",
          title:
            "Nouvelle tâche assignée",
          message: `${currentUser?.firstName ?? "Quelqu'un"} vous a assigné « ${taskWithMeta.title} »`,
          link:
            taskBoardPathForUser(u),
        },
        currentUser?.id
      );
    });

    showToast({ type: "success", message: "Tâche créée" });
  }


  function handleCreateSubtask(
    parentTaskId,
    title,
    assignments
  ) {
    handleCreateTask({
      id: Date.now(),
      title,
      description: "",
      status: "A_FAIRE",
      parentTaskId,
      assignments,
    });
  }


  function handleEditTask(
    taskId,
    updatedFields
  ) {
    const task = tasks.find(
      (t) => t.id === taskId
    );

    if (!task) return;


    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              ...updatedFields,
            }
          : t
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
        champ_modifie: "titre",
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
      changedActions.length === 0
    ) {
      return;
    }


    const newActions =
      changedActions.map((a) => ({
        id: generateActionId(),
        id_tache: taskId,
        id_user:
          currentUser?.email ??
          "inconnu",
        nom_user:
          currentUser?.firstName ??
          "Utilisateur",
        type_action:
          "MODIFICATION",
        ...a,
        date_action:
          new Date().toISOString(),
      }));


    setActions((prevActions) => [
      ...prevActions,
      ...newActions,
    ]);

    newActions.forEach(
      persistAction
    );

    showToast({ type: "success", message: "Tâche mise à jour" });
  }


  function handleVerify(code) {
    console.log(
      "Code entered:",
      code
    );
  }


  function handleDeleteTask(taskId) {
    setTasks((prevTasks) => {
      const idsToDelete =
        new Set([taskId]);

      let changed = true;

      while (changed) {
        changed = false;

        prevTasks.forEach((t) => {
          if (
            t.parentTaskId &&
            idsToDelete.has(
              t.parentTaskId
            ) &&
            !idsToDelete.has(t.id)
          ) {
            idsToDelete.add(t.id);
            changed = true;
          }
        });
      }

      return prevTasks.filter(
        (t) =>
          !idsToDelete.has(t.id)
      );
    });

    showToast({ type: "success", message: "Tâche supprimée" });
  }


  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            AUTHENTICATION
        ========================== */}

        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={handleLogin}
            />
          }
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
              onVerify={handleVerify}
            />
          }
        />


        {/* =========================
            ROOT REDIRECT
        ========================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute
              isLoggedIn={
                !!currentUser
              }
            >
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


        {/* =========================
            GENERAL PROJECTS
        ========================== */}

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
                  projects={projects}
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


        {/* =========================
            GENERAL DASHBOARD
        ========================== */}

        <Route
          path="/dashboard"
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
                {isAdminUser ? (
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
                    currentUser={
                      currentUser
                    }
                  />
                ) : isScrumMasterUser ? (
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
                ) : (
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
                )}
              </AppLayout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            ADMIN ROUTES
        ========================== */}

        <Route
          path="/admin"
          element={
            <RoleProtectedRoute
              isLoggedIn={
                !!currentUser
              }
              user={currentUser}
              allowedCheck={isAdmin}
            >
              <AdminLayout
                currentUser={
                  currentUser
                }
                onLogout={
                  handleLogout
                }
                tasks={
                  visibleTasks
                }
                projects={
                  projects
                }
                users={users}
              />
            </RoleProtectedRoute>
          }
        >

          <Route
            path="dashboard"
            element={
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
                currentUser={
                  currentUser
                }
              />
            }
          />

          <Route
            path="users"
            element={
              <AdminUsersPage />
            }
          />

          <Route
            path="calendar"
            element={
              <CalendarPage
                tasks={
                  visibleTasks
                }
                projects={
                  projects
                }
              />
            }
          />

          <Route
            path="projects"
            element={
              <AdminProjectsPage
                projects={
                  projects
                }
                tasks={
                  visibleTasks
                }
                actions={
                  actions
                }
                currentUser={
                  currentUser
                }
                onCreateProject={
                  handleCreateProject
                }
                onUpdateProject={
                  handleUpdateProject
                }
                onDeleteProject={
                  handleDeleteProject
                }
                onCreateSubtask={
                  handleCreateSubtask
                }
                onEditTask={
                  handleEditTask
                }
                onDeleteTask={
                  handleDeleteTask
                }
                onStatusChange={
                  handleStatusChange
                }
              />
            }
          />

          <Route
            path="backlog"
            element={
              <BacklogPage
                projects={
                  projects
                }
                tasks={
                  visibleTasks
                }
                onEditTask={
                  handleEditTask
                }
              />
            }
          />

          <Route
            path="teams"
            element={
              <AdminTeamPage
                tasks={
                  visibleTasks
                }
              />
            }
          />

          <Route
            path="team-evaluation"
            element={
              <TeamEvaluationPage
                tasks={
                  visibleTasks
                }
              />
            }
          />

          <Route
            path="tasks"
            element={
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
                loading={
                  loading
                }
                error={error}
                selectedTask={
                  selectedTask
                }
                setSelectedTask={
                  setSelectedTask
                }
                actions={
                  actions
                }
                onStatusChange={
                  handleStatusChange
                }
                onCreateTask={
                  handleCreateTask
                }
                onCreateSubtask={
                  handleCreateSubtask
                }
                onEditTask={
                  handleEditTask
                }
                onDeleteTask={
                  handleDeleteTask
                }
              />
            }
          />

          <Route
            path="activity"
            element={
              <AdminActivityPage
                actions={
                  actions
                }
                tasks={
                  visibleTasks
                }
                projects={
                  projects
                }
              />
            }
          />

          <Route
            path="reports"
            element={
              <AdminReportsPage
                projects={
                  projects
                }
                tasks={
                  visibleTasks
                }
                departments={
                  departments
                }
              />
            }
          />

          <Route
            path="settings"
            element={
              <ParametresPage
                currentUser={
                  currentUser
                }
                onUpdateProfile={
                  handleUpdateProfile
                }
              />
            }
          />

          {/* =========================
              INTERN REPORT — ADMIN
          ========================== */}

          <Route
            path="intern-report"
            element={
              <InternReportPage
                tasks={
                  visibleTasks
                }
                projects={
                  projects
                }
              />
            }
          />

          {/* =========================
              ARCHIVES — ADMIN
              Note : on passe ici les listes brutes
              (tasks/projects), pas visibleTasks —
              seule cette page doit voir les éléments
              archivés.
          ========================== */}

          <Route
            path="archives"
            element={
              <ArchivesPage
                tasks={tasks}
                projects={projects}
                onRestoreTask={
                  handleRestoreTask
                }
                onRestoreProject={
                  handleRestoreProject
                }
              />
            }
          />

        </Route>


        {/* =========================
            SCRUM MASTER ROUTES
        ========================== */}

        <Route
          path="/scrum-master"
          element={
            <RoleProtectedRoute
              isLoggedIn={
                !!currentUser
              }
              user={currentUser}
              allowedCheck={
                isScrumMaster
              }
            >
              <ScrumMasterLayout
                currentUser={
                  currentUser
                }
                onLogout={
                  handleLogout
                }
                tasks={
                  visibleTasks
                }
                projects={
                  projects
                }
                users={users}
              />
            </RoleProtectedRoute>
          }
        >

          <Route
            path="dashboard"
            element={
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
            }
          />

          <Route
            path="calendar"
            element={
              <ScrumMasterCalendarPage
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
            }
          />

          <Route
            path="projects"
            element={
              <ScrumMasterProjectsPage
                currentUser={
                  currentUser
                }
                projects={
                  projects
                }
                tasks={
                  visibleTasks
                }
                actions={
                  actions
                }
                onCreateProject={
                  handleCreateProject
                }
                onUpdateProject={
                  handleUpdateProject
                }
                onDeleteProject={
                  handleDeleteProject
                }
                onCreateSubtask={
                  handleCreateSubtask
                }
                onEditTask={
                  handleEditTask
                }
                onDeleteTask={
                  handleDeleteTask
                }
                onStatusChange={
                  handleStatusChange
                }
              />
            }
          />

          <Route
            path="backlog"
            element={
              <BacklogPage
                projects={
                  projects
                }
                tasks={
                  visibleTasks
                }
                onEditTask={
                  handleEditTask
                }
              />
            }
          />

          <Route
            path="tasks"
            element={
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
                loading={
                  loading
                }
                error={error}
                selectedTask={
                  selectedTask
                }
                setSelectedTask={
                  setSelectedTask
                }
                actions={
                  actions
                }
                onStatusChange={
                  handleStatusChange
                }
                onCreateTask={
                  handleCreateTask
                }
                onCreateSubtask={
                  handleCreateSubtask
                }
                onEditTask={
                  handleEditTask
                }
                onDeleteTask={
                  handleDeleteTask
                }
              />
            }
          />

          <Route
            path="team"
            element={
              <ScrumMasterTeamPage
                currentUser={
                  currentUser
                }
                tasks={
                  visibleTasks
                }
              />
            }
          />

          <Route
            path="team-evaluation"
            element={
              <ScrumMasterTeamEvaluationPage
                currentUser={
                  currentUser
                }
                tasks={
                  visibleTasks
                }
              />
            }
          />

          <Route
            path="activity"
            element={
              <ScrumMasterActivityPage
                currentUser={
                  currentUser
                }
                actions={
                  actions
                }
                tasks={
                  visibleTasks
                }
                projects={
                  projects
                }
              />
            }
          />

          <Route
            path="settings"
            element={
              <ParametresPage
                currentUser={
                  currentUser
                }
                onUpdateProfile={
                  handleUpdateProfile
                }
              />
            }
          />

          {/* =========================
              INTERN REPORT — SCRUM MASTER
          ========================== */}

          <Route
            path="intern-report"
            element={
              <InternReportPage
                tasks={
                  visibleTasks
                }
                projects={
                  projects
                }
              />
            }
          />

        </Route>


        {/* =========================
            TIMESHEET
            Accessible to every logged-in user
        ========================== */}

        <Route
          path="/timesheet"
          element={
            <ProtectedRoute
              isLoggedIn={
                !!currentUser
              }
            >
              {isAdminUser ? (
                <AdminLayout
                  currentUser={
                    currentUser
                  }
                  onLogout={
                    handleLogout
                  }
                  tasks={
                    visibleTasks
                  }
                  projects={
                    projects
                  }
                  users={users}
                />
              ) : (
                <ScrumMasterLayout
                  currentUser={
                    currentUser
                  }
                  onLogout={
                    handleLogout
                  }
                  tasks={
                    visibleTasks
                  }
                  projects={
                    projects
                  }
                  users={users}
                />
              )}
            </ProtectedRoute>
          }
        >

          <Route
            index
            element={
              <MyTimesheetPage
                currentUser={
                  currentUser
                }
                tasks={
                  visibleTasks
                }
                projects={
                  projects
                }
              />
            }
          />

        </Route>


        {/* =========================
            NOTIFICATIONS
        ========================== */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              isLoggedIn={
                !!currentUser
              }
            >
              {isAdminUser ? (
                <AdminLayout
                  currentUser={
                    currentUser
                  }
                  onLogout={
                    handleLogout
                  }
                  tasks={
                    visibleTasks
                  }
                  projects={
                    projects
                  }
                  users={users}
                />
              ) : (
                <ScrumMasterLayout
                  currentUser={
                    currentUser
                  }
                  onLogout={
                    handleLogout
                  }
                  tasks={
                    visibleTasks
                  }
                  projects={
                    projects
                  }
                  users={users}
                />
              )}
            </ProtectedRoute>
          }
        >

          <Route
            index
            element={
              <NotificationsPage
                currentUser={
                  currentUser
                }
              />
            }
          />

        </Route>


        {/* =========================
            USER PERFORMANCE ANALYTICS
            ADMIN + SCRUM MASTER ONLY
        ========================== */}

        <Route
          path="/analytics/user-performance"
          element={
            <RoleProtectedRoute
              isLoggedIn={
                !!currentUser
              }
              user={currentUser}
              allowedCheck={
                isAdminOrScrumMaster
              }
            >
              {isAdminUser ? (
                <AdminLayout
                  currentUser={
                    currentUser
                  }
                  onLogout={
                    handleLogout
                  }
                  tasks={
                    visibleTasks
                  }
                  projects={
                    projects
                  }
                  users={users}
                />
              ) : (
                <ScrumMasterLayout
                  currentUser={
                    currentUser
                  }
                  onLogout={
                    handleLogout
                  }
                  tasks={
                    visibleTasks
                  }
                  projects={
                    projects
                  }
                  users={users}
                />
              )}
            </RoleProtectedRoute>
          }
        >

          <Route
            index
            element={
              <UserPerformancePage
                tasks={
                  visibleTasks
                }
                projects={
                  projects
                }
              />
            }
          />

        </Route>


        {/* =========================
            CATCH ALL
        ========================== */}

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

      {/* Monté en dehors de <Routes> pour survivre à tous les changements de page */}
      <StatusConfirmModal
        task={statusChangeTask}
        unfinishedSubtasksCount={
          statusChangeTask
            ? getUnfinishedSubtasksCount(statusChangeTask.id)
            : 0
        }
        onConfirm={handleConfirmStatusChange}
        onClose={() => setStatusChangeTask(null)}
      />

      <ToastContainer />
    </BrowserRouter>
  );
}


export default App;