import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./MemberNotifications.css";

/* =========================================================
   LABELS
========================================================= */

const ACTION_LABELS = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  STATUS_CHANGE: "Changement de statut",
};

const STATUS_LABELS = {
  A_FAIRE: "À faire",
  EN_COURS: "En cours",
  TERMINE: "Terminée",
};

/* =========================================================
   HELPERS
========================================================= */

function formatDateTime(
  value
) {
  if (!value) {
    return "Date inconnue";
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
    return String(
      value
    );
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    date
  );
}

function formatStatus(
  status
) {
  return (
    STATUS_LABELS[
      status
    ] ??
    status ??
    "—"
  );
}

function getNotificationTitle(
  entry
) {
  const action =
    entry?.action;

  return (
    ACTION_LABELS[
      action
    ] ??
    action ??
    "Activité"
  );
}

function getNotificationMessage(
  entry
) {
  const action =
    entry?.action;

  const details =
    entry?.details;

  if (
    action ===
    "CREATE"
  ) {
    return "Une tâche a été créée.";
  }

  if (
    action ===
    "DELETE"
  ) {
    return "Une tâche a été supprimée.";
  }

  if (
    action ===
    "STATUS_CHANGE"
  ) {
    const oldStatus =
      details?.oldStatus ??
      details?.previousStatus ??
      details?.from ??
      details?.oldValue ??
      null;

    const newStatus =
      details?.newStatus ??
      details?.currentStatus ??
      details?.to ??
      details?.newValue ??
      null;

    if (
      oldStatus &&
      newStatus
    ) {
      return `Le statut est passé de « ${formatStatus(
        oldStatus
      )} » à « ${formatStatus(
        newStatus
      )} ».`;
    }

    if (
      newStatus
    ) {
      return `Le statut est maintenant « ${formatStatus(
        newStatus
      )} ».`;
    }

    return "Le statut d'une tâche a été modifié.";
  }

  if (
    action ===
    "UPDATE"
  ) {
    const field =
      details?.field ??
      details?.fieldName ??
      details?.property ??
      null;

    if (
      field
    ) {
      return `Le champ « ${field} » a été modifié.`;
    }

    return "Les informations d'une tâche ont été modifiées.";
  }

  return (
    details?.message ??
    details?.description ??
    "Une activité a été enregistrée."
  );
}

/* =========================================================
   COMPONENT
========================================================= */

