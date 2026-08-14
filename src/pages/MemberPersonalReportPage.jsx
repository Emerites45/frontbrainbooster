import {
  useMemo,
  useState,
} from "react";

import "./MemberPersonalReportPage.css";

/* =========================================================
   JOURS
========================================================= */

const FRENCH_DAYS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

/* =========================================================
   FILTRES WORK TIME
========================================================= */

const WORK_TIME_FILTERS = [
  {
    id: "30d",
    label: "30 jours",
  },
  {
    id: "3m",
    label: "3 mois",
  },
  {
    id: "6m",
    label: "6 mois",
  },
  {
    id: "1y",
    label: "1 an",
  },
  {
    id: "all",
    label: "Tout",
  },
];

/* =========================================================
   DATE HELPERS
========================================================= */

function getDayFromDate(
  dateValue
) {
  if (!dateValue) {
    return "";
  }

  const date =
    new Date(
      `${dateValue}T12:00:00`
    );

  return (
    FRENCH_DAYS[
      date.getDay()
    ] ?? ""
  );
}

function formatDate(
  dateValue
) {
  if (!dateValue) {
    return "";
  }

  const [
    year,
    month,
    day,
  ] = dateValue.split("-");

  return `${day}/${month}/${year}`;
}

function formatShortDate(
  dateValue
) {
  if (!dateValue) {
    return "";
  }

  const [
    year,
    month,
    day,
  ] = dateValue.split("-");

  return `${day}/${month}/${year.slice(
    -2
  )}`;
}

