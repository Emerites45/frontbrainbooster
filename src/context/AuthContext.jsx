import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  function handleLogin(data) {
    const merged = {
      ...data.user,
      token: data.token,
    };
    localStorage.setItem("currentUser", JSON.stringify(merged));
    setCurrentUser(merged);
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  }

  const isAdminUser = Boolean(
    currentUser?.globalRoles?.includes("ADMIN") || 
    currentUser?.role === "ADMIN"
  );

  const isScrumMasterUser = Boolean(
    currentUser?.departmentRoles?.some((dr) => dr.role === "SCRUM_MASTER") ||
    currentUser?.role === "SCRUM_MASTER"
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        handleLogin,
        handleLogout,
        isAdminUser,
        isScrumMasterUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}