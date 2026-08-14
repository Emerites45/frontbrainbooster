import { useMemo, useState } from "react";
import "./SubtaskList.css";

/* =========================================================
   DÉPARTEMENTS
========================================================= */

/**
 * Retourne tous les IDs de départements
 * associés à un utilisateur.
 *
 * On accepte plusieurs structures possibles
 * car la forme exacte peut dépendre de l'API.
 */
function getDepartmentIds(user) {
  if (!user) {
    return [];
  }

  const departmentIds = [];

  /* Cas :
     user.departmentId
  */
  if (
    user.departmentId !== undefined &&
    user.departmentId !== null
  ) {
    departmentIds.push(
      user.departmentId
    );
  }

  /* Cas :
     user.department.id
  */
  if (
    user.department?.id !== undefined &&
    user.department?.id !== null
  ) {
    departmentIds.push(
      user.department.id
    );
  }

  /* Cas :
     user.departmentRoles[]
  */
  if (
    Array.isArray(
      user.departmentRoles
    )
  ) {
    user.departmentRoles.forEach(
      (departmentRole) => {
        const departmentId =
          departmentRole?.departmentId ??
          departmentRole?.department?.id;

        if (
          departmentId !== undefined &&
          departmentId !== null
        ) {
          departmentIds.push(
            departmentId
          );
        }
      }
    );
  }

  /*
   * On transforme en String
   * pour éviter les problèmes :
   *
   * 5 !== "5"
   */
  return [
    ...new Set(
      departmentIds.map(String)
    ),
  ];
}

/* =========================================================
   RÔLES
========================================================= */

function isAdmin(user) {
  if (!user) {
    return false;
  }

  return (
    Array.isArray(
      user.globalRoles
    ) &&
    user.globalRoles.includes(
      "ADMIN"
    )
  );
}

function isScrumMaster(user) {
  if (!user) {
    return false;
  }

  return (
    Array.isArray(
      user.departmentRoles
    ) &&
    user.departmentRoles.some(
      (departmentRole) =>
        departmentRole?.role ===
        "SCRUM_MASTER"
    )
  );
}

/**
 * Un simple MEMBER :
 *
 * - n'est pas ADMIN
 * - n'est pas SCRUM_MASTER
 */
function isSimpleMember(user) {
  if (!user) {
    return false;
  }

  return (
    !isAdmin(user) &&
    !isScrumMaster(user)
  );
}

/* =========================================================
   COMPARAISON DÉPARTEMENTS
========================================================= */

/**
 * Vérifie si deux utilisateurs partagent
 * au moins un département.
 */
function shareSameDepartment(
  userA,
  userB
) {
  const departmentsA =
    getDepartmentIds(userA);

  const departmentsB =
    getDepartmentIds(userB);

  if (
    departmentsA.length === 0 ||
    departmentsB.length === 0
  ) {
    return false;
  }

  return departmentsA.some(
    (departmentId) =>
      departmentsB.includes(
        departmentId
      )
  );
}

/* =========================================================
   AFFICHAGE UTILISATEUR
========================================================= */

function getUserName(user) {
  if (!user) {
    return "Utilisateur";
  }

  const fullName =
    `${user.firstName ?? ""} ${
      user.lastName ?? ""
    }`.trim();

  return (
    fullName ||
    user.name ||
    user.email ||
    "Utilisateur"
  );
}

/* =========================================================
   COMPOSANT
========================================================= */

