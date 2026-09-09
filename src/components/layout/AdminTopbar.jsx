import { useState, useEffect } from "react";
import { Menu, Search } from "lucide-react";

import NotificationBell from "./NotificationBell";
import GlobalSearchModal from "./GlobalSearchModal";
import Avatar from "../ui/Avatar";

function primaryRoleLabel(user) {
  if (!user) return "";

  if (user.globalRoles?.includes("ADMIN")) {
    return "Administrateur";
  }

  const smRole = user.departmentRoles?.find(
    (dr) => dr.role === "SCRUM_MASTER"
  );

  if (smRole) {
    return `Scrum Master · ${smRole.departmentName}`;
  }

  const memberRole = user.departmentRoles?.[0];

  if (memberRole) {
    return `Membre · ${memberRole.departmentName}`;
  }

  return "";
}

function AdminTopbar({
  currentUser,
  onMenuClick,
  tasks = [],
  projects = [],
  users = [],
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handleKey(e) {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4 md:px-8">
        {/* Partie gauche */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Hamburger mobile */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-blue-600 md:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>

          {/* Recherche */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden w-[340px] items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 text-left transition-colors hover:border-slate-200 sm:flex"
          >
            <Search
              size={16}
              className="shrink-0 text-slate-400"
            />

            <span className="flex-1 truncate text-[13px] text-slate-400">
              Rechercher projets, tâches, utilisateurs...
            </span>

            <kbd className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Partie droite */}
        <div className="flex items-center gap-3 md:gap-5">
          <NotificationBell currentUser={currentUser} />

          <div className="flex cursor-pointer items-center gap-3 border-l border-slate-100 pl-3">
            {/* Informations utilisateur */}
            <div className="hidden text-right sm:block">
              <div className="text-[13.5px] font-bold leading-none text-slate-800">
                {currentUser
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : "—"}
              </div>

              <div className="mt-0.5 text-[10px] font-semibold text-lime-600">
                {primaryRoleLabel(currentUser)}
              </div>
            </div>

            {/* Avatar */}
            <Avatar
              userId={currentUser?.id}
              firstName={currentUser?.firstName}
              lastName={currentUser?.lastName}
              photoUrl={currentUser?.avatarUrl}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Recherche globale */}
      <GlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        tasks={tasks}
        projects={projects}
        users={users}
        currentUser={currentUser}
      />
    </>
  );
}

export default AdminTopbar;