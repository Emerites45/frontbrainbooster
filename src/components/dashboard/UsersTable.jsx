import "../../pages/AdminDashboard.css";

function UsersTable({ users, departments, onOpenCreate }) {
  const rolesLabel = (user) => {
    const labels = [];
    if (user.globalRoles?.includes("ADMIN")) labels.push("Admin");
    (user.departmentRoles || []).forEach((dr) => {
      const deptName = departments.find((d) => d.id === dr.departmentId)?.name ?? dr.departmentName;
      labels.push(`${dr.role === "SCRUM_MASTER" ? "Scrum Master" : "Membre"} · ${deptName}`);
    });
    return labels.length ? labels.join(", ") : "—";
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>Gestion des utilisateurs</h2>
        <button className="btn-primary-sm" onClick={onOpenCreate}>
          + Créer un utilisateur
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle(s)</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.email}</td>
              <td>{rolesLabel(u)}</td>
              <td>
                {u.mustChangePassword ? (
                  <span className="status-pill status-pending">En attente</span>
                ) : (
                  <span className="status-pill status-active">Actif</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;