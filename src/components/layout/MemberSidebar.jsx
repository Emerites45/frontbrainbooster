import Sidebar from "./Sidebar";
import { LayoutGrid, CheckSquare, FolderKanban, Calendar as CalendarIcon, Clock, Settings as SettingsIcon } from "lucide-react";

const MEMBER_NAV_SECTIONS = [
  { label: "Vue générale", items: [
    { label: "Tableau de bord", icon: LayoutGrid, path: "/member/dashboard" },
    { label: "Mon suivi", icon: Clock, path: "/timesheet" },
  ]},
  { label: "Travail", items: [
    { label: "Mes tâches", icon: CheckSquare, path: "/member/tasks" },
    { label: "Projets", icon: FolderKanban, path: "/member/projects" },
    { label: "Calendrier", icon: CalendarIcon, path: "/member/calendar" },
  ]},
  { label: "Système", items: [
    { label: "Paramètres", icon: SettingsIcon, path: "/member/settings" },
  ]},
];

function MemberSidebar({ onLogout, mobileOpen, onMobileClose }) {
  return (
    <Sidebar
      navSections={MEMBER_NAV_SECTIONS}
      logoSubtitle="Membre"
      onLogout={onLogout}
      accent="yellow"
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}

export default MemberSidebar;