import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./MemberNotifications.css";

/* =========================================================
   ICONS
========================================================= */

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
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
   HELPERS
========================================================= */

function isAssignedToUser(
  task,
  userId
) {
  return (
    task?.assignments || []
  ).some(
    (assignment) =>
      String(
        assignment.userId
      ) ===
        String(userId) &&
      !assignment.unassignedAt
  );
}

function getStatusLabel(
  status
) {
  const labels = {
    A_FAIRE: "À faire",
    EN_COURS: "En cours",
    TERMINE: "Terminé",
    A_REVOIR: "À revoir",
  };

  return (
    labels[status] ??
    status ??
    ""
  );
}

function formatRelativeDate(
  value
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const difference =
    Date.now() -
    date.getTime();

  const minutes =
    Math.floor(
      difference /
        60000
    );

  const hours =
    Math.floor(
      difference /
        3600000
    );

  const days =
    Math.floor(
      difference /
        86400000
    );

  if (minutes < 1) {
    return "À l'instant";
  }

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  if (hours < 24) {
    return `Il y a ${hours} h`;
  }

  if (days === 1) {
    return "Hier";
  }

  if (days < 7) {
    return `Il y a ${days} jours`;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
    }
  ).format(date);
}

function createNotificationContent(
  action,
  task
) {
  if (
    action.type_action ===
    "CHANGEMENT_STATUT"
  ) {
    return {
      title:
        "Statut modifié",

      message:
        `${getStatusLabel(
          action.ancienne_valeur
        )} → ${getStatusLabel(
          action.nouvelle_valeur
        )}`,
    };
  }

  if (
    action.type_action ===
    "MODIFICATION"
  ) {
    return {
      title:
        "Tâche modifiée",

      message:
        action.champ_modifie
          ? `${action.champ_modifie} a été modifié`
          : "Les informations de la tâche ont été modifiées.",
    };
  }

  if (
    action.type_action ===
    "CREATION"
  ) {
    return {
      title:
        task?.parentTaskId
          ? "Nouvelle sous-tâche"
          : "Nouvelle tâche",

      message:
        task?.parentTaskId
          ? "Une nouvelle sous-tâche est disponible."
          : "Une nouvelle tâche vous concerne.",
    };
  }

  return {
    title:
      "Nouvelle activité",

    message:
      "Une nouvelle activité concerne cette tâche.",
  };
}

/* =========================================================
   COMPONENT
========================================================= */

