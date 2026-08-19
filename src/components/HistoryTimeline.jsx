import "./HistoryTimeline.css";

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
   DATE
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    date
  );
}

/* =========================================================
   DETAILS
========================================================= */

function stringifyValue(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (
    typeof value ===
    "object"
  ) {
    try {
      return JSON.stringify(
        value
      );
    } catch {
      return String(
        value
      );
    }
  }

  return String(
    value
  );
}

function formatStatus(
  value
) {
  return (
    STATUS_LABELS[
      value
    ] ??
    value ??
    "—"
  );
}

/* =========================================================
   DESCRIPTION DE L'ACTION
========================================================= */

function getHistoryDescription(
  entry
) {
  const action =
    entry?.action;

  const details =
    entry?.details;

  /* -------------------------------------------------------
     CREATE
  ------------------------------------------------------- */

  if (
    action ===
    "CREATE"
  ) {
    return "La tâche a été créée.";
  }

  /* -------------------------------------------------------
     DELETE
  ------------------------------------------------------- */

  if (
    action ===
    "DELETE"
  ) {
    return "La tâche a été supprimée.";
  }

  /* -------------------------------------------------------
     STATUS CHANGE
  ------------------------------------------------------- */

  if (
    action ===
    "STATUS_CHANGE"
  ) {
    /*
     * Le contrat ne fixe pas encore
     * précisément la structure interne
     * de details.
     *
     * On supporte donc plusieurs formes
     * possibles sans inventer un endpoint.
     */

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

    return "Le statut de la tâche a été modifié.";
  }

  /* -------------------------------------------------------
     UPDATE
  ------------------------------------------------------- */

  if (
    action ===
    "UPDATE"
  ) {
    const field =
      details?.field ??
      details?.fieldName ??
      details?.property ??
      null;

    const oldValue =
      details?.oldValue ??
      details?.previousValue ??
      details?.from ??
      null;

    const newValue =
      details?.newValue ??
      details?.currentValue ??
      details?.to ??
      null;

    if (
      field &&
      oldValue !== null &&
      newValue !== null
    ) {
      return `${field} : « ${stringifyValue(
        oldValue
      )} » → « ${stringifyValue(
        newValue
      )} ».`;
    }

    if (
      field &&
      newValue !== null
    ) {
      return `${field} a été modifié en « ${stringifyValue(
        newValue
      )} ».`;
    }

    return "Les informations de la tâche ont été modifiées.";
  }

  /* -------------------------------------------------------
     ACTION INCONNUE
  ------------------------------------------------------- */

  return (
    details?.message ??
    details?.description ??
    "Une action a été effectuée sur cette tâche."
  );
}

/* =========================================================
   DÉTAILS BRUTS OPTIONNELS
========================================================= */

function getExtraDetails(
  entry
) {
  const details =
    entry?.details;

  if (!details) {
    return null;
  }

  if (
    typeof details ===
    "string"
  ) {
    return details;
  }

  if (
    typeof details !==
    "object"
  ) {
    return String(
      details
    );
  }

  /*
   * On n'affiche pas ici les champs
   * déjà utilisés dans la description.
   */
  const ignoredKeys =
    new Set([
      "message",
      "description",

      "field",
      "fieldName",
      "property",

      "oldStatus",
      "previousStatus",
      "from",
      "oldValue",

      "newStatus",
      "currentStatus",
      "to",
      "newValue",
    ]);

  const remainingEntries =
    Object.entries(
      details
    ).filter(
      ([key]) =>
        !ignoredKeys.has(
          key
        )
    );

  if (
    remainingEntries.length ===
    0
  ) {
    return null;
  }

  return remainingEntries
    .map(
      ([key, value]) =>
        `${key}: ${stringifyValue(
          value
        )}`
    )
    .join(
      " · "
    );
}

/* =========================================================
   TRI
========================================================= */

function sortHistory(
  history
) {
  return [
    ...history,
  ].sort(
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
  );
}

/* =========================================================
   COMPONENT
========================================================= */

function HistoryTimeline({
  actions = [],
}) {
  const history =
    sortHistory(
      Array.isArray(
        actions
      )
        ? actions
        : []
    );

  if (
    history.length ===
    0
  ) {
    return (
      <div className="history-empty">
        Aucun historique disponible.
      </div>
    );
  }

  return (
    <div className="history-timeline">

      {history.map(
        (
          entry,
          index
        ) => {
          const actionLabel =
            ACTION_LABELS[
              entry?.action
            ] ??
            entry?.action ??
            "Activité";

          const description =
            getHistoryDescription(
              entry
            );

          const extraDetails =
            getExtraDetails(
              entry
            );

          return (
            <article
              key={
                entry?.id ??
                `${entry?.entityId}-${entry?.createdAt}-${index}`
              }
              className="history-item"
            >

              {/* =========================================
                  POINT DE TIMELINE
              ========================================= */}

              <div className="history-marker">
                <span />

                {index !==
                  history.length -
                    1 && (
                  <i />
                )}
              </div>

              {/* =========================================
                  CONTENU
              ========================================= */}

              <div className="history-content">

                <div className="history-top-row">

                  <strong>
                    {
                      actionLabel
                    }
                  </strong>

                  <time>
                    {formatDateTime(
                      entry?.createdAt
                    )}
                  </time>
                </div>

                <p>
                  {
                    description
                  }
                </p>

                {extraDetails && (
                  <small className="history-extra-details">
                    {
                      extraDetails
                    }
                  </small>
                )}

                {entry?.userId !==
                  undefined &&
                  entry?.userId !==
                    null && (
                  <span className="history-user">
                    Utilisateur #{entry.userId}
                  </span>
                )}
              </div>
            </article>
          );
        }
      )}
    </div>
  );
}

export default HistoryTimeline;