import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  LayoutGrid,
  CheckSquare,
  Calendar as CalendarIcon,
  ScrollText,
  Users,
  Settings as SettingsIcon,
  Plus,
  LogOut,
  SlidersHorizontal,
  FileText,
  Target,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  GitCommit,
  GitPullRequest,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Info,
  RotateCcw,
  Sprout,
  Gauge,
  Flame,
  ArrowUp,
  ArrowDown,
  Send,
  ChevronDown,
  BarChart3,
  Edit3,
  Check,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const C = {
  primary: "#0B4F9E",
  primaryDark: "#08386F",
  primaryLight: "#EAF2FB",
  lime: "#7FB519",
  limeDark: "#5F8C13",
  limeLight: "#F1F7E4",
  ink: "#0F1E3D",
  slate: "#5B6B84",
  slateLight: "#F3F5F8",
  slateBorder: "#E4E8EF",
  red: "#DC2626",
  redLight: "#FDEAEA",
  white: "#FFFFFF",
};

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
    .font-display { font-family: 'Poppins', 'Inter', system-ui, sans-serif; }
    .font-body { font-family: 'Inter', system-ui, sans-serif; }
  `}</style>
);

const NAV = [
  { label: "Tableau de bord", icon: LayoutGrid },
  { label: "Tâches", icon: CheckSquare },
  { label: "Évolution", icon: TrendingUp },
  { label: "Performance individuelle", icon: Gauge },
  { label: "Difficultés & Améliorations", icon: Lightbulb },
  { label: "Calendrier", icon: CalendarIcon },
  { label: "Journal d'audit", icon: ScrollText },
  { label: "Équipe", icon: Users },
  { label: "Paramètres", icon: SettingsIcon },
];

const PEOPLE = [
  { name: "Dipta", initials: "DI", color: C.primary, role: "Responsable Audit Financier", email: "dipta@aaprovidir.com" },
  { name: "Flore", initials: "FL", color: C.lime, role: "Analyste Sécurité & Conformité", email: "flore@aaprovidir.com" },
  { name: "Dilane", initials: "DL", color: C.ink, role: "Coordinateur Qualité", email: "dilane@aaprovidir.com" },
];

const personByName = (name) => PEOPLE.find((p) => p.name === name) || PEOPLE[0];

const INITIAL_TASKS = [
  {
    id: "t1",
    icon: FileText,
    title: "Préparation de l'audit financier Q3",
    status: "EN COURS",
    priority: "CRITIQUE",
    assignee: "Dipta",
    due: "24-11-2023",
    dueRed: false,
    project: "Stratégie de conformité",
  },
  {
    id: "t2",
    icon: Target,
    title: "Collecte de preuves SOC2 Type II",
    status: "BACKLOG",
    priority: "MOYENNE",
    assignee: "Flore",
    due: "05-12-2023",
    dueRed: false,
    project: "Sécurité de l'infrastructure",
  },
  {
    id: "t3",
    icon: ShieldCheck,
    title: "Mise à jour Politique de Confidentialité (GDPR v2)",
    status: "TERMINEE",
    priority: "HAUTE",
    assignee: "Dilane",
    due: "15-11-2023",
    dueRed: false,
    project: "Mise à jour conformité",
  },
  {
    id: "t4",
    icon: FileText,
    title: "Rapport annuel d'évaluation des risques",
    status: "A REVOIR",
    priority: "BASSE",
    assignee: "Flore",
    due: "30-11-2023",
    dueRed: false,
    project: "Audit interne 2023",
  },
  {
    id: "t5",
    icon: AlertTriangle,
    title: "Correction des vulnérabilités réseau",
    status: "EN RETARD",
    priority: "CRITIQUE",
    assignee: "Dilane",
    due: "18-11-2023",
    dueRed: true,
    project: "Sécurité de l'infrastructure",
  },
];

const STATUS_STYLE = {
  "EN COURS": { color: C.primary, bg: C.primaryLight },
  "BACKLOG": { color: C.slate, bg: C.slateLight },
  "TERMINEE": { color: C.limeDark, bg: C.limeLight },
  "A REVOIR": { color: C.slate, bg: C.slateLight },
  "EN RETARD": { color: C.white, bg: C.red },
};

const PRIORITY_STYLE = {
  CRITIQUE: C.red,
  HAUTE: C.primary,
  MOYENNE: C.slate,
  BASSE: C.slate,
};

const ENHANCED_AUDIT_LOG = [
  {
    id: "a1",
    date: "Aujourd'hui",
    time: "14:32",
    user: "Dipta",
    role: "Responsable Audit",
    action: "Changement d'état",
    detail: "a déplacé « API Auth SSO » de EN COURS vers À REVOIR",
    sprint: "Sprint 24",
    type: "status",
    icon: GitPullRequest,
  },
  {
    id: "a2",
    date: "Aujourd'hui",
    time: "11:05",
    user: "Flore",
    role: "Analyste Sécurité",
    action: "Ajustement Sprint",
    detail: "a réassigné la tâche « Intégration Stripe » à Dilane pour rééquilibrage de charge",
    sprint: "Sprint 24",
    type: "sprint",
    icon: Activity,
  },
  {
    id: "a3",
    date: "Aujourd'hui",
    time: "09:15",
    user: "Dilane",
    role: "Coordinateur Qualité",
    action: "Alerte Bloqueur",
    detail: "a signalé un bloquant sur « Migration Base de Données » : environnement de staging instable",
    sprint: "Sprint 24",
    type: "blocker",
    icon: AlertCircle,
  },
  {
    id: "a4",
    date: "Hier",
    time: "17:40",
    user: "Flore",
    role: "Analyste Sécurité",
    action: "Revue validée",
    detail: "a validé la définition de fini (DoD) pour « Dashboard Métriques Q3 »",
    sprint: "Backlog",
    type: "story",
    icon: CheckCircle2,
  },
  {
    id: "a5",
    date: "Hier",
    time: "14:20",
    user: "Dipta",
    role: "Responsable Audit",
    action: "Commit & Suivi",
    detail: "a lié la revue #104 au correctif « Fuite mémoire cache »",
    sprint: "Sprint 24",
    type: "code",
    icon: GitCommit,
  },
];

const MONTH_NAMES = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const DAILY_PROGRESS = [
  { day: "02 Août", Dipta: 1, Flore: 2, Dilane: 0 },
  { day: "03 Août", Dipta: 2, Flore: 1, Dilane: 1 },
  { day: "04 Août", Dipta: 1, Flore: 3, Dilane: 2 },
  { day: "05 Août", Dipta: 3, Flore: 2, Dilane: 1 },
  { day: "06 Août", Dipta: 2, Flore: 2, Dilane: 3 },
  { day: "07 Août", Dipta: 0, Flore: 1, Dilane: 2 },
  { day: "08 Août", Dipta: 4, Flore: 3, Dilane: 2 },
  { day: "09 Août", Dipta: 3, Flore: 2, Dilane: 4 },
  { day: "10 Août", Dipta: 2, Flore: 4, Dilane: 3 },
  { day: "11 Août", Dipta: 5, Flore: 3, Dilane: 2 },
  { day: "12 Août", Dipta: 3, Flore: 2, Dilane: 4 },
  { day: "13 Août", Dipta: 4, Flore: 5, Dilane: 3 },
  { day: "14 Août", Dipta: 3, Flore: 4, Dilane: 5 },
  { day: "15 Août", Dipta: 5, Flore: 4, Dilane: 4 },
];

const INITIAL_NOTES = [
  { id: "n1", person: "Dipta", type: "difficulte", date: "14-08-2026", month: "Août 2026", text: "Retard sur la collecte des pièces justificatives côté fournisseurs, réponses lentes." },
  { id: "n2", person: "Dipta", type: "amelioration", date: "15-08-2026", month: "Août 2026", text: "Mise en place d'une relance automatique par email, gain de temps estimé à 2h/semaine." },
  { id: "n3", person: "Flore", type: "difficulte", date: "13-08-2026", month: "Août 2026", text: "Environnement de staging instable, plusieurs tests de sécurité à refaire." },
  { id: "n4", person: "Flore", type: "amelioration", date: "14-08-2026", month: "Août 2026", text: "Nouveau modèle de rapport de vulnérabilités, plus clair pour l'équipe technique." },
  { id: "n5", person: "Dilane", type: "difficulte", date: "12-08-2026", month: "Août 2026", text: "Difficulté à prioriser entre les tickets qualité et les demandes urgentes." },
  { id: "n6", person: "Dilane", type: "amelioration", date: "15-08-2026", month: "Août 2026", text: "Adoption d'un tableau Kanban partagé, meilleure visibilité sur la charge de l'équipe." },
];

const PERF_WEEKS = [
  { id: 1, label: "03 – 09 août 2026" },
  { id: 0, label: "10 – 16 août 2026" },
];

const PERFORMANCE = {
  Dipta: {
    0: {
      objectiveHours: 32,
      dailyTarget: 6.4,
      daily: [
        { d: "10/08", h: 6.5 }, { d: "11/08", h: 7 }, { d: "12/08", h: 6 },
        { d: "13/08", h: 7.5 }, { d: "14/08", h: 6 }, { d: "15/08", h: 5.5 }, { d: "16/08", h: 3.5 },
      ],
      tasksTotal: 9, tasksDone: 6, tasksLate: 1, tasksProgress: 2,
      timeLog: [
        { day: "Lundi", date: "10/08", project: "Audit Q3", task: "Collecte pièces", normal: 6.5, sup: 0 },
        { day: "Mardi", date: "11/08", project: "Audit Q3", task: "Analyse risques", normal: 7, sup: 0 },
        { day: "Mercredi", date: "12/08", project: "Conformité", task: "Revue GDPR", normal: 6, sup: 0 },
        { day: "Jeudi", date: "13/08", project: "Audit Q3", task: "Rapport intermédiaire", normal: 7, sup: 0.5 },
        { day: "Vendredi", date: "14/08", project: "Conformité", task: "Réunion cadrage", normal: 6, sup: 0 },
        { day: "Samedi", date: "15/08", project: "Audit Q3", task: "Finalisation", normal: 5.5, sup: 0 },
        { day: "Dimanche", date: "16/08", project: "—", task: "—", normal: 3.5, sup: 0 },
      ],
      retro: {
        difficultes: "Retard des fournisseurs sur les pièces justificatives, deux relances nécessaires.",
        solutions: "Mise en place d'une relance automatique par email dès J+2 sans réponse.",
        observations: "Charge stable, pic mercredi lié à la revue GDPR.",
        bilan: "Semaine productive malgré les blocages externes.",
      },
      comments: [{ id: "c1", author: "Flore", text: "Bon rythme cette semaine, la relance auto est une bonne idée.", time: "il y a 3h" }],
    },
    1: {
      objectiveHours: 32,
      dailyTarget: 6.4,
      daily: [
        { d: "03/08", h: 5 }, { d: "04/08", h: 6.5 }, { d: "05/08", h: 6 },
        { d: "06/08", h: 6.5 }, { d: "07/08", h: 5.5 }, { d: "08/08", h: 4 }, { d: "09/08", h: 2.5 },
      ],
      tasksTotal: 8, tasksDone: 5, tasksLate: 0, tasksProgress: 3,
      timeLog: [
        { day: "Lundi", date: "03/08", project: "Audit Q3", task: "Cadrage", normal: 5, sup: 0 },
        { day: "Mardi", date: "04/08", project: "Audit Q3", task: "Collecte pièces", normal: 6.5, sup: 0 },
        { day: "Mercredi", date: "05/08", project: "Conformité", task: "Revue GDPR", normal: 6, sup: 0 },
        { day: "Jeudi", date: "06/08", project: "Audit Q3", task: "Analyse", normal: 6.5, sup: 0 },
        { day: "Vendredi", date: "07/08", project: "Conformité", task: "Suivi", normal: 5.5, sup: 0 },
        { day: "Samedi", date: "08/08", project: "—", task: "—", normal: 4, sup: 0 },
        { day: "Dimanche", date: "09/08", project: "—", task: "—", normal: 2.5, sup: 0 },
      ],
      retro: {
        difficultes: "Démarrage lent en début de semaine, attente de validations.",
        solutions: "Anticiper les validations dès le vendredi précédent.",
        observations: "Montée en charge progressive vers la fin de semaine.",
        bilan: "Semaine correcte, marge de progression sur le démarrage.",
      },
      comments: [],
    },
  },
  Flore: {
    0: {
      objectiveHours: 35,
      dailyTarget: 7,
      daily: [
        { d: "10/08", h: 8 }, { d: "11/08", h: 7.5 }, { d: "12/08", h: 8 },
        { d: "13/08", h: 7 }, { d: "14/08", h: 6.5 }, { d: "15/08", h: 4 }, { d: "16/08", h: 2 },
      ],
      tasksTotal: 10, tasksDone: 8, tasksLate: 0, tasksProgress: 2,
      timeLog: [
        { day: "Lundi", date: "10/08", project: "Sécurité Infra", task: "Scan vulnérabilités", normal: 7, sup: 1 },
        { day: "Mardi", date: "11/08", project: "Sécurité Infra", task: "Correctifs", normal: 7, sup: 0.5 },
        { day: "Mercredi", date: "12/08", project: "SOC2", task: "Collecte preuves", normal: 7, sup: 1 },
        { day: "Jeudi", date: "13/08", project: "SOC2", task: "Documentation", normal: 7, sup: 0 },
        { day: "Vendredi", date: "14/08", project: "Sécurité Infra", task: "Tests", normal: 6.5, sup: 0 },
        { day: "Samedi", date: "15/08", project: "SOC2", task: "Revue", normal: 4, sup: 0 },
        { day: "Dimanche", date: "16/08", project: "—", task: "—", normal: 2, sup: 0 },
      ],
      retro: {
        difficultes: "Environnement de staging instable, plusieurs tests à refaire.",
        solutions: "Nouveau modèle de rapport de vulnérabilités mis en place.",
        observations: "Volume d'heures supplémentaires en légère hausse en début de semaine.",
        bilan: "Bonne semaine, vigilance à garder sur la charge lundi/mardi.",
      },
      comments: [{ id: "c2", author: "Dilane", text: "Le nouveau modèle de rapport est top, ça va nous faire gagner du temps.", time: "il y a 5h" }],
    },
    1: {
      objectiveHours: 35,
      dailyTarget: 7,
      daily: [
        { d: "03/08", h: 7 }, { d: "04/08", h: 7 }, { d: "05/08", h: 6.5 },
        { d: "06/08", h: 7.5 }, { d: "07/08", h: 6 }, { d: "08/08", h: 3 }, { d: "09/08", h: 1 },
      ],
      tasksTotal: 9, tasksDone: 6, tasksLate: 1, tasksProgress: 2,
      timeLog: [
        { day: "Lundi", date: "03/08", project: "Sécurité Infra", task: "Audit initial", normal: 7, sup: 0 },
        { day: "Mardi", date: "04/08", project: "Sécurité Infra", task: "Scan", normal: 7, sup: 0 },
        { day: "Mercredi", date: "05/08", project: "SOC2", task: "Préparation", normal: 6.5, sup: 0 },
        { day: "Jeudi", date: "06/08", project: "SOC2", task: "Collecte preuves", normal: 7.5, sup: 0.5 },
        { day: "Vendredi", date: "07/08", project: "Sécurité Infra", task: "Correctifs", normal: 6, sup: 0 },
        { day: "Samedi", date: "08/08", project: "—", task: "—", normal: 3, sup: 0 },
        { day: "Dimanche", date: "09/08", project: "—", task: "—", normal: 1, sup: 0 },
      ],
      retro: {
        difficultes: "Un bloqueur critique a immobilisé l'équipe une demi-journée.",
        solutions: "Escalade plus rapide vers l'infra la prochaine fois.",
        observations: "Charge homogène sur la semaine.",
        bilan: "Semaine correcte malgré le bloqueur du jeudi.",
      },
      comments: [],
    },
  },
  Dilane: {
    0: {
      objectiveHours: 30,
      dailyTarget: 6,
      daily: [
        { d: "10/08", h: 4 }, { d: "11/08", h: 6 }, { d: "12/08", h: 6.5 },
        { d: "13/08", h: 5.5 }, { d: "14/08", h: 6 }, { d: "15/08", h: 5 }, { d: "16/08", h: 3 },
      ],
      tasksTotal: 7, tasksDone: 3, tasksLate: 1, tasksProgress: 3,
      timeLog: [
        { day: "Lundi", date: "10/08", project: "Qualité", task: "Priorisation backlog", normal: 4, sup: 0 },
        { day: "Mardi", date: "11/08", project: "Qualité", task: "Tickets urgents", normal: 6, sup: 0 },
        { day: "Mercredi", date: "12/08", project: "Sécurité Infra", task: "Correctifs réseau", normal: 6.5, sup: 0 },
        { day: "Jeudi", date: "13/08", project: "Qualité", task: "Kanban partagé", normal: 5.5, sup: 0 },
        { day: "Vendredi", date: "14/08", project: "Qualité", task: "Revue qualité", normal: 6, sup: 0 },
        { day: "Samedi", date: "15/08", project: "—", task: "—", normal: 5, sup: 0 },
        { day: "Dimanche", date: "16/08", project: "—", task: "—", normal: 3, sup: 0 },
      ],
      retro: {
        difficultes: "Difficulté à prioriser entre tickets qualité et demandes urgentes.",
        solutions: "Adoption d'un tableau Kanban partagé pour la visibilité de charge.",
        observations: "Démarrage lent lundi, remontée progressive ensuite.",
        bilan: "Semaine en dessous de l'objectif, à rattraper la semaine prochaine.",
      },
      comments: [],
    },
    1: {
      objectiveHours: 30,
      dailyTarget: 6,
      daily: [
        { d: "03/08", h: 6 }, { d: "04/08", h: 6 }, { d: "05/08", h: 5.5 },
        { d: "06/08", h: 6 }, { d: "07/08", h: 6.5 }, { d: "08/08", h: 3.5 }, { d: "09/08", h: 1.5 },
      ],
      tasksTotal: 8, tasksDone: 5, tasksLate: 0, tasksProgress: 3,
      timeLog: [
        { day: "Lundi", date: "03/08", project: "Qualité", task: "Revue process", normal: 6, sup: 0 },
        { day: "Mardi", date: "04/08", project: "Qualité", task: "Audit interne", normal: 6, sup: 0 },
        { day: "Mercredi", date: "05/08", project: "Sécurité Infra", task: "Tests", normal: 5.5, sup: 0 },
        { day: "Jeudi", date: "06/08", project: "Qualité", task: "Documentation", normal: 6, sup: 0 },
        { day: "Vendredi", date: "07/08", project: "Qualité", task: "Suivi tickets", normal: 6.5, sup: 0 },
        { day: "Samedi", date: "08/08", project: "—", task: "—", normal: 3.5, sup: 0 },
        { day: "Dimanche", date: "09/08", project: "—", task: "—", normal: 1.5, sup: 0 },
      ],
      retro: {
        difficultes: "Coordination difficile avec deux projets en parallèle.",
        solutions: "Bloc horaire dédié par projet, testé cette semaine.",
        observations: "Bonne régularité journalière.",
        bilan: "Semaine solide, proche de l'objectif.",
      },
      comments: [],
    },
  },
};

function parseDue(due) {
  if (!due || !due.includes("-")) return { d: 1, m: 1, y: 2023 };
  const [d, m, y] = due.split("-").map(Number);
  return { d, m, y };
}

function Avatar({ initials, bg, size = 24 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold shrink-0 font-body"
      style={{ width: size, height: size, backgroundColor: bg || C.primary, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

function BrandMark({ size = 36 }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl shrink-0 relative"
      style={{
        width: size,
        height: size,
        backgroundImage: `linear-gradient(150deg, ${C.primary}, ${C.primaryDark})`,
        boxShadow: `0 4px 14px ${C.primary}40`,
      }}
    >
      <span className="font-display font-extrabold text-white" style={{ fontSize: size * 0.52, lineHeight: 1 }}>
        A
      </span>
      <Sprout
        size={size * 0.32}
        color={C.lime}
        strokeWidth={2.6}
        style={{ position: "absolute", top: -size * 0.16, right: -size * 0.14 }}
      />
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className="fixed bottom-6 right-6 z-[80] rounded-xl px-4 py-3 shadow-lg text-[13px] font-semibold text-white font-body flex items-center gap-2"
      style={{ backgroundColor: C.ink }}
    >
      <CheckCircle2 size={16} color={C.lime} />
      {message}
    </div>
  );
}

export default function AaprovidirDashboard() {
  const [activeNav, setActiveNav] = useState("Tableau de bord");
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [team, setTeam] = useState(PEOPLE.map((p, i) => ({ id: `m${i}`, ...p, tasks: INITIAL_TASKS.filter((t) => t.assignee === p.name).length })));
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "", email: "" });
  const [notes, setNotes] = useState(INITIAL_NOTES);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    project: "Audit général",
    assignee: "Dipta",
    due: "30-11-2023",
    priority: "MOYENNE",
  });

  const [calMonth, setCalMonth] = useState(10);
  const [calYear, setCalYear] = useState(2023);
  const [selectedDay, setSelectedDay] = useState(24);

  const [profile, setProfile] = useState({
    name: "Dipta",
    email: "dipta@aaprovidir.com",
    phone: "+237 6 90 12 34 56",
    role: "Responsable Audit Financier",
    department: "Ingénierie & Produit",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [toast, setToast] = useState(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const { d, m, y } = parseDue(t.due);
      const key = `${y}-${m}-${d}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const p = personByName(newTask.assignee);
    const createdTask = {
      id: `t_${Date.now()}`,
      icon: FileText,
      title: newTask.title,
      status: "BACKLOG",
      priority: newTask.priority,
      assignee: newTask.assignee,
      due: newTask.due,
      dueRed: false,
      project: newTask.project,
    };
    setTasks([createdTask, ...tasks]);
    setIsAddTaskOpen(false);
    setNewTask({ title: "", project: "Audit général", assignee: "Dipta", due: "30-11-2023", priority: "MOYENNE" });
    setToast(`Tâche assignée à ${p.name}`);
  };

  const addMember = () => {
    if (!newMember.name.trim()) return;
    const initials = newMember.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
    setTeam((prev) => [
      ...prev,
      { id: `m${Date.now()}`, name: newMember.name, initials, color: C.primary, role: newMember.role || "Membre de l'équipe", email: newMember.email || "—", tasks: 0 },
    ]);
    setNewMember({ name: "", role: "", email: "" });
    setShowAddMember(false);
    setToast("Membre ajouté à l'équipe");
  };

  const removeMember = (id) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
    setToast("Membre retiré de l'équipe");
  };

  const calGrid = useMemo(() => {
    const firstOfMonth = new Date(calYear, calMonth, 1);
    let startIdx = firstOfMonth.getDay() - 1;
    if (startIdx < 0) startIdx = 6;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startIdx; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calMonth, calYear]);

  const changeMonth = (delta) => {
    let m = calMonth + delta;
    let y = calYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setCalMonth(m);
    setCalYear(y);
    setSelectedDay(null);
  };

  const selectedKey = selectedDay ? `${calYear}-${calMonth + 1}-${selectedDay}` : null;
  const selectedTasks = selectedKey ? tasksByDate[selectedKey] || [] : [];

  if (loggedOut) {
    return (
      <div className="flex w-full h-full min-h-screen items-center justify-center font-body" style={{ backgroundColor: C.ink }}>
        {FONTS}
        <div className="flex flex-col items-center text-center gap-4 px-6">
          <BrandMark size={56} />
          <h1 className="text-white font-display font-bold text-[22px]">Vous êtes déconnecté(e)</h1>
          <p className="text-[13.5px]" style={{ color: "#AAB6CC" }}>À bientôt sur Aaprovidir.</p>
          <button
            onClick={() => setLoggedOut(false)}
            className="mt-2 flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-bold text-white transition-transform active:scale-95"
            style={{ backgroundImage: `linear-gradient(120deg, ${C.primary}, ${C.primaryDark})` }}
          >
            <RotateCcw size={16} /> Se reconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full min-h-screen font-body" style={{ backgroundColor: C.white, color: C.ink }}>
      {FONTS}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {}
      <aside className="flex flex-col shrink-0 border-r" style={{ width: 248, backgroundColor: C.slateLight, borderColor: C.slateBorder }}>
        <div className="flex items-center gap-3 px-6 pt-6 pb-8">
          <BrandMark size={38} />
          <div className="leading-tight">
            <div className="text-[16px] font-display font-extrabold tracking-tight" style={{ color: C.ink }}>Aaprovidir</div>
            <div className="text-[9px] tracking-wider font-bold uppercase" style={{ color: C.limeDark }}>
              Agile & Delivery Hub
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV.map(({ label, icon: Icon }) => {
            const active = activeNav === label;
            return (
              <div
                key={label}
                onClick={() => setActiveNav(label)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] cursor-pointer transition-all font-medium"
                style={
                  active
                    ? { backgroundColor: C.primary, color: C.white, fontWeight: 700, boxShadow: `0 4px 10px ${C.primary}30` }
                    : { color: C.slate }
                }
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.backgroundColor = C.primaryLight; e.currentTarget.style.color = C.primary; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = C.slate; } }}
              >
                <Icon size={17} strokeWidth={active ? 2.3 : 1.8} />
                <span className="leading-tight">{label}</span>
              </div>
            );
          })}
        </nav>

        <div className="px-4 pb-4">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[13.5px] font-bold text-white transition-all transform active:scale-95"
            style={{ backgroundImage: `linear-gradient(120deg, ${C.primary}, ${C.primaryDark})`, boxShadow: `0 4px 12px ${C.primary}35` }}
          >
            <Plus size={18} strokeWidth={2.5} /> Nouvelle tâche
          </button>
        </div>

        <div className="px-6 py-4 space-y-3 border-t" style={{ borderColor: C.slateBorder }}>
          <div
            className="flex items-center gap-2 text-[13px] cursor-pointer transition-colors"
            style={{ color: C.slate }}
            onClick={() => setShowHelp(true)}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.slate)}
          >
            <HelpCircle size={16} /> Centre d'aide / Renseignements
          </div>
          <div
            className="flex items-center gap-2 text-[13px] cursor-pointer transition-colors"
            style={{ color: C.slate }}
            onClick={() => setConfirmLogout(true)}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.red)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.slate)}
          >
            <LogOut size={16} /> Déconnexion
          </div>
        </div>
      </aside>

      {}
      <div className="flex-1 flex flex-col min-w-0">
        {}
        <div className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: C.slateBorder }}>
          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 w-[340px]" style={{ backgroundColor: C.slateLight, border: `1px solid ${C.slateBorder}` }}>
            <Search size={16} style={{ color: C.slate }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher tâches, membres, événements..."
              className="bg-transparent text-[13px] outline-none w-full"
              style={{ color: C.ink }}
            />
            {searchQuery && (
              <X size={14} className="cursor-pointer" style={{ color: C.slate }} onClick={() => setSearchQuery("")} />
            )}
          </div>
          <div className="flex items-center gap-5">
            <div className="relative" ref={notifRef}>
              <Bell
                size={19}
                className="cursor-pointer transition-colors"
                style={{ color: showNotifs ? C.primary : C.slate }}
                onClick={() => setShowNotifs((s) => !s)}
              />
              <span className="absolute -top-1 -right-1 rounded-full" style={{ width: 7, height: 7, backgroundColor: C.red }} />
              {showNotifs && (
                <div className="absolute right-0 top-8 w-72 rounded-2xl shadow-xl border z-50 overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.slateBorder }}>
                  <div className="px-4 py-3 border-b text-[12.5px] font-bold" style={{ borderColor: C.slateBorder, color: C.ink }}>Notifications</div>
                  {[
                    { t: "Dilane a signalé un bloquant", d: "il y a 10 min" },
                    { t: "Tâche « Correction réseau » en retard", d: "il y a 1 h" },
                    { t: "Flore a terminé « GDPR v2 »", d: "hier" },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-2.5 text-[12.5px] border-b last:border-none" style={{ borderColor: C.slateBorder, color: C.slate }}>
                      <div style={{ color: C.ink, fontWeight: 600 }}>{n.t}</div>
                      <div className="text-[11px] mt-0.5">{n.d}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 cursor-pointer pl-3 border-l" style={{ borderColor: C.slateBorder }} onClick={() => setActiveNav("Paramètres")}>
              <div className="text-right">
                <div className="text-[13px] font-bold leading-none" style={{ color: C.ink }}>{profile.name}</div>
                <div className="text-[10px] font-semibold mt-0.5" style={{ color: C.limeDark }}>{profile.role}</div>
              </div>
              <Avatar initials={personByName(profile.name).initials} bg={personByName(profile.name).color} size={34} />
            </div>
          </div>
        </div>

        {}
        <div className="px-8 py-7 flex-1 overflow-auto">
          {activeNav === "Tableau de bord" && (
            <DashboardView tasks={tasks} notes={notes} setActiveNav={setActiveNav} />
          )}
          {activeNav === "Tâches" && <TachesView tasks={tasks} profile={profile} searchQuery={searchQuery} />}
          {activeNav === "Évolution" && <EvolutionView />}
          {activeNav === "Performance individuelle" && <PerformanceView setToast={setToast} />}
          {activeNav === "Difficultés & Améliorations" && <NotesView notes={notes} setNotes={setNotes} setToast={setToast} />}
          {activeNav === "Journal d'audit" && <AuditView />}
          {activeNav === "Calendrier" && (
            <CalendarView
              calMonth={calMonth}
              calYear={calYear}
              calGrid={calGrid}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              changeMonth={changeMonth}
              tasksByDate={tasksByDate}
              selectedTasks={selectedTasks}
            />
          )}
          {activeNav === "Équipe" && (
            <EquipeView
              team={team}
              removeMember={removeMember}
              showAddMember={showAddMember}
              setShowAddMember={setShowAddMember}
              newMember={newMember}
              setNewMember={setNewMember}
              addMember={addMember}
            />
          )}
          {activeNav === "Paramètres" && <ParametresView profile={profile} setProfile={setProfile} setToast={setToast} />}
        </div>
      </div>

      {}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: "#0F1E3D66" }}>
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl border" style={{ backgroundColor: C.white, borderColor: C.slateBorder }}>
            <div className="flex items-center justify-between mb-5 pb-3 border-b" style={{ borderColor: C.slateBorder }}>
              <h3 className="text-[17px] font-display font-bold flex items-center gap-2" style={{ color: C.ink }}>
                <Plus size={20} style={{ color: C.primary }} /> Créer une nouvelle tâche
              </h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="rounded-lg p-1" style={{ color: C.slate }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold mb-1" style={{ color: C.slate }}>Titre de la tâche</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Analyse des risques informatiques"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2 text-[13.5px] outline-none border"
                  style={{ borderColor: C.slateBorder }}
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold mb-1" style={{ color: C.slate }}>Contexte du projet</label>
                <input
                  type="text"
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2 text-[13.5px] outline-none border"
                  style={{ borderColor: C.slateBorder }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: C.slate }}>Assigné à</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-[13px] outline-none border"
                    style={{ borderColor: C.slateBorder }}
                  >
                    {PEOPLE.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: C.slate }}>Priorité</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-[13px] outline-none border"
                    style={{ borderColor: C.slateBorder }}
                  >
                    <option value="BASSE">Basse</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="HAUTE">Haute</option>
                    <option value="CRITIQUE">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold mb-1" style={{ color: C.slate }}>Date d'échéance</label>
                <input
                  type="text"
                  placeholder="JJ-MM-AAAA"
                  value={newTask.due}
                  onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2 text-[13.5px] outline-none border"
                  style={{ borderColor: C.slateBorder }}
                />
              </div>

              <div className="flex gap-3 pt-3 mt-2 border-t" style={{ borderColor: C.slateBorder }}>
                <button type="button" onClick={() => setIsAddTaskOpen(false)} className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold" style={{ borderColor: C.slateBorder, color: C.slate }}>
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ backgroundImage: `linear-gradient(120deg, ${C.primary}, ${C.primaryDark})` }}>
                  Ajouter la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: "#0F1E3D66" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl border" style={{ backgroundColor: C.white, borderColor: C.slateBorder }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-display font-bold flex items-center gap-2" style={{ color: C.ink }}>
                <Info size={19} style={{ color: C.primary }} /> Renseignements
              </h3>
              <button onClick={() => setShowHelp(false)} style={{ color: C.slate }}><X size={18} /></button>
            </div>
            <p className="text-[13px] mb-3" style={{ color: C.slate }}>
              Aaprovidir Agile & Delivery Hub — v2.1. Pour toute question, contactez l'équipe support.
            </p>
            <div className="rounded-xl p-3 text-[12.5px] space-y-1" style={{ backgroundColor: C.slateLight, color: C.ink }}>
              <div><span className="font-semibold">Support :</span> support@aaprovidir.com</div>
              <div><span className="font-semibold">Équipe :</span> Dipta, Flore, Dilane</div>
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full mt-4 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ backgroundImage: `linear-gradient(120deg, ${C.primary}, ${C.primaryDark})` }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {}
      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: "#0F1E3D66" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl border text-center" style={{ backgroundColor: C.white, borderColor: C.slateBorder }}>
            <div className="mx-auto mb-3 flex items-center justify-center rounded-full" style={{ width: 44, height: 44, backgroundColor: C.redLight }}>
              <LogOut size={20} style={{ color: C.red }} />
            </div>
            <h3 className="text-[15.5px] font-display font-bold mb-1" style={{ color: C.ink }}>Se déconnecter ?</h3>
            <p className="text-[12.5px] mb-5" style={{ color: C.slate }}>Vous devrez vous reconnecter pour accéder au tableau de bord.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmLogout(false)} className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold" style={{ borderColor: C.slateBorder, color: C.slate }}>
                Annuler
              </button>
              <button
                onClick={() => { setConfirmLogout(false); setLoggedOut(true); }}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                style={{ backgroundColor: C.red }}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardView({ tasks, notes, setActiveNav }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "TERMINEE").length;
  const late = tasks.filter((t) => t.status === "EN RETARD").length;
  const inProgress = tasks.filter((t) => t.status === "EN COURS").length;

  const last3 = DAILY_PROGRESS.slice(-3);
  const recentNotes = [...notes].reverse().slice(0, 3);

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-[26px] font-display font-extrabold tracking-tight mb-1" style={{ color: C.ink }}>Tableau de bord</h1>
        <p className="text-[13.5px]" style={{ color: C.slate }}>Vue d'ensemble de l'activité de l'équipe Dipta, Flore et Dilane.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-7">
        {[
          { label: "Tâches totales", value: total, icon: CheckSquare, tone: "primary" },
          { label: "En cours", value: inProgress, icon: Activity, tone: "primary" },
          { label: "Terminées", value: done, icon: CheckCircle, tone: "lime" },
          { label: "En retard", value: late, icon: AlertTriangle, tone: "red" },
        ].map((k) => {
          const Icon = k.icon;
          const toneColor = k.tone === "lime" ? C.lime : k.tone === "red" ? C.red : C.primary;
          const toneBg = k.tone === "lime" ? C.limeLight : k.tone === "red" ? C.redLight : C.primaryLight;
          return (
            <div key={k.label} className="rounded-2xl p-4 border flex items-center justify-between" style={{ borderColor: C.slateBorder, backgroundColor: C.slateLight }}>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.slate }}>{k.label}</div>
                <div className="text-[22px] font-display font-extrabold mt-0.5" style={{ color: C.ink }}>{k.value}</div>
              </div>
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: toneBg, color: toneColor }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div
          className="rounded-2xl p-5 border cursor-pointer transition-transform hover:-translate-y-0.5"
          style={{ borderColor: C.slateBorder }}
          onClick={() => setActiveNav("Évolution")}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14.5px] font-display font-bold flex items-center gap-2" style={{ color: C.ink }}>
              <TrendingUp size={17} style={{ color: C.primary }} /> Évolution des tâches
            </h3>
            <span className="text-[11.5px] font-semibold" style={{ color: C.primary }}>Voir tout →</span>
          </div>
          <p className="text-[12.5px] mb-3" style={{ color: C.slate }}>Tâches terminées, 3 derniers jours.</p>
          <div className="flex gap-3">
            {last3.map((d) => (
              <div key={d.day} className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: C.slateLight }}>
                <div className="text-[10.5px] font-semibold mb-1" style={{ color: C.slate }}>{d.day}</div>
                <div className="text-[17px] font-display font-extrabold" style={{ color: C.primary }}>{d.Dipta + d.Flore + d.Dilane}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl p-5 border cursor-pointer transition-transform hover:-translate-y-0.5"
          style={{ borderColor: C.slateBorder }}
          onClick={() => setActiveNav("Difficultés & Améliorations")}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14.5px] font-display font-bold flex items-center gap-2" style={{ color: C.ink }}>
              <Lightbulb size={17} style={{ color: C.lime }} /> Difficultés & Améliorations
            </h3>
            <span className="text-[11.5px] font-semibold" style={{ color: C.primary }}>Voir tout →</span>
          </div>
          <div className="space-y-2">
            {recentNotes.map((n) => (
              <div key={n.id} className="flex items-center gap-2 text-[12.5px]" style={{ color: C.ink }}>
                <span className="rounded-full shrink-0" style={{ width: 6, height: 6, backgroundColor: n.type === "difficulte" ? C.red : C.lime }} />
                <span className="font-semibold">{n.person}</span>
                <span className="truncate" style={{ color: C.slate }}>{n.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EvolutionView() {
  const [personFilter, setPersonFilter] = useState("Tous");
  const [range, setRange] = useState(7);

  const data = useMemo(() => DAILY_PROGRESS.slice(-range), [range]);

  const totals = useMemo(() => {
    const t = { Dipta: 0, Flore: 0, Dilane: 0 };
    data.forEach((d) => { t.Dipta += d.Dipta; t.Flore += d.Flore; t.Dilane += d.Dilane; });
    return t;
  }, [data]);

  const visiblePeople = personFilter === "Tous" ? PEOPLE.map((p) => p.name) : [personFilter];

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-display font-extrabold tracking-tight mb-1" style={{ color: C.ink }}>Évolution des tâches</h1>
          <p className="text-[13.5px]" style={{ color: C.slate }}>Progression journalière du travail accompli par membre de l'équipe.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex items-center rounded-xl p-1" style={{ backgroundColor: C.slateLight, border: `1px solid ${C.slateBorder}` }}>
          {["Tous", ...PEOPLE.map((p) => p.name)].map((name) => (
            <button
              key={name}
              onClick={() => setPersonFilter(name)}
              className="px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all"
              style={
                personFilter === name
                  ? { backgroundColor: C.primary, color: C.white }
                  : { color: C.slate }
              }
            >
              {name}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center rounded-xl p-1" style={{ backgroundColor: C.slateLight, border: `1px solid ${C.slateBorder}` }}>
          {[7, 14].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-4 py-1.5 rounded-lg text-[12.5px] font-bold transition-all"
              style={range === r ? { backgroundColor: C.lime, color: C.white } : { color: C.slate }}
            >
              {r} jours
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {PEOPLE.map((p) => (
          <div key={p.name} className="rounded-2xl p-4 border flex items-center gap-3" style={{ borderColor: C.slateBorder, backgroundColor: personFilter === "Tous" || personFilter === p.name ? C.slateLight : C.white, opacity: personFilter === "Tous" || personFilter === p.name ? 1 : 0.45 }}>
            <Avatar initials={p.initials} bg={p.color} size={38} />
            <div>
              <div className="text-[13.5px] font-bold" style={{ color: C.ink }}>{p.name}</div>
              <div className="text-[11.5px]" style={{ color: C.slate }}>{totals[p.name]} tâches sur {range} jours</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5 border" style={{ borderColor: C.slateBorder }}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.slateBorder} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.slate }} />
            <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: C.slateBorder, fontSize: 12.5 }} />
            <Legend wrapperStyle={{ fontSize: 12.5 }} />
            {visiblePeople.includes("Dipta") && <Line type="monotone" dataKey="Dipta" stroke={C.primary} strokeWidth={2.5} dot={{ r: 3 }} />}
            {visiblePeople.includes("Flore") && <Line type="monotone" dataKey="Flore" stroke={C.lime} strokeWidth={2.5} dot={{ r: 3 }} />}
            {visiblePeople.includes("Dilane") && <Line type="monotone" dataKey="Dilane" stroke={C.ink} strokeWidth={2.5} dot={{ r: 3 }} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ArcGauge({ pct, size = 200 }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const r = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2 - 6;
  const circumference = Math.PI * r; // demi-cercle
  const offset = circumference * (1 - clamped / 100);
  const gaugeId = "perfGaugeGradient";
  return (
    <svg width={size} height={size / 2 + 26} viewBox={`0 0 ${size} ${size / 2 + 26}`}>
      <defs>
        <linearGradient id={gaugeId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={C.primary} />
          <stop offset="100%" stopColor={C.lime} />
        </linearGradient>
      </defs>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={C.slateBorder}
        strokeWidth={14}
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={`url(#${gaugeId})`}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" className="font-display font-extrabold" style={{ fontSize: size * 0.15, fill: C.ink }}>
        {Math.round(clamped)}%
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="font-body font-semibold" style={{ fontSize: 11, fill: C.slate }}>
        tâches terminées
      </text>
    </svg>
  );
}

function EditableField({ value, onSave, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  if (editing) {
    return (
      <div className="flex items-start gap-2">
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          className="flex-1 rounded-lg border px-2.5 py-1.5 text-[12.5px] outline-none resize-none"
          style={{ borderColor: C.primary, color: C.ink }}
        />
        <button
          onClick={() => { onSave(draft); setEditing(false); }}
          className="p-1.5 rounded-lg text-white shrink-0"
          style={{ backgroundColor: C.primary }}
        >
          <Check size={14} />
        </button>
      </div>
    );
  }
  return (
    <div className="group flex items-start justify-between gap-2 cursor-pointer" onClick={() => setEditing(true)}>
      <p className="text-[12.5px]" style={{ color: value ? C.ink : C.slate }}>{value || placeholder}</p>
      <Edit3 size={13} className="opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 transition-opacity" style={{ color: C.slate }} />
    </div>
  );
}

function PerformanceView({ setToast }) {
  const [person, setPerson] = useState("Dipta");
  const [weekIdx, setWeekIdx] = useState(1); // index dans PERF_WEEKS — 1 = semaine courante
  const [showPicker, setShowPicker] = useState(false);
  const [retroDrafts, setRetroDrafts] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [extraComments, setExtraComments] = useState({});

  const week = PERF_WEEKS[weekIdx];
  const data = PERFORMANCE[person][week.id];
  const prevWeek = PERFORMANCE[person][week.id === 0 ? 1 : 0];

  const pct = Math.round((data.tasksDone / data.tasksTotal) * 100);
  const prevPct = Math.round((prevWeek.tasksDone / prevWeek.tasksTotal) * 100);
  const pctDelta = pct - prevPct;

  const timeWorked = data.daily.reduce((s, d) => s + d.h, 0);
  const prevTimeWorked = prevWeek.daily.reduce((s, d) => s + d.h, 0);
  const timeDelta = timeWorked - prevTimeWorked;
  const objectivePct = Math.round((timeWorked / data.objectiveHours) * 100);

  const doneDelta = data.tasksDone - prevWeek.tasksDone;

  const streak = data.daily.filter((d) => d.h > 0).length;

  const breakdown = [
    { label: "Terminées", value: data.tasksDone, color: C.lime },
    { label: "En cours", value: data.tasksProgress, color: C.primary },
    { label: "En retard", value: data.tasksLate, color: C.red },
  ].filter((b) => b.value > 0);
  const breakdownTotal = breakdown.reduce((s, b) => s + b.value, 0) || 1;

  const teamComparison = PEOPLE.map((p) => {
    const d = PERFORMANCE[p.name][week.id];
    return { name: p.name, pct: Math.round((d.tasksDone / d.tasksTotal) * 100), color: p.color };
  });

  const insight = useMemo(() => {
    if (objectivePct >= 115) return { text: `Temps travaillé ${objectivePct - 100}% au-dessus de l'objectif — risque de surcharge cette semaine.`, tone: "red", icon: AlertTriangle };
    if (objectivePct < 80) return { text: `Temps travaillé ${100 - objectivePct}% en dessous de l'objectif — marge disponible cette semaine.`, tone: "primary", icon: Info };
    if (pctDelta >= 15) return { text: `Progression de ${pctDelta} points sur le taux de complétion par rapport à la semaine précédente.`, tone: "lime", icon: TrendingUp };
    if (pctDelta <= -15) return { text: `Baisse de ${Math.abs(pctDelta)} points sur le taux de complétion, à surveiller.`, tone: "red", icon: TrendingDown };
    return { text: `Rythme stable, cohérent avec la semaine précédente.`, tone: "primary", icon: Activity };
  }, [objectivePct, pctDelta]);

  const insightColor = insight.tone === "red" ? C.red : insight.tone === "lime" ? C.limeDark : C.primary;
  const insightBg = insight.tone === "red" ? C.redLight : insight.tone === "lime" ? C.limeLight : C.primaryLight;

  const key = `${person}-${week.id}`;
  const currentComments = [...data.comments, ...(extraComments[key] || [])];

  const submitComment = (e) => {
    e.preventDefault();
    const text = (commentDrafts[key] || "").trim();
    if (!text) return;
    setExtraComments((prev) => ({ ...prev, [key]: [...(prev[key] || []), { id: `x_${Date.now()}`, author: "Vous", text, time: "à l'instant" }] }));
    setCommentDrafts((prev) => ({ ...prev, [key]: "" }));
    setToast("Commentaire ajouté");
  };

  const p = personByName(person);

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-display font-extrabold tracking-tight mb-1" style={{ color: C.ink }}>Performance individuelle</h1>
          <p className="text-[13.5px]" style={{ color: C.slate }}>Temps de travail, complétion des tâches et objectifs pour un membre sélectionné.</p>
        </div>
      </div>

      {}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <button
            onClick={() => setShowPicker((s) => !s)}
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 border text-[13px] font-semibold"
            style={{ borderColor: C.slateBorder, color: C.ink }}
          >
            <Avatar initials={p.initials} bg={p.color} size={22} />
            {person}
            <ChevronDown size={14} style={{ color: C.slate }} />
          </button>
          {showPicker && (
            <div className="absolute left-0 top-11 w-44 rounded-xl border shadow-lg z-30 overflow-hidden" style={{ backgroundColor: C.white, borderColor: C.slateBorder }}>
              {PEOPLE.map((m) => (
                <div
                  key={m.name}
                  onClick={() => { setPerson(m.name); setShowPicker(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 text-[13px] cursor-pointer"
                  style={{ color: C.ink, backgroundColor: person === m.name ? C.primaryLight : "transparent" }}
                >
                  <Avatar initials={m.initials} bg={m.color} size={20} /> {m.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border px-1 py-1" style={{ borderColor: C.slateBorder }}>
          <button
            onClick={() => setWeekIdx((i) => Math.max(0, i - 1))}
            disabled={weekIdx === 0}
            className="p-1.5 rounded-lg disabled:opacity-30"
            style={{ color: C.slate }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[12.5px] font-semibold px-2" style={{ color: C.ink }}>{week.label}</span>
          <button
            onClick={() => setWeekIdx((i) => Math.min(PERF_WEEKS.length - 1, i + 1))}
            disabled={weekIdx === PERF_WEEKS.length - 1}
            className="p-1.5 rounded-lg disabled:opacity-30"
            style={{ color: C.slate }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {}
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-6" style={{ backgroundColor: insightBg }}>
        <insight.icon size={18} style={{ color: insightColor }} />
        <span className="text-[13px] font-semibold" style={{ color: insightColor }}>{insight.text}</span>
      </div>

      {}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: "Tâches totales", value: data.tasksTotal },
          { label: "Tâches terminées", value: data.tasksDone, delta: doneDelta },
          { label: "% tâches faites", value: `${pct}%`, delta: pctDelta, isPct: true },
          { label: "Temps travaillé", value: `${timeWorked.toFixed(1)}h`, delta: timeDelta, unit: "h" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl p-4 border" style={{ borderColor: C.slateBorder, backgroundColor: C.slateLight }}>
            <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ color: C.slate }}>{k.label}</div>
            <div className="flex items-end gap-2">
              <span className="text-[21px] font-display font-extrabold" style={{ color: C.ink }}>{k.value}</span>
              {typeof k.delta === "number" && k.delta !== 0 && (
                <span className="flex items-center gap-0.5 text-[11px] font-bold pb-1" style={{ color: k.delta > 0 ? C.limeDark : C.red }}>
                  {k.delta > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                  {Math.abs(k.delta).toFixed(k.unit === "h" ? 1 : 0)}{k.isPct ? " pts" : k.unit || ""}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl p-4 border" style={{ borderColor: C.slateBorder, backgroundColor: C.slateLight }}>
          <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ color: C.slate }}>Objectif hebdomadaire</div>
          <div className="text-[21px] font-display font-extrabold" style={{ color: C.ink }}>{data.objectiveHours}h</div>
        </div>
        <div className="rounded-2xl p-4 border flex items-center justify-between" style={{ borderColor: C.slateBorder, backgroundColor: C.slateLight }}>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ color: C.slate }}>Complétion objectif</div>
            <div className="text-[21px] font-display font-extrabold" style={{ color: objectivePct > 110 ? C.red : C.limeDark }}>{objectivePct}%</div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: C.limeDark, backgroundColor: C.limeLight }}>
            <Flame size={12} /> {streak}/7 jours actifs
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        {}
        <div className="rounded-2xl p-5 border" style={{ borderColor: C.slateBorder }}>
          <h3 className="text-[14px] font-display font-bold mb-4 flex items-center gap-2" style={{ color: C.ink }}>
            <Activity size={16} style={{ color: C.primary }} /> Temps de travail journalier
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.daily} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.slateBorder} />
              <XAxis dataKey="d" tick={{ fontSize: 10.5, fill: C.slate }} />
              <YAxis tick={{ fontSize: 10.5, fill: C.slate }} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: C.slateBorder, fontSize: 12 }} formatter={(v) => [`${v}h`, "Travaillé"]} />
              <Line
                type="monotone"
                dataKey="h"
                stroke={C.primary}
                strokeWidth={2.5}
                dot={(props) => {
                  const under = props.payload.h < data.dailyTarget * 0.6;
                  return <circle key={props.payload.d} cx={props.cx} cy={props.cy} r={4.5} fill={under ? C.red : C.lime} stroke={C.white} strokeWidth={1.5} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[11px]" style={{ color: C.slate }}>
            <span className="flex items-center gap-1"><span className="rounded-full" style={{ width: 7, height: 7, backgroundColor: C.lime }} /> Dans la cible</span>
            <span className="flex items-center gap-1"><span className="rounded-full" style={{ width: 7, height: 7, backgroundColor: C.red }} /> En dessous de 60% de la cible</span>
          </div>
        </div>

        {}
        <div className="rounded-2xl p-5 border flex flex-col items-center" style={{ borderColor: C.slateBorder }}>
          <h3 className="text-[14px] font-display font-bold mb-1 self-start flex items-center gap-2" style={{ color: C.ink }}>
            <Gauge size={16} style={{ color: C.primary }} /> Taux de complétion
          </h3>
          <ArcGauge pct={pct} size={190} />
          <div className="w-full mt-2 space-y-1.5">
            {breakdown.map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="rounded-full shrink-0" style={{ width: 8, height: 8, backgroundColor: b.color }} />
                <span className="text-[12px] flex-1" style={{ color: C.ink }}>{b.label}</span>
                <span className="text-[12px] font-semibold" style={{ color: C.slate }}>{b.value}</span>
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.slateBorder }}>
                  <div style={{ width: `${(b.value / breakdownTotal) * 100}%`, backgroundColor: b.color, height: "100%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      <div className="rounded-2xl p-5 border mb-6" style={{ borderColor: C.slateBorder }}>
        <h3 className="text-[14px] font-display font-bold mb-4 flex items-center gap-2" style={{ color: C.ink }}>
          <BarChart3 size={16} style={{ color: C.primary }} /> Comparaison d'équipe — taux de complétion
        </h3>
        <div className="space-y-3">
          {teamComparison.map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <span className="text-[12.5px] font-semibold w-16 shrink-0" style={{ color: t.name === person ? C.ink : C.slate }}>{t.name}</span>
              <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: C.slateLight }}>
                <div style={{ width: `${t.pct}%`, backgroundColor: t.color, height: "100%", borderRadius: 999, transition: "width 0.5s ease" }} />
              </div>
              <span className="text-[12px] font-bold w-10 text-right" style={{ color: C.ink }}>{t.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="rounded-2xl p-5 border mb-6" style={{ borderColor: C.slateBorder }}>
        <h3 className="text-[14px] font-display font-bold mb-4" style={{ color: C.ink }}>Feuille de temps de la semaine</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: C.slateBorder }}>
              {["JOUR", "DATE", "PROJET", "TÂCHE", "NORMALES", "SUP.", "TOTAL"].map((h) => (
                <th key={h} className="text-left px-2 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: C.slate }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.timeLog.map((r) => (
              <tr key={r.date} className="border-b last:border-none" style={{ borderColor: C.slateBorder }}>
                <td className="px-2 py-2 text-[12.5px] font-medium" style={{ color: C.ink }}>{r.day}</td>
                <td className="px-2 py-2 text-[12px]" style={{ color: C.slate }}>{r.date}</td>
                <td className="px-2 py-2 text-[12.5px]" style={{ color: C.ink }}>{r.project}</td>
                <td className="px-2 py-2 text-[12.5px]" style={{ color: C.slate }}>{r.task}</td>
                <td className="px-2 py-2 text-[12.5px]" style={{ color: C.ink }}>{r.normal}</td>
                <td className="px-2 py-2 text-[12.5px]" style={{ color: r.sup > 0 ? C.red : C.slate }}>{r.sup}</td>
                <td className="px-2 py-2 text-[12.5px] font-semibold" style={{ color: C.ink }}>{(r.normal + r.sup).toFixed(1)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={4} className="px-2 py-2.5 text-[12.5px] font-bold text-right" style={{ color: C.ink }}>Total</td>
              <td className="px-2 py-2.5 text-[12.5px] font-bold" style={{ color: C.ink }}>{data.timeLog.reduce((s, r) => s + r.normal, 0).toFixed(1)}</td>
              <td className="px-2 py-2.5 text-[12.5px] font-bold" style={{ color: C.ink }}>{data.timeLog.reduce((s, r) => s + r.sup, 0).toFixed(1)}</td>
              <td className="px-2 py-2.5 text-[12.5px] font-bold" style={{ color: C.primary }}>{data.timeLog.reduce((s, r) => s + r.normal + r.sup, 0).toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {}
      <div className="rounded-2xl p-5 border mb-6" style={{ borderColor: C.slateBorder }}>
        <h3 className="text-[14px] font-display font-bold mb-4" style={{ color: C.ink }}>Rétrospective de la semaine</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {[
            { k: "difficultes", label: "Difficultés majeures rencontrées" },
            { k: "observations", label: "Observations" },
            { k: "solutions", label: "Solutions proposées" },
            { k: "bilan", label: "Bilan personnel de fin de semaine" },
          ].map((f) => {
            const draftKey = `${key}-${f.k}`;
            const val = retroDrafts[draftKey] !== undefined ? retroDrafts[draftKey] : data.retro[f.k];
            return (
              <div key={f.k}>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: C.slate }}>{f.label}</div>
                <EditableField
                  value={val}
                  placeholder="Cliquer pour renseigner..."
                  onSave={(v) => { setRetroDrafts((p) => ({ ...p, [draftKey]: v })); setToast("Rétrospective mise à jour"); }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {}
      <div className="rounded-2xl p-5 border" style={{ borderColor: C.slateBorder }}>
        <h3 className="text-[14px] font-display font-bold mb-4" style={{ color: C.ink }}>Commentaires</h3>
        <div className="space-y-3 mb-4">
          {currentComments.length === 0 && <p className="text-[12.5px] italic" style={{ color: C.slate }}>Aucun commentaire pour cette semaine.</p>}
          {currentComments.map((c) => {
            const cp = personByName(c.author);
            return (
              <div key={c.id} className="flex items-start gap-2.5">
                <Avatar initials={c.author === "Vous" ? "V" : cp.initials} bg={c.author === "Vous" ? C.slate : cp.color} size={26} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-bold" style={{ color: C.ink }}>{c.author}</span>
                    <span className="text-[11px]" style={{ color: C.slate }}>{c.time}</span>
                  </div>
                  <p className="text-[12.5px]" style={{ color: C.ink }}>{c.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={submitComment} className="flex items-center gap-2">
          <input
            value={commentDrafts[key] || ""}
            onChange={(e) => setCommentDrafts((p) => ({ ...p, [key]: e.target.value }))}
            placeholder="Ajouter un commentaire pour cette semaine..."
            className="flex-1 rounded-xl border px-3.5 py-2 text-[12.5px] outline-none"
            style={{ borderColor: C.slateBorder }}
          />
          <button type="submit" className="p-2.5 rounded-xl text-white shrink-0" style={{ backgroundColor: C.primary }}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

function NotesView({ notes, setNotes, setToast }) {
  const [personFilter, setPersonFilter] = useState("Tous");
  const [period, setPeriod] = useState("jour");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ person: "Dipta", type: "difficulte", text: "" });

  const filtered = useMemo(() => {
    return notes.filter((n) => personFilter === "Tous" || n.person === personFilter);
  }, [notes, personFilter]);

  const groupedByMonth = useMemo(() => {
    const map = {};
    filtered.forEach((n) => {
      if (!map[n.month]) map[n.month] = [];
      map[n.month].push(n);
    });
    return map;
  }, [filtered]);

  const groupedByDay = useMemo(() => {
    const map = {};
    filtered.forEach((n) => {
      if (!map[n.date]) map[n.date] = [];
      map[n.date].push(n);
    });
    return map;
  }, [filtered]);

  const grouped = period === "jour" ? groupedByDay : groupedByMonth;
  const groupKeys = Object.keys(grouped).sort().reverse();

  const submit = (e) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    const today = "15-08-2026";
    setNotes((prev) => [...prev, { id: `n_${Date.now()}`, person: form.person, type: form.type, date: today, month: "Août 2026", text: form.text }]);
    setForm({ person: "Dipta", type: "difficulte", text: "" });
    setShowForm(false);
    setToast(form.type === "difficulte" ? "Difficulté enregistrée" : "Amélioration enregistrée");
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-display font-extrabold tracking-tight mb-1" style={{ color: C.ink }}>Difficultés & Améliorations</h1>
          <p className="text-[13.5px]" style={{ color: C.slate }}>Suivi des obstacles rencontrés et des progrès réalisés, par jour ou par mois.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white"
          style={{ backgroundImage: `linear-gradient(120deg, ${C.primary}, ${C.primaryDark})` }}
        >
          <Plus size={16} /> Ajouter une entrée
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="rounded-2xl p-5 mb-5 border grid grid-cols-4 gap-3 items-end" style={{ borderColor: C.slateBorder, backgroundColor: C.slateLight }}>
          <div>
            <label className="block text-[11.5px] font-semibold mb-1" style={{ color: C.slate }}>Personne</label>
            <select value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} className="w-full rounded-xl px-3 py-2 text-[13px] border outline-none" style={{ borderColor: C.slateBorder }}>
              {PEOPLE.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold mb-1" style={{ color: C.slate }}>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-xl px-3 py-2 text-[13px] border outline-none" style={{ borderColor: C.slateBorder }}>
              <option value="difficulte">Difficulté</option>
              <option value="amelioration">Amélioration</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[11.5px] font-semibold mb-1" style={{ color: C.slate }}>Description</label>
            <input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Décrire brièvement..." className="w-full rounded-xl px-3 py-2 text-[13px] border outline-none" style={{ borderColor: C.slateBorder }} />
          </div>
          <div className="col-span-4 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-[12.5px] font-semibold border" style={{ borderColor: C.slateBorder, color: C.slate }}>Annuler</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white" style={{ backgroundColor: C.primary }}>Enregistrer</button>
          </div>
        </form>
      )}

      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex items-center rounded-xl p-1" style={{ backgroundColor: C.slateLight, border: `1px solid ${C.slateBorder}` }}>
          {["Tous", ...PEOPLE.map((p) => p.name)].map((name) => (
            <button key={name} onClick={() => setPersonFilter(name)} className="px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all" style={personFilter === name ? { backgroundColor: C.primary, color: C.white } : { color: C.slate }}>
              {name}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center rounded-xl p-1" style={{ backgroundColor: C.slateLight, border: `1px solid ${C.slateBorder}` }}>
          {[{ k: "jour", label: "Par jour" }, { k: "mois", label: "Par mois" }].map((o) => (
            <button key={o.k} onClick={() => setPeriod(o.k)} className="px-4 py-1.5 rounded-lg text-[12.5px] font-bold transition-all" style={period === o.k ? { backgroundColor: C.lime, color: C.white } : { color: C.slate }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {groupKeys.length === 0 && (
          <div className="text-[13px] italic py-8 text-center" style={{ color: C.slate }}>Aucune entrée pour ce filtre.</div>
        )}
        {groupKeys.map((key) => (
          <div key={key} className="rounded-2xl p-5 border" style={{ borderColor: C.slateBorder }}>
            <div className="text-[12.5px] font-bold mb-3" style={{ color: C.primary }}>{key}</div>
            <div className="grid grid-cols-2 gap-3">
              {grouped[key].map((n) => {
                const p = personByName(n.person);
                const isDiff = n.type === "difficulte";
                return (
                  <div
                    key={n.id}
                    className="rounded-xl p-3 border-l-4"
                    style={{ backgroundColor: C.slateLight, borderLeftColor: isDiff ? C.red : C.lime }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar initials={p.initials} bg={p.color} size={20} />
                      <span className="text-[12px] font-bold" style={{ color: C.ink }}>{p.name}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-auto flex items-center gap-1"
                        style={{ color: isDiff ? C.red : C.limeDark, backgroundColor: isDiff ? C.redLight : C.limeLight }}
                      >
                        {isDiff ? <AlertTriangle size={10} /> : <Lightbulb size={10} />}
                        {isDiff ? "Difficulté" : "Amélioration"}
                      </span>
                    </div>
                    <p className="text-[12.5px]" style={{ color: C.slate }}>{n.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditView() {
  const [activeFilter, setActiveFilter] = useState("TOUS");

  const filteredLogs = useMemo(() => {
    if (activeFilter === "TOUS") return ENHANCED_AUDIT_LOG;
    return ENHANCED_AUDIT_LOG.filter((log) => log.type === activeFilter.toLowerCase());
  }, [activeFilter]);

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[26px] font-display font-extrabold tracking-tight" style={{ color: C.ink }}>Journal d'audit Agile</h1>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide" style={{ backgroundColor: C.primaryLight, color: C.primary }}>
              Sprint 24 En cours
            </span>
          </div>
          <p className="text-[13.5px]" style={{ color: C.slate }}>Flux d'événements en temps réel et traçabilité pour l'équipe.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold border" style={{ color: C.ink, borderColor: C.slateBorder }}>
          <Filter size={14} style={{ color: C.primary }} /> Exporter le rapport (.CSV)
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Mouvements Sprint", value: "18 Tâches", icon: Activity, tone: "primary" },
          { label: "Bloqueurs Actifs", value: "1 Critique", icon: AlertCircle, tone: "red" },
          { label: "Stories Validées", value: "12 / 15", icon: CheckCircle, tone: "lime" },
          { label: "Vélocité Moyenne", value: "42 pts", icon: Clock, tone: "primary" },
        ].map((k) => {
          const Icon = k.icon;
          const toneColor = k.tone === "lime" ? C.lime : k.tone === "red" ? C.red : C.primary;
          const toneBg = k.tone === "lime" ? C.limeLight : k.tone === "red" ? C.redLight : C.primaryLight;
          return (
            <div key={k.label} className="rounded-2xl p-4 border flex items-center justify-between" style={{ borderColor: C.slateBorder, backgroundColor: C.slateLight }}>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.slate }}>{k.label}</div>
                <div className="text-[20px] font-display font-extrabold mt-0.5" style={{ color: C.ink }}>{k.value}</div>
              </div>
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: toneBg, color: toneColor }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mb-6 border-b pb-3" style={{ borderColor: C.slateBorder }}>
        {[
          { label: "TOUS", name: "Tous les flux" },
          { label: "STATUS", name: "Changements d'état" },
          { label: "BLOCKER", name: "Bloqueurs & Risques" },
          { label: "SPRINT", name: "Ajustements Sprint" },
          { label: "CODE", name: "Commits & Code" },
        ].map((f) => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(f.label)}
            className="px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold transition-all"
            style={activeFilter === f.label ? { backgroundColor: C.primary, color: C.white } : { color: C.slate }}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-6 border" style={{ borderColor: C.slateBorder }}>
        <div className="relative space-y-6" style={{ position: "relative" }}>
          <div className="absolute" style={{ top: 0, bottom: 0, left: 19, width: 2, backgroundColor: C.slateBorder }} />
          {filteredLogs.map((entry) => {
            const Icon = entry.icon;
            const p = personByName(entry.user);
            return (
              <div key={entry.id} className="relative flex items-start gap-4">
                <div className="flex items-center justify-center rounded-full shrink-0 z-10 shadow-sm border-2" style={{ width: 40, height: 40, backgroundColor: C.primaryLight, borderColor: C.white }}>
                  <Icon size={18} style={{ color: C.primary }} strokeWidth={2.2} />
                </div>
                <div className="flex-1 rounded-2xl p-4 border" style={{ backgroundColor: C.slateLight, borderColor: C.slateBorder }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={p.initials} bg={p.color} size={26} />
                      <span className="text-[13.5px] font-bold" style={{ color: C.ink }}>{entry.user}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: C.slateBorder, color: C.slate }}>{entry.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: C.primaryLight, color: C.primary }}>{entry.sprint}</span>
                      <span className="text-[11.5px] font-medium" style={{ color: C.slate }}>{entry.date} à {entry.time}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wide mr-2" style={{ color: C.primary }}>[{entry.action}]</span>
                    <span className="text-[13.5px] font-medium" style={{ color: C.ink }}>{entry.detail}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TachesView({ tasks, profile, searchQuery }) {
  const [tab, setTab] = useState("toutes");

  const filtered = useMemo(() => {
    let list = tasks;
    if (tab === "moi") list = list.filter((t) => t.assignee === profile.name);
    if (tab === "retard") list = list.filter((t) => t.status === "EN RETARD" || t.dueRed);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q) || t.project.toLowerCase().includes(q));
    }
    return list;
  }, [tasks, tab, profile.name, searchQuery]);

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-display font-extrabold tracking-tight mb-1" style={{ color: C.ink }}>Répertoire des tâches</h1>
          <p className="text-[13.5px]" style={{ color: C.slate }}>Gérez et suivez les tâches de conformité d'audit d'entreprise.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold border" style={{ color: C.ink, borderColor: C.slateBorder }}>
          <SlidersHorizontal size={14} /> Filtrer
        </button>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex items-center rounded-xl p-1" style={{ backgroundColor: C.slateLight, border: `1px solid ${C.slateBorder}` }}>
          {[
            { k: "toutes", label: "Toutes les tâches" },
            { k: "moi", label: `Assignées à ${profile.name}` },
            { k: "retard", label: "En retard" },
          ].map((o) => (
            <button key={o.k} onClick={() => setTab(o.k)} className="px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all" style={tab === o.k ? { backgroundColor: C.primary, color: C.white } : { color: C.slate }}>
              {o.label}
            </button>
          ))}
        </div>
        <span className="text-[12px] font-semibold" style={{ color: C.slate }}>{filtered.length} tâche(s)</span>
      </div>

      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: C.slateBorder }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b" style={{ backgroundColor: C.slateLight, borderColor: C.slateBorder }}>
              {["TITRE DE LA TÂCHE", "STATUT", "PRIORITÉ", "ASSIGNÉ", "DATE D'ÉCHÉANCE", "CONTEXTE DU PROJET"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-[10.5px] font-bold tracking-wider uppercase" style={{ color: C.slate }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-[13px] italic" style={{ color: C.slate }}>Aucune tâche ne correspond à ce filtre.</td></tr>
            )}
            {filtered.map((t) => {
              const Icon = t.icon || FileText;
              const s = STATUS_STYLE[t.status] || STATUS_STYLE.BACKLOG;
              const p = personByName(t.assignee);
              return (
                <tr key={t.id} className="border-b last:border-none transition-colors" style={{ borderColor: C.slateBorder }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Icon size={18} style={{ color: C.primary }} strokeWidth={2} />
                      <span className="text-[13.5px] font-semibold" style={{ color: C.ink }}>{t.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide" style={{ color: s.color, backgroundColor: s.bg }}>{t.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full" style={{ width: 7, height: 7, backgroundColor: PRIORITY_STYLE[t.priority] }} />
                      <span className="text-[12.5px] font-semibold" style={{ color: C.slate }}>{t.priority}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar initials={p.initials} bg={p.color} />
                      <span className="text-[13px] font-medium" style={{ color: C.ink }}>{t.assignee}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] font-semibold" style={{ color: t.dueRed ? C.red : C.primary }}>{t.due}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] italic" style={{ color: C.slate }}>{t.project}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function CalendarView({ calMonth, calYear, calGrid, selectedDay, setSelectedDay, changeMonth, tasksByDate, selectedTasks }) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-[26px] font-display font-extrabold tracking-tight mb-1" style={{ color: C.ink }}>Calendrier des échéances</h1>
      </div>

      <div className="flex gap-6 items-start">
        <div className="rounded-2xl p-5 flex-1 border" style={{ borderColor: C.slateBorder }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-[16px] font-display font-bold" style={{ color: C.ink }}>{MONTH_NAMES[calMonth]} {calYear}</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg border" style={{ borderColor: C.slateBorder, color: C.slate }}><ChevronLeft size={16} /></button>
              <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg border" style={{ borderColor: C.slateBorder, color: C.slate }}><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((w) => <div key={w} className="text-center text-[11px] font-bold uppercase py-1" style={{ color: C.slate }}>{w}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calGrid.map((d, i) => {
              if (d === null) return <div key={`e${i}`} />;
              const key = `${calYear}-${calMonth + 1}-${d}`;
              const dayTasks = tasksByDate[key] || [];
              const isSelected = selectedDay === d;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className="flex flex-col items-center justify-center rounded-xl py-3 transition-all"
                  style={
                    isSelected
                      ? { backgroundColor: C.primary, color: C.white, fontWeight: 700 }
                      : dayTasks.length
                      ? { backgroundColor: C.primaryLight, color: C.primary, fontWeight: 700 }
                      : { color: C.ink }
                  }
                >
                  <span className="text-[13px]">{d}</span>
                  {dayTasks.length > 0 && <span className="rounded-full mt-1" style={{ width: 5, height: 5, backgroundColor: isSelected ? C.lime : C.primary }} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-5 shrink-0 border" style={{ width: 300, borderColor: C.slateBorder }}>
          <h3 className="text-[14px] font-display font-bold mb-1" style={{ color: C.ink }}>{selectedDay ? `${selectedDay} ${MONTH_NAMES[calMonth]} ${calYear}` : "Sélectionnez une date"}</h3>
          <p className="text-[12px] mb-4" style={{ color: C.slate }}>{selectedTasks.length} tâche(s)</p>
          {selectedTasks.length === 0 && <div className="text-[13px] italic py-6 text-center" style={{ color: C.slate }}>Aucune tâche ce jour-là.</div>}
          <div className="space-y-2">
            {selectedTasks.map((t) => (
              <div key={t.id} className="rounded-xl p-3 border" style={{ backgroundColor: C.primaryLight, borderColor: C.slateBorder }}>
                <div className="text-[12.5px] font-bold mb-1" style={{ color: C.primary }}>{t.title}</div>
                <div className="text-[11px]" style={{ color: C.slate }}>Assigné : {t.assignee}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function EquipeView({ team, removeMember, showAddMember, setShowAddMember, newMember, setNewMember, addMember }) {
  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-display font-extrabold tracking-tight mb-1" style={{ color: C.ink }}>Équipe Agile</h1>
          <p className="text-[13.5px]" style={{ color: C.slate }}>Dipta, Flore et Dilane — équipe de livraison.</p>
        </div>
        <button onClick={() => setShowAddMember(true)} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white" style={{ backgroundColor: C.primary }}>
          <UserPlus size={16} /> Ajouter un membre
        </button>
      </div>

      {showAddMember && (
        <div className="rounded-2xl p-5 mb-5 border" style={{ borderColor: C.slateBorder, backgroundColor: C.slateLight }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-bold" style={{ color: C.ink }}>Ajouter un membre</span>
            <button onClick={() => setShowAddMember(false)} style={{ color: C.slate }}><X size={16} /></button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <input className="rounded-xl px-3 py-2 text-[13px] border outline-none" style={{ borderColor: C.slateBorder }} placeholder="Nom complet" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
            <input className="rounded-xl px-3 py-2 text-[13px] border outline-none" style={{ borderColor: C.slateBorder }} placeholder="Rôle" value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} />
            <input className="rounded-xl px-3 py-2 text-[13px] border outline-none" style={{ borderColor: C.slateBorder }} placeholder="Email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
          </div>
          <button onClick={addMember} className="px-4 py-2 rounded-xl text-[13px] font-bold text-white" style={{ backgroundColor: C.primary }}>Valider</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {team.map((m) => (
          <div key={m.id} className="rounded-2xl p-4 border flex items-center justify-between" style={{ borderColor: C.slateBorder }}>
            <div className="flex items-center gap-3">
              <Avatar initials={m.initials} bg={m.color} size={40} />
              <div>
                <div className="text-[14px] font-bold" style={{ color: C.ink }}>{m.name}</div>
                <div className="text-[12px] font-medium" style={{ color: C.primary }}>{m.role}</div>
                <div className="text-[11px]" style={{ color: C.slate }}>{m.email}</div>
              </div>
            </div>
            <button onClick={() => removeMember(m.id)} className="p-2" style={{ color: C.slate }} onMouseEnter={(e) => (e.currentTarget.style.color = C.red)} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function ParametresView({ profile, setProfile, setToast }) {
  const save = (e) => {
    e.preventDefault();
    setToast("Profil mis à jour");
  };
  return (
    <div className="max-w-2xl">
      <h1 className="text-[26px] font-display font-extrabold tracking-tight mb-1" style={{ color: C.ink }}>Paramètres du profil</h1>
      <p className="text-[13.5px] mb-6" style={{ color: C.slate }}>Modifiez vos informations personnelles.</p>

      <form onSubmit={save} className="rounded-2xl p-6 border space-y-4" style={{ borderColor: C.slateBorder }}>
        <div>
          <label className="block text-[12px] font-bold mb-1" style={{ color: C.slate }}>Nom complet</label>
          <select
            className="w-full rounded-xl border px-3.5 py-2 text-[13.5px] outline-none"
            style={{ borderColor: C.slateBorder }}
            value={profile.name}
            onChange={(e) => {
              const p = personByName(e.target.value);
              setProfile({ ...profile, name: p.name, email: p.email, role: p.role });
            }}
          >
            {PEOPLE.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-bold mb-1" style={{ color: C.slate }}>Adresse Email</label>
          <input type="email" className="w-full rounded-xl border px-3.5 py-2 text-[13.5px] outline-none" style={{ borderColor: C.slateBorder }} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        </div>
        <div>
          <label className="block text-[12px] font-bold mb-1" style={{ color: C.slate }}>Rôle</label>
          <input type="text" className="w-full rounded-xl border px-3.5 py-2 text-[13.5px] outline-none" style={{ borderColor: C.slateBorder }} value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
        </div>
        <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white" style={{ backgroundImage: `linear-gradient(120deg, ${C.primary}, ${C.primaryDark})` }}>
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}