function MemberNotificationsPanel({
  open,
  onClose,
  actions = [],
  tasks = [],
  currentUser,
}) {
  const panelRef =
    useRef(
      null
    );

  const [
    readIds,
    setReadIds,
  ] =
    useState(
      new Set()
    );

  const [
    deletedIds,
    setDeletedIds,
  ] =
    useState(
      new Set()
    );

  /* =======================================================
     FERMETURE EXTÉRIEURE + ESC
  ======================================================= */

  useEffect(
    () => {
      if (
        !open
      ) {
        return;
      }

      function handleOutsideClick(
        event
      ) {
        if (
          panelRef.current &&
          !panelRef.current.contains(
            event.target
          )
        ) {
          onClose?.();
        }
      }

      function handleEscape(
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
    [
      open,
      onClose,
    ]
  );

  /* =======================================================
     NOTIFICATIONS DU MEMBER
  ======================================================= */

  const notifications =
    useMemo(
      () => {
        if (
          !currentUser?.id
        ) {
          return [];
        }

        /*
         * Une notification n'est gardée
         * que si elle correspond à une
         * tâche visible/assignée au membre.
         */
        const allowedTaskIds =
          new Set(
            tasks.map(
              (
                task
              ) =>
                String(
                  task.id
                )
            )
          );

        return actions
          .filter(
            (
              entry
            ) => {
              if (
                !entry
              ) {
                return false;
              }

              if (
                entry.entityType &&
                entry.entityType !==
                "TASK"
              ) {
                return false;
              }

              if (
                !allowedTaskIds.has(
                  String(
                    entry.entityId
                  )
                )
              ) {
                return false;
              }

              if (
                deletedIds.has(
                  String(
                    entry.id
                  )
                )
              ) {
                return false;
              }

              return true;
            }
          )
          .sort(
            (
              a,
              b
            ) =>
              new Date(
                b.createdAt ??
                  0
              ) -
              new Date(
                a.createdAt ??
                  0
              )
          );
      },
      [
        actions,
        tasks,
        currentUser,
        deletedIds,
      ]
    );

  /* =======================================================
     NON LUES
  ======================================================= */

  const unreadCount =
    notifications.filter(
      (
        entry
      ) =>
        !readIds.has(
          String(
            entry.id
          )
        )
    ).length;

  /* =======================================================
     ACTIONS LOCALES
  ======================================================= */

  function markAsRead(
    id
  ) {
    setReadIds(
      (
        previous
      ) => {
        const next =
          new Set(
            previous
          );

        next.add(
          String(
            id
          )
        );

        return next;
      }
    );
  }

  function markAllAsRead() {
    setReadIds(
      (
        previous
      ) => {
        const next =
          new Set(
            previous
          );

        notifications.forEach(
          (
            entry
          ) =>
            next.add(
              String(
                entry.id
              )
            )
        );

        return next;
      }
    );
  }

  function removeNotification(
    id
  ) {
    setDeletedIds(
      (
        previous
      ) => {
        const next =
          new Set(
            previous
          );

        next.add(
          String(
            id
          )
        );

        return next;
      }
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  if (
    !open
  ) {
    return null;
  }

  return (
    <aside
      ref={
        panelRef
      }
      className="member-notifications-panel"
      aria-label="Notifications"
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="member-notifications-header">
        <div>
          <span>
            Activité
          </span>

          <h3>
            Notifications
          </h3>

          <small>
            {unreadCount ===
            0
              ? "Aucune notification non lue"
              : `${unreadCount} notification${
                  unreadCount >
                  1
                    ? "s"
                    : ""
                } non lue${
                  unreadCount >
                  1
                    ? "s"
                    : ""
                }`}
          </small>
        </div>

        <button
          type="button"
          className="member-notifications-close"
          onClick={
            onClose
          }
          aria-label="Fermer les notifications"
        >
          ×
        </button>
      </div>

      {/* =================================================
          ACTION GLOBALE
      ================================================= */}

      {notifications.length >
        0 && (
        <div className="member-notifications-toolbar">
          <button
            type="button"
            onClick={
              markAllAsRead
            }
            disabled={
              unreadCount ===
              0
            }
          >
            Tout marquer comme lu
          </button>
        </div>
      )}

      {/* =================================================
          LISTE
      ================================================= */}

      <div className="member-notifications-list">

        {notifications.length ===
        0 ? (
          <div className="member-notifications-empty">
            <strong>
              Aucune notification
            </strong>

            <span>
              Les activités liées à vos tâches apparaîtront ici lorsqu'elles seront disponibles.
            </span>
          </div>
        ) : (
          notifications.map(
            (
              entry
            ) => {
              const id =
                String(
                  entry.id
                );

              const isRead =
                readIds.has(
                  id
                );

              const relatedTask =
                tasks.find(
                  (
                    task
                  ) =>
                    String(
                      task.id
                    ) ===
                    String(
                      entry.entityId
                    )
                );

              return (
                <article
                  key={
                    id
                  }
                  className={`member-notification-item ${
                    isRead
                      ? "member-notification-item-read"
                      : "member-notification-item-unread"
                  }`}
                >
                  {/* =====================================
                      INDICATEUR
                  ===================================== */}

                  <div className="member-notification-indicator">
                    <span />
                  </div>

                  {/* =====================================
                      CONTENT
                  ===================================== */}

                  <div className="member-notification-content">

                    <div className="member-notification-top">
                      <strong>
                        {getNotificationTitle(
                          entry
                        )}
                      </strong>

                      <time>
                        {formatDateTime(
                          entry.createdAt
                        )}
                      </time>
                    </div>

                    {relatedTask && (
                      <span className="member-notification-task">
                        {
                          relatedTask.title
                        }
                      </span>
                    )}

                    <p>
                      {getNotificationMessage(
                        entry
                      )}
                    </p>

                    {entry?.userId !==
                      undefined &&
                      entry?.userId !==
                        null && (
                      <small>
                        Utilisateur #{entry.userId}
                      </small>
                    )}

                    {/* =================================
                        ACTIONS
                    ================================= */}

                    <div className="member-notification-actions">

                      {!isRead && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(
                              id
                            )
                          }
                        >
                          Marquer comme lu
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeNotification(
                            id
                          )
                        }
                      >
                        Masquer
                      </button>
                    </div>
                  </div>
                </article>
              );
            }
          )
        )}
      </div>
    </aside>
  );
}

export default MemberNotificationsPanel;