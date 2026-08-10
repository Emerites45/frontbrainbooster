import { useState } from "react";

import SubtaskList from "./SubtaskList";
import HistoryTimeline from "./HistoryTimeline";

import {
  getAssigneeIds,
  getAssigneeNames,
  STATUS_LABEL,
} from "../utils/dashboardHelpers";

import "../pages/AdminDashboard.css";
import "../pages/Board.css";

function TaskModal({
  task,
  allTasks = [],
  users = [],
  currentUser,
  actions = [],
  onClose,
  onCreateSubtask,
  onEditTask,
  onDeleteTask,
}) {
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(
    task?.title ?? ""
  );

  const [description, setDescription] =
    useState(task?.description ?? "");

  if (!task) {
    return null;
  }

  /* =========================================================
     RÔLES
  ========================================================= */

  const isAdmin =
    currentUser?.globalRoles?.includes(
      "ADMIN"
    );

  const isScrumMaster =
    currentUser?.departmentRoles?.some(
      (departmentRole) =>
        departmentRole?.role ===
        "SCRUM_MASTER"
    );

  const isSimpleMember =
    !isAdmin && !isScrumMaster;

  /* =========================================================
     TÂCHE ASSIGNÉE AU MEMBER ?
  ========================================================= */

  const assigneeIds =
    getAssigneeIds(task);

  const isAssignedToCurrentUser =
    assigneeIds.some(
      (userId) =>
        String(userId) ===
        String(currentUser?.id)
    );

  /*
   * Admin et Scrum Master gardent
   * leurs droits actuels.
   *
   * Un MEMBER ne peut pas modifier
   * ou supprimer la tâche principale.
   */
  const canEditMainTask =
    isAdmin || isScrumMaster;

  const canDeleteMainTask =
    isAdmin || isScrumMaster;

  /*
   * Un simple MEMBER ne peut créer
   * une sous-tâche que si la tâche
   * principale lui est assignée.
   *
   * Admin / Scrum conservent leur
   * fonctionnement existant.
   */
  const canCreateSubtask =
    isAdmin ||
    isScrumMaster ||
    (isSimpleMember &&
      isAssignedToCurrentUser);

  /* =========================================================
     SOUS-TÂCHES
  ========================================================= */

  const subtasks =
    allTasks.filter(
      (currentTask) =>
        String(
          currentTask.parentTaskId
        ) === String(task.id)
    );

  /* =========================================================
     HISTORIQUE
  ========================================================= */

  const taskActions =
    actions.filter(
      (action) =>
        String(action.id_tache) ===
        String(task.id)
    );

  /* =========================================================
     MODIFICATION
  ========================================================= */

  function handleSave() {
    if (!canEditMainTask) {
      console.error(
        "Vous n'avez pas l'autorisation de modifier cette tâche."
      );

      return;
    }

    if (!onEditTask) {
      return;
    }

    onEditTask(task.id, {
      title,
      description,
    });

    setIsEditing(false);
  }

  /* =========================================================
     SUPPRESSION
  ========================================================= */

  function handleDelete() {
    if (!canDeleteMainTask) {
      console.error(
        "Vous n'avez pas l'autorisation de supprimer cette tâche."
      );

      return;
    }

    if (!onDeleteTask) {
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

  /* =========================================================
     CRÉATION SOUS-TÂCHE
  ========================================================= */

  function handleCreateSubtaskFromModal(
    subtaskData
  ) {
    if (!canCreateSubtask) {
      console.error(
        "Vous ne pouvez pas créer de sous-tâche pour cette tâche."
      );

      return;
    }

    if (!onCreateSubtask) {
      console.error(
        "La fonction de création de sous-tâche n'est pas disponible."
      );

      return;
    }

    /*
     * SubtaskList nous renvoie :
     *
     * {
     *   title,
     *   status,
     *   assignments
     * }
     *
     * Mais App.jsx attend :
     *
     * handleCreateSubtask(
     *   parentTaskId,
     *   title,
     *   assignments
     * )
     *
     * On fait donc l'adaptation ici.
     */
    onCreateSubtask(
      task.id,
      subtaskData.title,
      subtaskData.assignments
    );
  }

  /* =========================================================
     FERMETURE MODAL
  ========================================================= */

  function handleOverlayClick() {
    onClose?.();
  }

  function handleModalClick(event) {
    event.stopPropagation();
  }

  /* =========================================================
     AFFICHAGE
  ========================================================= */

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="modal-content"
        onClick={handleModalClick}
      >
        {/* =========================
            FERMETURE
        ========================= */}

        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          Fermer
        </button>

        {/* =========================
            MODIFICATION ADMIN /
            SCRUM MASTER
        ========================= */}

        {isEditing &&
        canEditMainTask ? (
          <>
            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
            />

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
            />

            <div className="task-detail-actions">
              <button
                type="button"
                className="btn-primary-sm"
                onClick={handleSave}
              >
                Enregistrer
              </button>

              <button
                type="button"
                className="btn-status"
                onClick={() =>
                  setIsEditing(false)
                }
              >
                Annuler
              </button>
            </div>
          </>
        ) : (
          <>
            {/* =========================
                INFORMATIONS TÂCHE
            ========================= */}

            <h2>{task.title}</h2>

            <span
              className={`status-pill status-${task.status?.toLowerCase()}`}
            >
              {STATUS_LABEL[
                task.status
              ] ?? task.status}
            </span>

            <p>
              {task.description ||
                "Aucune description."}
            </p>

            <p className="task-detail-meta">
              👤 Assigné(s) :{" "}
              {getAssigneeNames(
                assigneeIds,
                users
              )}
            </p>

            {/* =========================
                ADMIN / SCRUM MASTER
            ========================= */}

            {canEditMainTask && (
              <div className="task-detail-actions">
                <button
                  type="button"
                  className="btn-status"
                  onClick={() =>
                    setIsEditing(true)
                  }
                >
                  Modifier
                </button>

                <button
                  type="button"
                  className="btn-status"
                  onClick={handleDelete}
                >
                  Supprimer
                </button>
              </div>
            )}

            {/* =========================
                MESSAGE MEMBER
            ========================= */}

            {isSimpleMember && (
              <p className="task-member-info">
                Cette tâche vous a été
                assignée. Vous pouvez
                modifier son statut depuis
                la page « Mes tâches » et
                créer des sous-tâches pour
                organiser votre travail.
              </p>
            )}
          </>
        )}

        {/* =============================
            SOUS-TÂCHES
        ============================= */}

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
        ) : (
          <>
            <h3>Sous-tâches</h3>

            {subtasks.length === 0 ? (
              <p>
                Aucune sous-tâche.
              </p>
            ) : (
              <div className="subtask-items">
                {subtasks.map(
                  (subtask) => (
                    <div
                      key={
                        subtask.id
                      }
                      className="subtask-item"
                    >
                      <div>
                        <strong>
                          {
                            subtask.title
                          }
                        </strong>

                        <span>
                          {STATUS_LABEL[
                            subtask
                              .status
                          ] ??
                            subtask.status}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}

        {/* =============================
            HISTORIQUE INTERNE
        ============================= */}

        {taskActions.length >
          0 && (
          <>
            <h3>Historique</h3>

            <HistoryTimeline
              actions={
                taskActions
              }
            />
          </>
        )}
      </div>
    </div>
  );
}

export default TaskModal;