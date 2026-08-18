import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import aaprovidirLogo from "../../assets/aaprovidir-logo.png";
import marinaImg from "../../assets/marina.png"; // Même image que le login
import { registerUser } from "../../api/api";
import "./SignupPage.css"; // Créez ce fichier (voir ci-dessous)

function SignupPage() {
  const [name, setNom] = useState("");
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
      // Structure des données correspondant à l'API d'inscription
      await registerUser({ name, email, password });
      // Redirection vers le login après succès
      navigate("/login", { state: { message: "Inscription réussie ! Connectez-vous." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <AuthLayout
  fillRight={true}
  rightContent={
    <div className="showcase-wrapper">
      <img src={marinaImg} alt="Nourrir un avenir radieux" className="showcase-image" />
    </div>
  }
>
      <div className="signup-form-wrap">
        <div className="signup-logo">
          <img src={aaprovidirLogo} alt="Aaprovidir" className="logo-img" />
        </div>

        <div className="signup-header">
          <h1 className="signup-title">Créer un compte</h1>
          <p className="signup-subtitle">
            Inscrivez-vous pour accéder à votre tableau de bord d'audit.
          </p>
        </div>

        {error && (
          <p style={{ color: "red", fontSize: 13, marginBottom: 12 }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Champ Nom */}
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <div className="input-wrapper">
              <span className="input-icon">
                {/* Icône Utilisateur */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Champ Email */}
          <div className="form-group">
            <label htmlFor="email">Adresse e-mail professionnelle</label>
            <div className="input-wrapper">
              <span className="input-icon">
                {/* Icône Mail (comme au login) */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                placeholder="j.dupont@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-wrapper">
              <span className="input-icon">
                {/* Icône Cadenas (comme au login) */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Au moins 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <span className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  // Icône Œil Ouvert
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  // Icône Œil Barré
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.1A10.4 10.4 0 0112 5c6.5 0 10 7 10 7a17.7 17.7 0 01-3.2 4.1M6.5 6.6C4 8.3 2 12 2 12s3.5 7 10 7c1.4 0 2.6-.3 3.7-.8" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          {/* Politique de confidentialité (Optionnel mais recommandé) */}
          <p className="legal-text">
            En vous inscrivant, vous acceptez nos <a href="/terms" className="link">Conditions</a> et notre <a href="/privacy" className="link">Politique de confidentialité</a>.
          </p>

          {/* Bouton Soumettre */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
            <span className="btn-arrow">→</span>
          </button>
        </form>

        {/* Pied de page pour redirection vers Login */}
        <p className="signup-footer">
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="link">Se connecter</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default SignupPage;