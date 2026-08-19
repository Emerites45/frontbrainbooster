import {
  useMemo,
  useState,
} from "react";

import TaskColumn from "../components/TaskColumn";
import NewTaskModal from "../components/NewTaskModal";
import TaskModal from "../components/TaskModal";

import "./BoardPage.css";

/* =========================================================
   COLONNES
========================================================= */

const COLUMNS = [
  {
    status: "A_FAIRE",
    title: "À faire",
  },
  {
    status: "EN_COURS",
    title: "En cours",
  },
  {
    status: "TERMINE",
    title: "Terminées",
  },
];

/* =========================================================
   HELPERS RÔLES
========================================================= */

function isAdmin(
  user
) {
  return (
    Array.isArray(
      user?.globalRoles
    ) &&
    user.globalRoles.includes(
      "ADMIN"
    )
  );
}

function isScrumMaster(
  user
) {
  return (
    Array.isArray(
      user?.departmentRoles
    ) &&
    user.departmentRoles.some(
      (
        departmentRole
      ) =>
        departmentRole?.role ===
        "SCRUM_MASTER"
    )
  );
}

/* =========================================================
   BOARD PAGE
========================================================= */

function BoardPage({
  tasks = [],
  users = [],
  projects = [],
  currentUser,
  selectedTask,
  setSelectedTask,
  actions = [],
  onStatusChange,
  onCreateTask,
  onCreateSubtask,
  onEditTask,
  onDeleteTask,
}) {
  /* =======================================================
     MODAL CREATION
  ======================================================= */

  const [
    showNewTaskModal,
    setShowNewTaskModal,
  ] =
    useState(
      false
    );

  /* =======================================================
     RÔLES
  ======================================================= */

  const currentUserIsAdmin =
    isAdmin(
      currentUser
    );

  const currentUserIsScrumMaster =
    isScrumMaster(
      currentUser
    );

  const canCreateMainTask =
    currentUserIsAdmin ||
    currentUserIsScrumMaster;

  /* =======================================================
     TÂCHES PRINCIPALES
  ======================================================= */

  const rootTasks =
    useMemo(
      () =>
        tasks.filter(
          (
            task
          ) =>
            task.parentTaskId ===
              null ||
            task.parentTaskId ===
              undefined
        ),
      [
        tasks,
      ]
    );

  /* =======================================================
     TÂCHES PAR STATUT
  ======================================================= */

  function tasksByStatus(
    status
  ) {
    return rootTasks.filter(
      (
        task
      ) =>
        task.status ===
        status
    );
  }

  /* =======================================================
     OUVERTURE DÉTAILS
  ======================================================= */

  function openTask(
    task
  ) {
    if (
      !setSelectedTask
    ) {
      return;
    }

    setSelectedTask(
      task
    );
  }

  function closeTask() {
    setSelectedTask?.(
      null
    );
  }

  /* =======================================================
     CRÉATION
  ======================================================= */

  async function handleCreateTask(
    taskData
  ) {
    if (
      !onCreateTask
    ) {
      return null;
    }

    const result =
      await onCreateTask(
        taskData
      );

    return result;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="board-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="board-header">

        <div>
          <span className="board-eyebrow">
            Gestion des tâches
          </span>

          <h1>
            Tableau de bord
          </h1>

          <p>
            Suivez l'avancement des
            tâches par statut.
          </p>
        </div>

        {canCreateMainTask && (
          <button
            type="button"
            className="board-create-button"
            onClick={() =>
              setShowNewTaskModal(
                true
              )
            }
          >
            + Nouvelle tâche
          </button>
        )}
      </div>

      {/* =================================================
          BOARD
      ================================================= */}

      <section className="board-columns">

        {COLUMNS.map(
          (
            column
          ) => (
            <TaskColumn
              key={
                column.status
              }
              title={
                column.title
              }
              status={
                column.status
              }
              tasks={
                tasksByStatus(
                  column.status
                )
              }
              users={
                users
              }
              onTaskClick={
                openTask
              }
              onStatusChange={
                onStatusChange
              }
            />
          )
        )}
      </section>

      {/* =================================================
          MODAL CREATION
      ================================================= */}

      {showNewTaskModal && (
        <NewTaskModal
          users={
            users
          }
          projects={
            projects
          }
          currentUser={
            currentUser
          }
          onCreate={
            handleCreateTask
          }
          onClose={() =>
            setShowNewTaskModal(
              false
            )
          }
        />
      )}

      {/* =================================================
          MODAL DETAILS
      ================================================= */}

      {selectedTask && (
        <TaskModal
          task={
            selectedTask
          }
          allTasks={
            tasks
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
          onClose={
            closeTask
          }
          onCreateSubtask={
            onCreateSubtask
          }
          onEditTask={
            onEditTask
          }
          onDeleteTask={
            onDeleteTask
          }
        />
      )}
    </main>
  );
}

export default BoardPage;