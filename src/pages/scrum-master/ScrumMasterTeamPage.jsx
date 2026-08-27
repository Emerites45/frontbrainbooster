import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { fetchUsers } from "../../api/api";
import TeamRoster from "../../components/dashboard/TeamRoster";

function ScrumMasterTeamPage({ currentUser, tasks = [] }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchUsers().then(setUsers).finally(() => setLoading(false)); }, []);

  const myDeptRole = (currentUser?.departmentRoles || []).find((dr) => dr.role === "SCRUM_MASTER");
  const deptUsers = myDeptRole
    ? users.filter((u) => (u.departmentRoles || []).some((dr) => dr.departmentId === myDeptRole.departmentId))
    : [];

  const filteredUsers = useMemo(() => {
    return deptUsers.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return !search || fullName.includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    });
  }, [deptUsers, search]);

  if (loading) return <p className="text-[13.5px] text-slate-400 px-8 py-6">Chargement de l'équipe...</p>;

  return (
    <div className="px-8 py-6">
      <h1 className="text-[20px] font-semibold text-slate-900 mb-1">Équipe — {myDeptRole?.departmentName ?? ""}</h1>
      <p className="text-[13px] text-slate-400 mb-5">{filteredUsers.length} membre{filteredUsers.length > 1 ? "s" : ""} sur {deptUsers.length}.</p>

      <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 mb-6 bg-slate-50 border border-slate-200 max-w-[360px]">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un nom ou un email..."
          className="bg-transparent text-[13px] outline-none w-full text-slate-700 placeholder-slate-400"
        />
      </div>

      <TeamRoster users={filteredUsers} tasks={tasks} departments={[]} groupByDepartment={false} />
    </div>
  );
}

export default ScrumMasterTeamPage;