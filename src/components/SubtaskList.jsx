import {
  useMemo,
  useState,
} from "react";

import "./SubtaskList.css";

/* =========================================================
   DÉPARTEMENTS
========================================================= */

function getDepartmentIds(
  user
) {
  if (!user) {
    return [];
  }

  const departmentIds =
    [];

  if (
    Array.isArray(
      user.departmentRoles
    )
  ) {
    user.departmentRoles.forEach(
      (
        departmentRole
      ) => {
        const departmentId =
          departmentRole
            ?.departmentId;

        if (
          departmentId !==
            undefined &&
          departmentId !==
            null
        ) {
          departmentIds.push(
            departmentId
          );
        }
      }
    );
  }

  return [
    ...new Set(
      departmentIds.map(
        String
      )
    ),
  ];
}

/* =========================================================
   RÔLES
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
        departmentRole
          ?.role ===
        "SCRUM_MASTER"
    )
  );
}

function isSimpleMember(
  user
) {
  if (
    !user
  ) {
    return false;
  }

  return (
    !isAdmin(
      user
    ) &&
    !isScrumMaster(
      user
    )
  );
}

/* =========================================================
   MÊME DÉPARTEMENT
========================================================= */

function shareSameDepartment(
  userA,
  userB
) {
  const departmentsA =
    getDepartmentIds(
      userA
    );

  const departmentsB =
    getDepartmentIds(
      userB
    );

  if (
    departmentsA.length ===
      0 ||
    departmentsB.length ===
      0
  ) {
    return false;
  }

  return departmentsA.some(
    (
      departmentId
    ) =>
      departmentsB.includes(
        departmentId
      )
  );
}

/* =========================================================
   NOM UTILISATEUR
========================================================= */

function getUserName(
  user
) {
  if (
    !user
  ) {
    return "Utilisateur";
  }

  const fullName =
    `${user.firstName ?? ""} ${
      user.lastName ?? ""
    }`.trim();

  return (
    fullName ||
    user.email ||
    "Utilisateur"
  );
}

/* =========================================================
   SUBTASK LIST
========================================================= */

