import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordResetStepper from "../components/PasswordResetStepper";
import { resetPassword } from "../api/api";
import "./ResetPasswordPage.css";

function checkStrength(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;

  const checks = checkStrength(password);
  const score = Object.values(checks).filter(Boolean).length;
  const strengthLabel =
    score <= 2 ? "Faible" : score <= 4 ? "Moyen" : "Fort";
  const strengthClass =
    score <= 2 ? "weak" : score <= 4 ? "medium" : "strong";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (score < 5) {
      setError("Le mot de passe ne respecte pas tous les critères.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword: password });
      navigate("/login", { state: { resetSuccess: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const rightContent = (
    <>
      <div className="rp-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" className="rp-shield">
          <path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        <div className="rp-icon-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <h2 className="rp-showcase-title">Votre sécurité, notre priorité.</h2>
      <p className="rp-showcase-text">
        En choisissant un mot de passe fort, vous protégez vos données et
        assurez la conformité de votre entreprise avec confiance.
      </p>
      <div className="rp-features">
        <div className="rp-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
          <strong>Sécurisé</strong>
          <span>Protection avancée de vos données</span>
        </div>
        <div className="rp-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
          <strong>Confidentiel</strong>
          <span>Informations chiffrées</span>
        </div>
        <div className="rp-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 12l4-4 4 4 6-8" />
          </svg>
          <strong>Fiable</strong>
          <span>Conformité et intégrité assurées</span>
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout rightContent={rightContent}>
      <div className="rp-form-wrap">
        <Link to="/login" className="rp-back-link">← Retour à la connexion</Link>

        <PasswordResetStepper activeStep={2} />

        <h1 className="rp-title">Définissez votre nouveau mot de passe</h1>
        <p className="rp-subtitle">
          Votre nouveau mot de passe doit être robuste pour garantir la
          sécurité de votre compte.
        </p>

        {error && <p style={{ color: "red", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <form onSubmit={handleSubmit} className="rp-form">
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
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
                placeholder="••••••••••••"
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

            {password && (
              <>
                <div className={`rp-strength-bar rp-strength-bar--${strengthClass}`}>
                  <span /><span /><span /><span /><span />
                </div>
                <span className={`rp-strength-label rp-strength-label--${strengthClass}`}>
                  {strengthLabel}
                </span>
              </>
            )}
          </div>

          <div className="rp-criteria">
            <p className="rp-criteria-title">Le mot de passe doit contenir :</p>
            <ul>
              <li className={checks.length ? "met" : ""}>
                {checks.length ? "✓" : "○"} Au moins 8 caractères
              </li>
              <li className={checks.upper ? "met" : ""}>
                {checks.upper ? "✓" : "○"} Une lettre majuscule
              </li>
              <li className={checks.lower ? "met" : ""}>
                {checks.lower ? "✓" : "○"} Une lettre minuscule
              </li>
              <li className={checks.number ? "met" : ""}>
                {checks.number ? "✓" : "○"} Un chiffre
              </li>
              <li className={checks.special ? "met" : ""}>
                {checks.special ? "✓" : "○"} Un caractère spécial (ex : @, !, #, $)
              </li>
            </ul>
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirmez votre nouveau mot de passe</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              </span>
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <span className="toggle-eye" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? (
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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            <span className="btn-arrow">→</span>
          </button>
        </form>

        <p className="rp-footer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="rp-footer-icon">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
          Vos données sont chiffrées et sécurisées.
        </p>
      </div>
    </AuthLayout>
  );
}

export default ResetPasswordPage;