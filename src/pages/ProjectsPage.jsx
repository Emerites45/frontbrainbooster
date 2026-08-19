import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchDepartments,
} from "../api/api";

import "./ProjectsPage.css";

/* =========================================================
   STATUS
========================================================= */

const STATUS_OPTIONS = [
  {
    value: "A_FAIRE",
    label: "À faire",
  },
  {
    value: "EN_COURS",
    label: "En cours",
  },
  {
    value: "TERMINE",
    label: "Terminé",
  },
];

function getStatusLabel(status) {
  return (
    STATUS_OPTIONS.find(
      (item) =>
        item.value === status
    )?.label ??
    status ??
    "Non défini"
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
    .format(date)
    .replace(".", "");
}

/* =========================================================
   PROJECTS PAGE
========================================================= */

function ProjectsPage({
  projects = [],
  onCreateProject,
  onSelectProject,
  currentUser,
}) {
  const [
    showForm,
    setShowForm,
  ] =
    useState(false);

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    departmentId,
    setDepartmentId,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState("A_FAIRE");

  const [
    startDate,
    setStartDate,
  ] =
    useState("");

  const [
    endDate,
    setEndDate,
  ] =
    useState("");

  const [
    departments,
    setDepartments,
  ] =
    useState([]);

  const [
    departmentsLoading,
    setDepartmentsLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  /* =======================================================
     RÔLES
  ======================================================= */

  const isAdmin =
    currentUser
      ?.globalRoles
      ?.includes(
        "ADMIN"
      );

  const scrumMasterRoles =
    useMemo(
      () => {
        if (
          !Array.isArray(
            currentUser?.departmentRoles
          )
        ) {
          return [];
        }

        return currentUser.departmentRoles.filter(
          (role) =>
            role?.role ===
              "SCRUM_MASTER" &&
            role?.departmentId !==
              undefined &&
            role?.departmentId !==
              null
        );
      },
      [currentUser]
    );

  const isScrumMaster =
    scrumMasterRoles.length >
    0;

  const canCreateProject =
    !!currentUser &&
    (isAdmin ||
      isScrumMaster);

  /* =======================================================
     CHARGEMENT DES DÉPARTEMENTS POUR ADMIN
  ======================================================= */

  useEffect(
    () => {
      if (!isAdmin) {
        setDepartments([]);
        return;
      }

      let cancelled =
        false;

      async function loadDepartments() {
        setDepartmentsLoading(
          true
        );

        try {
          const data =
            await fetchDepartments();

          if (
            cancelled
          ) {
            return;
          }

          setDepartments(
            Array.isArray(
              data
            )
              ? data
              : []
          );
        } catch (err) {
          if (
            cancelled
          ) {
            return;
          }

          console.error(
            "Erreur chargement départements :",
            err
          );

          setDepartments([]);
        } finally {
          if (
            !cancelled
          ) {
            setDepartmentsLoading(
              false
            );
          }
        }
      }

      loadDepartments();

      return () => {
        cancelled =
          true;
      };
    },
    [isAdmin]
  );

  /* =======================================================
     DÉPARTEMENTS DISPONIBLES
  ======================================================= */

  const availableDepartments =
    useMemo(
      () => {
        /*
         * ADMIN :
         * tous les départements
         */
        if (isAdmin) {
          return departments
            .filter(
              (department) =>
                department?.id !==
                  undefined &&
                department?.id !==
                  null
            )
            .map(
              (department) => ({
                id:
                  department.id,

                name:
                  department.name ??
                  `Département ${department.id}`,
              })
            );
        }

        /*
         * SCRUM MASTER :
         * seulement ses départements
         * où il est Scrum Master
         */
        return scrumMasterRoles
          .map(
            (role) => ({
              id:
                role.departmentId,

              name:
                role.departmentName ??
                `Département ${role.departmentId}`,
            })
          )
          .filter(
            (
              department,
              index,
              array
            ) =>
              array.findIndex(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    department.id
                  )
              ) === index
          );
      },
      [
        isAdmin,
        departments,
        scrumMasterRoles,
      ]
    );

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    if (
      !canCreateProject
    ) {
      setError(
        "Vous n'avez pas la permission de créer un projet."
      );

      return;
    }

    const cleanName =
      name.trim();

    const cleanDescription =
      description.trim();

    if (!cleanName) {
      setError(
        "Le nom du projet est obligatoire."
      );

      return;
    }

    if (!departmentId) {
      setError(
        "Veuillez sélectionner un département."
      );

      return;
    }

    if (
      !currentUser?.id
    ) {
      setError(
        "Utilisateur courant introuvable."
      );

      return;
    }

    if (
      startDate &&
      endDate &&
      new Date(endDate) <
        new Date(startDate)
    ) {
      setError(
        "La date de fin ne peut pas être antérieure à la date de début."
      );

      return;
    }

    const projectData = {
      name:
        cleanName,

      description:
        cleanDescription,

      departmentId:
        Number(
          departmentId
        ),

      creatorId:
        currentUser.id,

      status,
    };

    /*
     * On ajoute les dates
     * seulement si elles sont saisies.
     */
    if (startDate) {
      projectData.startDate =
        startDate;
    }

    if (endDate) {
      projectData.endDate =
        endDate;
    }

    setLoading(true);

    try {
      const createdProject =
        await onCreateProject?.(
          projectData
        );

      if (
        createdProject ===
        null
      ) {
        setError(
          "Le projet n'a pas pu être créé."
        );

        return;
      }

      setName("");
      setDescription("");
      setDepartmentId("");
      setStatus(
        "A_FAIRE"
      );
      setStartDate("");
      setEndDate("");
      setShowForm(false);
    } catch (err) {
      console.error(
        "Erreur création projet :",
        err
      );

      setError(
        err?.message ??
          "Impossible de créer le projet."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="projects-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="projects-page-header">

        <div>
          <span className="projects-page-eyebrow">
            Gestion
          </span>

          <h1>
            Projets
          </h1>

          <p>
            Consultez les projets et
            gérez leur création.
          </p>
        </div>

        {canCreateProject && (
          <button
            type="button"
            className="projects-create-button"
            onClick={() =>
              setShowForm(
                (current) =>
                  !current
              )
            }
          >
            {showForm
              ? "Fermer"
              : "+ Nouveau projet"}
          </button>
        )}
      </div>

      {/* =================================================
          FORMULAIRE
      ================================================= */}

      {showForm &&
        canCreateProject && (
          <section className="projects-form-card">

            <h2>
              Créer un projet
            </h2>

            <form
              onSubmit={
                handleSubmit
              }
              className="projects-form"
            >

              <div className="projects-form-group">
                <label htmlFor="project-name">
                  Nom du projet
                </label>

                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(
                    event
                  ) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Ex. Refonte du portail"
                  required
                />
              </div>

              <div className="projects-form-group">
                <label htmlFor="project-department">
                  Département
                </label>

                <select
                  id="project-department"
                  value={
                    departmentId
                  }
                  onChange={(
                    event
                  ) =>
                    setDepartmentId(
                      event.target.value
                    )
                  }
                  required
                  disabled={
                    departmentsLoading
                  }
                >
                  <option value="">
                    {departmentsLoading
                      ? "Chargement..."
                      : "Sélectionner"}
                  </option>

                  {availableDepartments.map(
                    (department) => (
                      <option
                        key={
                          department.id
                        }
                        value={
                          department.id
                        }
                      >
                        {
                          department.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="projects-form-group">
                <label htmlFor="project-status">
                  Statut
                </label>

                <select
                  id="project-status"
                  value={status}
                  onChange={(
                    event
                  ) =>
                    setStatus(
                      event.target.value
                    )
                  }
                >
                  {STATUS_OPTIONS.map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="projects-form-group">
                <label htmlFor="project-start-date">
                  Date de début
                </label>

                <input
                  id="project-start-date"
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

              <div className="projects-form-group">
                <label htmlFor="project-end-date">
                  Date de fin
                </label>

                <input
                  id="project-end-date"
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

              <div className="projects-form-group projects-form-group-full">
                <label htmlFor="project-description">
                  Description
                </label>

                <textarea
                  id="project-description"
                  rows="4"
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
                  placeholder="Description du projet"
                />
              </div>

              {error && (
                <div className="projects-form-error">
                  {
                    error
                  }
                </div>
              )}

              <div className="projects-form-actions">

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(
                      false
                    )
                  }
                  disabled={
                    loading
                  }
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="projects-create-button"
                  disabled={
                    loading ||
                    departmentsLoading
                  }
                >
                  {loading
                    ? "Création..."
                    : "Créer le projet"}
                </button>

              </div>
            </form>
          </section>
        )}

      {/* =================================================
          LISTE DES PROJETS
      ================================================= */}

      <section className="projects-list">

        {projects.length ===
        0 ? (
          <div className="projects-empty">

            <strong>
              Aucun projet
            </strong>

            <span>
              Aucun projet n'est
              disponible pour le
              moment.
            </span>

          </div>
        ) : (
          projects.map(
            (project) => (
              <article
                key={
                  project.id
                }
                className="project-card"
                onClick={() =>
                  onSelectProject?.(
                    project
                  )
                }
              >

                <div className="project-card-top">

                  <div>
                    <span className="project-card-label">
                      Projet
                    </span>

                    <h2>
                      {
                        project.name
                      }
                    </h2>
                  </div>

                  <span
                    className={`project-status project-status-${String(
                      project.status ??
                        ""
                    ).toLowerCase()}`}
                  >
                    {getStatusLabel(
                      project.status
                    )}
                  </span>

                </div>

                <p className="project-description">
                  {project.description ||
                    "Aucune description."}
                </p>

                <div className="project-dates">

                  <div>
                    <span>
                      Début
                    </span>

                    <strong>
                      {formatDate(
                        project.startDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Fin
                    </span>

                    <strong>
                      {formatDate(
                        project.endDate
                      )}
                    </strong>
                  </div>

                </div>

              </article>
            )
          )
        )}

      </section>
    </main>
  );
}

export default ProjectsPage;