function SubtaskList({
  subtasks = [],
  users = [],
  currentUser,
  onCreateSubtask,
}) {
  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    assigneeId,
    setAssigneeId,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  /* =======================================================
     RÔLE UTILISATEUR
  ======================================================= */

  const currentUserIsAdmin =
    isAdmin(
      currentUser
    );

  const currentUserIsScrumMaster =
    isScrumMaster(
      currentUser
    );

  const currentUserIsMember =
    isSimpleMember(
      currentUser
    );

  /* =======================================================
     MEMBRES AUTORISÉS
  ======================================================= */

  const allowedMembers =
    useMemo(
      () => {
        if (
          !currentUser
        ) {
          return [];
        }

        /*
         * ADMIN :
         * conserve les utilisateurs
         * disponibles.
         */
        if (
          currentUserIsAdmin
        ) {
          return users.filter(
            (
              user
            ) =>
              user?.id !==
                undefined &&
              user?.id !==
                null
          );
        }

        /*
         * SCRUM MASTER :
         * conserve le fonctionnement
         * existant.
         */
        if (
          currentUserIsScrumMaster
        ) {
          return users.filter(
            (
              user
            ) =>
              user?.id !==
                undefined &&
              user?.id !==
                null
          );
        }

        /*
         * MEMBER :
         *
         * - lui-même
         * - autre MEMBER
         * - même département
         */
        return users.filter(
          (
            user
          ) => {
            if (
              user?.id ===
                undefined ||
              user?.id ===
                null
            ) {
              return false;
            }

            const isCurrentUser =
              String(
                user.id
              ) ===
              String(
                currentUser.id
              );

            if (
              isCurrentUser
            ) {
              return true;
            }

            if (
              !isSimpleMember(
                user
              )
            ) {
              return false;
            }

            return shareSameDepartment(
              currentUser,
              user
            );
          }
        );
      },
      [
        users,
        currentUser,
        currentUserIsAdmin,
        currentUserIsScrumMaster,
      ]
    );

  /* =======================================================
     AUTRES UTILISATEURS
  ======================================================= */

  const otherAllowedUsers =
    useMemo(
      () =>
        allowedMembers.filter(
          (
            user
          ) =>
            String(
              user.id
            ) !==
            String(
              currentUser?.id
            )
        ),
      [
        allowedMembers,
        currentUser,
      ]
    );

  /* =======================================================
     CRÉATION
  ======================================================= */

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    const trimmedTitle =
      title.trim();

    if (
      !trimmedTitle
    ) {
      setError(
        "Veuillez renseigner le titre de la sous-tâche."
      );

      return;
    }

    if (
      currentUser?.id ===
        undefined ||
      currentUser?.id ===
        null
    ) {
      setError(
        "Impossible d'identifier l'utilisateur connecté."
      );

      return;
    }

    /*
     * Si aucun utilisateur n'est
     * sélectionné :
     *
     * assignation à soi-même.
     */
    const selectedUserId =
      assigneeId ||
      currentUser.id;

    /* =====================================================
       CONTRÔLE MEMBER
    ===================================================== */

    if (
      currentUserIsMember
    ) {
      const assigningToSelf =
        String(
          selectedUserId
        ) ===
        String(
          currentUser.id
        );

      const selectedUserIsAllowed =
        allowedMembers.some(
          (
            user
          ) =>
            String(
              user.id
            ) ===
            String(
              selectedUserId
            )
        );

      if (
        !assigningToSelf &&
        !selectedUserIsAllowed
      ) {
        setError(
          "Vous ne pouvez attribuer cette sous-tâche qu'à vous-même ou à un membre de votre département."
        );

        return;
      }
    }

    /* =====================================================
       CONTRÔLE ADMIN / SCRUM MASTER
    ===================================================== */

    if (
      !currentUserIsMember &&
      String(
        selectedUserId
      ) !==
        String(
          currentUser.id
        )
    ) {
      const selectedUserExists =
        allowedMembers.some(
          (
            user
          ) =>
            String(
              user.id
            ) ===
            String(
              selectedUserId
            )
        );

      if (
        !selectedUserExists
      ) {
        setError(
          "L'utilisateur sélectionné n'est pas disponible."
        );

        return;
      }
    }

    /* =====================================================
       DONNÉES SOUS-TÂCHE
    ===================================================== */

    const subtaskData =
      {
        title:
          trimmedTitle,

        status:
          "A_FAIRE",

        /*
         * IMPORTANT :
         *
         * Le frontend ne génère plus
         * assignedAt.
         *
         * Le backend le fera lors de :
         *
         * POST
         * /api/v1/tasks/{id}/assignees
         */
        assignments: [
          {
            userId:
              selectedUserId,

            assignedBy:
              currentUser.id,
          },
        ],
      };

    onCreateSubtask?.(
      subtaskData
    );

    /* =====================================================
       RESET
    ===================================================== */

    setTitle("");
    setAssigneeId("");
    setError("");
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="subtask-list">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="subtask-list-header">
        <h3>
          Sous-tâches
        </h3>

        <span>
          {
            subtasks.length
          }
        </span>
      </div>

      {/* =================================================
          LISTE
      ================================================= */}

      {subtasks.length ===
      0 ? (
        <p className="subtask-empty">
          Aucune sous-tâche pour le moment.
        </p>
      ) : (
        <div className="subtask-items">
          {subtasks.map(
            (
              subtask
            ) => (
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
                    {subtask.status ===
                    "A_FAIRE"
                      ? "À faire"
                      : subtask.status ===
                        "EN_COURS"
                      ? "En cours"
                      : subtask.status ===
                        "TERMINE"
                      ? "Terminée"
                      : subtask.status}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* =================================================
          FORMULAIRE
      ================================================= */}

      <form
        className="subtask-create-form"
        onSubmit={
          handleSubmit
        }
      >

        <h4>
          Ajouter une sous-tâche
        </h4>

        {/* =================================================
            TITRE
        ================================================= */}

        <div className="subtask-form-group">
          <label htmlFor="subtask-title">
            Titre
          </label>

          <input
            id="subtask-title"
            type="text"
            value={
              title
            }
            onChange={(
              event
            ) => {
              setTitle(
                event.target.value
              );

              if (
                error
              ) {
                setError("");
              }
            }}
            placeholder="Ex : Vérifier les données"
            required
          />
        </div>

        {/* =================================================
            ASSIGNATION
        ================================================= */}

        <div className="subtask-form-group">

          <label htmlFor="subtask-assignee">
            Assigné à
          </label>

          <select
            id="subtask-assignee"
            value={
              assigneeId
            }
            onChange={(
              event
            ) => {
              setAssigneeId(
                event.target.value
              );

              if (
                error
              ) {
                setError("");
              }
            }}
          >

            <option value="">
              Moi-même
            </option>

            {otherAllowedUsers.map(
              (
                user
              ) => (
                <option
                  key={
                    user.id
                  }
                  value={
                    user.id
                  }
                >
                  {
                    getUserName(
                      user
                    )
                  }
                </option>
              )
            )}

          </select>

          {currentUserIsMember &&
            otherAllowedUsers.length ===
              0 && (
              <small className="subtask-member-info">
                Aucun autre membre de
                votre département n'est
                disponible.
              </small>
            )}
        </div>

        {/* =================================================
            ERREUR
        ================================================= */}

        {error && (
          <p className="subtask-form-error">
            {
              error
            }
          </p>
        )}

        {/* =================================================
            BOUTON
        ================================================= */}

        <button
          type="submit"
          className="subtask-create-button"
        >
          + Ajouter la sous-tâche
        </button>
      </form>
    </div>
  );
}

export default SubtaskList;