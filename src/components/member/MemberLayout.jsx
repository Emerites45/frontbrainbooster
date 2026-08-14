import MemberSidebar from "./MemberSidebar";
import MemberHeader from "./MemberHeader";

import "./MemberLayout.css";

function MemberLayout({
  children,
  currentUser,
  onLogout,
  tasks = [],
  actions = [],
}) {
  return (
    <div className="member-layout">
      {/* ============================
          SIDEBAR
      ============================ */}

      <MemberSidebar
        currentUser={
          currentUser
        }
        onLogout={
          onLogout
        }
      />

      {/* ============================
          CONTENU PRINCIPAL
      ============================ */}

      <div className="member-layout-main">
        <MemberHeader
          currentUser={
            currentUser
          }
          tasks={tasks}
          actions={actions}
        />

        <main className="member-layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MemberLayout;