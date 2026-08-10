import { useState } from "react";
import { Search, Bell } from "lucide-react";

// Libellé lisible du rôle le plus "élevé" de l'utilisateur, pour l'affichage
// sous son nom dans la topbar. L'Admin est toujours global, donc prioritaire.
function primaryRoleLabel(user) {
  if (!user) return "";
  if (user.globalRoles?.includes("ADMIN")) return "Administrateur";
  const smRole = user.departmentRoles?.find((dr) => dr.role === "SCRUM_MASTER");
  if (smRole) return `Scrum Master · ${smRole.departmentName}`;
  const memberRole = user.departmentRoles?.[0];
  if (memberRole) return `Membre · ${memberRole.departmentName}`;
  return "";
}

function userInitials(user) {
  if (!user) return "?";
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

function AdminTopbar({ currentUser, onOpenProfile, notificationCount = 0 }) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white sticky top-0 z-20">
      <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 w-[340px] bg-slate-50 border border-slate-100">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher projets, tâches, utilisateurs..."
          className="bg-transparent text-[13px] outline-none w-full text-slate-700 placeholder-slate-400"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-slate-400 hover:text-blue-600 transition-colors" aria-label="Notifications">
          <Bell size={19} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold w-4 h-4">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer pl-3 border-l border-slate-100"
        >
          <div className="text-right">
            <div className="text-[13.5px] font-bold text-slate-800 leading-none">
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "—"}
            </div>
            <div className="text-[10px] text-lime-600 font-semibold mt-0.5">
              {primaryRoleLabel(currentUser)}
            </div>
          </div>
          <div
            className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
            style={{ width: 34, height: 34, backgroundColor: "#0066CC", fontSize: 13 }}
          >
            {userInitials(currentUser)}
          </div>
        </button>
      </div>
    </div>
  );
}

export default AdminTopbar;