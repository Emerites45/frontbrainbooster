import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import TaskModal from "../components/TaskModal";

import {
  getAssigneeIds,
} from "../utils/dashboardHelpers";

import "./MemberTasksPage.css";

const PAGE_SIZE = 7;

/* =========================================================
   LABELS
========================================================= */

const STATUS_LABELS = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  A_REVOIR: "À revoir",
  TERMINE: "Terminée",
};

const PRIORITY_LABELS = {
  BASSE: "Basse",
  LOW: "Basse",

  MOYENNE: "Moyenne",
  MEDIUM: "Moyenne",

  HAUTE: "Haute",
  HIGH: "Haute",

  CRITIQUE: "Critique",
  CRITICAL: "Critique",
};

/* =========================================================
   ICONS
========================================================= */

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 4v6h6" />
      <path d="M5.5 15a7 7 0 1 0 1-7" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />

      <circle
        cx="12"
        cy="12"
        r="2.5"
      />
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

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/* =========================================================
   PRIORITE
========================================================= */

function normalizePriority(task) {
  const value =
    task.priority ??
    task.priorite;

  if (!value) {
    return null;
  }

  return String(
    value
  ).toUpperCase();
}

/* =========================================================
   RETARD
========================================================= */

function isTaskOverdue(task) {
  if (
    !task?.dueDate ||
    task.status === "TERMINE"
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
    dueDate < today
  );
}

function getDisplayedStatus(
  task
) {
  if (
    isTaskOverdue(
      task
    )
  ) {
    return "EN_RETARD";
  }

  return (
    task.status
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value
    );

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
    .format(
      date
    )
    .replace(
      ".",
      ""
    );
}

/* =========================================================
   UTILISATEUR
========================================================= */

function userFullName(
  user
) {
  if (!user) {
    return "—";
  }

  const fullName =
    `${user.firstName ?? ""} ${
      user.lastName ?? ""
    }`.trim();

  return (
    fullName ||
    user.name ||
    user.email ||
    "—"
  );
}

function getAssignedByNames(
  task,
  users
) {
  const assignments =
    task.assignments ??
    [];

  const assignedByIds = [
    ...new Set(
      assignments
        .filter(
          (
            assignment
          ) =>
            !assignment.unassignedAt
        )
        .map(
          (
            assignment
          ) =>
            assignment.assignedBy
        )
        .filter(
          (id) =>
            id !==
              undefined &&
            id !== null
        )
    ),
  ];

  if (
    assignedByIds.length ===
    0
  ) {
    return "—";
  }

  const names =
    assignedByIds
      .map(
        (id) =>
          users.find(
            (user) =>
              String(
                user.id
              ) ===
              String(
                id
              )
          )
      )
      .filter(
        Boolean
      )
      .map(
        userFullName
      );

  return (
    names.length > 0
      ? names.join(
          ", "
        )
      : "—"
  );
}

/* =========================================================
   CUSTOM STATUS DROPDOWN
========================================================= */

