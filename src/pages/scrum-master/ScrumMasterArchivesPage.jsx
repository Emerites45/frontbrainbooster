import ArchivesPage from "../admin/ArchivesPage";
import { projectDepartmentIds } from "../../utils/dashboardHelpers";

function ScrumMasterArchivesPage({ currentUser, tasks = [], projects = [], onRestoreTask, onRestoreProject }) {
  const myDeptRole = (currentUser?.departmentRoles || []).find((dr) => dr.role === "SCRUM_MASTER");
  const deptId = myDeptRole?.departmentId;

  const deptProjects = deptId ? projects.filter((p) => projectDepartmentIds(p).includes(deptId)) : [];
  const deptProjectIds = deptProjects.map((p) => p.id);
  const deptTasks = tasks.filter((t) => deptProjectIds.includes(t.projectId));

  return (
    <ArchivesPage
      tasks={deptTasks}
      projects={deptProjects}
      onRestoreTask={onRestoreTask}
      onRestoreProject={onRestoreProject}
    />
  );
}

export default ScrumMasterArchivesPage;