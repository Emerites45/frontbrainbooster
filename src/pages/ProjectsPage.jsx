import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProjectsPage({ projects, onCreateProject, onSelectProject }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateProject({ id: Date.now(), name, description });
    setName("");
    setDescription("");
  }

  function handleSelect(projectId) {
    onSelectProject(projectId);
    navigate("/");
  }

  return (
    <div className="dashboard-page">
      <h1>Projets</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du projet"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <button type="submit">Créer le projet</button>
      </form>

      <div className="stats-grid">
        {projects.map((p) => (
          <div key={p.id} className="stat-card" onClick={() => handleSelect(p.id)} style={{ cursor: "pointer" }}>
            <h3>{p.name}</h3>
            <p style={{ fontSize: "13px", color: "#6b6b6b" }}>{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectsPage;