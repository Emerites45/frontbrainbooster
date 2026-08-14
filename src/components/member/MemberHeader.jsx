import {
  useLocation,
  useSearchParams,
} from "react-router-dom";

import MemberNotificationsPanel from "./MemberNotificationsPanel";

/* =========================================================
   ICÔNE RECHERCHE
========================================================= */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m16 16 4 4" />
    </svg>
  );
}

/* =========================================================
   HEADER MEMBER
========================================================= */

function MemberHeader({
  currentUser,
  tasks = [],
  actions = [],
}) {
  const location =
    useLocation();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  /* =======================================================
     PAGES AVEC RECHERCHE
  ======================================================= */

  const isTasksPage =
    location.pathname ===
    "/member/tasks";

  const isProjectsPage =
    location.pathname ===
    "/member/projects";

  const hasSearch =
    isTasksPage ||
    isProjectsPage;

  /* =======================================================
     RECHERCHE
  ======================================================= */

  const search =
    searchParams.get("q") ??
    "";

  function handleSearchChange(
    event
  ) {
    const value =
      event.target.value;

    const nextParams =
      new URLSearchParams(
        searchParams
      );

    if (value.trim()) {
      nextParams.set(
        "q",
        value
      );
    } else {
      nextParams.delete(
        "q"
      );
    }

    setSearchParams(
      nextParams,
      {
        replace: true,
      }
    );
  }

  function getPlaceholder() {
    if (isProjectsPage) {
      return "Rechercher un projet...";
    }

    return "Rechercher une tâche...";
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <header
      className={`member-header ${
        hasSearch
          ? "member-header-with-search"
          : "member-header-clean"
      }`}
    >
      <div className="member-header-context">
  <strong>
    Espace membre
  </strong>

  <span>
    Gestion de vos activités
  </span>
</div>
      {/* ===============================================
          RECHERCHE
      =============================================== */}

      {hasSearch && (
        <div className="member-header-search">
          <span className="member-search-icon">
            <SearchIcon />
          </span>

          <input
            type="search"
            value={search}
            onChange={
              handleSearchChange
            }
            placeholder={
              getPlaceholder()
            }
            aria-label={
              getPlaceholder()
            }
          />
        </div>
      )}

      {/* ===============================================
          NOTIFICATIONS
      =============================================== */}

      <div className="member-header-actions">
        <MemberNotificationsPanel
          currentUser={
            currentUser
          }
          tasks={tasks}
          actions={actions}
        />
      </div>
    </header>
  );
}

export default MemberHeader;