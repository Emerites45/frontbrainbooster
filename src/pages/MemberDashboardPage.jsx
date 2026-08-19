import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  computeTaskStats,
  getAssigneeIds,
} from "../utils/dashboardHelpers";

import "./MemberDashboard.css";

/* =========================================================
   STATUTS
========================================================= */

const STATUS_LABEL = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINE: "Terminée",
};

/* =========================================================
   DATES
========================================================= */

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

/* =========================================================
   INFORMATION ÉCHÉANCE
========================================================= */

function getDeadlineInformation(
  dueDate
) {
  if (!dueDate) {
    return {
      label:
        "Sans échéance",

      state:
        "neutral",
    };
  }

  const today =
    new Date();

  const deadline =
    new Date(
      dueDate
    );

  if (
    Number.isNaN(
      deadline.getTime()
    )
  ) {
    return {
      label:
        formatDate(
          dueDate
        ),

      state:
        "neutral",
    };
  }

  today.setHours(
    0,
    0,
    0,
    0
  );

  deadline.setHours(
    0,
    0,
    0,
    0
  );

  const difference =
    Math.ceil(
      (
        deadline.getTime() -
        today.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        )
    );

  if (
    difference < 0
  ) {
    return {
      label:
        "En retard",

      state:
        "late",
    };
  }

  if (
    difference === 0
  ) {
    return {
      label:
        "Aujourd'hui",

      state:
        "today",
    };
  }

  if (
    difference === 1
  ) {
    return {
      label:
        "Demain",

      state:
        "soon",
    };
  }

  if (
    difference <= 7
  ) {
    return {
      label:
        `Dans ${difference} jours`,

      state:
        "soon",
    };
  }

  return {
    label:
      formatDate(
        dueDate
      ),

    state:
      "normal",
  };
}

/* =========================================================
   ICÔNES
========================================================= */

