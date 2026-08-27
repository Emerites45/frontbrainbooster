import { Mail, Briefcase } from "lucide-react";
import Avatar from "../ui/Avatar";
import { userColor } from "../../utils/avatarColor";

function roleLabel(user) {
  if (user.globalRoles?.includes("ADMIN")) {
    return "Admin";
  }

  const dr = user.departmentRoles?.[0];

  if (!dr) {
    return "—";
  }

  return dr.role === "SCRUM_MASTER"
    ? "Scrum Master"
    : "Membre";
}

const ROLE_BADGE = {
  Admin: "bg-blue-50 text-blue-700",
  "Scrum Master": "bg-green-50 text-green-700",
  Membre: "bg-slate-100 text-slate-600",
};

function MemberCard({
  user,
  tasks,
  onSelectMember,
}) {
  const userTasks = tasks.filter((t) =>
    (t.assignments || []).some(
      (a) =>
        a.userId === user.id &&
        !a.unassignedAt
    )
  );

  const active = userTasks.filter(
    (t) => t.status !== "TERMINE"
  ).length;

  const done = userTasks.filter(
    (t) => t.status === "TERMINE"
  ).length;

  const role = roleLabel(user);
  const accent = userColor(user.id);

  return (
    <div
      onClick={() => onSelectMember?.(user)}
      className="relative bg-slate-50 rounded-xl border border-slate-200/70 p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
    >
      <span
        className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
        style={{
          backgroundColor: accent,
        }}
      />

      <Avatar
        userId={user.id}
        firstName={user.firstName}
        lastName={user.lastName}
        photoUrl={user.avatarUrl}
        size="lg"
        className="ml-1.5"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-medium text-slate-900 truncate">
            {user.firstName} {user.lastName}
          </span>

          <span
            className={`shrink-0 inline-flex items-center rounded-full text-[10.5px] font-semibold px-2 py-0.5 ${
              ROLE_BADGE[role] ??
              "bg-slate-100 text-slate-600"
            }`}
          >
            {role}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[12px] text-slate-500 mt-0.5 truncate">
          <Mail
            size={11}
            className="shrink-0"
          />

          {user.email}
        </div>

        <div className="flex items-center gap-1 text-[11.5px] text-slate-400 mt-1">
          <Briefcase
            size={11}
            className="shrink-0"
          />

          {active} active{active > 1 ? "s" : ""} ·{" "}
          {done} terminée{done > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

function TeamRoster({
  users,
  tasks,
  departments,
  groupByDepartment = false,
  onSelectMember,
}) {
  if (users.length === 0) {
    return (
      <p className="text-[13px] text-slate-400 text-center py-16">
        Aucun membre ne correspond à ces critères.
      </p>
    );
  }

  if (!groupByDepartment) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {users.map((u) => (
          <MemberCard
            key={u.id}
            user={u}
            tasks={tasks}
            onSelectMember={onSelectMember}
          />
        ))}
      </div>
    );
  }

  const admins = users.filter((u) =>
    u.globalRoles?.includes("ADMIN")
  );

  return (
    <div className="space-y-8">
      {departments.map((dept) => {
        const deptUsers = users.filter((u) =>
          (u.departmentRoles || []).some(
            (dr) => dr.departmentId === dept.id
          )
        );

        if (deptUsers.length === 0) {
          return null;
        }

        return (
          <div key={dept.id}>
            <h2 className="text-[13.5px] font-semibold text-slate-700 mb-3">
              {dept.name} · {deptUsers.length}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deptUsers.map((u) => (
                <MemberCard
                  key={u.id}
                  user={u}
                  tasks={tasks}
                  onSelectMember={onSelectMember}
                />
              ))}
            </div>
          </div>
        );
      })}

      {admins.length > 0 && (
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-700 mb-3">
            Administration · {admins.length}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {admins.map((u) => (
              <MemberCard
                key={u.id}
                user={u}
                tasks={tasks}
                onSelectMember={onSelectMember}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamRoster;