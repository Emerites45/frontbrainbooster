import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const data = await loginUser(email, password);
      onLogin(data); // { token, user } ou équivalent — à ajuster selon la vraie réponse
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-page">
      <h1>Connexion</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />
        <button type="submit">Se connecter</button>
      </form>
      <p><a href="/signup">Pas de compte ? S'inscrire</a></p>
    </div>
  );
}

export default LoginPage;