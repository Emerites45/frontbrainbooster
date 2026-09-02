import { useState } from "react";
import { Outlet } from "react-router-dom";
import MemberSidebar from "../../components/layout/MemberSidebar";
import AdminTopbar from "../../components/layout/AdminTopbar";

function MemberLayout({ currentUser, onLogout, tasks, projects, users }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-white">
      <MemberSidebar onLogout={onLogout} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar currentUser={currentUser} onMenuClick={() => setMobileOpen(true)} tasks={tasks} projects={projects} users={users} />
        <main className="flex-1 overflow-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MemberLayout;