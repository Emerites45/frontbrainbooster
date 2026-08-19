import {
  useEffect,
  useState,
} from "react";

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
  fetchCurrentUser,
  fetchTasks,
  fetchProjects,
  fetchUsers,
  createProject,
  createTask,
  createSubtask as createSubtaskApi,
  updateTask,
  updateTaskStatus,
  deleteTask,
  assignUserToTask,
} from "./api/api";

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

/**
 * Lit l'utilisateur sauvegardé dans
 * le navigateur.
 *
 * Ce stockage contient actuellement :
 *
 * {
 *   ...user,
 *   token
 * }
 */
function getSavedUser() {
  try {
    const saved =
      localStorage.getItem(
        "currentUser"
      );

    if (!saved) {
      return null;
    }

    return JSON.parse(
      saved
    );
  } catch (error) {
    console.error(
      "Impossible de lire la session locale :",
      error
    );

    localStorage.removeItem(
      "currentUser"
    );

    return null;
  }
}

/**
 * Transforme les différentes formes
 * d'assignation utilisées dans les
 * composants en une simple liste
 * d'identifiants utilisateurs.
 *
 * Accepte :
 *
 * [1, 2]
 *
 * ou :
 *
 * [
 *   { userId: 1 },
 *   { userId: 2 }
 * ]
 */
