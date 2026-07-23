// après
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import aaprovidirLogo from "../assets/aaprovidir-logo.png";
import marinaImg from "../assets/marina.png";
import { requestPasswordReset } from "../api/api";
import "./ForgotPasswordPage.css";
import PasswordResetStepper from "../components/PasswordResetStepper";
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      navigate("/verify-email", { state: { email, mode: "reset" } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

// après
const rightContent = (
  <img src={marinaImg} alt="Nourrir un avenir radieux" className="showcase-image" />
);

  // après
return (
  <AuthLayout fillRight={true} rightContent={rightContent}>
      <div className="fp-form-wrap">
        <Link to="/login" className="fp-back-link">← Retour à la connexion</Link>
<PasswordResetStepper activeStep={1} />

        <div className="fp-logo">
          <img src={aaprovidirLogo} alt="Aaprovidir" className="logo-img" />
        </div>

        <h1 className="fp-title">Mot de passe oublié ?</h1>
        <p className="fp-subtitle">
          Entrez l'adresse e-mail associée à votre compte, nous vous enverrons
          un code de vérification pour réinitialiser votre mot de passe.
        </p>

        {error && <p style={{ color: "red", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <form onSubmit={handleSubmit} className="fp-form">
          <div className="form-group">
            <label htmlFor="email">Adresse e-mail</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                placeholder="nom@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le code de vérification"}
            <span className="btn-arrow">→</span>
          </button>
        </form>

        <p className="fp-footer">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link to="/login" className="link">Se connecter</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;