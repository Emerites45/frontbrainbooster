import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchUsers,
  fetchDepartments,
  createAdminUser,
} from "../api/api";

import {
  computeTaskStats,
  getAssigneeIds,
  projectProgress,
} from "../utils/dashboardHelpers";

import RecentActivity from "../components/dashboard/RecentActivity";

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

function getUserDepartmentIds(
  user
) {
  if (
    !Array.isArray(
      user?.departmentRoles
    )
  ) {
    return [];
  }

  return [
    ...new Set(
      user.departmentRoles
        .map(
          (
            role
          ) =>
            role?.departmentId
        )
        .filter(
          (
            id
          ) =>
            id !==
              undefined &&
            id !==
              null
        )
        .map(
          String
        )
    ),
  ];
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboardPage({
  tasks = [],
  projects = [],
  actions = [],
}) {
  /* =======================================================
     DONNÉES
  ======================================================= */

  const [
    users,
    setUsers,
  ] =
    useState([]);

  const [
    departments,
    setDepartments,
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
     FORMULAIRE UTILISATEUR
  ======================================================= */

  const [
    showUserForm,
    setShowUserForm,
  ] =
    useState(false);

  const [
    firstName,
    setFirstName,
  ] =
    useState("");

  const [
    lastName,
    setLastName,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    departmentId,
    setDepartmentId,
  ] =
    useState("");

  const [
    departmentRole,
    setDepartmentRole,
  ] =
    useState(
      "MEMBER"
    );

  const [
    globalRole,
    setGlobalRole,
  ] =
    useState(
      "USER"
    );

  const [
    creatingUser,
    setCreatingUser,
  ] =
    useState(false);

  const [
    createUserError,
    setCreateUserError,
  ] =
    useState("");

  /* =======================================================
     CHARGEMENT
  ======================================================= */

  useEffect(
    () => {
      let cancelled =
        false;

      async function loadDashboardData() {
        setLoading(
          true
        );

        setError("");

        try {
          const [
            usersData,
            departmentsData,
          ] =
            await Promise.all([
              fetchUsers(),
              fetchDepartments(),
            ]);

          if (
            cancelled
          ) {
            return;
          }

          setUsers(
            Array.isArray(
              usersData
            )
              ? usersData
              : []
          );

          setDepartments(
            Array.isArray(
              departmentsData
            )
              ? departmentsData
              : []
          );
        } catch (err) {
          if (
            cancelled
          ) {
            return;
          }

          console.error(
            "Erreur chargement dashboard admin :",
            err
          );

          setError(
            err?.message ??
              "Impossible de charger les données administratives."
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

      loadDashboardData();

      return () => {
        cancelled =
          true;
      };
    },
    []
  );

  /* =======================================================
     STATS TÂCHES
  ======================================================= */

  const stats =
    useMemo(
      () =>
        computeTaskStats(
          tasks
        ),
      [
        tasks,
      ]
    );

  /* =======================================================
     STATS PROJETS
  ======================================================= */

  const projectStats =
    useMemo(
      () => {
        const total =
          projects.length;

        const todo =
          projects.filter(
            (
              project
            ) =>
              project.status ===
              "A_FAIRE"
          ).length;

        const inProgress =
          projects.filter(
            (
              project
            ) =>
              project.status ===
              "EN_COURS"
          ).length;

        const done =
          projects.filter(
            (
              project
            ) =>
              project.status ===
              "TERMINE"
          ).length;

        return {
          total,
          todo,
          inProgress,
          done,
        };
      },
      [
        projects,
      ]
    );

  /* =======================================================
     CHARGE PAR UTILISATEUR
  ======================================================= */

  const userWorkload =
    useMemo(
      () => {
        return users
          .map(
            (
              user
            ) => {
              const assignedTasks =
                tasks.filter(
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
                          user.id
                        )
                    )
                );

              const activeTasks =
                assignedTasks.filter(
                  (
                    task
                  ) =>
                    task.status !==
                    "TERMINE"
                );

              const doneTasks =
                assignedTasks.filter(
                  (
                    task
                  ) =>
                    task.status ===
                    "TERMINE"
                );

              return {
                user,
                total:
                  assignedTasks.length,

                active:
                  activeTasks.length,

                done:
                  doneTasks.length,
              };
            }
          )
          .sort(
            (
              a,
              b
            ) =>
              b.active -
              a.active
          );
      },
      [
        users,
        tasks,
      ]
    );

  /* =======================================================
     PROJETS AVEC PROGRESSION
  ======================================================= */

  const projectsWithProgress =
    useMemo(
      () =>
        projects.map(
          (
            project
          ) => ({
            ...project,

            progress:
              projectProgress(
                project,
                tasks
              ),
          })
        ),
      [
        projects,
        tasks,
      ]
    );

  /* =======================================================
     CRÉATION UTILISATEUR
  ======================================================= */

  async function handleCreateUser(
    event
  ) {
    event.preventDefault();

    setCreateUserError("");

    const cleanFirstName =
      firstName.trim();

    const cleanLastName =
      lastName.trim();

    const cleanEmail =
      email.trim();

    if (
      !cleanFirstName ||
      !cleanLastName ||
      !cleanEmail ||
      !departmentId
    ) {
      setCreateUserError(
        "Veuillez remplir tous les champs obligatoires."
      );

      return;
    }

    setCreatingUser(
      true
    );

    try {
      /*
       * CONTRAT BACKEND :
       *
       * POST /api/v1/users
       *
       * {
       *   firstName,
       *   lastName,
       *   email,
       *   departmentId,
       *   departmentRole,
       *   globalRole
       * }
       */
      const createdUser =
        await createAdminUser({
          firstName:
            cleanFirstName,

          lastName:
            cleanLastName,

          email:
            cleanEmail,

          departmentId:
            Number(
              departmentId
            ),

          departmentRole,

          globalRole,
        });

      if (
        createdUser
      ) {
        setUsers(
          (
            previous
          ) => [
            ...previous,
            createdUser,
          ]
        );
      }

      setFirstName("");
      setLastName("");
      setEmail("");
      setDepartmentId("");
      setDepartmentRole(
        "MEMBER"
      );
      setGlobalRole(
        "USER"
      );

      setShowUserForm(
        false
      );
    } catch (err) {
      console.error(
        "Erreur création utilisateur :",
        err
      );

      setCreateUserError(
        err?.message ??
          "Impossible de créer l'utilisateur."
      );
    } finally {
      setCreatingUser(
        false
      );
    }
  }

  /* =======================================================
     RENDER LOADING
  ======================================================= */

  if (
    loading
  ) {
    return (
      <div className="admin-dashboard">
        <p>
          Chargement du dashboard administrateur...
        </p>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="admin-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-dashboard-header">
        <div>
          <span className="admin-dashboard-eyebrow">
            Administration
          </span>

          <h1>
            Dashboard administrateur
          </h1>

          <p>
            Vue globale des tâches,
            projets, utilisateurs et
            départements.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() =>
            setShowUserForm(
              (
                current
              ) =>
                !current
            )
          }
        >
          {showUserForm
            ? "Fermer"
            : "+ Ajouter un utilisateur"}
        </button>
      </div>

      {/* =================================================
          ERREUR
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
          CRÉATION UTILISATEUR
      ================================================= */}

      {showUserForm && (
        <section className="admin-card">

          <h2>
            Nouvel utilisateur
          </h2>

          <form
            onSubmit={
              handleCreateUser
            }
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",

              gap:
                "14px",

              marginTop:
                "16px",
            }}
          >

            <div className="form-group">
              <label htmlFor="admin-first-name">
                Prénom
              </label>

              <input
                id="admin-first-name"
                type="text"
                value={
                  firstName
                }
                onChange={(
                  event
                ) =>
                  setFirstName(
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-last-name">
                Nom
              </label>

              <input
                id="admin-last-name"
                type="text"
                value={
                  lastName
                }
                onChange={(
                  event
                ) =>
                  setLastName(
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-email">
                E-mail
              </label>

              <input
                id="admin-email"
                type="email"
                value={
                  email
                }
                onChange={(
                  event
                ) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-department">
                Département
              </label>

              <select
                id="admin-department"
                value={
                  departmentId
                }
                onChange={(
                  event
                ) =>
                  setDepartmentId(
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Sélectionner
                </option>

                {departments.map(
                  (
                    department
                  ) => (
                    <option
                      key={
                        department.id
                      }
                      value={
                        department.id
                      }
                    >
                      {
                        department.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="admin-department-role">
                Rôle département
              </label>

              <select
                id="admin-department-role"
                value={
                  departmentRole
                }
                onChange={(
                  event
                ) =>
                  setDepartmentRole(
                    event.target.value
                  )
                }
              >
                <option value="MEMBER">
                  Member
                </option>

                <option value="SCRUM_MASTER">
                  Scrum Master
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="admin-global-role">
                Rôle global
              </label>

              <select
                id="admin-global-role"
                value={
                  globalRole
                }
                onChange={(
                  event
                ) =>
                  setGlobalRole(
                    event.target.value
                  )
                }
              >
                <option value="USER">
                  Utilisateur
                </option>

                <option value="ADMIN">
                  Administrateur
                </option>
              </select>
            </div>

            {createUserError && (
              <div
                style={{
                  gridColumn:
                    "1 / -1",

                  color:
                    "#b42318",

                  fontSize:
                    "13px",
                }}
              >
                {
                  createUserError
                }
              </div>
            )}

            <div
              style={{
                gridColumn:
                  "1 / -1",

                display:
                  "flex",

                justifyContent:
                  "flex-end",

                gap:
                  "10px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setShowUserForm(
                    false
                  )
                }
                disabled={
                  creatingUser
                }
              >
                Annuler
              </button>

              <button
                type="submit"
                className="admin-primary-button"
                disabled={
                  creatingUser
                }
              >
                {creatingUser
                  ? "Création..."
                  : "Créer l'utilisateur"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <section className="admin-stats-grid">

        <article className="admin-stat-card">
          <span>
            Tâches
          </span>

          <strong>
            {
              stats.total
            }
          </strong>

          <small>
            {
              stats.inProgress
            }{" "}
            en cours
          </small>
        </article>

        <article className="admin-stat-card">
          <span>
            Terminées
          </span>

          <strong>
            {
              stats.done
            }
          </strong>

          <small>
            {
              stats.progression
            }
            % de progression
          </small>
        </article>

        <article className="admin-stat-card">
          <span>
            En retard
          </span>

          <strong>
            {
              stats.overdue
            }
          </strong>

          <small>
            Tâches à surveiller
          </small>
        </article>

        <article className="admin-stat-card">
          <span>
            Projets
          </span>

          <strong>
            {
              projectStats.total
            }
          </strong>

          <small>
            {
              projectStats.inProgress
            }{" "}
            en cours
          </small>
        </article>

        <article className="admin-stat-card">
          <span>
            Utilisateurs
          </span>

          <strong>
            {
              users.length
            }
          </strong>

          <small>
            Comptes chargés
          </small>
        </article>

        <article className="admin-stat-card">
          <span>
            Départements
          </span>

          <strong>
            {
              departments.length
            }
          </strong>

          <small>
            Structures actives
          </small>
        </article>
      </section>

      {/* =================================================
          GRID PRINCIPALE
      ================================================= */}

      <section className="admin-dashboard-grid">

        {/* =================================================
            PROJETS
        ================================================= */}

        <div className="admin-card">
          <h2>
            Progression des projets
          </h2>

          {projectsWithProgress.length ===
          0 ? (
            <p className="empty-state">
              Aucun projet disponible.
            </p>
          ) : (
            <div
              style={{
                display:
                  "grid",

                gap:
                  "14px",

                marginTop:
                  "14px",
              }}
            >
              {projectsWithProgress.map(
                (
                  project
                ) => (
                  <div
                    key={
                      project.id
                    }
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        gap:
                          "12px",

                        marginBottom:
                          "6px",
                      }}
                    >
                      <strong>
                        {
                          project.name
                        }
                      </strong>

                      <span>
                        {
                          project.progress
                        }
                        %
                      </span>
                    </div>

                    <div
                      style={{
                        height:
                          "7px",

                        background:
                          "#e5e7eb",

                        borderRadius:
                          "999px",

                        overflow:
                          "hidden",
                      }}
                    >
                      <div
                        style={{
                          height:
                            "100%",

                          width:
                            `${project.progress}%`,

                          background:
                            "#0b438c",
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* =================================================
            ACTIVITÉ
        ================================================= */}

        <RecentActivity
          actions={
            actions
          }
        />
      </section>

      {/* =================================================
          CHARGE UTILISATEURS
      ================================================= */}

      <section className="admin-card">

        <h2>
          Charge des utilisateurs
        </h2>

        {userWorkload.length ===
        0 ? (
          <p className="empty-state">
            Aucun utilisateur disponible.
          </p>
        ) : (
          <div
            style={{
              overflowX:
                "auto",

              marginTop:
                "14px",
            }}
          >
            <table
              style={{
                width:
                  "100%",

                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign:
                        "left",

                      padding:
                        "10px",
                    }}
                  >
                    Utilisateur
                  </th>

                  <th
                    style={{
                      textAlign:
                        "left",

                      padding:
                        "10px",
                    }}
                  >
                    Départements
                  </th>

                  <th
                    style={{
                      textAlign:
                        "left",

                      padding:
                        "10px",
                    }}
                  >
                    Total
                  </th>

                  <th
                    style={{
                      textAlign:
                        "left",

                      padding:
                        "10px",
                    }}
                  >
                    Actives
                  </th>

                  <th
                    style={{
                      textAlign:
                        "left",

                      padding:
                        "10px",
                    }}
                  >
                    Terminées
                  </th>
                </tr>
              </thead>

              <tbody>
                {userWorkload.map(
                  (
                    item
                  ) => {
                    const userDepartmentIds =
                      getUserDepartmentIds(
                        item.user
                      );

                    const departmentNames =
                      departments
                        .filter(
                          (
                            department
                          ) =>
                            userDepartmentIds.includes(
                              String(
                                department.id
                              )
                            )
                        )
                        .map(
                          (
                            department
                          ) =>
                            department.name
                        );

                    return (
                      <tr
                        key={
                          item.user.id
                        }
                      >
                        <td
                          style={{
                            padding:
                              "10px",

                            borderTop:
                              "1px solid #e5e7eb",
                          }}
                        >
                          <strong>
                            {getUserFullName(
                              item.user
                            )}
                          </strong>

                          <div
                            style={{
                              fontSize:
                                "12px",

                              color:
                                "#64748b",

                              marginTop:
                                "3px",
                            }}
                          >
                            {
                              item.user.email
                            }
                          </div>
                        </td>

                        <td
                          style={{
                            padding:
                              "10px",

                            borderTop:
                              "1px solid #e5e7eb",
                          }}
                        >
                          {departmentNames.length >
                          0
                            ? departmentNames.join(
                                ", "
                              )
                            : "—"}
                        </td>

                        <td
                          style={{
                            padding:
                              "10px",

                            borderTop:
                              "1px solid #e5e7eb",
                          }}
                        >
                          {
                            item.total
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "10px",

                            borderTop:
                              "1px solid #e5e7eb",
                          }}
                        >
                          {
                            item.active
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "10px",

                            borderTop:
                              "1px solid #e5e7eb",
                          }}
                        >
                          {
                            item.done
                          }
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboardPage;