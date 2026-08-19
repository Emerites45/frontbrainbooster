import {
  useMemo,
} from "react";

import {
  getAssigneeIds,
  projectProgress,
} from "../utils/dashboardHelpers";

import "./MemberProjectsPage.css";

/* =========================================================
   LABELS
========================================================= */

const PROJECT_STATUS_LABELS = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
};

const TASK_STATUS_LABELS = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINE: "Terminée",
};

/* =========================================================
   HELPERS
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

function getProjectStatusLabel(
  status
) {
  return (
    PROJECT_STATUS_LABELS[
      status
    ] ??
    status ??
    "Non défini"
  );
}

function getTaskStatusLabel(
  status
) {
  return (
    TASK_STATUS_LABELS[
      status
    ] ??
    status ??
    "Non défini"
  );
}

function getProjectStatusClass(
  status
) {
  if (
    status ===
    "EN_COURS"
  ) {
    return "member-project-status-active";
  }

  if (
    status ===
    "TERMINE"
  ) {
    return "member-project-status-done";
  }

  return "member-project-status-todo";
}

function isTaskOverdue(
  task
) {
  if (
    !task?.dueDate ||
    task.status ===
      "TERMINE"
  ) {
    return false;
  }

  const dueDate =
    new Date(
      task.dueDate
    );

  if (
    Number.isNaN(
      dueDate.getTime()
    )
  ) {
    return false;
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  dueDate.setHours(
    0,
    0,
    0,
    0
  );

  return (
    dueDate <
    today
  );
}

/* =========================================================
   ICONS
========================================================= */

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 7h7l2 2h9v10H3z" />
      <path d="M3 7V5h7l2 2" />
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

      <path d="M8 3v4M16 3v4M3 10h18" />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* =========================================================
   MEMBER PROJECTS PAGE
========================================================= */

