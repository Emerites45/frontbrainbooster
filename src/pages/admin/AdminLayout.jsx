import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/layout/AdminSidebar";
import AdminTopbar from "../../components/layout/AdminTopbar";

/**
 * Layout partagé par toutes les pages /admin/*.
 * currentUser et onLogout viennent de App.jsx (source de vérité unique de
 * l'auth) — ce composant ne gère aucun state d'auth lui-même.
 */
function AdminLayout({ currentUser, onLogout }) {
  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar currentUser={currentUser} />
        <main className="flex-1 overflow-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;