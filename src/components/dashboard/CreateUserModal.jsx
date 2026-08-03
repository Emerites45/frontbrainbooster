import { useState } from "react";
import "../../pages/AdminDashboard.css";

function CreateUserModal({ departments, onClose, onCreate }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departmentRole, setDepartmentRole] = useState("MEMBER");
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const dept = departments.find((d) => d.id === Number(departmentId));
    try {
      await onCreate({
        firstName,
        lastName,
        email,
        departmentId: dept?.id ?? null,
        departmentName: dept?.name ?? null,
        departmentRole,
        globalRole: isGlobalAdmin ? "ADMIN" : null,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close">Fermer</button>
        <h2>Créer un utilisateur</h2>
        <p className="modal-subtitle">
          Un mot de passe temporaire sera envoyé par email. L'utilisateur devra le
          changer à sa première connexion.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prénom"
              required
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nom"
              required
            />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email professionnel"
            required
          />
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required
          >
            <option value="">Sélectionner un département</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={departmentRole}
            onChange={(e) => setDepartmentRole(e.target.value)}
          >
            <option value="MEMBER">Membre</option>
            <option value="SCRUM_MASTER">Scrum Master</option>
          </select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isGlobalAdmin}
              onChange={(e) => setIsGlobalAdmin(e.target.checked)}
            />
            Accès Administrateur global
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Création..." : "Créer l'utilisateur"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateUserModal;