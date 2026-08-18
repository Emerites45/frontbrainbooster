import { useState, useEffect } from "react";
import { fetchUsers, fetchDepartments, fetchProjects } from "../../api/api";
import TeamRoster from "../../components/dashboard/TeamRoster";
import MemberTimesheetModal from "../../components/dashboard/MemberTimesheetModal";

function AdminTeamPage({ tasks = [] }) {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchDepartments(), fetchProjects()])
      .then(([u, d, p]) => { setUsers(u); setDepartments(d); setProjects(p); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[13.5px] text-slate-400 px-8 py-6">Chargement de l'équipe...</p>;

  return (
    <div className="px-8 py-6">
      <h1 className="text-[20px] font-semibold text-slate-900 mb-1">Équipe</h1>
      <p className="text-[13px] text-slate-400 mb-6">{users.length} membres au total, par département.</p>
      <TeamRoster users={users} tasks={tasks} departments={departments} groupByDepartment onSelectMember={setSelectedMember} />
      {selectedMember && (
        <MemberTimesheetModal user={selectedMember} projects={projects} tasks={tasks} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
}

export default AdminTeamPage;