import AdminActivityPage from "../admin/AdminActivityPage";
import { projectDepartmentIds } from "../../utils/dashboardHelpers";

function ScrumMasterActivityPage({ currentUser, actions = [], tasks = [], projects = [] }) {
  const myDeptRole = (currentUser?.departmentRoles || []).find((dr) => dr.role === "SCRUM_MASTER");
  const deptId = myDeptRole?.departmentId;

  const deptProjects = deptId ? projects.filter((p) => projectDepartmentIds(p).includes(deptId)) : [];
  const deptProjectIds = deptProjects.map((p) => p.id);
  const deptTasks = tasks.filter((t) => deptProjectIds.includes(t.projectId));
  const deptTaskIds = deptTasks.map((t) => t.id);
  const deptActions = actions.filter((a) => deptTaskIds.includes(a.id_tache));

  return <AdminActivityPage actions={deptActions} tasks={deptTasks} projects={deptProjects} />;
}

export default ScrumMasterActivityPage;