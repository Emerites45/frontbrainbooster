import Sidebar from "./Sidebar";
import {
  LayoutGrid,
  Users,
  FolderKanban,
  Building2,
  CheckSquare,
  ScrollText,
  BarChart3,
  Settings as SettingsIcon,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";

const ADMIN_NAV_SECTIONS = [
  {
    label: "Vue générale",
    items: [
      {
        label: "Tableau de bord",
        icon: LayoutGrid,
        path: "/admin/dashboard",
      },
      {
        label: "Calendrier",
        icon: CalendarIcon,
        path: "/admin/calendar",
      },
      {
        label: "Mon suivi",
        icon: Clock,
        path: "/timesheet",
      },
    ],
  },

  {
    label: "Gestion",
    items: [
      {
        label: "Utilisateurs",
        icon: Users,
        path: "/admin/users",
      },
      {
        label: "Projets",
        icon: FolderKanban,
        path: "/admin/projects",
      },
      {
        label: "Équipes",
        icon: Building2,
        path: "/admin/teams",
      },
      {
        label: "Évaluation équipe",
        icon: BarChart3,
        path: "/admin/team-evaluation",
      },
      {
        label: "Tâches",
        icon: CheckSquare,
        path: "/admin/tasks",
      },
    ],
  },

  {
    label: "Supervision",
    items: [
      {
        label: "Journal d'activité",
        icon: ScrollText,
        path: "/admin/activity",
      },
      {
        label: "Rapports",
        icon: BarChart3,
        path: "/admin/reports",
      },
      {
        label: "Analytics",
        icon: BarChart3,
        path: "/analytics/user-performance",
      },
    ],
  },

  {
    label: "Système",
    items: [
      {
        label: "Paramètres",
        icon: SettingsIcon,
        path: "/admin/settings",
      },
    ],
  },
];

function AdminSidebar({ onLogout }) {
  return (
    <Sidebar
      navSections={ADMIN_NAV_SECTIONS}
      logoSubtitle="Admin"
      ctaLabel="Créer un projet"
      ctaPath="/admin/projects?create=true"
      onLogout={onLogout}
      accent="blue"
    />
  );
}

export default AdminSidebar;