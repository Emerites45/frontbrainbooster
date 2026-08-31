import AdminProjectsPage from "../admin/AdminProjectsPage";
import { projectDepartmentIds } from "../../utils/dashboardHelpers";

function ScrumMasterProjectsPage({
  currentUser,
  projects = [],
  tasks = [],
  actions = [],
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onCreateSubtask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) {
  const myDeptRole = (currentUser?.departmentRoles || []).find((dr) => dr.role === "SCRUM_MASTER");
  const deptProjects = myDeptRole
    ? projects.filter((p) => projectDepartmentIds(p).includes(myDeptRole.departmentId))
    : [];

  return (
    <AdminProjectsPage
      projects={deptProjects}
      tasks={tasks}
      actions={actions}
      currentUser={currentUser}
      onCreateProject={onCreateProject}
      onUpdateProject={onUpdateProject}
      onDeleteProject={onDeleteProject}
      onCreateSubtask={onCreateSubtask}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
      onStatusChange={onStatusChange}
      lockedDepartmentId={myDeptRole?.departmentId}
    />
  );
}

export default ScrumMasterProjectsPage;