function TaskStatusDropdown({
  task,
  onChange,
}) {
  const wrapperRef =
    useRef(
      null
    );

  const [
    open,
    setOpen,
  ] = useState(
    false
  );

  const displayedStatus =
    getDisplayedStatus(
      task
    );

  const options = [
    {
      value:
        "A_FAIRE",
      label:
        "À faire",
    },

    {
      value:
        "EN_COURS",
      label:
        "En cours",
    },

    {
      value:
        "TERMINE",
      label:
        "Terminée",
    },
  ];

  /* =======================================================
     FERMETURE EXTERIEURE
  ======================================================= */

  useEffect(
    () => {
      function handleOutsideClick(
        event
      ) {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(
            event.target
          )
        ) {
          setOpen(
            false
          );
        }
      }

      function handleEscape(
        event
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          setOpen(
            false
          );
        }
      }

      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.addEventListener(
        "keydown",
        handleEscape
      );

      return () => {
        document.removeEventListener(
          "mousedown",
          handleOutsideClick
        );

        document.removeEventListener(
          "keydown",
          handleEscape
        );
      };
    },
    []
  );

  /* =======================================================
     LABEL AFFICHÉ
  ======================================================= */

  const displayedLabel =
    displayedStatus ===
    "EN_RETARD"
      ? "En retard"
      : STATUS_LABELS[
          task.status
        ] ??
        task.status ??
        "À faire";

  return (
    <div
      ref={
        wrapperRef
      }
      className={`member-custom-status ${
        open
          ? "member-custom-status-open"
          : ""
      }`}
    >
      {/* ===============================================
          TRIGGER
      =============================================== */}

      <button
        type="button"
        className={`member-custom-status-trigger member-custom-status-${displayedStatus?.toLowerCase()} ${
          open
            ? "member-custom-status-trigger-open"
            : ""
        }`}
        onClick={() =>
          setOpen(
            (
              current
            ) =>
              !current
          )
        }
        aria-expanded={
          open
        }
        aria-haspopup="menu"
      >
        <span className="member-custom-status-dot" />

        <span className="member-custom-status-label">
          {
            displayedLabel
          }
        </span>

        <span className="member-custom-status-chevron">
          <ChevronDownIcon />
        </span>
      </button>

      {/* ===============================================
          MENU
      =============================================== */}

      {open && (
        <div
          className="member-custom-status-menu"
          role="menu"
        >
          <div className="member-custom-status-menu-header">
            <div>
              <strong>
                Changer le statut
              </strong>

              <span>
                Sélectionnez le
                nouvel état
              </span>
            </div>
          </div>

          <div className="member-custom-status-options">
            {options.map(
              (
                option
              ) => {
                const selected =
                  task.status ===
                  option.value;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    role="menuitem"
                    className={`member-custom-status-option member-custom-status-option-${option.value.toLowerCase()} ${
                      selected
                        ? "member-custom-status-option-selected"
                        : ""
                    }`}
                    onClick={() => {
                      setOpen(
                        false
                      );

                      if (
                        option.value !==
                        task.status
                      ) {
                        onChange(
                          option.value
                        );
                      }
                    }}
                  >
                    <span className="member-custom-status-option-icon">
                      <span />
                    </span>

                    <span className="member-custom-status-option-text">
                      {
                        option.label
                      }
                    </span>

                    <span className="member-custom-status-option-check">
                      {selected && (
                        <CheckIcon />
                      )}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MEMBER TASKS PAGE
========================================================= */

function MemberTasksPage({
  currentUser,
  tasks = [],
  users = [],
  projects = [],
  actions = [],
  onStatusChange,
  onCreateSubtask,
}) {
  const [
    searchParams,
  ] =
    useSearchParams();

  const [
    selectedTask,
    setSelectedTask,
  ] =
    useState(
      null
    );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState(
      "ALL"
    );

  const [
    priorityFilter,
    setPriorityFilter,
  ] =
    useState(
      "ALL"
    );

  const [
    deadlineFilter,
    setDeadlineFilter,
  ] =
    useState(
      "ALL"
    );

  const [
    page,
    setPage,
  ] =
    useState(
      1
    );

  /* =======================================================
     RECHERCHE TOPBAR
  ======================================================= */

  const search =
    searchParams
      .get("q")
      ?.trim()
      .toLowerCase() ??
    "";

  /* =======================================================
     TACHES DU MEMBER
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
              (id) =>
                String(
                  id
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
     STATISTIQUES RAPIDES
  ======================================================= */

  const quickStats =
    useMemo(
      () => {
        const total =
          myTasks.length;

        const todo =
          myTasks.filter(
            (task) =>
              task.status ===
              "A_FAIRE"
          ).length;

        const inProgress =
          myTasks.filter(
            (task) =>
              task.status ===
              "EN_COURS"
          ).length;

        const done =
          myTasks.filter(
            (task) =>
              task.status ===
              "TERMINE"
          ).length;

        const overdue =
          myTasks.filter(
            isTaskOverdue
          ).length;

        return {
          total,
          todo,
          inProgress,
          done,
          overdue,
        };
      },
      [
        myTasks,
      ]
    );

  /* =======================================================
     FILTRES
  ======================================================= */

  const filteredTasks =
    useMemo(
      () => {
        return myTasks.filter(
          (
            task
          ) => {
            const displayedStatus =
              getDisplayedStatus(
                task
              );

            const priority =
              normalizePriority(
                task
              );

            const title =
              task.title
                ?.toLowerCase() ??
              "";

            const description =
              task.description
                ?.toLowerCase() ??
              "";

            const matchesSearch =
              !search ||
              title.includes(
                search
              ) ||
              description.includes(
                search
              );

            const matchesStatus =
              statusFilter ===
                "ALL" ||
              displayedStatus ===
                statusFilter;

            const matchesPriority =
              priorityFilter ===
                "ALL" ||
              priority ===
                priorityFilter;

            let matchesDeadline =
              true;

            if (
              deadlineFilter !==
              "ALL"
            ) {
              const dueDate =
                task.dueDate
                  ? new Date(
                      task.dueDate
                    )
                  : null;

              if (
                !dueDate ||
                Number.isNaN(
                  dueDate.getTime()
                )
              ) {
                matchesDeadline =
                  false;
              } else {
                const today =
                  new Date();

                today.setHours(
                  0,
                  0,
                  0,
                  0
                );

                const taskDate =
                  new Date(
                    dueDate
                  );

                taskDate.setHours(
                  0,
                  0,
                  0,
                  0
                );

                const difference =
                  (
                    taskDate -
                    today
                  ) /
                  (
                    1000 *
                    60 *
                    60 *
                    24
                  );

                if (
                  deadlineFilter ===
                  "TODAY"
                ) {
                  matchesDeadline =
                    difference ===
                    0;
                }

                if (
                  deadlineFilter ===
                  "WEEK"
                ) {
                  matchesDeadline =
                    difference >=
                      0 &&
                    difference <=
                      7;
                }

                if (
                  deadlineFilter ===
                  "OVERDUE"
                ) {
                  matchesDeadline =
                    isTaskOverdue(
                      task
                    );
                }
              }
            }

            return (
              matchesSearch &&
              matchesStatus &&
              matchesPriority &&
              matchesDeadline
            );
          }
        );
      },
      [
        myTasks,
        search,
        statusFilter,
        priorityFilter,
        deadlineFilter,
      ]
    );

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredTasks.length /
          PAGE_SIZE
      )
    );

  const safePage =
    Math.min(
      page,
      totalPages
    );

  const visibleTasks =
    filteredTasks.slice(
      (
        safePage -
        1
      ) *
        PAGE_SIZE,

      safePage *
        PAGE_SIZE
    );

  const firstResult =
    filteredTasks.length ===
    0
      ? 0
      : (
          safePage -
          1
        ) *
          PAGE_SIZE +
        1;

  const lastResult =
    Math.min(
      safePage *
        PAGE_SIZE,
      filteredTasks.length
    );

  /* =======================================================
     RESET
  ======================================================= */

  function resetFilters() {
    setStatusFilter(
      "ALL"
    );

    setPriorityFilter(
      "ALL"
    );

    setDeadlineFilter(
      "ALL"
    );

    setPage(
      1
    );
  }

  function handleFilterChange(
    setter,
    value
  ) {
    setter(
      value
    );

    setPage(
      1
    );
  }

  const hasActiveFilters =
    statusFilter !==
      "ALL" ||
    priorityFilter !==
      "ALL" ||
    deadlineFilter !==
      "ALL";

  /* =======================================================
     CHANGEMENT STATUT
  ======================================================= */

  function handleTaskStatusChange(
    task,
    newStatus
  ) {
    if (
      !onStatusChange
    ) {
      console.error(
        "onStatusChange n'est pas disponible."
      );

      return;
    }

    const isAssignedToMe =
      getAssigneeIds(
        task
      ).some(
        (id) =>
          String(
            id
          ) ===
          String(
            currentUser?.id
          )
      );

    if (
      !isAssignedToMe
    ) {
      console.error(
        "Vous ne pouvez pas modifier cette tâche."
      );

      return;
    }

    onStatusChange(
      task.id,
      newStatus
    );

    setSelectedTask(
      (
        currentTask
      ) => {
        if (
          !currentTask ||
          String(
            currentTask.id
          ) !==
          String(
            task.id
          )
        ) {
          return (
            currentTask
          );
        }

        return {
          ...currentTask,
          status:
            newStatus,
        };
      }
    );
  }

  /* =======================================================
     MODAL
  ======================================================= */

  function openTaskDetails(
    task
  ) {
    setSelectedTask(
      task
    );
  }

  function closeTaskDetails() {
    setSelectedTask(
      null
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <section className="member-tasks-page">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="member-tasks-heading">
          <div>
            <span className="member-tasks-eyebrow">
              Gestion personnelle
            </span>

            <h1>
              Mes tâches
            </h1>

            <p>
              Consultez vos tâches,
              ajustez leur avancement
              et accédez à leurs
              détails.
            </p>
          </div>

          <div className="member-tasks-summary">
            <div className="member-tasks-summary-number">
              {
                quickStats.total
              }
            </div>

            <div>
              <strong>
                Tâches assignées
              </strong>

              <span>
                {
                  quickStats.inProgress
                }{" "}
                en cours ·{" "}
                {
                  quickStats.done
                }{" "}
                terminée
                {quickStats.done !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            MINI STATS
        ================================================= */}

        <div className="member-task-overview">
          <div className="member-task-overview-item">
            <span className="member-task-overview-dot member-task-overview-dot-todo" />

            <div>
              <strong>
                {
                  quickStats.todo
                }
              </strong>

              <span>
                À faire
              </span>
            </div>
          </div>

          <div className="member-task-overview-item">
            <span className="member-task-overview-dot member-task-overview-dot-progress" />

            <div>
              <strong>
                {
                  quickStats.inProgress
                }
              </strong>

              <span>
                En cours
              </span>
            </div>
          </div>

          <div className="member-task-overview-item">
            <span className="member-task-overview-dot member-task-overview-dot-done" />

            <div>
              <strong>
                {
                  quickStats.done
                }
              </strong>

              <span>
                Terminées
              </span>
            </div>
          </div>

          <div className="member-task-overview-item">
            <span className="member-task-overview-dot member-task-overview-dot-late" />

            <div>
              <strong>
                {
                  quickStats.overdue
                }
              </strong>

              <span>
                En retard
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            FILTRES
        ================================================= */}

        <div className="member-task-filters">
          <div className="member-task-filter-intro">
            <div className="member-filter-icon">
              <FilterIcon />
            </div>

            <div>
              <strong>
                Filtrer les tâches
              </strong>

              <span>
                Affinez les résultats
                affichés.
              </span>
            </div>
          </div>

          <div className="member-task-filter-fields">
            <div className="member-filter-group">
              <label htmlFor="member-status-filter">
                Statut
              </label>

              <select
                id="member-status-filter"
                value={
                  statusFilter
                }
                onChange={(
                  event
                ) =>
                  handleFilterChange(
                    setStatusFilter,
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  Tous les statuts
                </option>

                <option value="A_FAIRE">
                  À faire
                </option>

                <option value="EN_COURS">
                  En cours
                </option>

                <option value="A_REVOIR">
                  À revoir
                </option>

                <option value="EN_RETARD">
                  En retard
                </option>

                <option value="TERMINE">
                  Terminée
                </option>
              </select>
            </div>

            <div className="member-filter-group">
              <label htmlFor="member-priority-filter">
                Priorité
              </label>

              <select
                id="member-priority-filter"
                value={
                  priorityFilter
                }
                onChange={(
                  event
                ) =>
                  handleFilterChange(
                    setPriorityFilter,
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  Toutes
                </option>

                <option value="BASSE">
                  Basse
                </option>

                <option value="MOYENNE">
                  Moyenne
                </option>

                <option value="HAUTE">
                  Haute
                </option>

                <option value="CRITIQUE">
                  Critique
                </option>
              </select>
            </div>

            <div className="member-filter-group">
              <label htmlFor="member-deadline-filter">
                Échéance
              </label>

              <select
                id="member-deadline-filter"
                value={
                  deadlineFilter
                }
                onChange={(
                  event
                ) =>
                  handleFilterChange(
                    setDeadlineFilter,
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  Toutes
                </option>

                <option value="TODAY">
                  Aujourd'hui
                </option>

                <option value="WEEK">
                  7 prochains jours
                </option>

                <option value="OVERDUE">
                  En retard
                </option>
              </select>
            </div>

            <button
              type="button"
              className={`member-reset-filters ${
                hasActiveFilters
                  ? "member-reset-filters-active"
                  : ""
              }`}
              onClick={
                resetFilters
              }
              disabled={
                !hasActiveFilters
              }
            >
              <ResetIcon />

              Réinitialiser
            </button>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="member-tasks-table-card">
          <div className="member-tasks-table-top">
            <div>
              <strong>
                Liste des tâches
              </strong>

              <span>
                {
                  filteredTasks.length
                }{" "}
                résultat
                {filteredTasks.length !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>

            {search && (
              <div className="member-task-search-indicator">
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

          <div className="member-tasks-table-scroll">
            <table className="member-tasks-table">
              <thead>
                <tr>
                  <th>
                    Tâche
                  </th>

                  <th>
                    Statut
                  </th>

                  <th>
                    Priorité
                  </th>

                  <th>
                    Assigné par
                  </th>

                  <th>
                    Échéance
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleTasks.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="member-no-tasks"
                    >
                      <div className="member-no-tasks-content">
                        <div className="member-no-tasks-icon">
                          <TaskIcon />
                        </div>

                        <strong>
                          Aucune tâche
                          trouvée
                        </strong>

                        <span>
                          Modifiez votre
                          recherche ou vos
                          filtres pour
                          afficher d'autres
                          tâches.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleTasks.map(
                    (
                      task
                    ) => {
                      const priority =
                        normalizePriority(
                          task
                        );

                      const overdue =
                        isTaskOverdue(
                          task
                        );

                      const assignedBy =
                        getAssignedByNames(
                          task,
                          users
                        );

                      return (
                        <tr
                          key={
                            task.id
                          }
                        >
                          {/* TACHE */}

                          <td>
                            <div className="member-task-title-cell">
                              <div className="member-task-row-icon">
                                <TaskIcon />
                              </div>

                              <div>
                                <strong>
                                  {task.title ??
                                    "Sans titre"}
                                </strong>

                                <span>
                                  {task.description ||
                                    "Aucune description"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* STATUT */}

                          <td>
                            <TaskStatusDropdown
                              task={
                                task
                              }
                              onChange={(
                                newStatus
                              ) =>
                                handleTaskStatusChange(
                                  task,
                                  newStatus
                                )
                              }
                            />
                          </td>

                          {/* PRIORITE */}

                          <td>
                            {priority ? (
                              <span
                                className={`member-task-priority member-task-priority-${priority.toLowerCase()}`}
                              >
                                <span />

                                {PRIORITY_LABELS[
                                  priority
                                ] ??
                                  priority}
                              </span>
                            ) : (
                              <span className="member-task-empty-value">
                                —
                              </span>
                            )}
                          </td>

                          {/* ASSIGNE PAR */}

                          <td>
                            <div className="member-assigned-by">
                              <span className="member-assigned-avatar">
                                {assignedBy ===
                                "—"
                                  ? "?"
                                  : assignedBy
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                              </span>

                              <span>
                                {
                                  assignedBy
                                }
                              </span>
                            </div>
                          </td>

                          {/* ECHEANCE */}

                          <td>
                            <div
                              className={`member-due-date ${
                                overdue
                                  ? "member-due-date-overdue"
                                  : ""
                              }`}
                            >
                              <strong>
                                {formatDate(
                                  task.dueDate
                                )}
                              </strong>

                              {overdue && (
                                <span>
                                  En retard
                                </span>
                              )}
                            </div>
                          </td>

                          {/* ACTION */}

                          <td>
                            <button
                              type="button"
                              className="member-task-details-button"
                              onClick={() =>
                                openTaskDetails(
                                  task
                                )
                              }
                            >
                              <EyeIcon />

                              <span>
                                Détails
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          <div className="member-tasks-pagination">
            <span>
              Affichage de{" "}
              <strong>
                {
                  firstResult
                }
              </strong>{" "}
              à{" "}
              <strong>
                {
                  lastResult
                }
              </strong>{" "}
              sur{" "}
              <strong>
                {
                  filteredTasks.length
                }
              </strong>
            </span>

            <div className="member-pagination-buttons">
              <button
                type="button"
                aria-label="Page précédente"
                disabled={
                  safePage <=
                  1
                }
                onClick={() =>
                  setPage(
                    (
                      current
                    ) =>
                      Math.max(
                        1,
                        current -
                          1
                      )
                  )
                }
              >
                <ChevronLeftIcon />
              </button>

              <span>
                Page{" "}
                <strong>
                  {
                    safePage
                  }
                </strong>{" "}
                sur{" "}
                <strong>
                  {
                    totalPages
                  }
                </strong>
              </span>

              <button
                type="button"
                aria-label="Page suivante"
                disabled={
                  safePage >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (
                      current
                    ) =>
                      Math.min(
                        totalPages,
                        current +
                          1
                      )
                  )
                }
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          MODAL
      =================================================== */}

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
    closeTaskDetails
  }
  onCreateSubtask={
    onCreateSubtask
  }
/>
      )}
    </>
  );
}

export default MemberTasksPage;
