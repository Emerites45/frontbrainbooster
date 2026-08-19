import {
  timeAgo,
} from "../../utils/dashboardHelpers";

import "../../pages/AdminDashboard.css";

/* =========================================================
   LABELS
========================================================= */

const ACTION_LABELS = {
  CREATE: "a créé une tâche",
  UPDATE: "a modifié une tâche",
  DELETE: "a supprimé une tâche",
  STATUS_CHANGE:
    "a changé le statut d'une tâche",
};

/* =========================================================
   HELPERS
========================================================= */

/**
 * Le nouveau HistoryEntry ne contient
 * plus nom_user.
 *
 * Il contient uniquement userId.
 *
 * Tant que RecentActivity ne reçoit
 * pas la liste des utilisateurs,
 * nous affichons donc l'identifiant.
 */
function getActorLabel(
  entry
) {
  if (
    entry?.userId ===
      undefined ||
    entry?.userId ===
      null
  ) {
    return "Un utilisateur";
  }

  return `Utilisateur #${entry.userId}`;
}

/**
 * Description principale de l'action.
 *
 * Le backend fournit :
 *
 * action:
 * CREATE | UPDATE | DELETE |
 * STATUS_CHANGE | ...
 */
function getActionLabel(
  entry
) {
  if (
    ACTION_LABELS[
      entry?.action
    ]
  ) {
    return ACTION_LABELS[
      entry.action
    ];
  }

  if (
    entry?.action
  ) {
    return `a effectué l'action « ${entry.action} »`;
  }

  return "a effectué une action";
}

/**
 * Le contrat indique que details
 * est une description lisible.
 *
 * Nous l'affichons donc directement
 * lorsqu'elle existe.
 */
function getDetails(
  entry
) {
  const details =
    entry?.details;

  if (
    details ===
      undefined ||
    details ===
      null ||
    details ===
      ""
  ) {
    return null;
  }

  if (
    typeof details ===
    "string"
  ) {
    return details;
  }

  /*
   * Petite sécurité si le backend
   * renvoie exceptionnellement un objet.
   */
  try {
    return JSON.stringify(
      details
    );
  } catch {
    return String(
      details
    );
  }
}

/* =========================================================
   RECENT ACTIVITY
========================================================= */

function RecentActivity({
  actions = [],
  limit = 8,
}) {
  /* =======================================================
     SÉCURISATION DU TABLEAU
  ======================================================= */

  const safeActions =
    Array.isArray(
      actions
    )
      ? actions
      : [];

  /* =======================================================
     TRI
  ======================================================= */

  const recent =
    [...safeActions]
      .filter(
        (
          entry
        ) =>
          entry &&
          (
            !entry.entityType ||
            entry.entityType ===
              "TASK"
          )
      )
      .sort(
        (
          a,
          b
        ) => {
          const dateA =
            new Date(
              a?.createdAt ??
                0
            ).getTime();

          const dateB =
            new Date(
              b?.createdAt ??
                0
            ).getTime();

          return (
            dateB -
            dateA
          );
        }
      )
      .slice(
        0,
        limit
      );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="admin-card">

      <h2>
        Activité récente
      </h2>

      {recent.length ===
      0 ? (
        <p className="empty-state">
          Aucune activité pour
          l'instant.
        </p>
      ) : (
        <ul className="activity-list">

          {recent.map(
            (
              entry,
              index
            ) => {
              const actor =
                getActorLabel(
                  entry
                );

              const actionLabel =
                getActionLabel(
                  entry
                );

              const details =
                getDetails(
                  entry
                );

              const key =
                entry?.id ??
                `${entry?.entityType ?? "TASK"}-${entry?.entityId ?? "unknown"}-${entry?.createdAt ?? index}`;

              return (
                <li
                  key={
                    key
                  }
                >

                  {/* =====================================
                      ACTION
                  ===================================== */}

                  <div>
                    <strong>
                      {
                        actor
                      }
                    </strong>{" "}

                    <span>
                      {
                        actionLabel
                      }
                    </span>
                  </div>

                  {/* =====================================
                      DETAILS
                  ===================================== */}

                  {details && (
                    <div
                      style={{
                        marginTop:
                          "4px",

                        color:
                          "#64748b",

                        fontSize:
                          "12px",

                        lineHeight:
                          1.5,
                      }}
                    >
                      {
                        details
                      }
                    </div>
                  )}

                  {/* =====================================
                      DATE
                  ===================================== */}

                  <span className="activity-time">
                    {timeAgo(
                      entry?.createdAt
                    )}
                  </span>

                </li>
              );
            }
          )}

        </ul>
      )}
    </div>
  );
}

export default RecentActivity;