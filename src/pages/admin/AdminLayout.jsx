import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminTopbar from "../../components/layout/AdminTopbar";

function AdminLayout({
  currentUser,
  onLogout,
  tasks,
  projects,
  users,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* =========================
          SIDEBAR
          ========================= */}
      <AdminSidebar
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* =========================
          MAIN APPLICATION AREA
          ========================= */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* =========================
            TOPBAR
            ========================= */}
        <AdminTopbar
          currentUser={currentUser}
          onMenuClick={() => setMobileOpen(true)}
          tasks={tasks}
          projects={projects}
          users={users}
        />

        {/* =========================
            PAGE CONTENT

            IMPORTANT:
            No bg-white here.

            This allows the global
            blue → cream gradient
            from body to remain visible.
            ========================= */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
