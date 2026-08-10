import { Mail } from "lucide-react";

function initials(first, last) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function roleLabel(user) {
  if (user.globalRoles?.includes("ADMIN")) return "Admin";
  const dr = user.departmentRoles?.[0];
  if (!dr) return "—";
  return dr.role === "SCRUM_MASTER" ? "Scrum Master" : "Membre";
}

const ROLE_BADGE = {
  Admin: "bg-blue-50 text-blue-700",
  "Scrum Master": "bg-green-50 text-green-700",
  Membre: "bg-slate-100 text-slate-600",
};

function MemberCard({ user, tasks }) {
  const userTasks = tasks.filter((t) => (t.assignments || []).some((a) => a.userId === user.id && !a.unassignedAt));
  const active = userTasks.filter((t) => t.status !== "TERMINE").length;
  const done = userTasks.filter((t) => t.status === "TERMINE").length;
  const role = roleLabel(user);

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
      <span className="flex items-center justify-center rounded-full bg-blue-600 text-white text-[13px] font-semibold w-11 h-11 shrink-0">
        {initials(user.firstName, user.lastName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-medium text-slate-900 truncate">{user.firstName} {user.lastName}</span>
          <span className={`shrink-0 inline-flex items-center rounded-full text-[10.5px] font-semibold px-2 py-0.5 ${ROLE_BADGE[role] ?? "bg-slate-100 text-slate-600"}`}>
            {role}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[12px] text-slate-400 mt-0.5 truncate">
          <Mail size={11} className="shrink-0" />
          {user.email}
        </div>
        <div className="text-[11.5px] text-slate-400 mt-1">
          {active} active{active > 1 ? "s" : ""} · {done} terminée{done > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

function TeamRoster({ users, tasks, departments, groupByDepartment = false }) {
  if (!groupByDepartment) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {users.map((u) => <MemberCard key={u.id} user={u} tasks={tasks} />)}
        {users.length === 0 && <p className="text-[13px] text-slate-400 col-span-2 text-center py-10">Aucun membre dans ce département.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {departments.map((dept) => {
        const deptUsers = users.filter((u) => (u.departmentRoles || []).some((dr) => dr.departmentId === dept.id));
        if (deptUsers.length === 0) return null;
        return (
          <div key={dept.id}>
            <h2 className="text-[13.5px] font-semibold text-slate-700 mb-3">{dept.name} · {deptUsers.length}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deptUsers.map((u) => <MemberCard key={u.id} user={u} tasks={tasks} />)}
            </div>
          </div>
        );
      })}
      {users.filter((u) => u.globalRoles?.includes("ADMIN")).length > 0 && (
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-700 mb-3">Administration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.filter((u) => u.globalRoles?.includes("ADMIN")).map((u) => <MemberCard key={u.id} user={u} tasks={tasks} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamRoster;