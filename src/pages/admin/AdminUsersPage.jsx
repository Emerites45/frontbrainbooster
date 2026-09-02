import { useState, useEffect, useMemo } from "react";
import { Search, UserPlus } from "lucide-react";
import { fetchUsers, fetchDepartments, createAdminUser, updateUser, toggleUserActive } from "../../api/users.api";
import CreateUserModal from "../../components/dashboard/CreateUserModal";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/dashboard/Pagination";

function buildRoleOptions(departments) {
  const options = [{ value: "ADMIN", label: "Admin" }];
  departments.forEach((d) => {
    options.push({ value: `SCRUM_MASTER:${d.id}`, label: `Scrum Master · ${d.name}` });
    options.push({ value: `MEMBER:${d.id}`, label: `Membre · ${d.name}` });
  });
  return options;
}

function currentRoleValue(user) {
  if (user.globalRoles?.includes("ADMIN")) return "ADMIN";
  const dr = user.departmentRoles?.[0];
  return dr ? `${dr.role}:${dr.departmentId}` : "";
}

function roleValueToPayload(value, departments) {
  if (value === "ADMIN") {
    return { globalRoles: ["ADMIN"], departmentRoles: [] };
  }
  const [role, deptIdStr] = value.split(":");
  const deptId = Number(deptIdStr);
  const dept = departments.find((d) => d.id === deptId);
  return {
    globalRoles: [],
    departmentRoles: [{ departmentId: deptId, departmentName: dept?.name ?? "", role }],
  };
}

function userDepartmentId(user) {
  return user.departmentRoles?.[0]?.departmentId ?? null;
}

function StatusBadge({ user }) {
  if (user.mustChangePassword) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold px-2.5 py-1">
        En attente
      </span>
    );
  }
  if (user.active === false) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 text-[11px] font-semibold px-2.5 py-1">
        Désactivé
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 text-[11px] font-semibold px-2.5 py-1">
      Actif
    </span>
  );
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savingUserId, setSavingUserId] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    Promise.all([fetchUsers(), fetchDepartments()])
      .then(([usersData, deptData]) => {
        setUsers(usersData);
        setDepartments(deptData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  const roleOptions = useMemo(() => buildRoleOptions(departments), [departments]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase();
      const matchesSearch =
        !search ||
        fullName.includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "ALL" ||
        (roleFilter === "ADMIN" && u.globalRoles?.includes("ADMIN")) ||
        (roleFilter === "SCRUM_MASTER" && u.departmentRoles?.some((dr) => dr.role === "SCRUM_MASTER")) ||
        (roleFilter === "MEMBER" && u.departmentRoles?.some((dr) => dr.role === "MEMBER"));

      const matchesDept =
        deptFilter === "ALL" || userDepartmentId(u) === Number(deptFilter);

      return matchesSearch && matchesRole && matchesDept;
    });
  }, [users, search, roleFilter, deptFilter]);

  const {
    pageItems: pagedUsers,
    page,
    totalPages,
    rangeStart,
    rangeEnd,
    totalItems,
    goToPage,
  } = usePagination(filteredUsers, 10);

  async function handleCreateUser(userData) {
    const newUser = await createAdminUser(userData);
    setUsers((prev) => [...prev, newUser]);
  }

  async function handleRoleChange(userId, newValue) {
    setSavingUserId(userId);
    try {
      const payload = roleValueToPayload(newValue, departments);
      const updated = await updateUser(userId, payload);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
    } catch (err) {
      alert("Erreur lors du changement de rôle : " + err.message);
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleToggleActive(user) {
    setSavingUserId(user.id);
    try {
      const updated = await toggleUserActive(user.id, !user.active);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u)));
    } catch (err) {
      alert("Erreur lors du changement de statut : " + err.message);
    } finally {
      setSavingUserId(null);
    }
  }

  if (loading) {
    return <p className="text-[13.5px] text-slate-400 px-8 py-6">Chargement des utilisateurs...</p>;
  }
  if (error) {
    return <p className="text-[13.5px] text-red-600 px-8 py-6">Erreur : {error}</p>;
  }

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900">Utilisateurs</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} sur {users.length}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2.5 transition-colors"
        >
          <UserPlus size={15} />
          Créer un utilisateur
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 flex-1 min-w-[260px] bg-slate-50 border border-slate-100">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom ou un email..."
            className="bg-transparent text-[13px] outline-none w-full text-slate-700 placeholder-slate-400"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none"
        >
          <option value="ALL">Tous les rôles</option>
          <option value="ADMIN">Admin</option>
          <option value="SCRUM_MASTER">Scrum Master</option>
          <option value="MEMBER">Membre</option>
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none"
        >
          <option value="ALL">Tous les départements</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/60">
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">Nom</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">Email</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">Rôle</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">Statut</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-[13px] text-slate-400 py-10">
                  Aucun utilisateur ne correspond à ces filtres.
                </td>
              </tr>
            )}
            {pagedUsers.map((u, i) => (
              <tr
                key={u.id}
                className={i !== pagedUsers.length - 1 ? "border-b border-slate-50" : ""}
              >
                <td className="px-4 py-3.5 text-[13.5px] text-slate-800 font-medium">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-4 py-3.5 text-[13.5px] text-slate-500">{u.email}</td>
                <td className="px-4 py-3.5">
                  <select
                    value={currentRoleValue(u)}
                    disabled={savingUserId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="text-[12.5px] rounded-md border border-slate-200 text-slate-600 px-2 py-1 outline-none disabled:opacity-50"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge user={u} />
                </td>
                <td className="px-4 py-3.5">
                  <button
                    disabled={savingUserId === u.id}
                    onClick={() => handleToggleActive(u)}
                    className={`rounded-lg text-white text-[12px] font-medium px-3 py-1.5 transition-colors disabled:opacity-50 ${
                      u.active === false
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {u.active === false ? "Activer" : "Désactiver"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalItems={totalItems}
          onPageChange={goToPage}
          itemLabel="utilisateurs"
        />
      </div>

      {showCreateModal && (
        <CreateUserModal
          departments={departments}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateUser}
        />
      )}
    </div>
  );
}

export default AdminUsersPage;