function MemberNotificationsPanel({
  currentUser,
  tasks = [],
  actions = [],
}) {
  const navigate =
    useNavigate();

  const wrapperRef =
    useRef(null);

  const [
    open,
    setOpen,
  ] = useState(false);

  const storageKey =
    `member-notifications-${
      currentUser?.id ??
      currentUser?.email ??
      "anonymous"
    }`;

  const [
    state,
    setState,
  ] = useState({
    readIds: [],
    deletedIds: [],
  });

  /* =======================================================
     LOAD LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          storageKey
        );

      if (!saved) {
        setState({
          readIds: [],
          deletedIds: [],
        });

        return;
      }

      const parsed =
        JSON.parse(saved);

      setState({
        readIds:
          Array.isArray(
            parsed.readIds
          )
            ? parsed.readIds
            : [],

        deletedIds:
          Array.isArray(
            parsed.deletedIds
          )
            ? parsed.deletedIds
            : [],
      });
    } catch {
      setState({
        readIds: [],
        deletedIds: [],
      });
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify(
        state
      )
    );
  }, [
    storageKey,
    state,
  ]);

  /* =======================================================
     RELEVANT TASKS
  ======================================================= */

  const relevantTaskIds =
    useMemo(() => {
      const ids =
        new Set();

      tasks.forEach(
        (task) => {
          if (
            isAssignedToUser(
              task,
              currentUser?.id
            )
          ) {
            ids.add(
              String(
                task.id
              )
            );

            if (
              task.parentTaskId
            ) {
              ids.add(
                String(
                  task.parentTaskId
                )
              );
            }
          }
        }
      );

      return ids;
    }, [
      tasks,
      currentUser,
    ]);

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const notifications =
    useMemo(() => {
      const read =
        new Set(
          state.readIds.map(
            String
          )
        );

      const deleted =
        new Set(
          state.deletedIds.map(
            String
          )
        );

      return actions
        .filter(
          (action) =>
            relevantTaskIds.has(
              String(
                action.id_tache
              )
            )
        )
        .map(
          (
            action,
            index
          ) => {
            const task =
              tasks.find(
                (task) =>
                  String(
                    task.id
                  ) ===
                  String(
                    action.id_tache
                  )
              );

            const id =
              String(
                action.id ??
                  `${action.id_tache}-${action.date_action}-${index}`
              );

            const content =
              createNotificationContent(
                action,
                task
              );

            return {
              id,

              taskId:
                action.id_tache,

              taskTitle:
                task?.title ??
                "Tâche",

              title:
                content.title,

              message:
                content.message,

              date:
                action.date_action,

              isRead:
                read.has(id),
            };
          }
        )
        .filter(
          (notification) =>
            !deleted.has(
              notification.id
            )
        )
        .sort(
          (a, b) =>
            new Date(
              b.date ?? 0
            ) -
            new Date(
              a.date ?? 0
            )
        );
    }, [
      actions,
      tasks,
      relevantTaskIds,
      state,
    ]);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  /* =======================================================
     ACTIONS
  ======================================================= */

  function markRead(id) {
    setState(
      (current) => ({
        ...current,

        readIds: [
          ...new Set([
            ...current.readIds,
            String(id),
          ]),
        ],
      })
    );
  }

  function markAllRead() {
    setState(
      (current) => ({
        ...current,

        readIds: [
          ...new Set([
            ...current.readIds,

            ...notifications.map(
              (notification) =>
                String(
                  notification.id
                )
            ),
          ]),
        ],
      })
    );
  }

  function removeNotification(
    id
  ) {
    setState(
      (current) => ({
        ...current,

        deletedIds: [
          ...new Set([
            ...current.deletedIds,
            String(id),
          ]),
        ],
      })
    );
  }

  function removeAll() {
    setState(
      (current) => ({
        ...current,

        deletedIds: [
          ...new Set([
            ...current.deletedIds,

            ...notifications.map(
              (notification) =>
                String(
                  notification.id
                )
            ),
          ]),
        ],
      })
    );
  }

  function openNotification(
    notification
  ) {
    markRead(
      notification.id
    );

    setOpen(false);

    navigate(
      `/member/tasks?q=${encodeURIComponent(
        notification.taskTitle
      )}`
    );
  }

  /* =======================================================
     OUTSIDE
  ======================================================= */

  useEffect(() => {
    function outside(
      event
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    }

    function escape(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      outside
    );

    document.addEventListener(
      "keydown",
      escape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        outside
      );

      document.removeEventListener(
        "keydown",
        escape
      );
    };
  }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      ref={
        wrapperRef
      }
      className="member-notification-wrapper"
    >
      <button
        type="button"
        className={`member-notification-button ${
          open
            ? "member-notification-button-open"
            : ""
        }`}
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        aria-label="Notifications"
      >
        <BellIcon />

        {unreadCount > 0 && (
          <span className="member-notification-badge">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="member-notifications-panel">
          <div className="member-notifications-header">
            <div>
              <h3>
                Notifications
              </h3>

              <span>
                {unreadCount ===
                0
                  ? "Aucune notification non lue"
                  : `${unreadCount} non lue${
                      unreadCount >
                      1
                        ? "s"
                        : ""
                    }`}
              </span>
            </div>

            {unreadCount >
              0 && (
              <button
                type="button"
                className="member-notifications-read-all"
                onClick={
                  markAllRead
                }
              >
                <CheckIcon />

                Tout lire
              </button>
            )}
          </div>

          <div className="member-notifications-list">
            {notifications.length ===
            0 ? (
              <div className="member-notifications-empty">
                <div className="member-notifications-empty-icon">
                  <BellIcon />
                </div>

                <strong>
                  Aucune notification
                </strong>

                <span>
                  Les nouvelles activités
                  liées à votre compte
                  apparaîtront ici.
                </span>
              </div>
            ) : (
              notifications.map(
                (
                  notification
                ) => (
                  <div
                    key={
                      notification.id
                    }
                    className={`member-notification-item ${
                      notification.isRead
                        ? "member-notification-item-read"
                        : "member-notification-item-unread"
                    }`}
                  >
                    <button
                      type="button"
                      className="member-notification-content"
                      onClick={() =>
                        openNotification(
                          notification
                        )
                      }
                    >
                      {!notification.isRead && (
                        <span className="member-notification-unread-dot" />
                      )}

                      <div className="member-notification-text">
                        <div className="member-notification-title-row">
                          <strong>
                            {
                              notification.title
                            }
                          </strong>

                          <time>
                            {formatRelativeDate(
                              notification.date
                            )}
                          </time>
                        </div>

                        <span className="member-notification-task-title">
                          {
                            notification.taskTitle
                          }
                        </span>

                        <p>
                          {
                            notification.message
                          }
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="member-notification-delete"
                      aria-label="Supprimer"
                      title="Supprimer"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        removeNotification(
                          notification.id
                        );
                      }}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                )
              )
            )}
          </div>

          {notifications.length >
            0 && (
            <div className="member-notifications-footer">
              <button
                type="button"
                disabled={
                  unreadCount === 0
                }
                onClick={
                  markAllRead
                }
              >
                Tout marquer comme lu
              </button>

              <button
                type="button"
                className="member-notifications-delete-all"
                onClick={
                  removeAll
                }
              >
                Tout supprimer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MemberNotificationsPanel;