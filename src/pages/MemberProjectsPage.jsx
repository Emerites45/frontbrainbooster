import {
  useMemo,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./MemberProjectsPage.css";

/* =========================================================
   DATES
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
    return value;
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
   STATUTS
========================================================= */

function getTaskStatusLabel(
  status
) {
  if (
    status === "A_FAIRE"
  ) {
    return "À faire";
  }

  if (
    status === "EN_COURS"
  ) {
    return "En cours";
  }

  if (
    status === "TERMINE"
  ) {
    return "Terminé";
  }

  if (
    status === "A_REVOIR"
  ) {
    return "À revoir";
  }

  return status ?? "—";
}

function getProjectStatusLabel(
  status
) {
  if (!status) {
    return "Actif";
  }

  const normalized =
    String(status).toUpperCase();

  if (
    normalized === "EN_COURS" ||
    normalized === "IN_PROGRESS"
  ) {
    return "En cours";
  }

  if (
    normalized === "TERMINE" ||
    normalized === "COMPLETED" ||
    normalized === "DONE"
  ) {
    return "Terminé";
  }

  if (
    normalized === "A_FAIRE" ||
    normalized === "TODO"
  ) {
    return "À démarrer";
  }

  if (
    normalized === "SUSPENDU" ||
    normalized === "PAUSED"
  ) {
    return "Suspendu";
  }

  return status;
}

function getProjectStatusClass(
  status
) {
  const normalized =
    String(
      status ?? "ACTIF"
    ).toUpperCase();

  if (
    normalized === "TERMINE" ||
    normalized === "COMPLETED" ||
    normalized === "DONE"
  ) {
    return "done";
  }

  if (
    normalized === "SUSPENDU" ||
    normalized === "PAUSED"
  ) {
    return "paused";
  }

  if (
    normalized === "A_FAIRE" ||
    normalized === "TODO"
  ) {
    return "todo";
  }

  return "active";
}

/* =========================================================
   ICÔNES
========================================================= */

function ProjectIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 7h7l2 2h9v10H3z" />
      <path d="M3 7V5h7l2 2" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3"
      />

      <path d="M8 9h8" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m4 16 5-5 4 3 7-8" />
      <path d="M15 6h5v5" />
    </svg>
  );
}

function SearchEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m16 16 4 4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

/* =========================================================
   PAGE
========================================================= */

