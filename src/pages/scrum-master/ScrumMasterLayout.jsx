import { Outlet } from "react-router-dom";
import ScrumMasterSidebar from "../../components/layout/ScrumMasterSidebar";
import AdminTopbar from "../../components/layout/AdminTopbar";

function ScrumMasterLayout({ currentUser, onLogout }) {
  const myDeptRole = (currentUser?.departmentRoles || []).find((dr) => dr.role === "SCRUM_MASTER");

  return (
    <div className="flex min-h-screen bg-white">
      <ScrumMasterSidebar deptName={myDeptRole?.departmentName ?? ""} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar currentUser={currentUser} />
        <main className="flex-1 overflow-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ScrumMasterLayout;