function getTodayValue() {
  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

/* =========================================================
   FILTRE PAR PÉRIODE
========================================================= */

function getFilterStartDate(
  filterId
) {
  if (
    filterId === "all"
  ) {
    return null;
  }

  const start =
    new Date();

  start.setHours(
    0,
    0,
    0,
    0
  );

  if (
    filterId === "30d"
  ) {
    start.setDate(
      start.getDate() - 29
    );

    return start;
  }

  if (
    filterId === "3m"
  ) {
    start.setMonth(
      start.getMonth() - 3
    );

    return start;
  }

  if (
    filterId === "6m"
  ) {
    start.setMonth(
      start.getMonth() - 6
    );

    return start;
  }

  if (
    filterId === "1y"
  ) {
    start.setFullYear(
      start.getFullYear() - 1
    );

    return start;
  }

  return null;
}

/* =========================================================
   CHART SETTINGS
========================================================= */

/*
  Jusqu'à 14 points :
  le graphique garde une largeur classique.

  Après 14 points :
  chaque date garde suffisamment
  d'espace et le graphique peut défiler.
*/

const CHART_VISIBLE_POINTS = 14;

const HISTORY_PAGE_SIZE = 5;

const CHART_MIN_WIDTH = 920;

const CHART_POINT_GAP = 64;

const CHART_HEIGHT = 320;

const CHART_PADDING = {
  top: 32,
  right: 34,
  bottom: 62,
  left: 58,
};

/* =========================================================
   PAGE
========================================================= */

function MemberPersonalReportPage({
  currentUser,
}) {
  const firstName =
    currentUser?.firstName ??
    "Membre";

  /* =======================================================
     FORMULAIRE
  ======================================================= */

  const [
    selectedDate,
    setSelectedDate,
  ] = useState("");

  const [
    workedHours,
    setWorkedHours,
  ] = useState("");

  const [
    extraHours,
    setExtraHours,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    majorDifficulties,
    setMajorDifficulties,
  ] = useState("");

  const [
    proposedSolution,
    setProposedSolution,
  ] = useState("");

  /* =======================================================
     FILTRE GRAPHIQUE
  ======================================================= */

  const [
    workTimeFilter,
    setWorkTimeFilter,
  ] = useState("30d");

  const [
    historyPage,
    setHistoryPage,
  ] = useState(1);

  /* =======================================================
     DONNÉES
  ======================================================= */

  const [
    workEntries,
    setWorkEntries,
  ] = useState([]);

  /* =======================================================
     FORM VALUES
  ======================================================= */

  const selectedDay =
    useMemo(
      () =>
        getDayFromDate(
          selectedDate
        ),
      [selectedDate]
    );

  const currentWorkedHours =
    Number(
      workedHours
    ) || 0;

  const currentExtraHours =
    Number(
      extraHours
    ) || 0;

  const currentTotal =
    currentWorkedHours +
    currentExtraHours;

  /* =======================================================
     HISTORIQUE TRIÉ
  ======================================================= */

  const sortedEntries =
    useMemo(() => {
      return [
        ...workEntries,
      ].sort(
        (
          a,
          b
        ) =>
          new Date(
            `${a.date}T12:00:00`
          ) -
          new Date(
            `${b.date}T12:00:00`
          )
      );
    }, [workEntries]);

  /* =======================================================
     HISTORIQUE PAGINÉ
  ======================================================= */

  const historyEntries =
    useMemo(
      () => [...sortedEntries].reverse(),
      [sortedEntries]
    );

  const totalHistoryPages =
    Math.max(
      1,
      Math.ceil(
        historyEntries.length /
          HISTORY_PAGE_SIZE
      )
    );

  const safeHistoryPage =
    Math.min(
      historyPage,
      totalHistoryPages
    );

  const paginatedHistoryEntries =
    useMemo(() => {
      const start =
        (safeHistoryPage - 1) *
        HISTORY_PAGE_SIZE;

      return historyEntries.slice(
        start,
        start + HISTORY_PAGE_SIZE
      );
    }, [
      historyEntries,
      safeHistoryPage,
    ]);

  const visibleHistoryPages =
    useMemo(() => {
      if (
        totalHistoryPages <= 3
      ) {
        return Array.from(
          {
            length:
              totalHistoryPages,
          },
          (_, index) =>
            index + 1
        );
      }

      let start =
        Math.max(
          1,
          safeHistoryPage - 1
        );

      let end =
        Math.min(
          totalHistoryPages,
          start + 2
        );

      if (
        end - start < 2
      ) {
        start =
          Math.max(
            1,
            end - 2
          );
      }

      return Array.from(
        {
          length:
            end - start + 1,
        },
        (_, index) =>
          start + index
      );
    }, [
      safeHistoryPage,
      totalHistoryPages,
    ]);

  const historyStartItem =
    historyEntries.length === 0
      ? 0
      : (safeHistoryPage - 1) *
          HISTORY_PAGE_SIZE +
        1;

  const historyEndItem =
    Math.min(
      safeHistoryPage *
        HISTORY_PAGE_SIZE,
      historyEntries.length
    );

  /* =======================================================
     TOTAL GLOBAL : HEURES TRAVAILLÉES
  ======================================================= */

  const totalWorkedHours =
    useMemo(() => {
      return sortedEntries.reduce(
        (
          total,
          entry
        ) =>
          total +
          entry.workedHours,
        0
      );
    }, [sortedEntries]);

  /* =======================================================
     TOTAL GLOBAL : HEURES SUPPLÉMENTAIRES
  ======================================================= */

  const totalExtraHours =
    useMemo(() => {
      return sortedEntries.reduce(
        (
          total,
          entry
        ) =>
          total +
          entry.extraHours,
        0
      );
    }, [sortedEntries]);

  /* =======================================================
     TOTAL GLOBAL
  ======================================================= */

  const totalAllHours =
    useMemo(() => {
      return sortedEntries.reduce(
        (
          total,
          entry
        ) =>
          total +
          entry.totalHours,
        0
      );
    }, [sortedEntries]);

  /* =======================================================
     TOTAL SEMAINE ACTUELLE
  ======================================================= */

  const currentWeekTotal =
    useMemo(() => {
      if (
        sortedEntries.length ===
        0
      ) {
        return 0;
      }

      const today =
        new Date();

      today.setHours(
        12,
        0,
        0,
        0
      );

      const currentDay =
        today.getDay();

      const distanceToMonday =
        currentDay === 0
          ? -6
          : 1 -
            currentDay;

      const monday =
        new Date(
          today
        );

      monday.setDate(
        today.getDate() +
          distanceToMonday
      );

      const sunday =
        new Date(
          monday
        );

      sunday.setDate(
        monday.getDate() +
          6
      );

      return sortedEntries.reduce(
        (
          total,
          entry
        ) => {
          const entryDate =
            new Date(
              `${entry.date}T12:00:00`
            );

          if (
            entryDate >=
              monday &&
            entryDate <=
              sunday
          ) {
            return (
              total +
              entry.totalHours
            );
          }

          return total;
        },
        0
      );
    }, [sortedEntries]);

  /* =======================================================
     ENTRÉES FILTRÉES POUR LE GRAPHIQUE
  ======================================================= */

  const filteredChartEntries =
    useMemo(() => {
      if (
        workTimeFilter ===
        "all"
      ) {
        return sortedEntries;
      }

      const startDate =
        getFilterStartDate(
          workTimeFilter
        );

      if (!startDate) {
        return sortedEntries;
      }

      return sortedEntries.filter(
        (entry) => {
          const entryDate =
            new Date(
              `${entry.date}T12:00:00`
            );

          return (
            entryDate >=
            startDate
          );
        }
      );
    }, [
      sortedEntries,
      workTimeFilter,
    ]);

  /* =======================================================
     TOTAL DE LA PÉRIODE DU GRAPHIQUE
  ======================================================= */

  const filteredTotalHours =
    useMemo(() => {
      return filteredChartEntries.reduce(
        (
          total,
          entry
        ) =>
          total +
          entry.totalHours,
        0
      );
    }, [filteredChartEntries]);

  /* =======================================================
     AJOUT / UPDATE
  ======================================================= */

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    setFormError("");

    if (!selectedDate) {
      setFormError(
        "Veuillez sélectionner une date."
      );

      return;
    }

    if (
      workedHours === ""
    ) {
      setFormError(
        "Veuillez renseigner le nombre d'heures travaillées."
      );

      return;
    }

    const normal =
      Number(
        workedHours
      );

    const extra =
      Number(
        extraHours
      ) || 0;

    if (
      normal < 0 ||
      extra < 0
    ) {
      setFormError(
        "Le nombre d'heures ne peut pas être négatif."
      );

      return;
    }

    if (
      normal + extra >
      24
    ) {
      setFormError(
        "Le total des heures d'une journée ne peut pas dépasser 24 h."
      );

      return;
    }

    const entry = {
      date:
        selectedDate,

      day:
        selectedDay,

      workedHours:
        normal,

      extraHours:
        extra,

      totalHours:
        normal + extra,
    };

    setWorkEntries(
      (
        previous
      ) => {
        const existing =
          previous.some(
            (
              currentEntry
            ) =>
              currentEntry.date ===
              selectedDate
          );

        if (
          existing
        ) {
          return previous.map(
            (
              currentEntry
            ) =>
              currentEntry.date ===
              selectedDate
                ? entry
                : currentEntry
          );
        }

        return [
          ...previous,
          entry,
        ];
      }
    );

    setSelectedDate("");
    setWorkedHours("");
    setExtraHours("");
    setHistoryPage(1);
  }

  /* =======================================================
     MODIFIER
  ======================================================= */

  function handleEditEntry(
    entry
  ) {
    setSelectedDate(
      entry.date
    );

    setWorkedHours(
      String(
        entry.workedHours
      )
    );

    setExtraHours(
      String(
        entry.extraHours
      )
    );

    setFormError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     SUPPRIMER
  ======================================================= */

  function handleDeleteEntry(
    date
  ) {
    setWorkEntries(
      (
        previous
      ) =>
        previous.filter(
          (entry) =>
            entry.date !==
            date
        )
    );

    setHistoryPage(1);
  }

  /* =======================================================
     MAX HEURES DU GRAPHIQUE
  ======================================================= */

  const maxChartHours =
    useMemo(() => {
      const maximum =
        Math.max(
          4,
          ...filteredChartEntries.map(
            (entry) =>
              entry.totalHours
          )
        );

      return (
        Math.ceil(
          maximum / 2
        ) * 2
      );
    }, [
      filteredChartEntries,
    ]);

  /* =======================================================
     TAILLE + POINTS DU GRAPHIQUE
  ======================================================= */

  const chartData =
    useMemo(() => {
      const numberOfPoints =
        filteredChartEntries.length;

      if (
        numberOfPoints === 0
      ) {
        return {
          width:
            CHART_MIN_WIDTH,

          points: [],

          polyline: "",
        };
      }

      /*
        Pour 14 points ou moins :
        largeur normale.

        Pour plus de 14 points :
        largeur qui augmente avec
        chaque date supplémentaire.
      */

      const dynamicWidth =
        numberOfPoints <=
        CHART_VISIBLE_POINTS
          ? CHART_MIN_WIDTH
          : CHART_PADDING.left +
            CHART_PADDING.right +
            (
              numberOfPoints -
              1
            ) *
              CHART_POINT_GAP;

      const chartWidth =
        Math.max(
          CHART_MIN_WIDTH,
          dynamicWidth
        );

      const graphWidth =
        chartWidth -
        CHART_PADDING.left -
        CHART_PADDING.right;

      const graphHeight =
        CHART_HEIGHT -
        CHART_PADDING.top -
        CHART_PADDING.bottom;

      const denominator =
        Math.max(
          numberOfPoints - 1,
          1
        );

      const points =
        filteredChartEntries.map(
          (
            entry,
            index
          ) => {
            let x;

            if (
              numberOfPoints ===
              1
            ) {
              x =
                CHART_PADDING.left +
                graphWidth / 2;
            } else {
              x =
                CHART_PADDING.left +
                (
                  index /
                  denominator
                ) *
                  graphWidth;
            }

            const y =
              CHART_PADDING.top +
              graphHeight -
              (
                entry.totalHours /
                maxChartHours
              ) *
                graphHeight;

            return {
              ...entry,
              x,
              y,
            };
          }
        );

      return {
        width:
          chartWidth,

        points,

        polyline:
          points
            .map(
              (point) =>
                `${point.x},${point.y}`
            )
            .join(" "),
      };
    }, [
      filteredChartEntries,
      maxChartHours,
    ]);

  /* =======================================================
     GRADUATIONS AXE Y
  ======================================================= */

  const chartTicks =
    useMemo(() => {
      return [
        maxChartHours,
        maxChartHours * 0.75,
        maxChartHours * 0.5,
        maxChartHours * 0.25,
        0,
      ];
    }, [maxChartHours]);

  /* =======================================================
     LABEL DU FILTRE
  ======================================================= */

  const activeFilterLabel =
    WORK_TIME_FILTERS.find(
      (filter) =>
        filter.id ===
        workTimeFilter
    )?.label ??
    "Tout";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="member-personal-report-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="member-personal-report-header">
        <div>
          <span className="member-personal-report-eyebrow">
            Suivi personnel
          </span>

          <h1>
            Bilan personnel
          </h1>

          <p>
            Bonjour {firstName},
            renseignez votre activité
            quotidienne afin de conserver
            un historique précis de votre
            temps de travail.
          </p>
        </div>

        <div className="member-personal-report-global-stats">

          <div className="member-personal-report-stat">
            <span>
              Cette semaine
            </span>

            <strong>
              {currentWeekTotal} h
            </strong>
          </div>

          <div className="member-personal-report-stat member-personal-report-stat-primary">
            <span>
              Depuis le début
            </span>

            <strong>
              {totalAllHours} h
            </strong>
          </div>
        </div>
      </div>

      <div className="member-personal-report-actions-grid">
      {/* =================================================
          FORMULAIRE
      ================================================= */}

      <div className="member-work-entry-card">

        <div className="member-work-entry-header">

          <div className="member-work-entry-icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="5"
                width="16"
                height="15"
                rx="2"
              />

              <path d="M8 3v4" />

              <path d="M16 3v4" />

              <path d="M4 9h16" />
            </svg>
          </div>

          <div>
            <span>
              TEMPS DE TRAVAIL
            </span>

            <h2>
              Enregistrer une journée
            </h2>

            <p>
              Sélectionnez la date et
              renseignez les heures
              réellement effectuées.
            </p>
          </div>
        </div>

        <div className="member-work-reference">
          <div>
            <span className="member-work-reference-dot" />

            <div>
              <strong>
                Temps normal de référence :
                4 h / jour
              </strong>

              <p>
                Cette valeur est uniquement
                indicative. Une journée de
                moins de 4 heures reste
                parfaitement valide.
              </p>
            </div>
          </div>
        </div>

        <form
          className="member-work-entry-form"
          onSubmit={
            handleSubmit
          }
        >

          {/* DATE */}

          <div className="member-work-form-group">
            <label
              htmlFor="work-date"
            >
              Date de travail
            </label>

            <div className="member-work-date-wrapper">
              <input
                id="work-date"
                type="date"
                max={
                  getTodayValue()
                }
                value={
                  selectedDate
                }
                onChange={(
                  event
                ) => {
                  setSelectedDate(
                    event.target
                      .value
                  );

                  setFormError(
                    ""
                  );
                }}
              />
            </div>

            <small>
              Choisissez la date
              concernée.
            </small>
          </div>

          {/* JOUR AUTOMATIQUE */}

          <div className="member-work-form-group">
            <label>
              Jour
            </label>

            <div className="member-work-auto-day">
              <span>
                {
                  selectedDay ||
                  "—"
                }
              </span>
            </div>

            <small>
              Calculé automatiquement
              selon la date.
            </small>
          </div>

          {/* HEURES */}

          <div className="member-work-form-group">
            <label
              htmlFor="worked-hours"
            >
              Heures travaillées
            </label>

            <div className="member-work-number-wrapper">
              <input
                id="worked-hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="Ex : 4"
                value={
                  workedHours
                }
                onChange={(
                  event
                ) => {
                  setWorkedHours(
                    event.target
                      .value
                  );

                  setFormError(
                    ""
                  );
                }}
              />

              <span>
                h
              </span>
            </div>

            <small>
              Temps réellement effectué.
            </small>
          </div>

          {/* EXTRA */}

          <div className="member-work-form-group">
            <label
              htmlFor="extra-hours"
            >
              Heures supplémentaires
            </label>

            <div className="member-work-number-wrapper">
              <input
                id="extra-hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="Ex : 1"
                value={
                  extraHours
                }
                onChange={(
                  event
                ) => {
                  setExtraHours(
                    event.target
                      .value
                  );

                  setFormError(
                    ""
                  );
                }}
              />

              <span>
                h
              </span>
            </div>

            <small>
              Facultatif.
            </small>
          </div>

          {/* TOTAL */}

          <div className="member-work-form-total">
            <span>
              Total du jour
            </span>

            <strong>
              {currentTotal} h
            </strong>

            <small>
              Calcul automatique
            </small>
          </div>

          {/* ERROR */}

          {formError && (
            <div className="member-work-form-error">
              <span>
                !
              </span>

              {formError}
            </div>
          )}

          {/* BUTTON */}

          <div className="member-work-form-actions">
            <button
              type="submit"
              className="member-work-add-button"
            >
              <span>
                +
              </span>

              Ajouter au bilan
            </button>
          </div>
        </form>
      </div>

      {/* =================================================
          DIFFICULTÉS ET SOLUTIONS
      ================================================= */}

      <div className="member-work-reflection-card">
        <div className="member-work-reflection-header">
          <div className="member-work-reflection-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v6" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <div>
            <span>RETOUR D'EXPÉRIENCE</span>
            <h2>Difficultés et solutions</h2>
            <p>
              Documentez les principales difficultés rencontrées
              ainsi que les solutions que vous proposez.
            </p>
          </div>
        </div>

        <div className="member-work-reflection-grid">
          <div className="member-work-reflection-field">
            <div className="member-work-reflection-label-row">
              <label htmlFor="major-difficulties">
                Difficultés majeures rencontrées
              </label>
              <span>{majorDifficulties.length}/1000</span>
            </div>

            <textarea
              id="major-difficulties"
              maxLength="1000"
              value={majorDifficulties}
              onChange={(event) =>
                setMajorDifficulties(event.target.value)
              }
              placeholder="Décrivez les blocages ou difficultés ayant ralenti ou empêché l'avancement de votre travail : problème technique, manque d'information, accès manquant, dépendance avec une autre tâche..."
            />

            <small>
              Expliquez clairement ce qui a ralenti
              ou empêché la réalisation du travail.
            </small>
          </div>

          <div className="member-work-reflection-field">
            <div className="member-work-reflection-label-row">
              <label htmlFor="proposed-solution">
                Solution proposée
              </label>
              <span>{proposedSolution.length}/1000</span>
            </div>

            <textarea
              id="proposed-solution"
              maxLength="1000"
              value={proposedSolution}
              onChange={(event) =>
                setProposedSolution(event.target.value)
              }
              placeholder="Décrivez la solution, l'action ou l'accompagnement qui permettrait de résoudre la difficulté et d'avancer plus efficacement..."
            />

            <small>
              Proposez une solution réaliste ou précisez
              l'aide dont vous avez besoin.
            </small>
          </div>
        </div>

        <div className="member-work-reflection-footer">
          <span>
            Ces informations seront enregistrées avec votre bilan personnel.
          </span>

          <button
            type="button"
            className="member-work-reflection-save"
            onClick={() => {
              console.log("Difficultés :", majorDifficulties);
              console.log("Solution :", proposedSolution);
            }}
          >
            Enregistrer le commentaire
          </button>
        </div>
      </div>
      </div>

      {/* =================================================
          WORK TIME
      ================================================= */}

      <div className="member-work-chart-card">

        {/* HEADER */}

        <div className="member-work-chart-header">

          <div>
            <span>
              WORK TIME
            </span>

            <h2>
              Historique du temps de travail
            </h2>

            <p>
              Consultez l'évolution
              chronologique de votre
              temps de travail.
            </p>
          </div>

          <div className="member-work-chart-header-right">

            <div className="member-work-chart-legend">
              <span className="member-work-chart-legend-line" />

              <span>
                Total journalier
              </span>
            </div>

            <div className="member-work-chart-week-total">
              <span>
                Période
              </span>

              <strong>
                {
                  filteredTotalHours
                } h
              </strong>
            </div>
          </div>
        </div>

        {/* =================================================
            FILTRES
        ================================================= */}

        <div className="member-work-chart-toolbar">

          <div className="member-work-chart-filters">

            {WORK_TIME_FILTERS.map(
              (filter) => (
                <button
                  key={
                    filter.id
                  }
                  type="button"
                  className={`member-work-chart-filter ${
                    workTimeFilter ===
                    filter.id
                      ? "member-work-chart-filter-active"
                      : ""
                  }`}
                  onClick={() =>
                    setWorkTimeFilter(
                      filter.id
                    )
                  }
                >
                  {filter.label}
                </button>
              )
            )}
          </div>

          <div className="member-work-chart-toolbar-info">
            <span>
              {
                filteredChartEntries.length
              }
            </span>

            <span>
              donnée
              {
                filteredChartEntries.length >
                1
                  ? "s"
                  : ""
              }
            </span>

            <strong>
              {activeFilterLabel}
            </strong>
          </div>
        </div>

        {/* =================================================
            CHART BODY
        ================================================= */}

        <div className="member-work-chart-body">

          {filteredChartEntries.length ===
          0 ? (
            <div className="member-work-chart-empty">

              <div className="member-work-chart-empty-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M4 19V5" />

                  <path d="M4 19h16" />

                  <path d="m7 15 4-5 3 3 4-6" />
                </svg>
              </div>

              <strong>
                Aucune donnée sur cette période
              </strong>

              <p>
                Changez la période ou
                ajoutez de nouvelles
                journées de travail.
              </p>
            </div>
          ) : (
            <div className="member-work-chart-wrapper">

              <svg
                className="member-work-chart-svg"
                width={
                  chartData.width
                }
                height={
                  CHART_HEIGHT
                }
                viewBox={`0 0 ${chartData.width} ${CHART_HEIGHT}`}
                role="img"
                aria-label="Courbe historique du temps de travail"
              >

                {/* =======================================
                    AXE VERTICAL
                ======================================= */}

                <line
                  className="member-work-chart-axis"
                  x1={
                    CHART_PADDING.left
                  }
                  y1={
                    CHART_PADDING.top
                  }
                  x2={
                    CHART_PADDING.left
                  }
                  y2={
                    CHART_HEIGHT -
                    CHART_PADDING.bottom
                  }
                />

                {/* =======================================
                    AXE HORIZONTAL
                ======================================= */}

                <line
                  className="member-work-chart-axis"
                  x1={
                    CHART_PADDING.left
                  }
                  y1={
                    CHART_HEIGHT -
                    CHART_PADDING.bottom
                  }
                  x2={
                    chartData.width -
                    CHART_PADDING.right
                  }
                  y2={
                    CHART_HEIGHT -
                    CHART_PADDING.bottom
                  }
                />

                {/* =======================================
                    GRADUATIONS HEURES
                ======================================= */}

                {chartTicks.map(
                  (
                    tick,
                    index
                  ) => {
                    const graphHeight =
                      CHART_HEIGHT -
                      CHART_PADDING.top -
                      CHART_PADDING.bottom;

                    const y =
                      CHART_PADDING.top +
                      (
                        index /
                        (
                          chartTicks.length -
                          1
                        )
                      ) *
                        graphHeight;

                    return (
                      <g
                        key={`${tick}-${index}`}
                      >

                        <line
                          className="member-work-chart-axis-tick"
                          x1={
                            CHART_PADDING.left -
                            6
                          }
                          y1={y}
                          x2={
                            CHART_PADDING.left
                          }
                          y2={y}
                        />

                        <text
                          className="member-work-chart-y-label"
                          x={
                            CHART_PADDING.left -
                            11
                          }
                          y={
                            y + 3
                          }
                          textAnchor="end"
                        >
                          {
                            Number(
                              tick.toFixed(
                                1
                              )
                            )
                          } h
                        </text>
                      </g>
                    );
                  }
                )}

                {/* =======================================
                    AXIS LABEL
                ======================================= */}

                <text
                  className="member-work-chart-axis-title member-work-chart-axis-title-y"
                  x="15"
                  y={
                    CHART_PADDING.top -
                    10
                  }
                >
                  Heures
                </text>

                <text
                  className="member-work-chart-axis-title"
                  x={
                    chartData.width -
                    CHART_PADDING.right
                  }
                  y={
                    CHART_HEIGHT -
                    8
                  }
                  textAnchor="end"
                >
                  Dates
                </text>

                {/* =======================================
                    AREA GRADIENT
                ======================================= */}

                <defs>
                  <linearGradient
                    id="workHistoryGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#0b438c"
                      stopOpacity="0.15"
                    />

                    <stop
                      offset="100%"
                      stopColor="#0b438c"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                {/* =======================================
                    AREA
                ======================================= */}

                {chartData.points.length >
                  1 && (
                  <polygon
                    points={`
                      ${chartData.points[0].x},
                      ${
                        CHART_HEIGHT -
                        CHART_PADDING.bottom
                      }

                      ${chartData.polyline}

                      ${
                        chartData.points[
                          chartData.points.length -
                          1
                        ].x
                      },
                      ${
                        CHART_HEIGHT -
                        CHART_PADDING.bottom
                      }
                    `}
                    fill="url(#workHistoryGradient)"
                  />
                )}

                {/* =======================================
                    CURVE
                ======================================= */}

                {chartData.points.length >
                  1 && (
                  <polyline
                    className="member-work-chart-line"
                    points={
                      chartData.polyline
                    }
                  />
                )}

                {/* =======================================
                    POINTS + DATES
                ======================================= */}

                {chartData.points.map(
                  (point) => (
                    <g
                      key={
                        point.date
                      }
                    >

                      {/* Petite graduation date */}

                      <line
                        className="member-work-chart-date-tick"
                        x1={
                          point.x
                        }
                        y1={
                          CHART_HEIGHT -
                          CHART_PADDING.bottom
                        }
                        x2={
                          point.x
                        }
                        y2={
                          CHART_HEIGHT -
                          CHART_PADDING.bottom +
                          6
                        }
                      />

                      {/* POINT */}

                      <circle
                        className="member-work-chart-point member-work-chart-point-active"
                        cx={
                          point.x
                        }
                        cy={
                          point.y
                        }
                        r="5"
                      >
                        <title>
                          {formatDate(
                            point.date
                          )}
                          {"\n"}
                          {point.day}
                          {"\n"}
                          Heures travaillées :
                          {" "}
                          {point.workedHours}
                          {" h"}
                          {"\n"}
                          Heures supplémentaires :
                          {" "}
                          {point.extraHours}
                          {" h"}
                          {"\n"}
                          Total :
                          {" "}
                          {point.totalHours}
                          {" h"}
                        </title>
                      </circle>

                      {/* DATE */}

                      <text
                        className="member-work-chart-day-label"
                        x={
                          point.x
                        }
                        y={
                          CHART_HEIGHT -
                          CHART_PADDING.bottom +
                          22
                        }
                        textAnchor="middle"
                      >
                        {
                          formatShortDate(
                            point.date
                          )
                        }
                      </text>
                    </g>
                  )
                )}
              </svg>
            </div>
          )}

          {/* =================================================
              INFO SCROLL
          ================================================= */}

          {filteredChartEntries.length >
            CHART_VISIBLE_POINTS && (
            <div className="member-work-chart-scroll-hint">
              <span>
                ↔
              </span>

              Faites défiler horizontalement
              pour consulter les autres dates.
            </div>
          )}

          {/* =================================================
              STATS
          ================================================= */}

          {sortedEntries.length >
            0 && (
            <div className="member-work-chart-statistics">

              <div className="member-work-chart-stat">
                <span>
                  Temps travaillé
                </span>

                <strong>
                  {
                    totalWorkedHours
                  } h
                </strong>

                <small>
                  Depuis le début
                </small>
              </div>

              <div className="member-work-chart-stat">
                <span>
                  Supplémentaire
                </span>

                <strong>
                  {
                    totalExtraHours
                  } h
                </strong>

                <small>
                  Depuis le début
                </small>
              </div>

              <div className="member-work-chart-stat member-work-chart-stat-primary">
                <span>
                  Total cumulé
                </span>

                <strong>
                  {totalAllHours} h
                </strong>

                <small>
                  Historique complet
                </small>
              </div>

              <div className="member-work-chart-stat">
                <span>
                  Journées
                </span>

                <strong>
                  {
                    sortedEntries.length
                  }
                </strong>

                <small>
                  Journées enregistrées
                </small>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          HISTORIQUE
      ================================================= */}

      <div className="member-work-summary-card">

        <div className="member-work-summary-header">

          <div>
            <span>
              HISTORIQUE
            </span>

            <h2>
              Temps de travail enregistré
            </h2>

            <p>
              L'ensemble des journées
              renseignées depuis le début.
            </p>
          </div>

          <div className="member-work-summary-total">
            <span>
              Total global
            </span>

            <strong>
              {totalAllHours} h
            </strong>
          </div>
        </div>

        <div className="member-work-summary-table">

          <div className="member-work-summary-table-head member-work-history-head">

            <span>
              Date
            </span>

            <span>
              Jour
            </span>

            <span>
              Heures travaillées
            </span>

            <span>
              Supplémentaires
            </span>

            <span>
              Total
            </span>

            <span>
              Actions
            </span>
          </div>

          {sortedEntries.length ===
          0 ? (
            <div className="member-work-empty">

              <div className="member-work-empty-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M5 4h14v16H5z" />

                  <path d="M8 9h8" />

                  <path d="M8 13h8" />

                  <path d="M8 17h5" />
                </svg>
              </div>

              <strong>
                Aucun temps enregistré
              </strong>

              <p>
                Ajoutez votre première
                journée avec le formulaire
                ci-dessus.
              </p>
            </div>
          ) : (
            paginatedHistoryEntries.map(
              (entry) => (
                <div
                  className="member-work-summary-row member-work-history-row"
                  key={
                    entry.date
                  }
                >

                  <div className="member-work-history-date">
                    <strong>
                      {
                        formatDate(
                          entry.date
                        )
                      }
                    </strong>
                  </div>

                  <div className="member-work-summary-day">
                    <span>
                      {
                        entry.day.slice(
                          0,
                          1
                        )
                      }
                    </span>

                    <strong>
                      {entry.day}
                    </strong>
                  </div>

                  <div className="member-work-summary-value">
                    <strong>
                      {
                        entry.workedHours
                      }
                    </strong>

                    <span>
                      h
                    </span>
                  </div>

                  <div className="member-work-summary-value member-work-summary-extra">
                    <strong>
                      {
                        entry.extraHours
                      }
                    </strong>

                    <span>
                      h
                    </span>
                  </div>

                  <div className="member-work-summary-daily-total">
                    <strong>
                      {
                        entry.totalHours
                      } h
                    </strong>
                  </div>

                  <div className="member-work-summary-actions">

                    <button
                      type="button"
                      className="member-work-edit-button"
                      onClick={() =>
                        handleEditEntry(
                          entry
                        )
                      }
                    >
                      Modifier
                    </button>

                    <button
                      type="button"
                      className="member-work-delete-button"
                      onClick={() =>
                        handleDeleteEntry(
                          entry.date
                        )
                      }
                      aria-label={`Supprimer ${formatDate(
                        entry.date
                      )}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>


        {historyEntries.length >
          HISTORY_PAGE_SIZE && (
          <div className="member-work-history-pagination">

            <span className="member-work-history-pagination-info">
              Affichage {historyStartItem}–{historyEndItem} sur {historyEntries.length}
            </span>

            <div className="member-work-history-pagination-controls">

              <button
                type="button"
                className="member-work-history-page-button"
                disabled={
                  safeHistoryPage === 1
                }
                onClick={() =>
                  setHistoryPage(
                    Math.max(
                      1,
                      safeHistoryPage - 1
                    )
                  )
                }
                aria-label="Page précédente"
              >
                ‹
              </button>

              {visibleHistoryPages.map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    className={`member-work-history-page-button ${
                      page ===
                      safeHistoryPage
                        ? "member-work-history-page-button-active"
                        : ""
                    }`}
                    onClick={() =>
                      setHistoryPage(
                        page
                      )
                    }
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                className="member-work-history-page-button"
                disabled={
                  safeHistoryPage ===
                  totalHistoryPages
                }
                onClick={() =>
                  setHistoryPage(
                    Math.min(
                      totalHistoryPages,
                      safeHistoryPage + 1
                    )
                  )
                }
                aria-label="Page suivante"
              >
                ›
              </button>
            </div>
          </div>
        )}

        {sortedEntries.length >
          0 && (
          <div className="member-work-summary-footer">

            <div>
              <span>
                Heures travaillées
              </span>

              <strong>
                {
                  totalWorkedHours
                } h
              </strong>
            </div>

            <div>
              <span>
                Heures supplémentaires
              </span>

              <strong>
                {
                  totalExtraHours
                } h
              </strong>
            </div>

            <div className="member-work-summary-footer-main">
              <span>
                Total depuis le début
              </span>

              <strong>
                {totalAllHours} h
              </strong>
            </div>
          </div>
        )}
      </div>


    </section>
  );
}

export default MemberPersonalReportPage;