function getAssignmentUserIds(
  assignments
) {
  if (
    !Array.isArray(
      assignments
    )
  ) {
    return [];
  }

  const ids =
    assignments
      .map(
        (assignment) => {
          if (
            typeof assignment ===
              "number" ||
            typeof assignment ===
              "string"
          ) {
            return assignment;
          }

          return (
            assignment?.userId ??
            null
          );
        }
      )
      .filter(
        (id) =>
          id !== null &&
          id !== undefined &&
          id !== ""
      );

  return [
    ...new Map(
      ids.map(
        (id) => [
          String(id),
          id,
        ]
      )
    ).values(),
  ];
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
        currentUser={
          currentUser
        }
        onLogout={
          onLogout
        }
      />

      {children}
    </>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  /* =======================================================
     DONNÉES
  ======================================================= */

  const [
    tasks,
    setTasks,
  ] = useState([]);

  const [
    projects,
    setProjects,
  ] = useState([]);

  const [
    users,
    setUsers,
  ] = useState([]);

  /*
   * Les anciennes notifications utilisent
   * encore "actions".
   *
   * Le nouveau backend utilise HistoryEntry.
   *
   * Nous les adapterons dans une prochaine
   * étape.
   */
  const [
    actions,
    setActions,
  ] = useState([]);

  const [
    selectedTask,
    setSelectedTask,
  ] = useState(null);

  /* =======================================================
     CHARGEMENT
  ======================================================= */

  const [
    authChecking,
    setAuthChecking,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  /* =======================================================
     UTILISATEUR CONNECTÉ
  ======================================================= */

  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  /* =========================================================
     RESTAURATION DE LA SESSION
  ========================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function restoreSession() {
      const savedUser =
        getSavedUser();

      /*
       * Aucun token :
       * l'utilisateur n'est pas connecté.
       */
      if (
        !savedUser?.token
      ) {
        if (!cancelled) {
          setCurrentUser(
            null
          );

          setAuthChecking(
            false
          );
        }

        return;
      }

      try {
        /*
         * Le token existe.
         *
         * On demande maintenant au backend
         * de confirmer qu'il est valide.
         */
        const userFromApi =
          await fetchCurrentUser();

        if (cancelled) {
          return;
        }

        const authenticatedUser =
          {
            ...userFromApi,

            token:
              savedUser.token,
          };

        localStorage.setItem(
          "currentUser",
          JSON.stringify(
            authenticatedUser
          )
        );

        setCurrentUser(
          authenticatedUser
        );
      } catch (err) {
        console.error(
          "Session invalide :",
          err
        );

        /*
         * Si /auth/me refuse le token,
         * on supprime la session locale.
         */
        localStorage.removeItem(
          "currentUser"
        );

        if (!cancelled) {
          setCurrentUser(
            null
          );
        }
      } finally {
        if (!cancelled) {
          setAuthChecking(
            false
          );
        }
      }
    }

    restoreSession();

    return () => {
      cancelled =
        true;
    };
  }, []);

  /* =========================================================
     LOGIN
  ========================================================= */

  function handleLogin(
    data
  ) {
    if (
      !data?.token ||
      !data?.user
    ) {
      console.error(
        "Réponse de connexion invalide :",
        data
      );

      return;
    }

    const authenticatedUser =
      {
        ...data.user,

        token:
          data.token,
      };

    localStorage.setItem(
      "currentUser",
      JSON.stringify(
        authenticatedUser
      )
    );

    setCurrentUser(
      authenticatedUser
    );

    setError(
      null
    );
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  function handleLogout() {
    localStorage.removeItem(
      "currentUser"
    );

    setCurrentUser(
      null
    );

    setTasks([]);
    setProjects([]);
    setUsers([]);
    setActions([]);
    setSelectedTask(null);

    setError(
      null
    );
  }

  /* =========================================================
     CHARGEMENT DES DONNÉES
  ========================================================= */

  useEffect(() => {
    let cancelled =
      false;

    /*
     * On attend que la vérification
     * /auth/me soit terminée.
     */
    if (
      authChecking
    ) {
      return;
    }

    /*
     * Pas connecté :
     * aucun appel aux endpoints protégés.
     */
    if (
      !currentUser?.id
    ) {
      setTasks([]);
      setProjects([]);
      setUsers([]);
      setActions([]);
      setLoading(false);

      return;
    }

    async function loadData() {
      setLoading(
        true
      );

      setError(
        null
      );

      try {
        const [
          tasksData,
          projectsData,
          usersData,
        ] =
          await Promise.all([
            fetchTasks(),
            fetchProjects(),
            fetchUsers(),
          ]);

        if (cancelled) {
          return;
        }

        setTasks(
          Array.isArray(
            tasksData
          )
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
          Array.isArray(
            usersData
          )
            ? usersData
            : []
        );

        /*
         * Le nouveau backend n'a pas
         * de GET /actions.
         *
         * L'historique sera récupéré avec :
         *
         * /tasks/{id}/history
         *
         * à une prochaine étape.
         */
        setActions([]);
      } catch (err) {
        console.error(
          "Erreur chargement données :",
          err
        );

        if (
          cancelled
        ) {
          return;
        }

        setError(
          err.message ??
            "Impossible de charger les données."
        );

        /*
         * Si le serveur retourne 401,
         * la session n'est plus valide.
         */
        if (
          err.status ===
          401
        ) {
          localStorage.removeItem(
            "currentUser"
          );

          setCurrentUser(
            null
          );

          setTasks([]);
          setProjects([]);
          setUsers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(
            false
          );
        }
      }
    }

    loadData();

    return () => {
      cancelled =
        true;
    };
  }, [
    authChecking,
    currentUser?.id,
  ]);

  /* =========================================================
     RÔLES
  ========================================================= */

  const isAdmin =
    currentUser
      ?.globalRoles
      ?.includes(
        "ADMIN"
      );

  const isScrumMaster =
    currentUser
      ?.departmentRoles
      ?.some(
        (
          departmentRole
        ) =>
          departmentRole.role ===
          "SCRUM_MASTER"
      );

  const isSimpleMember =
    !!currentUser &&
    !isAdmin &&
    !isScrumMaster;

  /* =========================================================
     VISIBILITÉ DES TÂCHES
  ========================================================= */

  function getVisibleTasks() {
    if (
      !currentUser
    ) {
      return [];
    }

    /*
     * L'ADMIN voit tout.
     */
    if (
      isAdmin
    ) {
      return tasks;
    }

    const myDepartmentRoles =
      currentUser
        .departmentRoles ??
      [];

    /* -------------------------------------------------------
       SCRUM MASTER D'UN DÉPARTEMENT
    ------------------------------------------------------- */

    function isScrumMasterOf(
      departmentId
    ) {
      return myDepartmentRoles.some(
        (
          departmentRole
        ) =>
          String(
            departmentRole.departmentId
          ) ===
            String(
              departmentId
            ) &&
          departmentRole.role ===
            "SCRUM_MASTER"
      );
    }

    /* -------------------------------------------------------
       TÂCHE ASSIGNÉE À L'UTILISATEUR
    ------------------------------------------------------- */

    function isAssignedToMe(
      task
    ) {
      return (
        task.assignments ??
        []
      ).some(
        (
          assignment
        ) =>
          String(
            assignment.userId
          ) ===
          String(
            currentUser.id
          )
      );
    }

    /* -------------------------------------------------------
       VISIBILITÉ DIRECTE
    ------------------------------------------------------- */

    function isDirectlyVisible(
      task
    ) {
      /*
       * Un Scrum Master voit les tâches
       * des projets appartenant à son
       * département.
       */
      if (
        isScrumMaster
      ) {
        const project =
          projects.find(
            (
              currentProject
            ) =>
              String(
                currentProject.id
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

      /*
       * Un MEMBER voit les tâches
       * qui lui sont assignées.
       */
      return isAssignedToMe(
        task
      );
    }

    const visibleIds =
      new Set(
        tasks
          .filter(
            isDirectlyVisible
          )
          .map(
            (task) =>
              String(
                task.id
              )
          )
      );

    /*
     * Si une sous-tâche est visible,
     * on garde aussi sa tâche parente.
     *
     * Si une tâche parente est visible,
     * on conserve également ses
     * sous-tâches déjà chargées.
     */
    let changed =
      true;

    while (
      changed
    ) {
      changed =
        false;

      tasks.forEach(
        (task) => {
          const taskId =
            String(
              task.id
            );

          const parentId =
            task.parentTaskId !==
              null &&
            task.parentTaskId !==
              undefined
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

            changed =
              true;
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

            changed =
              true;
          }
        }
      );
    }

    return tasks.filter(
      (task) =>
        visibleIds.has(
          String(
            task.id
          )
        )
    );
  }

  const visibleTasks =
    getVisibleTasks();

  /* =========================================================
     PROJETS
  ========================================================= */

  async function handleCreateProject(
    projectData
  ) {
    if (
      !currentUser?.id
    ) {
      return null;
    }

    /*
     * Un simple MEMBER ne crée pas
     * de projet.
     */
    if (
      isSimpleMember
    ) {
      console.error(
        "Un membre ne peut pas créer de projet."
      );

      return null;
    }

    const projectToCreate =
      {
        ...projectData,

        creatorId:
          projectData
            ?.creatorId ??
          currentUser.id,
      };

    try {
      const newProject =
        await createProject(
          projectToCreate
        );

      setProjects(
        (
          previousProjects
        ) => [
          ...previousProjects,
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
        err.message ??
          "Erreur lors de la création du projet."
      );

      return null;
    }
  }

  function handleSelectProject(
    projectId
  ) {
    console.log(
      "Projet sélectionné :",
      projectId
    );
  }

  /* =========================================================
     ASSIGNER DES UTILISATEURS À UNE TÂCHE
  ========================================================= */

  async function createTaskAssignments(
    taskId,
    assignmentValues
  ) {
    if (
      !currentUser?.id
    ) {
      return [];
    }

    let userIds =
      getAssignmentUserIds(
        assignmentValues
      );

    /*
     * Pour conserver le comportement
     * actuel :
     *
     * si aucun utilisateur n'a été
     * choisi, le créateur est assigné.
     */
    if (
      userIds.length ===
      0
    ) {
      userIds = [
        currentUser.id,
      ];
    }

    const createdAssignments =
      [];

    /*
     * Le contrat API exige une requête
     * séparée pour chaque assignation.
     */
    for (
      const userId
      of userIds
    ) {
      try {
        const assignment =
          await assignUserToTask(
            taskId,
            {
              userId,

              assignedBy:
                currentUser.id,
            }
          );

        if (
          assignment
        ) {
          createdAssignments.push(
            assignment
          );
        }
      } catch (err) {
        console.error(
          `Impossible d'assigner l'utilisateur ${userId} à la tâche ${taskId} :`,
          err
        );
      }
    }

    return createdAssignments;
  }

  /* =========================================================
     CHANGEMENT DE STATUT
  ========================================================= */

  async function handleStatusChange(
    taskId,
    requestedStatus = null
  ) {
    const task =
      tasks.find(
        (
          currentTask
        ) =>
          String(
            currentTask.id
          ) ===
          String(
            taskId
          )
      );

    if (
      !task
    ) {
      console.error(
        "Tâche introuvable :",
        taskId
      );

      return;
    }

    /* -------------------------------------------------------
       PROTECTION MEMBER
    ------------------------------------------------------- */

    if (
      isSimpleMember
    ) {
      const assigned =
        (
          task.assignments ??
          []
        ).some(
          (
            assignment
          ) =>
            String(
              assignment.userId
            ) ===
            String(
              currentUser.id
            )
        );

      if (
        !assigned
      ) {
        console.error(
          "Le membre ne peut pas modifier le statut de cette tâche."
        );

        return;
      }
    }

    const oldStatus =
      task.status;

    let newStatus;

    if (
      requestedStatus &&
      ALLOWED_TASK_STATUSES.includes(
        requestedStatus
      )
    ) {
      newStatus =
        requestedStatus;
    } else {
      newStatus =
        NEXT_STATUS[
          oldStatus
        ];
    }

    if (
      !newStatus
    ) {
      console.error(
        "Statut inconnu :",
        oldStatus
      );

      return;
    }

    if (
      newStatus ===
      oldStatus
    ) {
      return;
    }

    try {
      /*
       * NOUVEAU CONTRAT :
       *
       * PATCH
       * /api/v1/tasks/{id}/status
       */
      const updatedTask =
        await updateTaskStatus(
          taskId,
          newStatus
        );

      setTasks(
        (
          previousTasks
        ) =>
          previousTasks.map(
            (
              currentTask
            ) =>
              String(
                currentTask.id
              ) ===
              String(
                taskId
              )
                ? {
                    ...currentTask,

                    ...updatedTask,

                    status:
                      newStatus,
                  }
                : currentTask
          )
      );

      /*
       * On garde également la tâche
       * actuellement ouverte synchronisée.
       */
      setSelectedTask(
        (
          current
        ) => {
          if (
            !current ||
            String(
              current.id
            ) !==
            String(
              taskId
            )
          ) {
            return current;
          }

          return {
            ...current,

            ...updatedTask,

            status:
              newStatus,
          };
        }
      );
    } catch (err) {
      console.error(
        "Impossible de modifier le statut :",
        err
      );

      alert(
        err.message ??
          "Impossible de modifier le statut de la tâche."
      );
    }
  }

  /* =========================================================
     CRÉATION D'UNE TÂCHE PRINCIPALE
  ========================================================= */

  async function handleCreateTask(
    newTask
  ) {
    if (
      !currentUser?.id
    ) {
      return null;
    }

    /*
     * Le MEMBER ne crée pas de tâche
     * principale.
     */
    if (
      isSimpleMember
    ) {
      console.error(
        "Un membre ne peut pas créer une tâche principale."
      );

      return null;
    }

    const assignmentValues =
      newTask?.assignments ??
      [];

    /*
     * Le backend crée la tâche sans
     * assignments.
     *
     * On retire donc ce champ du body.
     */
    const {
      assignments:
        ignoredAssignments,

      id:
        ignoredId,

      ...taskFields
    } = newTask;

    const taskToCreate =
      {
        ...taskFields,

        creatorId:
          newTask
            ?.creatorId ??
          currentUser.id,
      };

    try {
      /*
       * 1. Création de la tâche.
       */
      const createdTask =
        await createTask(
          taskToCreate
        );

      if (
        !createdTask?.id
      ) {
        throw new Error(
          "La tâche créée n'a pas été retournée correctement par l'API."
        );
      }

      /*
       * 2. Création des assignations
       * séparément.
       */
      const createdAssignments =
        await createTaskAssignments(
          createdTask.id,
          assignmentValues
        );

      const completeTask =
        {
          ...createdTask,

          assignments:
            createdAssignments,
        };

      /*
       * 3. Mise à jour du state.
       */
      setTasks(
        (
          previousTasks
        ) => [
          ...previousTasks,
          completeTask,
        ]
      );

      return completeTask;
    } catch (err) {
      console.error(
        "Impossible de créer la tâche :",
        err
      );

      alert(
        err.message ??
          "Impossible de créer la tâche."
      );

      return null;
    }
  }

  /* =========================================================
     CRÉATION D'UNE SOUS-TÂCHE
  ========================================================= */

  async function handleCreateSubtask(
    parentTaskId,
    title,
    assignments
  ) {
    if (
      !currentUser?.id
    ) {
      return null;
    }

    const parentTask =
      tasks.find(
        (
          task
        ) =>
          String(
            task.id
          ) ===
          String(
            parentTaskId
          )
      );

    if (
      !parentTask
    ) {
      console.error(
        "Impossible de créer la sous-tâche : tâche parente introuvable."
      );

      return null;
    }

    const cleanTitle =
      title?.trim();

    if (
      !cleanTitle
    ) {
      console.error(
        "Le titre de la sous-tâche est obligatoire."
      );

      return null;
    }

    /* -------------------------------------------------------
       PROTECTION MEMBER
    ------------------------------------------------------- */

    if (
      isSimpleMember
    ) {
      const parentAssigned =
        (
          parentTask.assignments ??
          []
        ).some(
          (
            assignment
          ) =>
            String(
              assignment.userId
            ) ===
            String(
              currentUser.id
            )
        );

      if (
        !parentAssigned
      ) {
        console.error(
          "Vous ne pouvez pas créer une sous-tâche sur cette tâche."
        );

        return null;
      }
    }

    const subtaskToCreate =
      {
        title:
          cleanTitle,

        description:
          "",

        status:
          "A_FAIRE",

        projectId:
          parentTask.projectId,

        creatorId:
          currentUser.id,

        /*
         * Ces dates sont reprises de
         * la tâche parente lorsqu'elles
         * existent.
         */
        ...(parentTask.startDate
          ? {
              startDate:
                parentTask.startDate,
            }
          : {}),

        ...(parentTask.endDate
          ? {
              endDate:
                parentTask.endDate,
            }
          : {}),

        ...(parentTask.dueDate
          ? {
              dueDate:
                parentTask.dueDate,
            }
          : {}),
      };

    try {
      /*
       * NOUVEAU CONTRAT :
       *
       * POST
       * /api/v1/tasks/{id}/subtasks
       *
       * Le backend ajoute lui-même :
       * parentTaskId = parentTaskId
       */
      const createdSubtask =
        await createSubtaskApi(
          parentTaskId,
          subtaskToCreate
        );

      if (
        !createdSubtask?.id
      ) {
        throw new Error(
          "La sous-tâche créée n'a pas été retournée correctement par l'API."
        );
      }

      /*
       * Assignation séparée.
       */
      const createdAssignments =
        await createTaskAssignments(
          createdSubtask.id,
          assignments
        );

      const completeSubtask =
        {
          ...createdSubtask,

          /*
           * Normalement fourni par
           * le backend.
           *
           * Cette valeur garantit aussi
           * l'affichage immédiat.
           */
          parentTaskId:
            createdSubtask
              .parentTaskId ??
            parentTaskId,

          assignments:
            createdAssignments,
        };

      setTasks(
        (
          previousTasks
        ) => [
          ...previousTasks,
          completeSubtask,
        ]
      );

      return completeSubtask;
    } catch (err) {
      console.error(
        "Impossible de créer la sous-tâche :",
        err
      );

      alert(
        err.message ??
          "Impossible de créer la sous-tâche."
      );

      return null;
    }
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
        (
          currentTask
        ) =>
          String(
            currentTask.id
          ) ===
          String(
            taskId
          )
      );

    if (
      !task
    ) {
      return null;
    }

    /*
     * Le MEMBER simple ne modifie
     * pas le titre ou la description
     * d'une tâche principale.
     */
    if (
      isSimpleMember
    ) {
      console.error(
        "Modification interdite pour un membre."
      );

      return null;
    }

    try {
      const updatedTask =
        await updateTask(
          taskId,
          updatedFields
        );

      setTasks(
        (
          previousTasks
        ) =>
          previousTasks.map(
            (
              currentTask
            ) =>
              String(
                currentTask.id
              ) ===
              String(
                taskId
              )
                ? {
                    ...currentTask,

                    ...updatedTask,
                  }
                : currentTask
          )
      );

      setSelectedTask(
        (
          current
        ) => {
          if (
            !current ||
            String(
              current.id
            ) !==
            String(
              taskId
            )
          ) {
            return current;
          }

          return {
            ...current,

            ...updatedTask,
          };
        }
      );

      return updatedTask;
    } catch (err) {
      console.error(
        "Impossible de modifier la tâche :",
        err
      );

      alert(
        err.message ??
          "Impossible de modifier la tâche."
      );

      return null;
    }
  }

  /* =========================================================
     SUPPRESSION D'UNE TÂCHE
  ========================================================= */

  async function handleDeleteTask(
    taskId
  ) {
    /*
     * Protection supplémentaire.
     */
    if (
      isSimpleMember
    ) {
      console.error(
        "Un membre ne peut pas supprimer une tâche principale."
      );

      return false;
    }

    try {
      /*
       * NOUVEAU CONTRAT :
       *
       * DELETE /api/v1/tasks/{id}
       *
       * Le backend supprime également
       * les sous-tâches.
       */
      await deleteTask(
        taskId
      );

      /*
       * Après confirmation du serveur,
       * on retire la tâche et ses
       * descendants du state React.
       */
      setTasks(
        (
          previousTasks
        ) => {
          const idsToDelete =
            new Set([
              String(
                taskId
              ),
            ]);

          let changed =
            true;

          while (
            changed
          ) {
            changed =
              false;

            previousTasks.forEach(
              (
                task
              ) => {
                const parentId =
                  task.parentTaskId !==
                    null &&
                  task.parentTaskId !==
                    undefined
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

                  changed =
                    true;
                }
              }
            );
          }

          return previousTasks.filter(
            (
              task
            ) =>
              !idsToDelete.has(
                String(
                  task.id
                )
              )
          );
        }
      );

      setSelectedTask(
        null
      );

      return true;
    } catch (err) {
      console.error(
        "Impossible de supprimer la tâche :",
        err
      );

      alert(
        err.message ??
          "Impossible de supprimer la tâche."
      );

      return false;
    }
  }

  /* =========================================================
     EMAIL
  ========================================================= */

  function handleVerify(
    code
  ) {
    console.log(
      "Code entered:",
      code
    );
  }

  /* =========================================================
     CHARGEMENT SESSION
  ========================================================= */

  if (
    authChecking
  ) {
    return (
      <div
        style={{
          padding:
            "30px",
        }}
      >
        Vérification de la session...
      </div>
    );
  }

  /* =========================================================
     CHARGEMENT DONNÉES
  ========================================================= */

  if (
    loading &&
    currentUser
  ) {
    return (
      <div
        style={{
          padding:
            "30px",
        }}
      >
        Chargement des données...
      </div>
    );
  }

  if (
    error
  ) {
    console.error(
      error
    );
  }

  /* =========================================================
     ROUTES
  ========================================================= */

  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate
                to="/"
                replace
              />
            ) : (
              <LoginPage
                onLogin={
                  handleLogin
                }
              />
            )
          }
        />

        {/* =================================================
            SIGNUP
        ================================================= */}

        <Route
          path="/signup"
          element={
            <SignupPage />
          }
        />

        {/* =================================================
            RESET PASSWORD
        ================================================= */}

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
            RACINE
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
  currentUser={
    currentUser
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
                  actions={
                    actions
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
                <MemberPersonalReportPage
                  currentUser={
                    currentUser
                  }
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