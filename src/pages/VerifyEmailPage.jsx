// après
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import "./VerifyEmailPage.css";

const CODE_LENGTH = 6;
const EXPIRY_SECONDS = 5 * 60;

function VerifyEmailPage({ onVerify }) {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "nom@entreprise.com";
  const mode = location.state?.mode; // "reset" ou undefined
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const inputRefs = useRef([]);

  // countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (totalSeconds) => {
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (index, value) => {
    // only allow a single digit
    if (!/^\d?$/.test(value)) return;

    const next = [...code];
    next[index] = value;
    setCode(next);

    // auto-advance to next box
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // backspace on an empty box moves focus back
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("");
    while (next.length < CODE_LENGTH) next.push("");
    setCode(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

 const handleSubmit = (e) => {
  e.preventDefault();
  const fullCode = code.join("");
  if (fullCode.length === CODE_LENGTH) {
    if (mode === "reset") {
      navigate("/reset-password", { state: { email, otp: fullCode } });
    } else if (onVerify) {
      onVerify(fullCode);
    }
  }
};

  const handleResend = () => {
    setSecondsLeft(EXPIRY_SECONDS);
    setCode(Array(CODE_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    // TODO: call backend to actually resend the code
  };

  const rightContent = (
    <>
      <div className="verify-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" className="verify-envelope">
          <path d="M3 7l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        <div className="verify-icon-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
        </div>
      </div>

      <h2 className="verify-showcase-title">Sécurisez votre compte</h2>
      <p className="verify-showcase-text">
        Cette étape permet de confirmer que vous êtes bien le propriétaire de
        cette adresse e-mail et de protéger votre compte contre tout accès
        non autorisé.
      </p>

      <div className="verify-stats">
        <div className="verify-stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3z" />
          </svg>
          <span>Vérification<br />sécurisée</span>
        </div>
        <div className="verify-stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
          <span>Code à usage<br />unique</span>
        </div>
        <div className="verify-stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
          <span>Expire dans<br />5 minutes</span>
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout rightContent={rightContent}>
      <div className="verify-form-wrap">
        <a href="/login" className="verify-back-link">
          ← Retour à la connexion
        </a>

        <h1 className="verify-title">Vérifiez votre adresse e-mail</h1>
        <p className="verify-subtitle">
          Nous venons d'envoyer un code de vérification à{" "}
          <strong>{email}</strong>.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="verify-code-label">Code de vérification (OTP)</label>
          <div className="otp-boxes" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="otp-box"
              />
            ))}
          </div>

          <p className="verify-expiry-label">Le code expire dans</p>
          <div className="verify-timer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            {formatTime(secondsLeft)}
          </div>

          <p className="verify-resend-label">Vous n'avez pas reçu le code ?</p>
          <button type="button" className="verify-resend-btn" onClick={handleResend}>
            ↻ Renvoyer le code
          </button>

          <button type="submit" className="btn-primary verify-submit">
            Vérifier le code →
          </button>
        </form>

        <p className="verify-footer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="verify-footer-icon">
            <path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3z" />
          </svg>
          Besoin d'aide ? <a href="#" className="link">Contactez votre administrateur.</a>
        </p>
      </div>
    </AuthLayout>
  );
}

export default VerifyEmailPage;