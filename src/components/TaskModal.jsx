import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import SubtaskList from "./SubtaskList";
import HistoryTimeline from "./HistoryTimeline";

import {
  getAssigneeIds,
  getAssigneeNames,
  STATUS_LABEL,
} from "../utils/dashboardHelpers";

import "./TaskModal.css";
import "./SubtaskList.css";

/* =========================================================
   ICONS
========================================================= */

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <path d="M9 3.5h6v4H9z" />
      <path d="m9 12 1.5 1.5L14 10" />
      <path d="M9 17h6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 7h7l2 2h9v10H3z" />
      <path d="M3 7V5h7l2 2" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 21V4" />
      <path d="M5 5h11l-2 4 2 4H5" />
    </svg>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value) {
  if (!value) {
    return "Non définie";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getPriorityLabel(priority) {
  const values = {
    LOW: "Faible",
    MEDIUM: "Moyenne",
    HIGH: "Élevée",
    URGENT: "Urgente",
  };

  return values[priority] ?? priority ?? "Non définie";
}

/* =========================================================
   COMPONENT
========================================================= */

function TaskModal({
  task,
  allTasks = [],
  users = [],
  projects = [],
  currentUser,
  actions = [],
  onClose,
  onCreateSubtask,
  onEditTask,
  onDeleteTask,
}) {
  const [isEditing, setIsEditing] =
    useState(false);

  const [title, setTitle] =
    useState(task?.title ?? "");

  const [description, setDescription] =
    useState(task?.description ?? "");

  /* =======================================================
     ESC + BODY LOCK
  ======================================================= */

  useEffect(() => {
    if (!task) {
      return;
    }

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        oldOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [task, onClose]);

  if (!task) {
    return null;
  }

  /* =======================================================
     ROLES
  ======================================================= */

  const isAdmin =
    currentUser?.globalRoles?.includes(
      "ADMIN"
    );

  const isScrumMaster =
    currentUser?.departmentRoles?.some(
      (role) =>
        role?.role ===
        "SCRUM_MASTER"
    );

  const isSimpleMember =
    !isAdmin && !isScrumMaster;

  /* =======================================================
     ASSIGNMENT
  ======================================================= */

  const assigneeIds =
    getAssigneeIds(task);

  const assignedNames =
    getAssigneeNames(
      assigneeIds,
      users
    );

  const isAssignedToCurrentUser =
    assigneeIds.some(
      (userId) =>
        String(userId) ===
        String(currentUser?.id)
    );

  const canEditMainTask =
    isAdmin || isScrumMaster;

  const canDeleteMainTask =
    isAdmin || isScrumMaster;

  const canCreateSubtask =
    isAdmin ||
    isScrumMaster ||
    (isSimpleMember &&
      isAssignedToCurrentUser);

  /* =======================================================
     DATA
  ======================================================= */

  const subtasks =
    allTasks.filter(
      (item) =>
        String(item.parentTaskId) ===
        String(task.id)
    );

  const taskActions =
    actions.filter(
      (action) =>
        String(action.id_tache) ===
        String(task.id)
    );

  const project =
    projects.find(
      (item) =>
        String(item.id) ===
        String(task.projectId)
    );

  /* =======================================================
     ACTIONS
  ======================================================= */

  function handleSave() {
    if (
      !canEditMainTask ||
      !onEditTask
    ) {
      return;
    }

    onEditTask(task.id, {
      title,
      description,
    });

    setIsEditing(false);
  }

  function handleDelete() {
    if (
      !canDeleteMainTask ||
      !onDeleteTask
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Supprimer cette tâche et ses sous-tâches ?"
      );

    if (!confirmed) {
      return;
    }

    onDeleteTask(task.id);
    onClose?.();
  }

  function handleCreateSubtaskFromModal(
    subtaskData
  ) {
    if (
      !canCreateSubtask ||
      !onCreateSubtask
    ) {
      return;
    }

    onCreateSubtask(
      task.id,
      subtaskData.title,
      subtaskData.assignments
    );
  }

  /* =======================================================
     MODAL
  ======================================================= */

  const modal = (
    <div
      className="task-details-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <section
        className="task-details-modal"
        role="dialog"
        aria-modal="true"
      >
        {/* ===============================================
            HEADER
        =============================================== */}

        <header className="task-details-header">
          <div className="task-details-heading">
            <span className="task-details-main-icon">
              <TaskIcon />
            </span>

            <div>
              <span className="task-details-eyebrow">
                Détail de la tâche
              </span>

              {!isEditing ? (
                <h2>
                  {task.title}
                </h2>
              ) : (
                <input
                  className="task-details-title-input"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                />
              )}
            </div>
          </div>

          <div className="task-details-header-right">
            <span
              className={`task-details-status status-${String(
                task.status ?? ""
              ).toLowerCase()}`}
            >
              <i />

              {STATUS_LABEL[
                task.status
              ] ?? task.status}
            </span>

            <button
              type="button"
              className="task-details-close"
              onClick={onClose}
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        {/* ===============================================
            CONTENT
        =============================================== */}

        <div className="task-details-scroll">
          <div className="task-details-grid">
            {/* =============================================
                MAIN COLUMN
            ============================================= */}

            <div className="task-details-main">
              <section className="task-details-card">
                <div className="task-details-card-title">
                  <span>
                    Description
                  </span>

                  <h3>
                    Informations principales
                  </h3>
                </div>

                {!isEditing ? (
                  <p className="task-details-description">
                    {task.description ||
                      "Aucune description n’a été renseignée pour cette tâche."}
                  </p>
                ) : (
                  <>
                    <textarea
                      className="task-details-description-input"
                      value={description}
                      onChange={(event) =>
                        setDescription(
                          event.target.value
                        )
                      }
                    />

                    <div className="task-details-edit-buttons">
                      <button
                        type="button"
                        className="task-details-primary-button"
                        onClick={
                          handleSave
                        }
                      >
                        Enregistrer
                      </button>

                      <button
                        type="button"
                        className="task-details-secondary-button"
                        onClick={() =>
                          setIsEditing(
                            false
                          )
                        }
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                )}
              </section>

              {/* ===========================================
                  SUBTASKS
              =========================================== */}

              <section className="task-details-card">
                <div className="task-details-card-head">
                  <div className="task-details-card-title">
                    <span>
                      Organisation
                    </span>

                    <h3>
                      Sous-tâches
                    </h3>
                  </div>

                  <span className="task-details-counter">
                    {subtasks.length}
                  </span>
                </div>

                {canCreateSubtask ? (
                  <SubtaskList
                    subtasks={subtasks}
                    users={users}
                    currentUser={
                      currentUser
                    }
                    onCreateSubtask={
                      handleCreateSubtaskFromModal
                    }
                  />
                ) : subtasks.length >
                  0 ? (
                  <div className="task-details-readonly-list">
                    {subtasks.map(
                      (subtask) => (
                        <div
                          className="task-details-readonly-item"
                          key={
                            subtask.id
                          }
                        >
                          <div>
                            <strong>
                              {
                                subtask.title
                              }
                            </strong>

                            <span>
                              {STATUS_LABEL[
                                subtask.status
                              ] ??
                                subtask.status}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="task-details-empty">
                    Aucune sous-tâche pour le moment.
                  </div>
                )}
              </section>

              {/* ===========================================
                  HISTORY
              =========================================== */}

              {taskActions.length >
                0 && (
                <section className="task-details-card">
                  <div className="task-details-card-head">
                    <div className="task-details-card-title">
                      <span>
                        Activité
                      </span>

                      <h3>
                        Historique
                      </h3>
                    </div>

                    <span className="task-details-counter">
                      {
                        taskActions.length
                      }
                    </span>
                  </div>

                  <HistoryTimeline
                    actions={
                      taskActions
                    }
                  />
                </section>
              )}
            </div>

            {/* =============================================
                SIDE COLUMN
            ============================================= */}

            <aside className="task-details-aside">
              <section className="task-details-information">
                <h3>
                  Informations
                </h3>

                <div className="task-details-info-item">
                  <span className="task-details-info-icon">
                    <UserIcon />
                  </span>

                  <div>
                    <small>
                      Assigné à
                    </small>

                    <strong>
                      {assignedNames ||
                        "Non assignée"}
                    </strong>
                  </div>
                </div>

                <div className="task-details-info-item">
                  <span className="task-details-info-icon">
                    <FolderIcon />
                  </span>

                  <div>
                    <small>
                      Projet
                    </small>

                    <strong>
                      {project?.name ??
                        project?.title ??
                        "Non défini"}
                    </strong>
                  </div>
                </div>

                <div className="task-details-info-item">
                  <span className="task-details-info-icon">
                    <CalendarIcon />
                  </span>

                  <div>
                    <small>
                      Échéance
                    </small>

                    <strong>
                      {formatDate(
                        task.dueDate ??
                          task.deadline
                      )}
                    </strong>
                  </div>
                </div>

                <div className="task-details-info-item">
                  <span className="task-details-info-icon">
                    <FlagIcon />
                  </span>

                  <div>
                    <small>
                      Priorité
                    </small>

                    <strong>
                      {getPriorityLabel(
                        task.priority
                      )}
                    </strong>
                  </div>
                </div>
              </section>

              {isSimpleMember && (
                <section className="task-details-member-box">
                  <span>
                    Votre tâche
                  </span>

                  <strong>
                    Vous êtes assigné à cette tâche
                  </strong>

                  <p>
                    Modifiez son statut depuis
                    « Mes tâches » ou créez des
                    sous-tâches pour organiser
                    votre travail.
                  </p>
                </section>
              )}

              {canEditMainTask && (
                <div className="task-details-admin-buttons">
                  <button
                    type="button"
                    className="task-details-secondary-button"
                    onClick={() =>
                      setIsEditing(true)
                    }
                  >
                    Modifier
                  </button>

                  <button
                    type="button"
                    className="task-details-danger-button"
                    onClick={
                      handleDelete
                    }
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </div>
  );

  /*
   * IMPORTANT :
   * Le modal sort complètement
   * du MemberLayout.
   *
   * La sidebar et le header ne
   * peuvent donc plus passer devant.
   */
  return createPortal(
    modal,
    document.body
  );
}

export default TaskModal;
