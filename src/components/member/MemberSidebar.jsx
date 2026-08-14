import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

/* =========================================================
   ICONS
========================================================= */

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function TasksIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <path d="M9 3.5h6v4H9z" />
      <path d="m9 12 1.5 1.5L14 10" />
      <path d="M9 17h6" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 7h7l2 2h9v10H3z" />
      <path d="M3 7V5h7l2 2" />
    </svg>
  );
}

/* =========================================================
   NOUVELLE ICÔNE : BILAN PERSONNEL
========================================================= */

function PersonalReportIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M10 5H5v14h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M8 12h10" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function DepartmentIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M9 21v-5h6v5" />
      <path d="M8 9h.01M12 9h.01M16 9h.01" />
      <path d="M8 13h.01M12 13h.01M16 13h.01" />
    </svg>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function MemberSidebar({
  currentUser,
  onLogout,
}) {
  const navigate = useNavigate();

  const profileRef =
    useRef(null);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const firstName =
    currentUser?.firstName ??
    "Utilisateur";

  const lastName =
    currentUser?.lastName ??
    "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  const email =
    currentUser?.email ??
    "Adresse e-mail non disponible";

  const department =
    currentUser
      ?.departmentRoles?.[0]
      ?.departmentName ??
    currentUser
      ?.departmentRoles?.[0]
      ?.department?.name ??
    currentUser?.departmentName ??
    currentUser?.department?.name ??
    "Département";

  const profilePicture =
    currentUser?.profilePicture ??
    currentUser?.avatar ??
    null;

  const initials =
    `${firstName?.[0] ?? ""}${
      lastName?.[0] ?? ""
    }`.toUpperCase();

  /* =======================================================
     LOGOUT
  ======================================================= */

  function handleLogout() {
    setProfileOpen(false);

    onLogout?.();

    navigate("/login");
  }

  /* =======================================================
     FERMETURE PROFIL
  ======================================================= */

  useEffect(() => {
    function handleOutsideClick(
      event
    ) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscape(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <aside className="member-sidebar">

      {/* =================================================
          BRAND
      ================================================= */}

      <div className="member-brand">
        <div className="member-brand-top">
          <div className="member-brand-mark">
            <span className="member-brand-leaf member-brand-leaf-left" />

            <span className="member-brand-leaf member-brand-leaf-right" />
          </div>

          <div className="member-brand-name">
            Aaprovidir
          </div>
        </div>

        <p>
          Nourrir un avenir radieux
        </p>
      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="member-sidebar-section-label">
        Navigation
      </div>

      <nav className="member-navigation">

        {/* TABLEAU DE BORD */}

        <NavLink
          to="/dashboard"
          className={({
            isActive,
          }) =>
            `member-nav-link ${
              isActive
                ? "member-nav-link-active"
                : ""
            }`
          }
        >
          <span className="member-nav-icon">
            <DashboardIcon />
          </span>

          <span className="member-nav-label">
            Tableau de bord
          </span>
        </NavLink>

        {/* MES TÂCHES */}

        <NavLink
          to="/member/tasks"
          className={({
            isActive,
          }) =>
            `member-nav-link ${
              isActive
                ? "member-nav-link-active"
                : ""
            }`
          }
        >
          <span className="member-nav-icon">
            <TasksIcon />
          </span>

          <span className="member-nav-label">
            Mes tâches
          </span>
        </NavLink>

        {/* PROJETS */}

        <NavLink
          to="/member/projects"
          className={({
            isActive,
          }) =>
            `member-nav-link ${
              isActive
                ? "member-nav-link-active"
                : ""
            }`
          }
        >
          <span className="member-nav-icon">
            <ProjectsIcon />
          </span>

          <span className="member-nav-label">
            Projets
          </span>
        </NavLink>

        {/* =================================================
            NOUVEAU : BILAN PERSONNEL
        ================================================= */}

        <NavLink
          to="/member/personal-report"
          className={({
            isActive,
          }) =>
            `member-nav-link ${
              isActive
                ? "member-nav-link-active"
                : ""
            }`
          }
        >
          <span className="member-nav-icon">
            <PersonalReportIcon />
          </span>

          <span className="member-nav-label">
            Bilan personnel
          </span>
        </NavLink>
      </nav>

      {/* =================================================
          BAS SIDEBAR
      ================================================= */}

      <div className="member-sidebar-bottom">

        {/* DÉCONNEXION */}

        <button
          type="button"
          className="member-logout"
          onClick={handleLogout}
        >
          <span className="member-nav-icon">
            <LogoutIcon />
          </span>

          <span>
            Déconnexion
          </span>
        </button>

        <div className="member-profile-divider" />

        {/* =================================================
            PROFIL
        ================================================= */}

        <div
          className="member-profile-wrapper"
          ref={profileRef}
        >
          <button
            type="button"
            className={`member-profile-trigger ${
              profileOpen
                ? "member-profile-trigger-open"
                : ""
            }`}
            onClick={() =>
              setProfileOpen(
                (
                  current
                ) =>
                  !current
              )
            }
            aria-expanded={
              profileOpen
            }
          >
            <div className="member-profile-avatar-wrap">
              {profilePicture ? (
                <img
                  src={
                    profilePicture
                  }
                  alt={
                    fullName
                  }
                  className="member-profile-avatar"
                />
              ) : (
                <div className="member-profile-avatar member-profile-initials">
                  {initials ||
                    "U"}
                </div>
              )}

              <span className="member-online-dot" />
            </div>

            <div className="member-profile-information">
              <strong>
                {fullName}
              </strong>

              <span>
                {department}
              </span>
            </div>

            <span className="member-profile-chevron">
              <ChevronIcon />
            </span>
          </button>

          {/* =============================================
              MENU PROFIL
          ============================================= */}

          {profileOpen && (
            <div className="member-profile-menu">

              <div className="member-profile-menu-accent" />

              <div className="member-profile-menu-header">

                <div className="member-profile-menu-avatar">
                  {profilePicture ? (
                    <img
                      src={
                        profilePicture
                      }
                      alt={
                        fullName
                      }
                    />
                  ) : (
                    initials ||
                    "U"
                  )}
                </div>

                <div>
                  <strong>
                    {fullName}
                  </strong>

                  <span>
                    Membre Aaprovidir
                  </span>
                </div>
              </div>

              {/* =========================================
                  INFOS PROFIL
              ========================================= */}

              <div className="member-profile-menu-info">

                {/* EMAIL */}

                <div className="member-profile-menu-info-row">
                  <span className="member-profile-menu-info-icon">
                    <MailIcon />
                  </span>

                  <div>
                    <small>
                      Adresse e-mail
                    </small>

                    <strong>
                      {email}
                    </strong>
                  </div>
                </div>

                {/* DÉPARTEMENT */}

                <div className="member-profile-menu-info-row">
                  <span className="member-profile-menu-info-icon">
                    <DepartmentIcon />
                  </span>

                  <div>
                    <small>
                      Département
                    </small>

                    <strong>
                      {department}
                    </strong>
                  </div>
                </div>
              </div>

              {/* =========================================
                  FOOTER PROFIL
              ========================================= */}

              <div className="member-profile-menu-footer">
                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                >
                  <LogoutIcon />

                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default MemberSidebar;