function StatsIcon({
  type,
}) {
  if (
    type === "done"
  ) {
    return (
      <svg viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="9"
        />

        <path d="m8 12 2.5 2.5L16.5 9" />
      </svg>
    );
  }

  if (
    type === "late"
  ) {
    return (
      <svg viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="9"
        />

        <path d="M12 7v6" />

        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (
    type ===
    "progress"
  ) {
    return (
      <svg viewBox="0 0 24 24">
        <path d="m4 16 5-5 4 3 7-8" />

        <path d="M15 6h5v5" />
      </svg>
    );
  }

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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 12h14" />

      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 6h16" />

      <path d="M7 12h10" />

      <path d="M10 18h4" />
    </svg>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function MemberDashboardPage({
  currentUser,
  tasks = [],
  projects = [],
}) {
  const navigate =
    useNavigate();

  const [
    statusFilter,
    setStatusFilter,
  ] = useState(
    "ALL"
  );

  /* =======================================================
     TÂCHES DU MEMBER
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
        (
          task
        ) =>
          getAssigneeIds(
            task
          ).some(
            (
              userId
            ) =>
              String(
                userId
              ) ===
              String(
                currentUser.id
              )
          )
      );
    }, [
      tasks,
      currentUser,
    ]);

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const stats =
    useMemo(
      () =>
        computeTaskStats(
          myTasks
        ),
      [
        myTasks,
      ]
    );

  const activeTasks =
    useMemo(
      () =>
        myTasks.filter(
          (
            task
          ) =>
            task.status !==
            "TERMINE"
        ).length,
      [
        myTasks,
      ]
    );

  /* =======================================================
     FILTRE
  ======================================================= */

  const filteredTasks =
    useMemo(() => {
      if (
        statusFilter ===
        "ALL"
      ) {
        return myTasks;
      }

      return myTasks.filter(
        (
          task
        ) =>
          task.status ===
          statusFilter
      );
    }, [
      myTasks,
      statusFilter,
    ]);

  /* =======================================================
     ÉCHÉANCES
  ======================================================= */

  const upcomingTasks =
    useMemo(() => {
      return [
        ...myTasks,
      ]
        .filter(
          (
            task
          ) =>
            task.dueDate &&
            task.status !==
              "TERMINE"
        )
        .sort(
          (
            a,
            b
          ) =>
            new Date(
              a.dueDate
            ) -
            new Date(
              b.dueDate
            )
        )
        .slice(
          0,
          4
        );
    }, [
      myTasks,
    ]);

  /* =======================================================
     NOM DU PROJET
  ======================================================= */

  function projectName(
    projectId
  ) {
    const project =
      projects.find(
        (
          project
        ) =>
          String(
            project.id
          ) ===
          String(
            projectId
          )
      );

    return (
      project?.name ??
      "Sans projet"
    );
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function goToTasks() {
    navigate(
      "/member/tasks"
    );
  }

  /* =======================================================
     AFFICHAGE
  ======================================================= */

  return (
    <section className="member-dashboard-page">

      {/* =================================================
          INTRODUCTION
      ================================================= */}

      <div className="member-dashboard-heading">
        <div>
          <span className="member-dashboard-eyebrow">
            Espace membre
          </span>

          <h1>
            Bonjour,{" "}
            <span>
              {currentUser
                ?.firstName ??
                "Utilisateur"}
            </span>{" "}
            👋
          </h1>

          <p>
            Voici un aperçu de vos
            tâches et de votre
            progression actuelle.
          </p>
        </div>

        <button
          type="button"
          className="member-dashboard-primary-action"
          onClick={
            goToTasks
          }
        >
          Voir mes tâches

          <ArrowIcon />
        </button>
      </div>

      {/* =================================================
          STATISTIQUES
      ================================================= */}

      <div className="member-dashboard-stats">

        {/* MES TÂCHES */}

        <article className="member-stat-card member-stat-card-blue">
          <div className="member-stat-card-top">
            <div className="member-stat-icon member-stat-icon-blue">
              <StatsIcon type="tasks" />
            </div>

            <span className="member-stat-chip">
              Total
            </span>
          </div>

          <div className="member-stat-content">
            <strong>
              {
                stats.total
              }
            </strong>

            <span>
              Mes tâches
            </span>

            <small>
              {
                activeTasks
              }{" "}
              actuellement active
              {activeTasks >
              1
                ? "s"
                : ""}
            </small>
          </div>
        </article>

        {/* TERMINÉES */}

        <article className="member-stat-card member-stat-card-green">
          <div className="member-stat-card-top">
            <div className="member-stat-icon member-stat-icon-green">
              <StatsIcon type="done" />
            </div>

            <span className="member-stat-chip member-stat-chip-green">
              Réalisées
            </span>
          </div>

          <div className="member-stat-content">
            <strong>
              {
                stats.done
              }
            </strong>

            <span>
              Terminées
            </span>

            <small>
              {stats.total >
              0
                ? `${stats.done} sur ${stats.total} tâches`
                : "Aucune tâche"}
            </small>
          </div>
        </article>

        {/* EN RETARD */}

        <article className="member-stat-card member-stat-card-red">
          <div className="member-stat-card-top">
            <div className="member-stat-icon member-stat-icon-red">
              <StatsIcon type="late" />
            </div>

            <span className="member-stat-chip member-stat-chip-red">
              Attention
            </span>
          </div>

          <div className="member-stat-content">
            <strong>
              {
                stats.overdue
              }
            </strong>

            <span>
              En retard
            </span>

            <small>
              {stats.overdue >
              0
                ? "Nécessite votre attention"
                : "Aucun retard actuellement"}
            </small>
          </div>
        </article>

        {/* PROGRESSION */}

        <article className="member-stat-card member-stat-card-progress">
          <div className="member-stat-card-top">
            <div className="member-stat-icon member-stat-icon-progress">
              <StatsIcon type="progress" />
            </div>

            <span className="member-stat-chip">
              Global
            </span>
          </div>

          <div className="member-progress-stat-content">
            <div>
              <strong>
                {
                  stats.progression
                }
                %
              </strong>

              <span>
                Progression
              </span>
            </div>

            <div
              className="member-progress-ring"
              style={{
                "--progress":
                  `${stats.progression * 3.6}deg`,
              }}
            >
              <div>
                {
                  stats.progression
                }
                %
              </div>
            </div>
          </div>

          <div className="member-stat-progress-bar">
            <span
              style={{
                width:
                  `${stats.progression}%`,
              }}
            />
          </div>
        </article>
      </div>

      {/* =================================================
          CONTENU PRINCIPAL
      ================================================= */}

      <div className="member-dashboard-grid">

        {/* =================================================
            ÉCHÉANCES
        ================================================= */}

        <article className="member-dashboard-card member-deadlines-card">
          <div className="member-dashboard-card-header">
            <div className="member-card-title">
              <div className="member-small-icon">
                <CalendarIcon />
              </div>

              <div>
                <h2>
                  Échéances à venir
                </h2>

                <p>
                  Les tâches à
                  surveiller en
                  priorité.
                </p>
              </div>
            </div>

            <span className="member-card-counter">
              {
                upcomingTasks.length
              }
            </span>
          </div>

          <div className="member-deadlines-list">
            {upcomingTasks.length ===
              0 && (
              <div className="member-deadlines-empty">
                <div className="member-deadlines-empty-icon">
                  <CalendarIcon />
                </div>

                <strong>
                  Tout est sous contrôle
                </strong>

                <span>
                  Aucune échéance à
                  venir pour le moment.
                </span>
              </div>
            )}

            {upcomingTasks.map(
              (
                task
              ) => {
                const deadline =
                  getDeadlineInformation(
                    task.dueDate
                  );

                return (
                  <button
                    type="button"
                    key={
                      task.id
                    }
                    className="member-deadline-item"
                    onClick={() =>
                      navigate(
                        `/member/tasks?q=${encodeURIComponent(
                          task.title
                        )}`
                      )
                    }
                  >
                    <div className="member-deadline-item-top">
                      <span
                        className={`member-deadline-indicator member-deadline-indicator-${deadline.state}`}
                      />

                      <span className="member-deadline-project">
                        {projectName(
                          task.projectId
                        )}
                      </span>

                      <span
                        className={`member-deadline-relative member-deadline-relative-${deadline.state}`}
                      >
                        {
                          deadline.label
                        }
                      </span>
                    </div>

                    <strong className="member-deadline-title">
                      {
                        task.title
                      }
                    </strong>

                    <div className="member-deadline-date">
                      <CalendarIcon />

                      <span>
                        {formatDate(
                          task.dueDate
                        )}
                      </span>
                    </div>
                  </button>
                );
              }
            )}
          </div>

          <button
            type="button"
            className="member-view-deadlines"
            onClick={
              goToTasks
            }
          >
            <span>
              Voir toutes mes tâches
            </span>

            <ArrowIcon />
          </button>
        </article>

        {/* =================================================
            TABLEAU TÂCHES
        ================================================= */}

        <article className="member-dashboard-card member-tasks-card">

          <div className="member-tasks-card-header">
            <div className="member-card-title">
              <div className="member-small-icon">
                <StatsIcon type="tasks" />
              </div>

              <div>
                <h2>
                  Toutes mes tâches
                </h2>

                <p>
                  Suivez rapidement
                  votre activité.
                </p>
              </div>
            </div>

            <div className="member-dashboard-filter-wrap">
              <FilterIcon />

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="member-dashboard-filter"
              >
                <option value="ALL">
                  Toutes
                </option>

                <option value="A_FAIRE">
                  À faire
                </option>

                <option value="EN_COURS">
                  En cours
                </option>

                <option value="TERMINE">
                  Terminées
                </option>
              </select>
            </div>
          </div>

          <div className="member-dashboard-table-wrap">
            <table className="member-dashboard-table">
              <thead>
                <tr>
                  <th>
                    Tâche
                  </th>

                  <th>
                    Projet
                  </th>

                  <th>
                    Statut
                  </th>

                  <th>
                    Échéance
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="member-empty-table"
                    >
                      <div className="member-empty-table-content">
                        <strong>
                          Aucune tâche
                        </strong>

                        <span>
                          Aucune tâche
                          ne correspond
                          à ce filtre.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredTasks
                  .slice(
                    0,
                    7
                  )
                  .map(
                    (
                      task
                    ) => {
                      const deadline =
                        getDeadlineInformation(
                          task.dueDate
                        );

                      return (
                        <tr
                          key={
                            task.id
                          }
                          onClick={() =>
                            navigate(
                              `/member/tasks?q=${encodeURIComponent(
                                task.title
                              )}`
                            )
                          }
                        >

                          {/* TÂCHE */}

                          <td>
                            <div className="member-dashboard-task-cell">
                              <span className="member-task-leading-icon">
                                <StatsIcon type="tasks" />
                              </span>

                              <strong>
                                {
                                  task.title
                                }
                              </strong>
                            </div>
                          </td>

                          {/* PROJET */}

                          <td>
                            <span className="member-dashboard-project-name">
                              {projectName(
                                task.projectId
                              )}
                            </span>
                          </td>

                          {/* STATUT */}

                          <td>
                            <span
                              className={`member-status member-status-${task.status?.toLowerCase()}`}
                            >
                              <span />

                              {STATUS_LABEL[
                                task.status
                              ] ??
                                task.status}
                            </span>
                          </td>

                          {/* ÉCHÉANCE */}

                          <td>
                            <div className="member-dashboard-deadline-cell">
                              <span>
                                {formatDate(
                                  task.dueDate
                                )}
                              </span>

                              {task.status !==
                                "TERMINE" &&
                                deadline.state ===
                                  "late" && (
                                  <small>
                                    En retard
                                  </small>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
              </tbody>
            </table>
          </div>

          <div className="member-tasks-card-footer">
            <span>
              Affichage de{" "}
              {Math.min(
                filteredTasks.length,
                7
              )}{" "}
              tâche
              {Math.min(
                filteredTasks.length,
                7
              ) >
              1
                ? "s"
                : ""}
            </span>

            <button
              type="button"
              onClick={
                goToTasks
              }
            >
              Voir toutes

              <ArrowIcon />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

export default MemberDashboardPage;