import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./TaskModal.css";

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

function getScrumMasterDepartmentIds(
  user
) {
  if (
    !Array.isArray(
      user?.departmentRoles
    )
  ) {
    return [];
  }

  return user.departmentRoles
    .filter(
      (
        departmentRole
      ) =>
        departmentRole?.role ===
        "SCRUM_MASTER"
    )
    .map(
      (
        departmentRole
      ) =>
        String(
          departmentRole.departmentId
        )
    );
}

/* =========================================================
   UTILISATEUR
========================================================= */

function getUserName(
  user
) {
  if (!user) {
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
   NEW TASK MODAL
========================================================= */

function NewTaskModal({
  users = [],
  projects = [],
  currentUser,
  onCreate,
  onClose,
}) {
  /* =======================================================
     FORMULAIRE
  ======================================================= */

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    projectId,
    setProjectId,
  ] = useState("");

  const [
    selectedAssignees,
    setSelectedAssignees,
  ] = useState([]);

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  const [
    dueDate,
    setDueDate,
  ] = useState("");

  /* =======================================================
     ÉTATS
  ======================================================= */

  const [
    error,
    setError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

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

  /* =======================================================
     PROJETS AUTORISÉS
  ======================================================= */

  const availableProjects =
    useMemo(
      () => {
        /*
         * ADMIN :
         * accès aux projets chargés.
         */
        if (
          currentUserIsAdmin
        ) {
          return projects;
        }

        /*
         * SCRUM MASTER :
         * seulement les projets des
         * départements où il est
         * Scrum Master.
         */
        if (
          currentUserIsScrumMaster
        ) {
          const departmentIds =
            getScrumMasterDepartmentIds(
              currentUser
            );

          return projects.filter(
            (
              project
            ) =>
              departmentIds.includes(
                String(
                  project.departmentId
                )
              )
          );
        }

        /*
         * MEMBER :
         * aucune création de tâche
         * principale.
         */
        return [];
      },
      [
        projects,
        currentUser,
        currentUserIsAdmin,
        currentUserIsScrumMaster,
      ]
    );

  /* =======================================================
     PROJET SÉLECTIONNÉ
  ======================================================= */

  const selectedProject =
    useMemo(
      () =>
        availableProjects.find(
          (
            project
          ) =>
            String(
              project.id
            ) ===
            String(
              projectId
            )
        ) ??
        null,
      [
        availableProjects,
        projectId,
      ]
    );

  /* =======================================================
     UTILISATEURS POUR ASSIGNATION
  ======================================================= */

  const availableUsers =
    useMemo(
      () => {
        /*
         * Tant qu'aucun projet n'est
         * sélectionné, on n'affiche
         * personne.
         */
        if (
          !selectedProject
        ) {
          return [];
        }

        /*
         * On privilégie les utilisateurs
         * appartenant au département
         * du projet.
         *
         * Cela évite de proposer par
         * erreur des membres d'un autre
         * département.
         */
        const sameDepartmentUsers =
          users.filter(
            (
              user
            ) =>
              Array.isArray(
                user?.departmentRoles
              ) &&
              user.departmentRoles.some(
                (
                  departmentRole
                ) =>
                  String(
                    departmentRole.departmentId
                  ) ===
                  String(
                    selectedProject.departmentId
                  )
              )
          );

        /*
         * Si la liste reçue du backend
         * contient bien departmentRoles,
         * on utilise le filtrage.
         */
        if (
          sameDepartmentUsers.length >
          0
        ) {
          return sameDepartmentUsers;
        }

        /*
         * Compatibilité temporaire :
         * si les utilisateurs locaux
         * ne possèdent pas encore
         * departmentRoles, on conserve
         * la liste reçue afin de ne pas
         * bloquer l'interface.
         */
        return users;
      },
      [
        users,
        selectedProject,
      ]
    );

  /* =======================================================
     RESET ASSIGNATIONS SI PROJET CHANGE
  ======================================================= */

  useEffect(
    () => {
      setSelectedAssignees(
        []
      );
    },
    [
      projectId,
    ]
  );

  /* =======================================================
     FERMETURE ESCAPE
  ======================================================= */

  useEffect(
    () => {
      function handleKeyDown(
        event
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          onClose?.();
        }
      }

      document.addEventListener(
        "keydown",
        handleKeyDown
      );

      return () => {
        document.removeEventListener(
          "keydown",
          handleKeyDown
        );
      };
    },
    [
      onClose,
    ]
  );

  /* =======================================================
     ASSIGNATIONS
  ======================================================= */

  function toggleAssignee(
    userId
  ) {
    const stringId =
      String(
        userId
      );

    setSelectedAssignees(
      (
        previous
      ) => {
        const exists =
          previous.some(
            (
              id
            ) =>
              String(
                id
              ) ===
              stringId
          );

        if (
          exists
        ) {
          return previous.filter(
            (
              id
            ) =>
              String(
                id
              ) !==
              stringId
          );
        }

        return [
          ...previous,
          userId,
        ];
      }
    );
  }

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateForm() {
    if (
      !title.trim()
    ) {
      return "Veuillez renseigner le titre de la tâche.";
    }

    if (
      !projectId
    ) {
      return "Veuillez sélectionner un projet.";
    }

    if (
      startDate &&
      endDate &&
      new Date(
        endDate
      ) <
        new Date(
          startDate
        )
    ) {
      return "La date de fin ne peut pas être antérieure à la date de début.";
    }

    if (
      startDate &&
      dueDate &&
      new Date(
        dueDate
      ) <
        new Date(
          startDate
        )
    ) {
      return "L'échéance ne peut pas être antérieure à la date de début.";
    }

    return null;
  }

  /* =======================================================
     CRÉATION
  ======================================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    const validationError =
      validateForm();

    if (
      validationError
    ) {
      setError(
        validationError
      );

      return;
    }

    if (
      !onCreate
    ) {
      setError(
        "La création de tâche n'est pas disponible."
      );

      return;
    }

    setSubmitting(
      true
    );

    try {
      /*
       * IMPORTANT :
       *
       * Aucun ID local n'est créé.
       *
       * Le backend générera l'ID.
       */
      const taskData =
        {
          title:
            title.trim(),

          description:
            description.trim(),

          status:
            "A_FAIRE",

          projectId:
            Number(
              projectId
            ),

          /*
           * App.jsx ajoutera creatorId
           * depuis currentUser.
           */

          /*
           * parentTaskId n'est pas
           * nécessaire ici car il
           * s'agit d'une tâche principale.
           */
          parentTaskId:
            null,

          /*
           * Ces champs sont uniquement
           * envoyés lorsqu'une valeur
           * existe.
           */
          ...(startDate
            ? {
                startDate,
              }
            : {}),

          ...(endDate
            ? {
                endDate,
              }
            : {}),

          ...(dueDate
            ? {
                dueDate,
              }
            : {}),

          /*
           * ATTENTION :
           *
           * App.jsx retirera ce tableau
           * avant POST /tasks.
           *
           * Il l'utilisera ensuite pour
           * faire séparément :
           *
           * POST
           * /tasks/{id}/assignees
           */
          assignments:
            selectedAssignees,
        };

      const createdTask =
        await onCreate(
          taskData
        );

      /*
       * Si App.jsx retourne null,
       * cela signifie que la création
       * n'a pas abouti.
       */
      if (
        createdTask ===
        null
      ) {
        return;
      }

      onClose?.();
    } catch (err) {
      console.error(
        "Erreur création tâche :",
        err
      );

      setError(
        err?.message ??
          "Impossible de créer la tâche."
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  /* =======================================================
     CLICK BACKDROP
  ======================================================= */

  function handleBackdropClick(
    event
  ) {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose?.();
    }
  }

  /* =======================================================
     INTERDICTION MEMBER
  ======================================================= */

  if (
    !currentUserIsAdmin &&
    !currentUserIsScrumMaster
  ) {
    return (
      <div
        className="task-modal-overlay"
        onMouseDown={
          handleBackdropClick
        }
      >
        <div className="task-modal">
          <div className="task-modal-header">
            <div>
              <h2>
                Nouvelle tâche
              </h2>

              <p>
                Création non autorisée.
              </p>
            </div>

            <button
              type="button"
              className="task-modal-close"
              onClick={
                onClose
              }
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

          <div className="task-modal-body">
            <p>
              Un membre ne peut pas créer
              une tâche principale.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="task-modal-overlay"
      onMouseDown={
        handleBackdropClick
      }
    >
      <div
        className="task-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="task-modal-header">
          <div>
            <h2>
              Nouvelle tâche
            </h2>

            <p>
              Créez une tâche et
              assignez-la aux membres
              concernés.
            </p>
          </div>

          <button
            type="button"
            className="task-modal-close"
            onClick={
              onClose
            }
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={
            handleSubmit
          }
          className="task-modal-body"
        >

          {/* =================================================
              ERREUR
          ================================================= */}

          {error && (
            <div
              role="alert"
              style={{
                color:
                  "#b42318",

                background:
                  "#fff4f2",

                border:
                  "1px solid #ffd5d2",

                borderRadius:
                  "8px",

                padding:
                  "10px 12px",

                marginBottom:
                  "16px",

                fontSize:
                  "13px",

                lineHeight:
                  1.5,
              }}
            >
              {
                error
              }
            </div>
          )}

          {/* =================================================
              TITRE
          ================================================= */}

          <div className="form-group">
            <label htmlFor="new-task-title">
              Titre de la tâche
            </label>

            <input
              id="new-task-title"
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
              placeholder="Ex : Préparer le rapport mensuel"
              required
            />
          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="form-group">
            <label htmlFor="new-task-description">
              Description
            </label>

            <textarea
              id="new-task-description"
              value={
                description
              }
              onChange={(
                event
              ) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Décrivez les éléments importants de la tâche..."
              rows="4"
            />
          </div>

          {/* =================================================
              PROJET
          ================================================= */}

          <div className="form-group">
            <label htmlFor="new-task-project">
              Projet
            </label>

            <select
              id="new-task-project"
              value={
                projectId
              }
              onChange={(
                event
              ) => {
                setProjectId(
                  event.target.value
                );

                if (
                  error
                ) {
                  setError("");
                }
              }}
              required
            >
              <option value="">
                Sélectionner un projet
              </option>

              {availableProjects.map(
                (
                  project
                ) => (
                  <option
                    key={
                      project.id
                    }
                    value={
                      project.id
                    }
                  >
                    {
                      project.name
                    }
                  </option>
                )
              )}
            </select>

            {availableProjects.length ===
              0 && (
              <small>
                Aucun projet disponible
                pour votre rôle.
              </small>
            )}
          </div>

          {/* =================================================
              DATES
          ================================================= */}

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",

              gap:
                "12px",
            }}
          >
            <div className="form-group">
              <label htmlFor="new-task-start-date">
                Date de début
              </label>

              <input
                id="new-task-start-date"
                type="date"
                value={
                  startDate
                }
                onChange={(
                  event
                ) =>
                  setStartDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-task-end-date">
                Date de fin
              </label>

              <input
                id="new-task-end-date"
                type="date"
                value={
                  endDate
                }
                onChange={(
                  event
                ) =>
                  setEndDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-task-due-date">
                Échéance
              </label>

              <input
                id="new-task-due-date"
                type="date"
                value={
                  dueDate
                }
                onChange={(
                  event
                ) =>
                  setDueDate(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          {/* =================================================
              ASSIGNATION
          ================================================= */}

          <div className="form-group">
            <label>
              Assigner la tâche
            </label>

            {!selectedProject ? (
              <p
                style={{
                  fontSize:
                    "13px",

                  margin:
                    "6px 0 0",

                  opacity:
                    0.7,
                }}
              >
                Sélectionnez d'abord un projet
                pour afficher les membres.
              </p>
            ) : availableUsers.length ===
              0 ? (
              <p
                style={{
                  fontSize:
                    "13px",

                  margin:
                    "6px 0 0",

                  opacity:
                    0.7,
                }}
              >
                Aucun utilisateur disponible.
              </p>
            ) : (
              <div
                style={{
                  display:
                    "grid",

                  gap:
                    "8px",

                  marginTop:
                    "8px",

                  maxHeight:
                    "180px",

                  overflowY:
                    "auto",
                }}
              >
                {availableUsers.map(
                  (
                    user
                  ) => {
                    const checked =
                      selectedAssignees.some(
                        (
                          id
                        ) =>
                          String(
                            id
                          ) ===
                          String(
                            user.id
                          )
                      );

                    return (
                      <label
                        key={
                          user.id
                        }
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap:
                            "10px",

                          cursor:
                            "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            checked
                          }
                          onChange={() =>
                            toggleAssignee(
                              user.id
                            )
                          }
                        />

                        <span>
                          {
                            getUserName(
                              user
                            )
                          }
                        </span>
                      </label>
                    );
                  }
                )}
              </div>
            )}

            {selectedAssignees.length >
              0 && (
              <small
                style={{
                  display:
                    "block",

                  marginTop:
                    "8px",
                }}
              >
                {
                  selectedAssignees.length
                }{" "}
                membre
                {selectedAssignees.length >
                1
                  ? "s"
                  : ""}{" "}
                sélectionné
                {selectedAssignees.length >
                1
                  ? "s"
                  : ""}
              </small>
            )}
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            className="task-modal-actions"
            style={{
              display:
                "flex",

              justifyContent:
                "flex-end",

              gap:
                "10px",

              marginTop:
                "20px",
            }}
          >
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                submitting
              }
            >
              Annuler
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={
                submitting ||
                availableProjects.length ===
                  0
              }
            >
              {submitting
                ? "Création..."
                : "Créer la tâche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewTaskModal;