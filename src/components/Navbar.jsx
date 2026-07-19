import { Link, useNavigate } from "react-router-dom";

function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();

  function handleLogoutClick() {
    onLogout();
    navigate("/login");
  }

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "12px", borderBottom: "1px solid #ccc" }}>
      <div style={{ display: "flex", gap: "16px" }}>
        <Link to="/">Board</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
      <div>
        <span>{currentUser?.name} </span>
        <button onClick={handleLogoutClick}>Déconnexion</button>
      </div>
    </nav>
  );
}

export default Navbar;