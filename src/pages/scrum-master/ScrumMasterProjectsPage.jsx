import { useState, useEffect } from "react";
import AdminProjectsPage from "../admin/AdminProjectsPage";
import { fetchDepartments } from "../../api/api";

// Réutilise AdminProjectsPage tel quel, mais ne lui passe que les projets
// du département du Scrum Master connecté — même logique de filtrage que
// ScrumMasterDashboardPage.
function ScrumMasterProjectsPage({ currentUser, projects = [], tasks = [], onCreateProject, onUpdateProject, onDeleteProject }) {
  const myDeptRole = (currentUser?.departmentRoles || []).find((dr) => dr.role === "SCRUM_MASTER");
  const deptProjects = myDeptRole ? projects.filter((p) => p.departmentId === myDeptRole.departmentId) : [];

  return (
    <AdminProjectsPage
      projects={deptProjects}
      tasks={tasks}
      onCreateProject={onCreateProject}
      onUpdateProject={onUpdateProject}
      onDeleteProject={onDeleteProject}
    />
  );
}

export default ScrumMasterProjectsPage;