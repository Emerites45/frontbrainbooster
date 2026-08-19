import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import AuthLayout from "../../components/AuthLayout";

import aaprovidirLogo from "../../assets/aaprovidir-logo.png";
import marinaImg from "../../assets/marina.png";

import {
  registerUser,
} from "../../api/api";

import "./SignupPage.css";

/* =========================================================
   SIGNUP PAGE
========================================================= */

function SignupPage() {
  /* =======================================================
     FORMULAIRE
  ======================================================= */

  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    lastName,
    setLastName,
  ] = useState("");

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

    const cleanFirstName =
      firstName.trim();

    const cleanLastName =
      lastName.trim();

    const cleanEmail =
      email.trim();

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (
      !cleanFirstName
    ) {
      setError(
        "Veuillez renseigner votre prénom."
      );

      return;
    }

    if (
      !cleanLastName
    ) {
      setError(
        "Veuillez renseigner votre nom."
      );

      return;
    }

    if (
      !cleanEmail
    ) {
      setError(
        "Veuillez renseigner votre adresse e-mail."
      );

      return;
    }

    if (
      password.length < 8
    ) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
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
       * POST /api/v1/auth/signup
       *
       * {
       *   firstName,
       *   lastName,
       *   email,
       *   password
       * }
       */

      await registerUser({
        firstName:
          cleanFirstName,

        lastName:
          cleanLastName,

        email:
          cleanEmail,

        password,
      });

      /*
       * Si le backend autorise
       * l'inscription publique.
       */
      navigate(
        "/login",
        {
          state: {
            message:
              "Inscription réussie ! Connectez-vous.",
          },
        }
      );
    } catch (err) {
      /*
       * Le contrat précise que
       * l'inscription publique peut
       * être désactivée et retourner 403.
       */
      if (
        err?.status ===
        403
      ) {
        setError(
          "L'inscription publique est actuellement désactivée. Contactez un administrateur pour obtenir un compte."
        );
      } else {
        setError(
          err?.message ??
            "Impossible de créer le compte."
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
        <div className="showcase-wrapper">
          <img
            src={
              marinaImg
            }
            alt="Nourrir un avenir radieux"
            className="showcase-image"
          />
        </div>
      }
    >
      <div className="signup-form-wrap">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="signup-logo">
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

        <div className="signup-header">
          <h1 className="signup-title">
            Créer un compte
          </h1>

          <p className="signup-subtitle">
            Inscrivez-vous pour accéder
            à votre espace Aaprovidir.
          </p>
        </div>

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
          className="signup-form"
        >

          {/* =================================================
              PRÉNOM
          ================================================= */}

          <div className="form-group">
            <label htmlFor="firstName">
              Prénom
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
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                  />
                </svg>
              </span>

              <input
                id="firstName"
                type="text"
                placeholder="Jean"
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
                autoComplete="given-name"
                required
              />
            </div>
          </div>

          {/* =================================================
              NOM
          ================================================= */}

          <div className="form-group">
            <label htmlFor="lastName">
              Nom
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
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                  />
                </svg>
              </span>

              <input
                id="lastName"
                type="text"
                placeholder="Dupont"
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
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="form-group">
            <label htmlFor="email">
              Adresse e-mail professionnelle
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
                placeholder="j.dupont@entreprise.com"
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
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* =================================================
              MOT DE PASSE
          ================================================= */}

          <div className="form-group">
            <label htmlFor="password">
              Mot de passe
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
                placeholder="Au moins 8 caractères"
                value={
                  password
                }
                onChange={(
                  event
                ) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                minLength={
                  8
                }
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
              INFORMATIONS
          ================================================= */}

          <p className="legal-text">
            En vous inscrivant, vous
            acceptez nos{" "}
            <a
              href="/terms"
              className="link"
            >
              Conditions
            </a>{" "}
            et notre{" "}
            <a
              href="/privacy"
              className="link"
            >
              Politique de confidentialité
            </a>
            .
          </p>

          {/* =================================================
              BOUTON
          ================================================= */}

          <button
            type="submit"
            className="btn-primary"
            disabled={
              loading
            }
          >
            {loading
              ? "Création..."
              : "Créer mon compte"}

            <span className="btn-arrow">
              →
            </span>
          </button>
        </form>

        {/* =================================================
            FOOTER
        ================================================= */}

        <p className="signup-footer">
          Vous avez déjà un compte ?{" "}

          <Link
            to="/login"
            className="link"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default SignupPage;