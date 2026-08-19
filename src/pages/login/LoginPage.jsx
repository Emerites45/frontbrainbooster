import {
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AuthLayout from "../../components/AuthLayout";

import aaprovidirLogo from "../../assets/aaprovidir-logo.png";
import marinaImg from "../../assets/marina.png";

import {
  loginUser,
} from "../../api/api";

import "./LoginPage.css";

/* =========================================================
   LOGIN PAGE
========================================================= */

function LoginPage({
  onLogin,
}) {
  /* =======================================================
     FORMULAIRE
  ======================================================= */

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    rememberMe,
    setRememberMe,
  ] = useState(false);

  /* =======================================================
     ÉTATS
  ======================================================= */

  const [
    error,
    setError,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const navigate =
    useNavigate();

  const location =
    useLocation();

  /* =======================================================
     MESSAGES VENANT D'AUTRES PAGES
  ======================================================= */

  const successMessage =
    location.state?.message ??
    (
      location.state?.resetSuccess
        ? "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter."
        : null
    );

  /* =======================================================
     SOUMISSION
  ======================================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError(
      null
    );

    const cleanEmail =
      email.trim();

    /* -------------------------------------------------------
       VALIDATION LOCALE
    ------------------------------------------------------- */

    if (
      !cleanEmail
    ) {
      setError(
        "Veuillez renseigner votre adresse e-mail."
      );

      return;
    }

    if (
      !password
    ) {
      setError(
        "Veuillez renseigner votre mot de passe."
      );

      return;
    }

    setLoading(
      true
    );

    try {
      /*
       * CONTRAT BACKEND :
       *
       * POST /api/v1/auth/login
       *
       * Body :
       *
       * {
       *   email,
       *   password
       * }
       *
       * Réponse :
       *
       * {
       *   token,
       *   user
       * }
       */

         const data =
         await loginUser(
         cleanEmail,
         password
       );

//tester les different utilisateur sans le backend 
/* let testUser;

if (
  cleanEmail ===
  "admin@test.com"
) {
  testUser = {
    id: 1,

    firstName: "Dilane",

    lastName: "Admin",

    email: cleanEmail,

    globalRoles: [
      "ADMIN",
    ],

    departmentRoles: [],

    mustChangePassword: false,
  };
} else if (
  cleanEmail ===
  "scrum@test.com"
) {
  testUser = {
    id: 2,

    firstName: "Jean",

    lastName: "Scrum",

    email: cleanEmail,

    globalRoles: [],

    departmentRoles: [
      {
        departmentId: 1,

        departmentName:
          "Informatique",

        role:
          "SCRUM_MASTER",
      },
    ],

    mustChangePassword: false,
  };
} else {
  testUser = {
    id: 3,

    firstName: "Paul",

    lastName: "Member",

    email: cleanEmail,

    globalRoles: [],

    departmentRoles: [
      {
        departmentId: 1,

        departmentName:
          "Informatique",

        role:
          "MEMBER",
      },
    ],

    mustChangePassword: false,
  };
}

const data = {
  token:
    "TEST_TOKEN_FRONTEND",

  user:
    testUser,
};
*/
      /* -----------------------------------------------------
         VALIDATION DE LA RÉPONSE
      ----------------------------------------------------- */

      if (
        !data?.token ||
        !data?.user
      ) {
        throw new Error(
          "La réponse du serveur de connexion est invalide."
        );
      }

      /* -----------------------------------------------------
         SESSION
      ----------------------------------------------------- */

      if (
        onLogin
      ) {
        onLogin(
          data
        );
      }

      /*
       * Pour le moment, App.jsx gère
       * réellement le stockage du token
       * et de l'utilisateur.
       *
       * Le checkbox "Se souvenir de moi"
       * reste donc uniquement un choix
       * d'interface tant que le backend
       * ne définit pas de durée différente
       * de session.
       */
      if (
        rememberMe
      ) {
        console.info(
          "Option « Se souvenir de moi » activée."
        );
      }

      /*
       * App.jsx déterminera ensuite
       * automatiquement l'espace :
       *
       * ADMIN
       * SCRUM_MASTER
       * MEMBER
       */
      navigate(
        "/",
        {
          replace:
            true,
        }
      );
    } catch (err) {
      console.error(
        "Erreur de connexion :",
        err
      );

      /*
       * Contrat :
       *
       * 401 = identifiants invalides
       * ou token invalide.
       */
      if (
        err?.status ===
        401
      ) {
        setError(
          "Adresse e-mail ou mot de passe incorrect."
        );
      } else if (
        err?.status ===
        403
      ) {
        setError(
          "Vous n'êtes pas autorisé à accéder à cette application."
        );
      } else {
        setError(
          err?.message ??
            "Impossible de vous connecter."
        );
      }
    } finally {
      setLoading(
        false
      );
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AuthLayout
      fillRight={
        true
      }
      rightContent={
        <img
          src={
            marinaImg
          }
          alt="Nourrir un avenir radieux"
          className="showcase-image"
        />
      }
    >
      <div className="login-form-wrap">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="login-logo">
          <img
            src={
              aaprovidirLogo
            }
            alt="Aaprovidir"
            className="logo-img"
          />
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="login-header">
          <h1 className="login-title">
            Bon retour
          </h1>

          <p className="login-subtitle">
            Connectez-vous à votre espace
            Aaprovidir.
          </p>
        </div>

        {/* =================================================
            MESSAGE SUCCÈS
        ================================================= */}

        {successMessage && (
          <div
            role="status"
            style={{
              color:
                "#067647",

              background:
                "#ecfdf3",

              border:
                "1px solid #abefc6",

              borderRadius:
                "8px",

              padding:
                "10px 12px",

              fontSize:
                "13px",

              marginBottom:
                "14px",

              lineHeight:
                1.5,
            }}
          >
            {successMessage}
          </div>
        )}

        {/* =================================================
            ERREUR
        ================================================= */}

        {error && (
          <div
            role="alert"
            style={{
              color:
                "#b42318",

              background:
                "#fff4f2",

              border:
                "1px solid #ffd5d2",

              borderRadius:
                "8px",

              padding:
                "10px 12px",

              fontSize:
                "13px",

              marginBottom:
                "14px",

              lineHeight:
                1.5,
            }}
          >
            {error}
          </div>
        )}

        {/* =================================================
            FORMULAIRE
        ================================================= */}

        <form
          onSubmit={
            handleSubmit
          }
          className="login-form"
        >

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="form-group">
            <label htmlFor="email">
              Adresse e-mail
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />

                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>

              <input
                id="email"
                type="email"
                placeholder="nom@entreprise.com"
                value={
                  email
                }
                onChange={(
                  event
                ) => {
                  setEmail(
                    event.target.value
                  );

                  if (
                    error
                  ) {
                    setError(
                      null
                    );
                  }
                }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* =================================================
              MOT DE PASSE
          ================================================= */}

          <div className="form-group">

            <div className="label-row">
              <label htmlFor="password">
                Mot de passe
              </label>

              <Link
                to="/forgot-password"
                className="link-small"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <div className="input-wrapper">

              <span className="input-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="9"
                    rx="2"
                  />

                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              </span>

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="••••••••"
                value={
                  password
                }
                onChange={(
                  event
                ) => {
                  setPassword(
                    event.target.value
                  );

                  if (
                    error
                  ) {
                    setError(
                      null
                    );
                  }
                }}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="toggle-eye"
                onClick={() =>
                  setShowPassword(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.1A10.4 10.4 0 0112 5c6.5 0 10 7 10 7a17.7 17.7 0 01-3.2 4.1M6.5 6.6C4 8.3 2 12 2 12s3.5 7 10 7c1.4 0 2.6-.3 3.7-.8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* =================================================
              FOOTER FORMULAIRE
          ================================================= */}

          <div className="form-footer-row">

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={
                  rememberMe
                }
                onChange={(
                  event
                ) =>
                  setRememberMe(
                    event.target.checked
                  )
                }
              />

              <span>
                Se souvenir de moi
              </span>
            </label>

            <button
              type="submit"
              className="btn-primary"
              disabled={
                loading
              }
            >
              {loading
                ? "Connexion..."
                : "Se connecter au tableau de bord"}

              <span className="btn-arrow">
                →
              </span>
            </button>
          </div>
        </form>

        {/* =================================================
            SIGNUP
        ================================================= */}

        <p className="login-footer">
          Pas encore de compte ?{" "}

          <Link
            to="/signup"
            className="link"
          >
            S'inscrire
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;