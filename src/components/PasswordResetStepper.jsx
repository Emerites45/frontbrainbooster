import "./PasswordResetStepper.css";

function PasswordResetStepper({ activeStep }) {
  return (
    <div className="fp-stepper">
      <div className={`fp-step ${activeStep === 1 ? "fp-step--active" : ""}`}>
        <span className="fp-step-num">1</span> Vérification e-mail
      </div>
      <div className="fp-step-divider" />
      <div className={`fp-step ${activeStep === 2 ? "fp-step--active" : ""}`}>
        <span className="fp-step-num">2</span> Nouveau mot de passe
      </div>
    </div>
  );
}

export default PasswordResetStepper;