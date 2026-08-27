import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { fetchUsers, fetchDepartments, fetchProjects } from "../../api/api";
import TeamRoster from "../../components/dashboard/TeamRoster";
import MemberTimesheetModal from "../../components/dashboard/MemberTimesheetModal";

function AdminTeamPage({ tasks = [] }) {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");

  useEffect(() => {
    Promise.all([fetchUsers(), fetchDepartments(), fetchProjects()])
      .then(([u, d, p]) => { setUsers(u); setDepartments(d); setProjects(p); })
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const matchesSearch = !search || fullName.includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesDept =
        deptFilter === "ALL" ||
        (deptFilter === "ADMIN" ? u.globalRoles?.includes("ADMIN") : (u.departmentRoles || []).some((dr) => dr.departmentId === Number(deptFilter)));
      return matchesSearch && matchesDept;
    });
  }, [users, search, deptFilter]);

  if (loading) return <p className="text-[13.5px] text-slate-400 px-8 py-6">Chargement de l'équipe...</p>;

  return (
    <div className="px-8 py-6">
      <h1 className="text-[20px] font-semibold text-slate-900 mb-1">Équipe</h1>
      <p className="text-[13px] text-slate-400 mb-5">{filteredUsers.length} membre{filteredUsers.length > 1 ? "s" : ""} sur {users.length}, par département.</p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 flex-1 min-w-[240px] bg-slate-50 border border-slate-200">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom ou un email..."
            className="bg-transparent text-[13px] outline-none w-full text-slate-700 placeholder-slate-400"
          />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none">
          <option value="ALL">Tous les départements</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          <option value="ADMIN">Administration</option>
        </select>
      </div>

      <TeamRoster users={filteredUsers} tasks={tasks} departments={departments} groupByDepartment={deptFilter === "ALL"} onSelectMember={setSelectedMember} />

      {selectedMember && (
        <MemberTimesheetModal user={selectedMember} projects={projects} tasks={tasks} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
}

export default AdminTeamPage;