function MemberProjectsPage({
  currentUser,
  projects = [],
  tasks = [],
}) {
  /* =======================================================
     TÂCHES DU MEMBER
  ======================================================= */

  const myTasks =
    useMemo(
      () => {
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
            getAssigneeIds(
              task
            ).some(
              (userId) =>
                String(
                  userId
                ) ===
                String(
                  currentUser.id
                )
            )
        );
      },
      [
        tasks,
        currentUser,
      ]
    );

  /* =======================================================
     IDS PROJETS
  ======================================================= */

  const myProjectIds =
    useMemo(
      () =>
        new Set(
          myTasks
            .map(
              (task) =>
                task.projectId
            )
            .filter(
              (projectId) =>
                projectId !==
                  undefined &&
                projectId !==
                  null
            )
            .map(
              String
            )
        ),
      [
        myTasks,
      ]
    );

  /* =======================================================
     PROJETS DU MEMBER
  ======================================================= */

  const myProjects =
    useMemo(
      () =>
        projects.filter(
          (project) =>
            myProjectIds.has(
              String(
                project.id
              )
            )
        ),
      [
        projects,
        myProjectIds,
      ]
    );

  /* =======================================================
     STATS PROJETS
  ======================================================= */

  const projectStats =
    useMemo(
      () => {
        const total =
          myProjects.length;

        const todo =
          myProjects.filter(
            (project) =>
              project.status ===
              "A_FAIRE"
          ).length;

        const inProgress =
          myProjects.filter(
            (project) =>
              project.status ===
              "EN_COURS"
          ).length;

        const done =
          myProjects.filter(
            (project) =>
              project.status ===
              "TERMINE"
          ).length;

        const averageProgress =
          total > 0
            ? Math.round(
                myProjects.reduce(
                  (
                    sum,
                    project
                  ) =>
                    sum +
                    projectProgress(
                      project,
                      tasks
                    ),
                  0
                ) /
                  total
              )
            : 0;

        return {
          total,
          todo,
          inProgress,
          done,
          averageProgress,
        };
      },
      [
        myProjects,
        tasks,
      ]
    );

  /* =======================================================
     TÂCHES PAR PROJET
  ======================================================= */

  function getProjectTasks(
    projectId
  ) {
    return myTasks.filter(
      (task) =>
        String(
          task.projectId
        ) ===
        String(
          projectId
        )
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
            Mon activité
          </span>

          <h1>
            Mes projets
          </h1>

          <p>
            Retrouvez les projets auxquels
            vous participez et suivez
            l'avancement des tâches qui
            vous sont assignées.
          </p>
        </div>

        <div className="member-projects-heading-summary">

          <div className="member-projects-heading-icon">
            <FolderIcon />
          </div>

          <div>
            <strong>
              {
                projectStats.total
              }
            </strong>

            <span>
              projet
              {projectStats.total !==
              1
                ? "s actifs"
                : " actif"}
            </span>
          </div>

        </div>
      </div>

      {/* =================================================
          OVERVIEW
      ================================================= */}

      <div className="member-project-overview">

        {/* TOTAL */}

        <article className="member-project-overview-item">

          <div
            className="
              member-project-overview-icon
              member-project-overview-icon-blue
            "
          >
            <FolderIcon />
          </div>

          <div>
            <span>
              Mes projets
            </span>

            <strong>
              {
                projectStats.total
              }
            </strong>
          </div>

        </article>

        {/* EN COURS */}

        <article className="member-project-overview-item">

          <div
            className="
              member-project-overview-icon
              member-project-overview-icon-purple
            "
          >
            <ProgressIcon />
          </div>

          <div>
            <span>
              En cours
            </span>

            <strong>
              {
                projectStats.inProgress
              }
            </strong>
          </div>

        </article>

        {/* TERMINES */}

        <article className="member-project-overview-item">

          <div
            className="
              member-project-overview-icon
              member-project-overview-icon-green
            "
          >
            <CheckIcon />
          </div>

          <div>
            <span>
              Terminés
            </span>

            <strong>
              {
                projectStats.done
              }
            </strong>
          </div>

        </article>

        {/* PROGRESSION */}

        <article className="member-project-overview-item">

          <div
            className="
              member-project-overview-icon
              member-project-overview-icon-progress
            "
          >
            <ProgressIcon />
          </div>

          <div>
            <span>
              Progression moyenne
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
          RESULT BAR
      ================================================= */}

      <div className="member-projects-results-bar">

        <div>
          <strong>
            Projets associés à mes tâches
          </strong>

          <span>
            {
              projectStats.total
            }{" "}
            projet
            {projectStats.total !==
            1
              ? "s"
              : ""}{" "}
            trouvé
            {projectStats.total !==
            1
              ? "s"
              : ""}
          </span>
        </div>

        <div className="member-project-search-value">
          <strong>
            {
              myTasks.length
            }
          </strong>{" "}
          tâche
          {myTasks.length !==
          1
            ? "s"
            : ""}{" "}
          assignée
          {myTasks.length !==
          1
            ? "s"
            : ""}
        </div>

      </div>

      {/* =================================================
          LISTE DES PROJETS
      ================================================= */}

      <div className="member-projects-list">

        {myProjects.length ===
        0 ? (
          <div className="member-projects-empty">

            <div className="member-project-empty-icon">
              <FolderIcon />
            </div>

            <strong>
              Aucun projet pour le moment
            </strong>

            <span>
              Les projets contenant des tâches
              qui vous sont assignées
              apparaîtront automatiquement ici.
            </span>

          </div>
        ) : (
          myProjects.map(
            (project) => {
              const projectTasks =
                getProjectTasks(
                  project.id
                );

              const progress =
                projectProgress(
                  project,
                  tasks
                );

              const todoTasks =
                projectTasks.filter(
                  (task) =>
                    task.status ===
                    "A_FAIRE"
                ).length;

              const inProgressTasks =
                projectTasks.filter(
                  (task) =>
                    task.status ===
                    "EN_COURS"
                ).length;

              const completedTasks =
                projectTasks.filter(
                  (task) =>
                    task.status ===
                    "TERMINE"
                ).length;

              const overdueTasks =
                projectTasks.filter(
                  isTaskOverdue
                ).length;

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

                    {/* ===================================
                        HEADER
                    =================================== */}

                    <div className="member-project-card-header">

                      <div className="member-project-title-area">

                        <div className="member-project-card-icon">
                          <FolderIcon />
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
                        className={`member-project-status ${getProjectStatusClass(
                          project.status
                        )}`}
                      >
                        <span />

                        {getProjectStatusLabel(
                          project.status
                        )}
                      </span>

                    </div>

                    {/* ===================================
                        DESCRIPTION
                    =================================== */}

                    <p className="member-project-description">
                      {project.description ||
                        "Aucune description n'est disponible pour ce projet."}
                    </p>

                    {/* ===================================
                        METADATA
                    =================================== */}

                    <div className="member-project-metadata">

                      {/* DATE DEBUT */}

                      <div className="member-project-meta-item">

                        <div className="member-project-meta-icon">
                          <CalendarIcon />
                        </div>

                        <div>
                          <span>
                            Date de début
                          </span>

                          <strong>
                            {formatDate(
                              project.startDate
                            )}
                          </strong>
                        </div>

                      </div>

                      {/* DATE FIN */}

                      <div className="member-project-meta-item">

                        <div className="member-project-meta-icon">
                          <CalendarIcon />
                        </div>

                        <div>
                          <span>
                            Date de fin
                          </span>

                          <strong>
                            {formatDate(
                              project.endDate
                            )}
                          </strong>
                        </div>

                      </div>

                      {/* MES TACHES */}

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
                            }{" "}
                            tâche
                            {projectTasks.length !==
                            1
                              ? "s"
                              : ""}
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
                            Progression du projet
                          </span>

                          <small>
                            {
                              completedTasks
                            }{" "}
                            terminée
                            {completedTasks !==
                            1
                              ? "s"
                              : ""}
                            {" · "}
                            {
                              inProgressTasks
                            }{" "}
                            en cours
                            {" · "}
                            {
                              todoTasks
                            }{" "}
                            à faire
                          </small>
                        </div>

                        <strong>
                          {
                            progress
                          }
                          %
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

                    {/* ===================================
                        RETARD
                    =================================== */}

                    {overdueTasks >
                      0 && (
                      <div
                        style={{
                          marginTop:
                            "12px",

                          color:
                            "#b54708",

                          fontSize:
                            "9px",

                          fontWeight:
                            600,
                        }}
                      >
                        {
                          overdueTasks
                        }{" "}
                        tâche
                        {overdueTasks >
                        1
                          ? "s"
                          : ""}{" "}
                        en retard
                      </div>
                    )}

                  </div>

                  {/* =====================================
                      PANEL DROIT : TACHES
                  ===================================== */}

                  <aside className="member-project-task-panel">

                    <div className="member-project-task-panel-header">

                      <div>
                        <strong>
                          Mes tâches
                        </strong>

                        <span>
                          Tâches qui me sont assignées
                        </span>
                      </div>

                      <span className="member-project-task-count">
                        {
                          projectTasks.length
                        }
                      </span>

                    </div>

                    {projectTasks.length ===
                    0 ? (
                      <div className="member-project-no-tasks">

                        <TaskIcon />

                        <span>
                          Aucune tâche assignée.
                        </span>

                      </div>
                    ) : (
                      <div className="member-project-task-list">

                        {projectTasks.map(
                          (task) => (
                            <div
                              key={
                                task.id
                              }
                              className="member-project-task-row"
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
                                  className={`member-project-task-status member-project-task-status-${String(
                                    task.status ??
                                      ""
                                  ).toLowerCase()}`}
                                >
                                  <span />

                                  {getTaskStatusLabel(
                                    task.status
                                  )}
                                </span>

                                <ArrowIcon />

                              </div>

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </aside>

                </article>
              );
            }
          )
        )}

      </div>

    </section>
  );
}

export default MemberProjectsPage;