import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchUsers,
} from "../api/api";

import StatsGrid from "../components/dashboard/StatsGrid";
import WorkloadList from "../components/dashboard/WorkloadList";
import ProjectsTable from "../components/dashboard/ProjectsTable";

import {
  computeTaskStats,
  getAssigneeIds,
} from "../utils/dashboardHelpers";

import "./AdminDashboard.css";

/* =========================================================
   HELPERS
========================================================= */

function getUserFullName(
  user
) {
  if (!user) {
    return "Utilisateur";
  }

  const fullName =
    `${user.firstName ?? ""} ${
      user.lastName ?? ""
    }`.trim();

  return (
    fullName ||
    user.email ||
    "Utilisateur"
  );
}

/* =========================================================
   SCRUM MASTER DASHBOARD
========================================================= */

function ScrumMasterDashboardPage({
  currentUser,
  tasks = [],
  projects = [],
}) {
  /* =======================================================
     UTILISATEURS
  ======================================================= */

  const [
    users,
    setUsers,
  ] =
    useState([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  /* =======================================================
     DÉPARTEMENT SÉLECTIONNÉ
  ======================================================= */

  const [
    selectedDepartmentId,
    setSelectedDepartmentId,
  ] =
    useState("");

  /* =======================================================
     CHARGEMENT UTILISATEURS
  ======================================================= */

  useEffect(
    () => {
      let cancelled =
        false;

      async function loadUsers() {
        setLoading(
          true
        );

        setError("");

        try {
          const data =
            await fetchUsers();

          if (
            cancelled
          ) {
            return;
          }

          setUsers(
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
            "Erreur chargement utilisateurs Scrum Master :",
            err
          );

          setUsers([]);

          setError(
            err?.message ??
              "Impossible de charger les membres de l'équipe."
          );
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            );
          }
        }
      }

      loadUsers();

      return () => {
        cancelled =
          true;
      };
    },
    []
  );

  /* =======================================================
     RÔLES SCRUM MASTER
  ======================================================= */

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
          (
            departmentRole
          ) =>
            departmentRole?.role ===
            "SCRUM_MASTER" &&
            departmentRole?.departmentId !==
              undefined &&
            departmentRole?.departmentId !==
              null
        );
      },
      [
        currentUser,
      ]
    );

  /* =======================================================
     DÉPARTEMENT PAR DÉFAUT
  ======================================================= */

  useEffect(
    () => {
      if (
        scrumMasterRoles.length ===
        0
      ) {
        setSelectedDepartmentId(
          ""
        );

        return;
      }

      const stillExists =
        scrumMasterRoles.some(
          (
            role
          ) =>
            String(
              role.departmentId
            ) ===
            String(
              selectedDepartmentId
            )
        );

      if (
        !stillExists
      ) {
        setSelectedDepartmentId(
          String(
            scrumMasterRoles[0]
              .departmentId
          )
        );
      }
    },
    [
      scrumMasterRoles,
      selectedDepartmentId,
    ]
  );

  /* =======================================================
     RÔLE DU DÉPARTEMENT ACTIF
  ======================================================= */

  const selectedDepartmentRole =
    useMemo(
      () =>
        scrumMasterRoles.find(
          (
            role
          ) =>
            String(
              role.departmentId
            ) ===
            String(
              selectedDepartmentId
            )
        ) ??
        null,
      [
        scrumMasterRoles,
        selectedDepartmentId,
      ]
    );

  const departmentId =
    selectedDepartmentRole
      ?.departmentId ??
    null;

  const departmentName =
    selectedDepartmentRole
      ?.departmentName ??
    "Département";

  /* =======================================================
     PROJETS DU DÉPARTEMENT
  ======================================================= */

  const departmentProjects =
    useMemo(
      () => {
        if (
          departmentId ===
            null ||
          departmentId ===
            undefined
        ) {
          return [];
        }

        return projects.filter(
          (
            project
          ) =>
            String(
              project.departmentId
            ) ===
            String(
              departmentId
            )
        );
      },
      [
        projects,
        departmentId,
      ]
    );

  /* =======================================================
     IDS PROJETS
  ======================================================= */

  const departmentProjectIds =
    useMemo(
      () =>
        new Set(
          departmentProjects.map(
            (
              project
            ) =>
              String(
                project.id
              )
          )
        ),
      [
        departmentProjects,
      ]
    );

  /* =======================================================
     TÂCHES DU DÉPARTEMENT
  ======================================================= */

  const departmentTasks =
    useMemo(
      () =>
        tasks.filter(
          (
            task
          ) =>
            departmentProjectIds.has(
              String(
                task.projectId
              )
            )
        ),
      [
        tasks,
        departmentProjectIds,
      ]
    );

  /* =======================================================
     MEMBRES DU DÉPARTEMENT
  ======================================================= */

  const teamMembers =
    useMemo(
      () => {
        if (
          departmentId ===
            null ||
          departmentId ===
            undefined
        ) {
          return [];
        }

        return users.filter(
          (
            user
          ) => {
            /*
             * On ne remet pas le Scrum Master
             * lui-même dans la liste de charge.
             */
            if (
              String(
                user.id
              ) ===
              String(
                currentUser?.id
              )
            ) {
              return false;
            }

            return (
              Array.isArray(
                user?.departmentRoles
              ) &&
              user.departmentRoles.some(
                (
                  role
                ) =>
                  String(
                    role.departmentId
                  ) ===
                  String(
                    departmentId
                  )
              )
            );
          }
        );
      },
      [
        users,
        currentUser,
        departmentId,
      ]
    );

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const stats =
    useMemo(
      () =>
        computeTaskStats(
          departmentTasks
        ),
      [
        departmentTasks,
      ]
    );

  /* =======================================================
     CHARGE ÉQUIPE
  ======================================================= */

  const workloadRows =
    useMemo(
      () =>
        teamMembers.map(
          (
            member
          ) => {
            const memberTasks =
              departmentTasks.filter(
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
                        member.id
                      )
                  )
              );

            const done =
              memberTasks.filter(
                (
                  task
                ) =>
                  task.status ===
                  "TERMINE"
              ).length;

            return {
              id:
                member.id,

              name:
                getUserFullName(
                  member
                ),

              numerator:
                done,

              total:
                memberTasks.length,

              unitLabel:
                "tâches",
            };
          }
        ),
      [
        teamMembers,
        departmentTasks,
      ]
    );

  /* =======================================================
     CHARGEMENT
  ======================================================= */

  if (
    loading
  ) {
    return (
      <p className="loading-text">
        Chargement du tableau de bord...
      </p>
    );
  }

  /* =======================================================
     AUCUN DÉPARTEMENT SCRUM
  ======================================================= */

  if (
    scrumMasterRoles.length ===
    0
  ) {
    return (
      <div className="admin-dashboard">

        <p className="empty-state">
          Aucun département Scrum Master
          n'est associé à votre compte.
          Contactez un administrateur si
          cela ne devrait pas être le cas.
        </p>

      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="admin-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>
          <h1>
            Tableau de bord —{" "}
            {
              departmentName
            }
          </h1>

          <p className="dashboard-subtitle">
            Vue d'ensemble de votre
            équipe et de vos projets.
          </p>
        </div>

        {/* =================================================
            CHOIX DU DÉPARTEMENT
        ================================================= */}

        {scrumMasterRoles.length >
          1 && (
          <div
            style={{
              display:
                "flex",

              flexDirection:
                "column",

              gap:
                "5px",

              minWidth:
                "220px",
            }}
          >
            <label
              htmlFor="scrum-department-select"
              style={{
                fontSize:
                  "12px",

                fontWeight:
                  600,

                color:
                  "#64748b",
              }}
            >
              Département
            </label>

            <select
              id="scrum-department-select"
              value={
                selectedDepartmentId
              }
              onChange={(
                event
              ) =>
                setSelectedDepartmentId(
                  event.target.value
                )
              }
            >
              {scrumMasterRoles.map(
                (
                  role
                ) => (
                  <option
                    key={
                      role.departmentId
                    }
                    value={
                      role.departmentId
                    }
                  >
                    {role.departmentName ??
                      `Département ${role.departmentId}`}
                  </option>
                )
              )}
            </select>
          </div>
        )}
      </div>

      {/* =================================================
          ERREUR UTILISATEURS
      ================================================= */}

      {error && (
        <div
          className="admin-card"
          style={{
            marginBottom:
              "18px",

            color:
              "#b42318",
          }}
        >
          {
            error
          }
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <StatsGrid
        items={[
          {
            label:
              "Tâches du département",

            value:
              stats.total,
          },

          {
            label:
              "À faire",

            value:
              stats.todo,
          },

          {
            label:
              "En cours",

            value:
              stats.inProgress,
          },

          {
            label:
              "Terminées",

            value:
              stats.done,

            variant:
              "positive",
          },

          {
            label:
              "En retard",

            value:
              stats.overdue,

            variant:
              stats.overdue >
              0
                ? "negative"
                : undefined,
          },

          {
            label:
              "Progression",

            value:
              `${stats.progression}%`,
          },
        ]}
      />

      {/* =================================================
          GRID
      ================================================= */}

      <div className="admin-grid">

        {/* =================================================
            CHARGE ÉQUIPE
        ================================================= */}

        <WorkloadList
          title="Charge de l'équipe"
          rows={
            workloadRows
          }
          emptyMessage="Aucun autre membre dans ce département pour l'instant."
        />

        {/* =================================================
            PROJETS
        ================================================= */}

        <ProjectsTable
          title="Projets du département"
          projects={
            departmentProjects
          }
          tasks={
            departmentTasks
          }
        />

      </div>
    </div>
  );
}

export default ScrumMasterDashboardPage;