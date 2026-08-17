
import Sidebar from "./Sidebar";
import {
  LayoutGrid,
  FolderKanban,
  CheckSquare,
  Users,
  ScrollText,
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
        label: "Tâches",
        icon: CheckSquare,
        path: "/scrum-master/tasks",
      },
      {
        label: "Équipe",
        icon: Users,
        path: "/scrum-master/team",
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
    ],
  },
];

function ScrumMasterSidebar({ deptName, onLogout }) {
  return (
    <Sidebar
      navSections={SM_NAV_SECTIONS}
      logoSubtitle={`Scrum Master · ${deptName}`}
      ctaLabel="Nouveau projet"
      ctaPath="/scrum-master/projects?create=true"
      onLogout={onLogout}
      accent="green"
    />
  );
}

export default ScrumMasterSidebar;

