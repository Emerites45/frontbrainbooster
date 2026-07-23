import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import wallyLogo from "../assets/wally-logo.png";
import marinaImg from "../assets/marina.png";
import { loginUser } from "../api/api";
import "./LoginPage.css";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser(email, password); // vrai appel API
      if (onLogin) {
        onLogin(data); // data doit contenir { token, ... } venant du serveur
      }
      navigate("/"); // redirection après succès
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      rightContent={
        <img src={marinaImg} alt="Nourrir un avenir radieux" className="showcase-image" />
      }
    >
      <div className="login-form-wrap">

        <div className="login-header">
          <h1 className="login-title">Bon retour</h1>
          <p className="login-subtitle">
            Connectez-vous à votre tableau de bord d'audit d'entreprise.
          </p>
        </div>

        {error && <p style={{ color: "red", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
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

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Mot de passe</label>
              <a href="#" className="link-small">Mot de passe oublié ?</a>
            </div>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.1A10.4 10.4 0 0112 5c6.5 0 10 7 10 7a17.7 17.7 0 01-3.2 4.1M6.5 6.6C4 8.3 2 12 2 12s3.5 7 10 7c1.4 0 2.6-.3 3.7-.8" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          <div className="form-footer-row">
            <label className="checkbox-row">
              <input type="checkbox" />
              <span>Se souvenir de moi pendant 30 jours</span>
            </label>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter au tableau de bord"}
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </form>

        <p className="login-footer">
          Pas encore de compte ?{" "}
          <a href="/signup" className="link">Demandez l'accès à votre manager</a>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;