function MemberProjectsPage({
  currentUser,
  projects = [],
  tasks = [],
}) {
  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  /* =======================================================
     RECHERCHE
  ======================================================= */

  const search =
    searchParams
      .get("q")
      ?.trim()
      .toLowerCase() ?? "";

  /* =======================================================
     TÂCHES ASSIGNÉES AU MEMBER
  ======================================================= */

  const myTasks =
    useMemo(() => {
      if (
        currentUser?.id ===
          undefined ||
        currentUser?.id ===
          null
      ) {
        return [];
      }

      return tasks.filter(
        (task) =>
          (
            task.assignments ||
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
                ) &&
              !assignment.unassignedAt
          )
      );
    }, [
      tasks,
      currentUser,
    ]);

  /* =======================================================
     PROJETS DU MEMBER
  ======================================================= */

  const allMemberProjects =
    useMemo(() => {
      const projectIds =
        new Set(
          myTasks
            .map(
              (task) =>
                task.projectId
            )
            .filter(
              (projectId) =>
                projectId !==
                  null &&
                projectId !==
                  undefined
            )
            .map(String)
        );

      return projects.filter(
        (project) =>
          projectIds.has(
            String(
              project.id
            )
          )
      );
    }, [
      projects,
      myTasks,
    ]);

  /* =======================================================
     PROJETS FILTRÉS PAR RECHERCHE
  ======================================================= */

  const memberProjects =
    useMemo(() => {
      if (!search) {
        return allMemberProjects;
      }

      return allMemberProjects.filter(
        (project) => {
          const name =
            project.name
              ?.toLowerCase() ??
            "";

          const description =
            project.description
              ?.toLowerCase() ??
            "";

          return (
            name.includes(
              search
            ) ||
            description.includes(
              search
            )
          );
        }
      );
    }, [
      allMemberProjects,
      search,
    ]);

  /* =======================================================
     TÂCHES PRINCIPALES D'UN PROJET
  ======================================================= */

  function getMyProjectTasks(
    projectId
  ) {
    return myTasks.filter(
      (task) =>
        String(
          task.projectId
        ) ===
          String(
            projectId
          ) &&
        !task.parentTaskId
    );
  }

  /* =======================================================
     PROGRESSION
  ======================================================= */

  function getProjectProgress(
    projectId
  ) {
    const projectTasks =
      getMyProjectTasks(
        projectId
      );

    if (
      projectTasks.length ===
      0
    ) {
      return 0;
    }

    const completedTasks =
      projectTasks.filter(
        (task) =>
          task.status ===
          "TERMINE"
      ).length;

    return Math.round(
      (
        completedTasks /
        projectTasks.length
      ) * 100
    );
  }

  /* =======================================================
     STATS GLOBALES
  ======================================================= */

  const projectStats =
    useMemo(() => {
      const totalProjects =
        allMemberProjects.length;

      const totalTasks =
        myTasks.filter(
          (task) =>
            !task.parentTaskId
        ).length;

      const completedTasks =
        myTasks.filter(
          (task) =>
            !task.parentTaskId &&
            task.status ===
              "TERMINE"
        ).length;

      const averageProgress =
        totalTasks === 0
          ? 0
          : Math.round(
              (
                completedTasks /
                totalTasks
              ) * 100
            );

      return {
        totalProjects,
        totalTasks,
        completedTasks,
        averageProgress,
      };
    }, [
      allMemberProjects,
      myTasks,
    ]);

  /* =======================================================
     NAVIGATION VERS UNE TÂCHE
  ======================================================= */

  function openTask(
    task
  ) {
    navigate(
      `/member/tasks?q=${encodeURIComponent(
        task.title ?? ""
      )}`
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="member-projects-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="member-projects-heading">
        <div>
          <span className="member-projects-eyebrow">
            Vue d'ensemble
          </span>

          <h1>
            Projets
          </h1>

          <p>
            Consultez les projets
            associés à vos tâches et
            suivez votre progression.
          </p>
        </div>

        <div className="member-projects-heading-summary">
          <div className="member-projects-heading-icon">
            <ProjectIcon />
          </div>

          <div>
            <strong>
              {
                projectStats.totalProjects
              }
            </strong>

            <span>
              projet
              {projectStats.totalProjects !==
              1
                ? "s"
                : ""}{" "}
              associé
              {projectStats.totalProjects !==
              1
                ? "s"
                : ""}
            </span>
          </div>
        </div>
      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="member-project-overview">
        <article className="member-project-overview-item">
          <div className="member-project-overview-icon member-project-overview-icon-blue">
            <ProjectIcon />
          </div>

          <div>
            <span>
              Mes projets
            </span>

            <strong>
              {
                projectStats.totalProjects
              }
            </strong>
          </div>
        </article>

        <article className="member-project-overview-item">
          <div className="member-project-overview-icon member-project-overview-icon-purple">
            <TaskIcon />
          </div>

          <div>
            <span>
              Mes tâches
            </span>

            <strong>
              {
                projectStats.totalTasks
              }
            </strong>
          </div>
        </article>

        <article className="member-project-overview-item">
          <div className="member-project-overview-icon member-project-overview-icon-green">
            <ProgressIcon />
          </div>

          <div>
            <span>
              Terminées
            </span>

            <strong>
              {
                projectStats.completedTasks
              }
            </strong>
          </div>
        </article>

        <article className="member-project-overview-item">
          <div className="member-project-overview-icon member-project-overview-icon-progress">
            <ProgressIcon />
          </div>

          <div>
            <span>
              Progression globale
            </span>

            <strong>
              {
                projectStats.averageProgress
              }
              %
            </strong>
          </div>
        </article>
      </div>

      {/* =================================================
          BARRE RÉSULTATS
      ================================================= */}

      <div className="member-projects-results-bar">
        <div>
          <strong>
            Mes projets
          </strong>

          <span>
            {
              memberProjects.length
            }{" "}
            résultat
            {memberProjects.length !==
            1
              ? "s"
              : ""}
          </span>
        </div>

        {search && (
          <div className="member-project-search-value">
            Recherche :{" "}
            <strong>
              {
                searchParams.get(
                  "q"
                )
              }
            </strong>
          </div>
        )}
      </div>

      {/* =================================================
          RECHERCHE VIDE
      ================================================= */}

      {search &&
        memberProjects.length ===
          0 && (
          <div className="member-projects-search-empty">
            <div className="member-project-empty-icon">
              <SearchEmptyIcon />
            </div>

            <strong>
              Aucun projet trouvé
            </strong>

            <span>
              Aucun projet associé à
              votre compte ne correspond
              à «{" "}
              {searchParams.get(
                "q"
              )}{" "}
              ».
            </span>
          </div>
        )}

      {/* =================================================
          AUCUN PROJET
      ================================================= */}

      {!search &&
        memberProjects.length ===
          0 && (
          <div className="member-projects-empty">
            <div className="member-project-empty-icon">
              <ProjectIcon />
            </div>

            <strong>
              Aucun projet disponible
            </strong>

            <span>
              Aucun projet n'est
              actuellement associé à
              vos tâches.
            </span>
          </div>
        )}

      {/* =================================================
          LISTE PROJETS
      ================================================= */}

      {memberProjects.length >
        0 && (
        <div className="member-projects-list">
          {memberProjects.map(
            (project) => {
              const projectTasks =
                getMyProjectTasks(
                  project.id
                );

              const progress =
                getProjectProgress(
                  project.id
                );

              const completedTasks =
                projectTasks.filter(
                  (task) =>
                    task.status ===
                    "TERMINE"
                ).length;

              const projectStatusClass =
                getProjectStatusClass(
                  project.status
                );

              return (
                <article
                  key={
                    project.id
                  }
                  className="member-project-card"
                >
                  {/* =====================================
                      PARTIE GAUCHE
                  ===================================== */}

                  <div className="member-project-main">
                    <div className="member-project-card-header">
                      <div className="member-project-title-area">
                        <div className="member-project-card-icon">
                          <ProjectIcon />
                        </div>

                        <div>
                          <span className="member-project-label">
                            Projet
                          </span>

                          <h2>
                            {
                              project.name
                            }
                          </h2>
                        </div>
                      </div>

                      <span
                        className={`member-project-status member-project-status-${projectStatusClass}`}
                      >
                        <span />

                        {getProjectStatusLabel(
                          project.status
                        )}
                      </span>
                    </div>

                    <p className="member-project-description">
                      {project.description ||
                        "Aucune description disponible pour ce projet."}
                    </p>

                    {/* ===================================
                        MÉTADONNÉES
                    =================================== */}

                    <div className="member-project-metadata">
                      <div className="member-project-meta-item">
                        <div className="member-project-meta-icon">
                          <TaskIcon />
                        </div>

                        <div>
                          <span>
                            Mes tâches
                          </span>

                          <strong>
                            {
                              projectTasks.length
                            }
                          </strong>
                        </div>
                      </div>

                      <div className="member-project-meta-item">
                        <div className="member-project-meta-icon">
                          <CalendarIcon />
                        </div>

                        <div>
                          <span>
                            Échéance
                          </span>

                          <strong>
                            {formatDate(
                              project.dueDate ??
                                project.endDate
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="member-project-meta-item">
                        <div className="member-project-meta-icon">
                          <ProgressIcon />
                        </div>

                        <div>
                          <span>
                            Terminées
                          </span>

                          <strong>
                            {
                              completedTasks
                            }
                            /
                            {
                              projectTasks.length
                            }
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* ===================================
                        PROGRESSION
                    =================================== */}

                    <div className="member-project-progress">
                      <div className="member-project-progress-header">
                        <div>
                          <span>
                            Ma progression
                          </span>

                          <small>
                            {
                              completedTasks
                            }{" "}
                            tâche
                            {completedTasks !==
                            1
                              ? "s"
                              : ""}{" "}
                            terminée
                            {completedTasks !==
                            1
                              ? "s"
                              : ""}
                          </small>
                        </div>

                        <strong>
                          {progress}%
                        </strong>
                      </div>

                      <div className="member-project-progress-bar">
                        <span
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* =====================================
                      LISTE TÂCHES
                  ===================================== */}

                  <div className="member-project-task-panel">
                    <div className="member-project-task-panel-header">
                      <div>
                        <strong>
                          Mes tâches
                        </strong>

                        <span>
                          Activité dans ce projet
                        </span>
                      </div>

                      <span className="member-project-task-count">
                        {
                          projectTasks.length
                        }
                      </span>
                    </div>

                    <div className="member-project-task-list">
                      {projectTasks.length ===
                      0 ? (
                        <div className="member-project-no-tasks">
                          <TaskIcon />

                          <span>
                            Aucune tâche dans
                            ce projet.
                          </span>
                        </div>
                      ) : (
                        projectTasks.map(
                          (task) => (
                            <button
                              type="button"
                              key={
                                task.id
                              }
                              className="member-project-task-row"
                              onClick={() =>
                                openTask(
                                  task
                                )
                              }
                            >
                              <div className="member-project-task-name">
                                <span className="member-project-task-icon">
                                  <TaskIcon />
                                </span>

                                <span>
                                  {
                                    task.title
                                  }
                                </span>
                              </div>

                              <div className="member-project-task-right">
                                <span
                                  className={`member-project-task-status member-project-task-status-${task.status?.toLowerCase()}`}
                                >
                                  <span />

                                  {getTaskStatusLabel(
                                    task.status
                                  )}
                                </span>

                                <ArrowIcon />
                              </div>
                            </button>
                          )
                        )
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}

export default MemberProjectsPage;