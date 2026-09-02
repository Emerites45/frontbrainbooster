import { useState, useEffect } from "react";
import { fetchUsers } from "../../api/users.api";
import TeamRoster from "../../components/dashboard/TeamRoster";

function ScrumMasterTeamPage({ currentUser, tasks = [] }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const myDeptRole = (currentUser?.departmentRoles || []).find((dr) => dr.role === "SCRUM_MASTER");
  const deptUsers = myDeptRole
    ? users.filter((u) => (u.departmentRoles || []).some((dr) => dr.departmentId === myDeptRole.departmentId))
    : [];

  if (loading) return <p className="text-[13.5px] text-slate-400 px-8 py-6">Chargement de l'équipe...</p>;

  return (
    <div className="px-8 py-6">
      <h1 className="text-[20px] font-semibold text-slate-900 mb-1">Équipe — {myDeptRole?.departmentName ?? ""}</h1>
      <p className="text-[13px] text-slate-400 mb-6">{deptUsers.length} membres dans votre département.</p>
      <TeamRoster users={deptUsers} tasks={tasks} departments={[]} groupByDepartment={false} />
    </div>
  );
}

export default ScrumMasterTeamPage;