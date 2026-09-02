
import Sidebar from "./Sidebar";

import {
  LayoutGrid,
  FolderKanban,
  CheckSquare,
  ListTodo,
  Users,
  ScrollText,
  BarChart3,
  Clock,
  Settings as SettingsIcon,
  FileText,
} from "lucide-react";

const SM_NAV_SECTIONS = [
  {
    label: "Vue générale",
    items: [
      {
        label: "Tableau de bord",
        icon: LayoutGrid,
        path: "/scrum-master/dashboard",
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
        label: "Projets",
        icon: FolderKanban,
        path: "/scrum-master/projects",
      },
      {
        label: "Backlog & Sprints",
        icon: ListTodo,
        path: "/scrum-master/backlog",
      },
      {
        label: "Tâches",
        icon: CheckSquare,
        path: "/scrum-master/tasks",
      },
      {
        label: "Équipe",
        icon: Users,
        path: "/scrum-master/team",
      },
      {
        label: "Évaluation équipe",
        icon: BarChart3,
        path: "/scrum-master/team-evaluation",
      },
    ],
  },

  {
    label: "Supervision",
    items: [
      {
        label: "Journal d'activité",
        icon: ScrollText,
        path: "/scrum-master/activity",
      },
      {
        label: "Rapport de stage",
        icon: FileText,
        path: "/scrum-master/intern-report",
      },
      {
        label: "Analytics",
        icon: BarChart3,
        path: "/analytics/user-performance",
      },
    ],
  },

  {
    label: "Compte",
    items: [
      {
        label: "Paramètres",
        icon: SettingsIcon,
        path: "/scrum-master/settings",
      },
    ],
  },
];

function ScrumMasterSidebar({
  deptName,
  onLogout,
  mobileOpen,
  onMobileClose,
}) {
  return (
    <Sidebar
      navSections={SM_NAV_SECTIONS}
      logoSubtitle={`Scrum Master · ${deptName}`}
      ctaLabel="Nouveau projet"
      ctaPath="/scrum-master/projects?create=true"
      onLogout={onLogout}
      accent="green"
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}

export default ScrumMasterSidebar;
