import {
  Link,
  useNavigate,
} from "react-router-dom";

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
   NAVBAR
========================================================= */

function Navbar({
  currentUser,
  onLogout,
}) {
  const navigate =
    useNavigate();

  const fullName =
    getUserFullName(
      currentUser
    );

  /* =======================================================
     LOGOUT
  ======================================================= */

  function handleLogoutClick() {
    onLogout?.();

    navigate(
      "/login",
      {
        replace:
          true,
      }
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <nav
      style={{
        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        padding:
          "12px 18px",

        borderBottom:
          "1px solid #e5e7eb",

        background:
          "#ffffff",

        gap:
          "20px",
      }}
    >
      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div
        style={{
          display:
            "flex",

          alignItems:
            "center",

          gap:
            "16px",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration:
              "none",

            fontWeight:
              600,

            color:
              "#111827",
          }}
        >
          Board
        </Link>

        <Link
          to="/dashboard"
          style={{
            textDecoration:
              "none",

            fontWeight:
              600,

            color:
              "#111827",
          }}
        >
          Dashboard
        </Link>

        <Link
          to="/projects"
          style={{
            textDecoration:
              "none",

            fontWeight:
              600,

            color:
              "#111827",
          }}
        >
          Projets
        </Link>
      </div>

      {/* =================================================
          PROFIL
      ================================================= */}

      <div
        style={{
          display:
            "flex",

          alignItems:
            "center",

          gap:
            "14px",
        }}
      >
        <div
          style={{
            display:
              "flex",

            flexDirection:
              "column",

            alignItems:
              "flex-end",

            lineHeight:
              1.2,
          }}
        >
          <strong
            style={{
              fontSize:
                "14px",

              color:
                "#111827",
            }}
          >
            {
              fullName
            }
          </strong>

          {currentUser?.email && (
            <small
              style={{
                marginTop:
                  "3px",

                color:
                  "#6b7280",

                fontSize:
                  "11px",
              }}
            >
              {
                currentUser.email
              }
            </small>
          )}
        </div>

        <button
          type="button"
          onClick={
            handleLogoutClick
          }
          style={{
            border:
              "1px solid #d1d5db",

            background:
              "#ffffff",

            borderRadius:
              "7px",

            padding:
              "8px 12px",

            cursor:
              "pointer",

            fontWeight:
              600,

            color:
              "#374151",
          }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}

export default Navbar;