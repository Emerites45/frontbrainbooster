import TeamEvaluationPage from "../admin/TeamEvaluationPage";

function ScrumMasterTeamEvaluationPage({ currentUser, tasks = [] }) {
  const myDeptRole = (currentUser?.departmentRoles || []).find((dr) => dr.role === "SCRUM_MASTER");
  return (
    <TeamEvaluationPage
      tasks={tasks}
      lockedDepartmentId={myDeptRole?.departmentId}
      lockedDepartmentName={myDeptRole?.departmentName}
    />
  );
}

export default ScrumMasterTeamEvaluationPage;