function SubtaskList({
  subtasks = [],
  users = [],
  currentUser,
  onCreateSubtask,
}) {
  const [title, setTitle] =
    useState("");

  const [
    assigneeId,
    setAssigneeId,
  ] = useState("");

  const [error, setError] =
    useState("");

  /* =======================================================
     RÔLE DE L'UTILISATEUR CONNECTÉ
  ======================================================= */

  const currentUserIsAdmin =
    isAdmin(currentUser);

  const currentUserIsScrumMaster =
    isScrumMaster(currentUser);

  const currentUserIsMember =
    isSimpleMember(currentUser);

  /* =======================================================
     UTILISATEURS AUTORISÉS
  ======================================================= */

  const allowedMembers =
    useMemo(() => {
      if (!currentUser) {
        return [];
      }

      /*
       * ===================================================
       * ADMIN
       * ===================================================
       *
       * On ne lui applique pas les restrictions MEMBER.
       *
       * Il conserve l'accès aux utilisateurs existants.
       */
      if (currentUserIsAdmin) {
        return users.filter(
          (user) => user?.id != null
        );
      }

      /*
       * ===================================================
       * SCRUM MASTER
       * ===================================================
       *
       * On ne lui applique pas non plus
       * les restrictions du MEMBER.
       *
       * On conserve ici les utilisateurs
       * disponibles pour ne pas casser le
       * fonctionnement existant.
       */
      if (
        currentUserIsScrumMaster
      ) {
        return users.filter(
          (user) => user?.id != null
        );
      }

      /*
       * ===================================================
       * MEMBER
       * ===================================================
       *
       * Le membre peut uniquement attribuer
       * une sous-tâche :
       *
       * - à lui-même
       * - à un MEMBER de son département
       *
       * INTERDIT :
       *
       * - ADMIN
       * - SCRUM_MASTER
       * - autre département
       */
      return users.filter(
        (user) => {
          if (
            user?.id === undefined ||
            user?.id === null
          ) {
            return false;
          }

          const isCurrentUser =
            String(user.id) ===
            String(
              currentUser.id
            );

          /*
           * Le MEMBER peut toujours
           * sélectionner son propre compte
           * s'il apparaît dans users.
           */
          if (isCurrentUser) {
            return true;
          }

          /*
           * On retire Admin et Scrum Master.
           */
          if (
            !isSimpleMember(user)
          ) {
            return false;
          }

          /*
           * Il doit appartenir au même
           * département.
           */
          return shareSameDepartment(
            currentUser,
            user
          );
        }
      );
    }, [
      users,
      currentUser,
      currentUserIsAdmin,
      currentUserIsScrumMaster,
    ]);

  /* =======================================================
     AUTRES UTILISATEURS

     "Moi-même" est affiché séparément.
  ======================================================= */

  const otherAllowedUsers =
    useMemo(
      () =>
        allowedMembers.filter(
          (user) =>
            String(user.id) !==
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

  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const trimmedTitle =
      title.trim();

    /* ---------------------------------
       Titre obligatoire
    --------------------------------- */

    if (!trimmedTitle) {
      setError(
        "Veuillez renseigner le titre de la sous-tâche."
      );

      return;
    }

    /* ---------------------------------
       Utilisateur connecté obligatoire
    --------------------------------- */

    if (!currentUser?.id) {
      setError(
        "Impossible d'identifier l'utilisateur connecté."
      );

      return;
    }

    /*
     * Si aucune personne n'est sélectionnée,
     * la sous-tâche est assignée
     * automatiquement à l'utilisateur connecté.
     */
    const selectedUserId =
      assigneeId ||
      currentUser.id;

    /* =====================================================
       CONTRÔLE PERMISSIONS MEMBER
    ===================================================== */

    if (currentUserIsMember) {
      /*
       * Le MEMBER peut toujours
       * s'assigner à lui-même.
       */
      const assigningToSelf =
        String(
          selectedUserId
        ) ===
        String(
          currentUser.id
        );

      /*
       * Sinon, l'utilisateur doit être
       * présent dans allowedMembers.
       */
      const selectedUserIsAllowed =
        allowedMembers.some(
          (user) =>
            String(user.id) ===
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
       CONTRÔLE ADMIN / SCRUM
    ===================================================== */

    if (
      !currentUserIsMember &&
      String(selectedUserId) !==
        String(currentUser.id)
    ) {
      const selectedUserExists =
        allowedMembers.some(
          (user) =>
            String(user.id) ===
            String(
              selectedUserId
            )
        );

      if (!selectedUserExists) {
        setError(
          "L'utilisateur sélectionné n'est pas disponible."
        );

        return;
      }
    }

    /* =====================================================
       DONNÉES DE LA SOUS-TÂCHE
    ===================================================== */

    const subtaskData = {
      title: trimmedTitle,

      status: "A_FAIRE",

      assignments: [
        {
          /*
           * IMPORTANT :
           * on ne fait pas Number(...)
           * afin de conserver le vrai type
           * d'identifiant du backend.
           */
          userId:
            selectedUserId,

          assignedBy:
            currentUser.id,

          assignedAt:
            new Date().toISOString(),
        },
      ],
    };

    /*
     * TaskModal adaptera ensuite cet objet
     * vers :
     *
     * handleCreateSubtask(
     *   task.id,
     *   title,
     *   assignments
     * )
     */
    onCreateSubtask?.(
      subtaskData
    );

    /*
     * Réinitialisation du formulaire.
     */
    setTitle("");
    setAssigneeId("");
    setError("");
  }

  /* =========================================================
     AFFICHAGE
  ========================================================= */

  return (
    <div className="subtask-list">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="subtask-list-header">
        <h3>Sous-tâches</h3>

        <span>
          {subtasks.length}
        </span>
      </div>

      {/* =====================================================
          LISTE DES SOUS-TÂCHES
      ===================================================== */}

      {subtasks.length === 0 ? (
        <p className="subtask-empty">
          Aucune sous-tâche pour le moment.
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

      {/* =====================================================
          FORMULAIRE
      ===================================================== */}

      <form
        className="subtask-create-form"
        onSubmit={
          handleSubmit
        }
      >
        <h4>
          Ajouter une sous-tâche
        </h4>

        {/* ===============================
            TITRE
        =============================== */}

        <div className="subtask-form-group">
          <label htmlFor="subtask-title">
            Titre
          </label>

          <input
            id="subtask-title"
            type="text"
            value={title}
            onChange={(
              event
            ) => {
              setTitle(
                event.target.value
              );

              if (error) {
                setError("");
              }
            }}
            placeholder="Ex : Vérifier les données"
            required
          />
        </div>

        {/* ===============================
            ASSIGNATION
        =============================== */}

        <div className="subtask-form-group">
          <label htmlFor="subtask-assignee">
            Assigné à
          </label>

          <select
            id="subtask-assignee"
            value={assigneeId}
            onChange={(
              event
            ) => {
              setAssigneeId(
                event.target.value
              );

              if (error) {
                setError("");
              }
            }}
          >
            <option value="">
              Moi-même
            </option>

            {otherAllowedUsers.map(
              (user) => (
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

          {/* =============================
              INFORMATION MEMBER
          ============================= */}

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

        {/* ===============================
            ERREUR
        =============================== */}

        {error && (
          <p className="subtask-form-error">
            {error}
          </p>
        )}

        {/* ===============================
            BOUTON
        =============================== */}

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