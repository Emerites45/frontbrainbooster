import CalendarPage from "../CalendarPage";
import { projectDepartmentIds } from "../../utils/dashboardHelpers";

function ScrumMasterCalendarPage({ currentUser, projects = [], tasks = [] }) {
  const myDeptRole = (currentUser?.departmentRoles || []).find((dr) => dr.role === "SCRUM_MASTER");
  const deptProjectIds = myDeptRole
    ? projects.filter((p) => projectDepartmentIds(p).includes(myDeptRole.departmentId)).map((p) => p.id)
    : [];
  const deptTasks = tasks.filter((t) => deptProjectIds.includes(t.projectId));
  const deptProjects = projects.filter((p) => deptProjectIds.includes(p.id));
  return <CalendarPage tasks={deptTasks} projects={deptProjects} />;
}

export default ScrumMasterCalendarPage;