import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";

function SignupPage() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await registerUser(nom, email, password);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="signup-page">
      <h1>Inscription</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}

export default SignupPage;