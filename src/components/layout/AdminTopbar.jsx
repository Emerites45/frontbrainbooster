import { useState, useEffect } from "react";

import {
  Menu,
  Search,
} from "lucide-react";

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
  const [searchOpen, setSearchOpen] =
    useState(false);

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

    document.addEventListener(
      "keydown",
      handleKey
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, []);

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-slate-100 bg-white sticky top-0 z-20">
        {/* Partie gauche */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Hamburger mobile */}
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-50 shrink-0 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>

          {/* Recherche */}
          <button
            type="button"
            onClick={() =>
              setSearchOpen(true)
            }
            className="hidden sm:flex items-center gap-2 rounded-xl px-3.5 py-2 w-[340px] bg-slate-50 border border-slate-100 text-left hover:border-slate-200 transition-colors"
          >
            <Search
              size={16}
              className="text-slate-400 shrink-0"
            />

            <span className="text-[13px] text-slate-400 flex-1 truncate">
              Rechercher projets, tâches,
              utilisateurs...
            </span>

            <kbd className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Partie droite */}
        <div className="flex items-center gap-3 md:gap-5">
          <NotificationBell
            currentUser={currentUser}
          />

          <div className="flex items-center gap-3 cursor-pointer pl-3 border-l border-slate-100">
            {/* Informations utilisateur */}
            <div className="text-right hidden sm:block">
              <div className="text-[13.5px] font-bold text-slate-800 leading-none">
                {currentUser
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : "—"}
              </div>

              <div className="text-[10px] text-lime-600 font-semibold mt-0.5">
                {primaryRoleLabel(
                  currentUser
                )}
              </div>
            </div>

            {/* Avatar */}
            <Avatar
              userId={currentUser?.id}
              firstName={
                currentUser?.firstName
              }
              lastName={
                currentUser?.lastName
              }
              photoUrl={
                currentUser?.avatarUrl
              }
              size="md"
            />
          </div>
        </div>

        {/* Recherche globale */}
        <GlobalSearchModal
          open={searchOpen}
          onClose={() =>
            setSearchOpen(false)
          }
          tasks={tasks}
          projects={projects}
          users={users}
          currentUser={currentUser}
        />
      </div>
    </>
  );
}

export default AdminTopbar;