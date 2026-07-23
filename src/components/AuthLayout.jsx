// AuthLayout.jsx
import "./AuthLayout.css";

function AuthLayout({ children, rightContent, fillRight = false }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-form-side">{children}</div>
        <div className={`auth-showcase-side ${fillRight ? "auth-showcase-side--fill" : ""}`}>
          {rightContent}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;