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
import MemberPersonalReportPage from "./pages/MemberPersonalReportPage";

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
  createTask,
  updateTask,
} from "./api/api";

import {
  normalizeAssignments,
} from "./utils/dashboardHelpers";

/* =========================================================
   STATUTS
========================================================= */

const NEXT_STATUS = {
  A_FAIRE: "EN_COURS",
  EN_COURS: "TERMINE",
  TERMINE: "A_FAIRE",
};

const ALLOWED_TASK_STATUSES = [
  "A_FAIRE",
  "EN_COURS",
  "TERMINE",
];

/* =========================================================
   HELPERS
========================================================= */

function generateActionId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/* =========================================================
   LAYOUT ADMIN / SCRUM
========================================================= */

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

/* =========================================================
   APP
========================================================= */

function App() {
  const [tasks, setTasks] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [actions, setActions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [
    selectedTask,
    setSelectedTask,
  ] = useState(null);

  const [
    currentUser,
    setCurrentUser,
  ] = useState(() => {
    const saved =
      localStorage.getItem(
        "currentUser"
      );

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
    localStorage.removeItem(
      "currentUser"
    );

    setCurrentUser(null);
  }

  /* =========================================================
     CHARGEMENT INITIAL
  ========================================================= */

  useEffect(() => {
    setLoading(true);
    setError(null);

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
          setTasks(
            Array.isArray(tasksData)
              ? tasksData
              : []
          );

          setProjects(
            Array.isArray(
              projectsData
            )
              ? projectsData
              : []
          );

          setUsers(
            Array.isArray(usersData)
              ? usersData
              : []
          );

          setActions(
            Array.isArray(
              actionsData
            )
              ? actionsData
              : []
          );
        }
      )
      .catch((err) => {
        console.error(
          "Erreur chargement données :",
          err
        );

        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* =========================================================
     HISTORIQUE / ACTIONS
  ========================================================= */

  async function persistAction(
    action
  ) {
    try {
      const savedAction =
        await createAction(
          action
        );

      return (
        savedAction ??
        action
      );
    } catch (err) {
      console.error(
        "Impossible d'enregistrer l'action :",
        err
      );

      return action;
    }
  }

  /* =========================================================
     PROJETS
  ========================================================= */

  const handleCreateProject =
    async (projectData) => {
      try {
        const newProject =
          await createProject(
            projectData
          );

        setProjects(
          (previous) => [
            ...previous,
            newProject,
          ]
        );

        return newProject;
      } catch (err) {
        console.error(
          "Erreur création projet :",
          err
        );

        alert(
          "Erreur lors de la création du projet"
        );

        return null;
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
      currentUser.departmentRoles ||
      [];

    const isScrumMasterOf = (
      deptId
    ) =>
      myDeptRoles.some(
        (departmentRole) =>
          String(
            departmentRole.departmentId
          ) ===
            String(deptId) &&
          departmentRole.role ===
            "SCRUM_MASTER"
      );

    const isAssignedToMe = (
      task
    ) =>
      (
        task.assignments || []
      ).some(
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
              String(
                project.id
              ) ===
              String(
                task.projectId
              )
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

      return isAssignedToMe(
        task
      );
    };

    const visibleIds =
      new Set(
        tasks
          .filter(
            isDirectlyVisible
          )
          .map((task) =>
            String(task.id)
          )
      );

    let changed = true;

    while (changed) {
      changed = false;

      tasks.forEach(
        (task) => {
          const taskId =
            String(task.id);

          const parentId =
            task.parentTaskId
              ? String(
                  task.parentTaskId
                )
              : null;

          if (
            visibleIds.has(
              taskId
            ) &&
            parentId &&
            !visibleIds.has(
              parentId
            )
          ) {
            visibleIds.add(
              parentId
            );

            changed = true;
          }

          if (
            parentId &&
            visibleIds.has(
              parentId
            ) &&
            !visibleIds.has(
              taskId
            )
          ) {
            visibleIds.add(
              taskId
            );

            changed = true;
          }
        }
      );
    }

    return tasks.filter(
      (task) =>
        visibleIds.has(
          String(task.id)
        )
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

  const isSimpleMember =
    !!currentUser &&
    !isAdmin &&
    !isScrumMaster;

  /* =========================================================
     CHANGEMENT DE STATUT
     IMPORTANT :
     maintenant persisté dans le mock/backend
  ========================================================= */

  async function handleStatusChange(
    taskId,
    requestedStatus = null
  ) {
    const task =
      tasks.find(
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

    /* -------------------------------------------------------
       Sécurité côté interface pour MEMBER
    ------------------------------------------------------- */

    if (isSimpleMember) {
      const assigned =
        (
          task.assignments || []
        ).some(
          (assignment) =>
            String(
              assignment.userId
            ) ===
              String(
                currentUser.id
              ) &&
            !assignment.unassignedAt
        );

      if (!assigned) {
        console.error(
          "Le membre ne peut pas modifier le statut de cette tâche."
        );

        return;
      }
    }

    const ancienStatut =
      task.status;

    let nouveauStatut;

    if (
      requestedStatus &&
      ALLOWED_TASK_STATUSES.includes(
        requestedStatus
      )
    ) {
      nouveauStatut =
        requestedStatus;
    } else {
      nouveauStatut =
        NEXT_STATUS[
          ancienStatut
        ];
    }

    if (!nouveauStatut) {
      console.error(
        "Statut inconnu :",
        ancienStatut
      );

      return;
    }

    if (
      nouveauStatut ===
      ancienStatut
    ) {
      return;
    }

    try {
      /*
        Sauvegarde réelle dans
        db.json / backend.
      */

      const updatedTask =
        await updateTask(
          taskId,
          {
            status:
              nouveauStatut,
          }
        );

      /*
        Mise à jour de React avec
        la réponse du serveur.
      */

      setTasks(
        (previousTasks) =>
          previousTasks.map(
            (
              currentTask
            ) =>
              String(
                currentTask.id
              ) ===
              String(taskId)
                ? {
                    ...currentTask,
                    ...updatedTask,
                    status:
                      nouveauStatut,
                  }
                : currentTask
          )
      );

      /*
        Historique / notification.
      */

      const actionToCreate =
        {
          id:
            generateActionId(),

          id_tache:
            taskId,

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

      const savedAction =
        await persistAction(
          actionToCreate
        );

      setActions(
        (previousActions) => [
          ...previousActions,
          savedAction,
        ]
      );
    } catch (err) {
      console.error(
        "Impossible de modifier le statut :",
        err
      );

      alert(
        "Impossible de modifier le statut de la tâche."
      );
    }
  }

  /* =========================================================
     CRÉATION D'UNE TÂCHE
     IMPORTANT :
     maintenant persistée dans le mock/backend
  ========================================================= */

  async function handleCreateTask(
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

    const taskToCreate = {
      ...newTask,

      creatorId:
        currentUser?.id ??
        null,

      assignments,
    };

    /*
      Le serveur mock génère
      l'identifiant de la tâche.

      On retire donc l'id local
      éventuellement envoyé.
    */

    delete taskToCreate.id;

    try {
      const createdTask =
        await createTask(
          taskToCreate
        );

      if (!createdTask) {
        throw new Error(
          "La tâche créée n'a pas été retournée par l'API."
        );
      }

      /*
        Maintenant la tâche
        existe réellement dans
        db.json.
      */

      setTasks(
        (previousTasks) => [
          ...previousTasks,
          createdTask,
        ]
      );

      /*
        Création de l'action.
        Cette action alimentera
        les notifications.
      */

      const actionToCreate =
        {
          id:
            generateActionId(),

          id_tache:
            createdTask.id,

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

      const savedAction =
        await persistAction(
          actionToCreate
        );

      setActions(
        (previousActions) => [
          ...previousActions,
          savedAction,
        ]
      );

      return createdTask;
    } catch (err) {
      console.error(
        "Impossible de créer la tâche :",
        err
      );

      alert(
        "Impossible de créer la tâche."
      );

      return null;
    }
  }

  /* =========================================================
     CRÉATION D'UNE SOUS-TÂCHE
     Elle passe maintenant elle aussi
     par createTask() et est persistée.
  ========================================================= */

  async function handleCreateSubtask(
    parentTaskId,
    title,
    assignments
  ) {
    const parentTask =
      tasks.find(
        (task) =>
          String(task.id) ===
          String(
            parentTaskId
          )
      );

    if (!parentTask) {
      console.error(
        "Impossible de créer la sous-tâche : tâche parente introuvable."
      );

      return null;
    }

    const cleanTitle =
      title?.trim();

    if (!cleanTitle) {
      console.error(
        "Impossible de créer la sous-tâche : le titre est obligatoire."
      );

      return null;
    }

    /*
      Protection MEMBER :
      la tâche principale doit
      lui être assignée.
    */

    if (isSimpleMember) {
      const parentAssigned =
        (
          parentTask.assignments ||
          []
        ).some(
          (assignment) =>
            String(
              assignment.userId
            ) ===
              String(
                currentUser.id
              ) &&
            !assignment.unassignedAt
        );

      if (!parentAssigned) {
        console.error(
          "Vous ne pouvez pas créer une sous-tâche sur cette tâche."
        );

        return null;
      }
    }

    return handleCreateTask({
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

  async function handleEditTask(
    taskId,
    updatedFields
  ) {
    const task =
      tasks.find(
        (task) =>
          String(task.id) ===
          String(taskId)
      );

    if (!task) {
      return;
    }

    /*
      Un membre simple ne doit pas
      modifier titre/description
      d'une tâche principale.
    */

    if (isSimpleMember) {
      console.error(
        "Modification interdite pour un membre."
      );

      return;
    }

    try {
      const updatedTask =
        await updateTask(
          taskId,
          updatedFields
        );

      setTasks(
        (previousTasks) =>
          previousTasks.map(
            (
              currentTask
            ) =>
              String(
                currentTask.id
              ) ===
              String(taskId)
                ? {
                    ...currentTask,
                    ...updatedTask,
                  }
                : currentTask
          )
      );

      const changedActions =
        [];

      if (
        updatedFields.title !==
          undefined &&
        updatedFields.title !==
          task.title
      ) {
        changedActions.push(
          {
            champ_modifie:
              "titre",

            ancienne_valeur:
              task.title,

            nouvelle_valeur:
              updatedFields.title,
          }
        );
      }

      if (
        updatedFields.description !==
          undefined &&
        updatedFields.description !==
          task.description
      ) {
        changedActions.push(
          {
            champ_modifie:
              "description",

            ancienne_valeur:
              task.description,

            nouvelle_valeur:
              updatedFields.description,
          }
        );
      }

      for (const change of changedActions) {
        const actionToCreate =
          {
            id:
              generateActionId(),

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

            ...change,

            date_action:
              new Date().toISOString(),
          };

        const savedAction =
          await persistAction(
            actionToCreate
          );

        setActions(
          (previousActions) => [
            ...previousActions,
            savedAction,
          ]
        );
      }
    } catch (err) {
      console.error(
        "Impossible de modifier la tâche :",
        err
      );

      alert(
        "Impossible de modifier la tâche."
      );
    }
  }

  /* =========================================================
     SUPPRESSION
     Pour l'instant on conserve ton
     fonctionnement existant.
  ========================================================= */

  function handleDeleteTask(
    taskId
  ) {
    setTasks(
      (previousTasks) => {
        const idsToDelete =
          new Set([
            String(taskId),
          ]);

        let changed = true;

        while (changed) {
          changed = false;

          previousTasks.forEach(
            (task) => {
              const parentId =
                task.parentTaskId
                  ? String(
                      task.parentTaskId
                    )
                  : null;

              if (
                parentId &&
                idsToDelete.has(
                  parentId
                ) &&
                !idsToDelete.has(
                  String(
                    task.id
                  )
                )
              ) {
                idsToDelete.add(
                  String(
                    task.id
                  )
                );

                changed = true;
              }
            }
          );
        }

        return previousTasks.filter(
          (task) =>
            !idsToDelete.has(
              String(task.id)
            )
        );
      }
    );
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
     CHARGEMENT
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

        {/* =================================================
            ROUTES PUBLIQUES
        ================================================= */}

        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={
                handleLogin
              }
            />
          }
        />

        <Route
          path="/signup"
          element={
            <SignupPage />
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
              onVerify={
                handleVerify
              }
            />
          }
        />

        {/* =================================================
            ROUTE RACINE
        ================================================= */}

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
                    users={
                      users
                    }
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

        {/* =================================================
            PROJETS ADMIN / SCRUM
        ================================================= */}

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

        {/* =================================================
            DASHBOARD
        ================================================= */}

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

                  /*
                    IMPORTANT :
                    permet au Header
                    de calculer les
                    notifications.
                  */
                  tasks={
                    visibleTasks
                  }
                  actions={
                    actions
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

        {/* =================================================
            MES TÂCHES MEMBER
        ================================================= */}

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

                tasks={
                  visibleTasks
                }

                actions={
                  actions
                }
              >
                <MemberTasksPage
                  tasks={
                    visibleTasks
                  }
                  users={
                    users
                  }
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

        {/* =================================================
            PROJETS MEMBER
        ================================================= */}

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

                tasks={
                  visibleTasks
                }

                actions={
                  actions
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

        {/* =================================================
          BILAN PERSONNEL MEMBER
       ================================================= */}

<Route
  path="/member/personal-report"
  element={
    <ProtectedRoute
      isLoggedIn={!!currentUser}
    >
      <MemberLayout
        currentUser={currentUser}
        onLogout={handleLogout}
        tasks={visibleTasks}
        actions={actions}
      >
        <MemberPersonalReportPage
          currentUser={currentUser}
        />
      </MemberLayout>
    </ProtectedRoute>
  }
/>

        {/* =================================================
            FALLBACK
        ================================================= */}

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
