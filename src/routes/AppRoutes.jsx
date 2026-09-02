import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleProtectedRoute from "../components/RoleProtectedRoute";

import AppLayout from "../components/AppLayout";
import LoginPage from "../pages/login/LoginPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ForgotPasswordPage from "../pages/resetpassword/ForgotPasswordPage";
import ResetPasswordPage from "../pages/resetpassword/ResetPasswordPage";

import ProjectsPage from "../pages/ProjectsPage";
import MyTimesheetPage from "../pages/MyTimesheetPage";
import UserPerformancePage from "../pages/analytics/UserPerformancePage";

import AdminLayout from "../pages/admin/AdminLayout";
import ScrumMasterLayout from "../pages/scrum-master/ScrumMasterLayout";
import MemberLayout from "../pages/member/MemberLayout";

import getAdminRoutes from "./AdminRoutes";
import getScrumMasterRoutes from "./ScrumMasterRoutes";
import getMemberRoutes from "./MemberRoutes";

import { useAuth } from "../context/AuthContext";
import { useInitialData } from "../hooks/useInitialData";
import { isAdminOrScrumMaster } from "../utils/permissions";
import SignupPage from "../pages/signup/SignupPage";

export default function AppRoutes() {
  const {
    currentUser,
    handleLogin,
    handleLogout,
    isAdminUser,
    isScrumMasterUser,
  } = useAuth();

  const userToken = currentUser?.token || localStorage.getItem("token");
  console.log("Token :", userToken);
  console.log("Données du Token :", parseJwt(userToken));

  const data = useInitialData(currentUser);
  const [selectedTask, setSelectedTask] = useState(null);

  // Injection de isAdminUser et isScrumMasterUser dans les dataHandlers
  const dataHandlers = {
    ...data,
    currentUser,
    isAdminUser,
    isScrumMasterUser,
    handleLogout,
    selectedTask,
    setSelectedTask,
  };

  function handleVerify(code) {
    console.log("Code entered:", code);
  }

  function handleSelectProject(projectId) {
    console.log("Projet sélectionné :", projectId);
  }

  function parseJwt(token) {
    if (!token) return null;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Token invalide :", error);
      return null;
    }
  }

  return (
    <Routes>
      {/* AUTHENTICATION */}
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<SignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/verify-email"
        element={<VerifyEmailPage onVerify={handleVerify} />}
      />

      {/* ROOT REDIRECT */}
      <Route
        path="/"
        element={
          <ProtectedRoute isLoggedIn={!!currentUser}>
            <Navigate
              to={
                isAdminUser
                  ? "/admin/dashboard"
                  : isScrumMasterUser
                    ? "/scrum-master/tasks"
                    : "/member/dashboard"
              }
              replace
            />
          </ProtectedRoute>
        }
      />

      {/* GENERAL PROJECTS */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute isLoggedIn={!!currentUser}>
            <AppLayout currentUser={currentUser} onLogout={handleLogout}>
              <ProjectsPage
                projects={data.projects}
                onCreateProject={data.handleCreateProject}
                onSelectProject={handleSelectProject}
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ADMIN ROUTES */}
      {getAdminRoutes(dataHandlers)}

      {/* SCRUM MASTER ROUTES */}
      {getScrumMasterRoutes(dataHandlers)}

      {/* MEMBER ROUTES */}
      {getMemberRoutes(dataHandlers)}

      {/* TIMESHEET */}
      <Route
        path="/timesheet"
        element={
          <ProtectedRoute isLoggedIn={!!currentUser}>
            {isAdminUser ? (
              <AdminLayout currentUser={currentUser} onLogout={handleLogout} />
            ) : isScrumMasterUser ? (
              <ScrumMasterLayout
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            ) : (
              <MemberLayout currentUser={currentUser} onLogout={handleLogout} />
            )}
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <MyTimesheetPage
              currentUser={currentUser}
              tasks={data.visibleTasks}
              projects={data.projects}
            />
          }
        />
      </Route>

      {/* USER PERFORMANCE ANALYTICS — Admin/Scrum Master uniquement */}
      <Route
        path="/analytics/user-performance"
        element={
          <RoleProtectedRoute
            isLoggedIn={!!currentUser}
            user={currentUser}
            allowedCheck={isAdminOrScrumMaster}
          >
            {isAdminUser ? (
              <AdminLayout currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <ScrumMasterLayout
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            )}
          </RoleProtectedRoute>
        }
      >
        <Route
          index
          element={
            <UserPerformancePage
              tasks={data.visibleTasks}
              projects={data.projects}
            />
          }
        />
      </Route>

      {/* CATCH ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}