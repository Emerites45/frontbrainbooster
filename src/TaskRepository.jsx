import React, { useState, useMemo } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  LayoutGrid,
  FolderKanban,
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
  ShieldAlert,
  AlertTriangle,
  FileEdit,
  CheckCircle2,
  Trash2,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  Activity,
  GitCommit,
  GitPullRequest,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Clock,
  Filter,
} from "lucide-react";

/* ---------------------------------- DATA ---------------------------------- */

const NAV = [
  { label: "Tableau de bord", icon: LayoutGrid },
  { label: "Projets", icon: FolderKanban },
  { label: "Tâches", icon: CheckSquare },
  { label: "Calendrier", icon: CalendarIcon },
  { label: "Journal d'audit", icon: ScrollText },
  { label: "Équipe", icon: Users },
  { label: "Paramètres", icon: SettingsIcon },
];

const INITIAL_TASKS = [
  {
    id: "t1",
    icon: FileText,
    iconColor: "#0066CC",
    title: "Préparation de l'audit financier Q3",
    status: "EN COURS",
    statusColor: "#0052A5",
    statusBg: "#E6F0FA",
    priority: "CRITIQUE",
    priorityColor: "#DC2626",
    assignee: "M. Chen",
    initials: "MC",
    avatarBg: "#0066CC",
    due: "24-11-2023",
    dueRed: false,
    project: "Stratégie de conformité",
    titleRed: false,
  },
  {
    id: "t2",
    icon: Target,
    iconColor: "#64748B",
    title: "Collecte de preuves SOC2 Type II",
    status: "BACKLOG",
    statusColor: "#475569",
    statusBg: "#F1F5F9",
    priority: "MOYENNE",
    priorityColor: "#0066CC",
    assignee: "J. Doe",
    initials: "JD",
    avatarBg: "#64748B",
    due: "05-12-2023",
    dueRed: false,
    project: "Sécurité de l'infrastructure",
    titleRed: false,
  },
  {
    id: "t3",
    icon: ShieldCheck,
    iconColor: "#7CB518",
    title: "Mise à jour Politique de Confidentialité (GDPR v2)",
    status: "TERMINEE",
    statusColor: "#5B8C00",
    statusBg: "#F4F9E8",
    priority: "HAUTE",
    priorityColor: "#EA580C",
    assignee: "L. Thorne",
    initials: "LT",
    avatarBg: "#7CB518",
    due: "15-11-2023",
    dueRed: false,
    project: "Mise à jour conformité",
    titleRed: false,
  },
  {
    id: "t4",
    icon: ShieldAlert,
    iconColor: "#EA580C",
    title: "Rapport annuel d'évaluation des risques",
    status: "A REVOIR",
    statusColor: "#C2410C",
    statusBg: "#FFEDD5",
    priority: "BASSE",
    priorityColor: "#94A3B8",
    assignee: "S. Gupta",
    initials: "SG",
    avatarBg: "#0284C7",
    due: "30-11-2023",
    dueRed: false,
    project: "Audit interne 2023",
    titleRed: false,
  },
  {
    id: "t5",
    icon: AlertTriangle,
    iconColor: "#DC2626",
    title: "Correction des vulnérabilités réseau",
    status: "EN RETARD",
    statusColor: "#FFFFFF",
    statusBg: "#DC2626",
    priority: "CRITIQUE",
    priorityColor: "#DC2626",
    assignee: "K. Wu",
    initials: "KW",
    avatarBg: "#1E293B",
    due: "18-11-2023",
    dueRed: true,
    project: "Sécurité de l'infrastructure",
    titleRed: true,
  },
];

const ENHANCED_AUDIT_LOG = [
  {
    id: "a1",
    date: "Aujourd'hui",
    time: "14:32",
    user: "Marc Chen",
    role: "Dev Team",
    initials: "MC",
    avatarBg: "#0066CC",
    action: "Changement d'état",
    detail: "a déplacé « API Auth SSO » de EN COURS vers CODE REVIEW",
    sprint: "Sprint 24",
    type: "status",
    badgeColor: "#0066CC",
    badgeBg: "#E6F0FA",
    icon: GitPullRequest,
  },
  {
    id: "a2",
    date: "Aujourd'hui",
    time: "11:05",
    user: "Alex Rivera",
    role: "Scrum Master",
    initials: "AR",
    avatarBg: "#7CB518",
    action: "Ajustement Sprint",
    detail: "a réassigné la User Story « Intégration Stripe » à Julie Doe pour rééquilibrage de charge",
    sprint: "Sprint 24",
    type: "sprint",
    badgeColor: "#7CB518",
    badgeBg: "#F4F9E8",
    icon: Activity,
  },
  {
    id: "a3",
    date: "Aujourd'hui",
    time: "09:15",
    user: "Julie Doe",
    role: "QA Engineer",
    initials: "JD",
    avatarBg: "#0284C7",
    action: "Alerte Bloqueur",
    detail: "a signalé un bloquant sur « DB Migration Pipeline » : Environnement de Staging instable",
    sprint: "Sprint 24",
    type: "blocker",
    badgeColor: "#DC2626",
    badgeBg: "#FEE2E2",
    icon: AlertCircle,
  },
  {
    id: "a4",
    date: "Hier",
    time: "17:40",
    user: "Léa Thorne",
    role: "Product Owner",
    initials: "LT",
    avatarBg: "#EA580C",
    action: "Backlog Refinement",
    detail: "a validé la définition de fini (DoD) pour la Story « Dashboard Metriques Q3 »",
    sprint: "Backlog",
    type: "story",
    badgeColor: "#EA580C",
    badgeBg: "#FFEDD5",
    icon: CheckCircle2,
  },
  {
    id: "a5",
    date: "Hier",
    time: "14:20",
    user: "Marc Chen",
    role: "Dev Team",
    initials: "MC",
    avatarBg: "#0066CC",
    action: "Commit & Branch",
    detail: "a lié la PR #104 au ticket « Correctif Fuite Mémoire Cache Redis »",
    sprint: "Sprint 24",
    type: "code",
    badgeColor: "#475569",
    badgeBg: "#F1F5F9",
    icon: GitCommit,
  },
];

const INITIAL_TEAM = [
  { id: "m1", name: "Marc Chen", initials: "MC", avatarBg: "#0066CC", role: "Responsable Audit Financier", email: "m.chen@aaprovidir.com", tasks: 4 },
  { id: "m2", name: "Julie Doe", initials: "JD", avatarBg: "#0284C7", role: "Analyste Sécurité", email: "j.doe@aaprovidir.com", tasks: 2 },
  { id: "m3", name: "Léa Thorne", initials: "LT", avatarBg: "#7CB518", role: "Responsable Conformité", email: "l.thorne@aaprovidir.com", tasks: 3 },
];

const MONTH_NAMES = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/* --------------------------------- HELPERS --------------------------------- */

function parseDue(due) {
  if (!due || !due.includes("-")) return { d: 1, m: 1, y: 2023 };
  const [d, m, y] = due.split("-").map(Number);
  return { d, m, y };
}

function Avatar({ initials, bg, size = 24 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
      style={{ width: size, height: size, backgroundColor: bg || "#0066CC", fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

/* ==================================================================== */

export default function TaskRepository() {
  const [activeNav, setActiveNav] = useState("Journal d'audit");
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [team, setTeam] = useState(INITIAL_TEAM);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "", email: "" });

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    project: "Audit général",
    assignee: "M. Chen",
    due: "30-11-2023",
    priority: "MOYENNE",
  });

  const [calMonth, setCalMonth] = useState(10);
  const [calYear, setCalYear] = useState(2023);
  const [selectedDay, setSelectedDay] = useState(24);

  const [profile, setProfile] = useState({
    name: "Alex Rivera",
    email: "alex.rivera@aaprovidir.com",
    phone: "+237 6 90 12 34 56",
    role: "Scrum Master",
    department: "Ingénierie & Produit",
  });

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

    const createdTask = {
      id: `t_${Date.now()}`,
      icon: FileText,
      iconColor: "#0066CC",
      title: newTask.title,
      status: "BACKLOG",
      statusColor: "#0066CC",
      statusBg: "#E6F0FA",
      priority: newTask.priority,
      priorityColor: newTask.priority === "CRITIQUE" ? "#DC2626" : "#0066CC",
      assignee: newTask.assignee,
      initials: newTask.assignee.split(" ").map((n) => n[0]).join("").toUpperCase(),
      avatarBg: "#0066CC",
      due: newTask.due,
      dueRed: false,
      project: newTask.project,
      titleRed: false,
    };

    setTasks([createdTask, ...tasks]);
    setIsAddTaskOpen(false);
    setNewTask({ title: "", project: "Audit général", assignee: "M. Chen", due: "30-11-2023", priority: "MOYENNE" });
  };

  const addMember = () => {
    if (!newMember.name.trim()) return;
    const initials = newMember.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
    setTeam((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        name: newMember.name,
        initials,
        avatarBg: "#0066CC",
        role: newMember.role || "Membre de l'équipe",
        email: newMember.email || "—",
        tasks: 0,
      },
    ]);
    setNewMember({ name: "", role: "", email: "" });
    setShowAddMember(false);
  };

  const removeMember = (id) => setTeam((prev) => prev.filter((m) => m.id !== id));

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
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setCalMonth(m);
    setCalYear(y);
    setSelectedDay(null);
  };

  const selectedKey = selectedDay ? `${calYear}-${calMonth + 1}-${selectedDay}` : null;
  const selectedTasks = selectedKey ? tasksByDate[selectedKey] || [] : [];

  return (
    <div className="flex w-full h-full min-h-screen bg-white text-slate-800" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className="flex flex-col shrink-0 border-r border-slate-100 bg-slate-50/50" style={{ width: 240 }}>
        <div className="flex items-center gap-3 px-6 pt-6 pb-8">
          <div className="flex items-center justify-center rounded-xl shadow-md bg-gradient-to-tr from-blue-700 to-sky-500" style={{ width: 36, height: 36 }}>
            <Building2 size={20} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <div className="text-[16px] font-black text-blue-900 tracking-tight">Aaprovidir</div>
            <div className="text-[9px] tracking-wider text-lime-600 font-bold uppercase">
              Agile & Delivery Hub
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ label, icon: Icon }) => {
            const active = activeNav === label;
            return (
              <div
                key={label}
                onClick={() => setActiveNav(label)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] cursor-pointer transition-all ${
                  active
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-600 font-medium"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </div>
            );
          })}
        </nav>

        <div className="px-4 pb-4">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[13.5px] font-bold text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:opacity-95 shadow-md shadow-blue-500/25 transition-all transform active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} /> Nouvelle tâche
          </button>
        </div>

        <div className="px-6 py-4 space-y-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-blue-600 cursor-pointer">
            <HelpCircle size={16} /> Centre d'aide
          </div>
          <div className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-red-600 cursor-pointer">
            <LogOut size={16} /> Déconnexion
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Topbar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 w-[340px] bg-slate-50 border border-slate-100">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher événements, tickets, membres..."
              className="bg-transparent text-[13px] outline-none w-full text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-5">
            <Bell size={19} className="text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" />
            <div
              className="flex items-center gap-3 cursor-pointer pl-3 border-l border-slate-100"
              onClick={() => setActiveNav("Paramètres")}
            >
              <div className="text-right">
                <div className="text-[13.5px] font-bold text-slate-800 leading-none">{profile.name}</div>
                <div className="text-[10px] text-lime-600 font-semibold mt-0.5">Scrum Master</div>
              </div>
              <Avatar initials="AR" bg="#0066CC" size={34} />
            </div>
          </div>
        </div>

        {/* Dynamic Views */}
        <div className="px-8 py-7 flex-1 overflow-auto bg-white">
          {activeNav === "Tâches" && <TachesView tasks={tasks} />}
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
          {activeNav === "Paramètres" && <ParametresView profile={profile} setProfile={setProfile} />}
          {(activeNav === "Tableau de bord" || activeNav === "Projets") && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <LayoutGrid size={48} className="mb-2 text-blue-200" />
              <p className="text-[15px] font-medium">Vue {activeNav} en cours de développement</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Créer une Tâche */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-[17px] font-bold text-blue-900 flex items-center gap-2">
                <Plus size={20} className="text-blue-600" /> Créer une nouvelle tâche
              </h3>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-600 mb-1">Titre de la tâche</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Analyse des risques informatiques"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-[13.5px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-600 mb-1">Contexte du projet</label>
                <input
                  type="text"
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-[13.5px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1">Assigné à</label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500"
                  >
                    <option value="M. Chen">Marc Chen</option>
                    <option value="J. Doe">Julie Doe</option>
                    <option value="L. Thorne">Léa Thorne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1">Priorité</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500"
                  >
                    <option value="BASSE">Basse</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="HAUTE">Haute</option>
                    <option value="CRITIQUE">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-600 mb-1">Date d'échéance</label>
                <input
                  type="text"
                  placeholder="JJ-MM-AAAA"
                  value={newTask.due}
                  onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-[13.5px] outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-3 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-[13px] font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-95"
                >
                  Ajouter la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== JOURNAL D'AUDIT (SCRUM MASTER) ============================== */

function AuditView() {
  const [activeFilter, setActiveFilter] = useState("TOUS");

  const filteredLogs = useMemo(() => {
    if (activeFilter === "TOUS") return ENHANCED_AUDIT_LOG;
    return ENHANCED_AUDIT_LOG.filter((log) => log.type === activeFilter.toLowerCase());
  }, [activeFilter]);

  return (
    <div className="max-w-6xl">
      {/* Header avec Métriques de Vélocité Agile */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[26px] font-black text-slate-900 tracking-tight">Journal d'audit Agile</h1>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
              Sprint 24 En cours
            </span>
          </div>
          <p className="text-[13.5px] text-slate-500">
            Flux d'événements en temps réel et traçabilité pour le Scrum Master.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all">
          <Filter size={14} className="text-blue-600" /> Exporter le rapport (.CSV)
        </button>
      </div>

      {/* Cartes d'indicateurs rapides pour Scrum Master */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl p-4 border border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mouvements Sprint</div>
            <div className="text-[20px] font-black text-slate-800 mt-0.5">18 Tâches</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
            <Activity size={20} />
          </div>
        </div>

        <div className="rounded-2xl p-4 border border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bloqueurs Actifs</div>
            <div className="text-[20px] font-black text-red-600 mt-0.5">1 Critique</div>
          </div>
          <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="rounded-2xl p-4 border border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stories Validées</div>
            <div className="text-[20px] font-black text-lime-600 mt-0.5">12 / 15</div>
          </div>
          <div className="p-2.5 rounded-xl bg-lime-100 text-lime-700">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="rounded-2xl p-4 border border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vélocité Moyenne</div>
            <div className="text-[20px] font-black text-blue-900 mt-0.5">42 pts</div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Bar de filtres d'activités */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
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
            className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold transition-all ${
              activeFilter === f.label
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Timeline d'audit enrichie */}
      <div className="rounded-2xl p-6 border border-slate-100 bg-white shadow-sm">
        <div className="relative space-y-6 before:absolute before:inset-0 before:left-[19px] before:w-[2px] before:bg-slate-100">
          {filteredLogs.map((entry) => {
            const Icon = entry.icon;
            return (
              <div key={entry.id} className="relative flex items-start gap-4 group">
                {/* Pastille Icone */}
                <div
                  className="flex items-center justify-center rounded-full shrink-0 z-10 shadow-sm border-2 border-white"
                  style={{ width: 40, height: 40, backgroundColor: entry.badgeBg }}
                >
                  <Icon size={18} color={entry.badgeColor} strokeWidth={2.2} />
                </div>

                {/* Contenu principal */}
                <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80 hover:bg-blue-50/20 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={entry.initials} bg={entry.avatarBg} size={26} />
                      <span className="text-[13.5px] font-bold text-slate-900">{entry.user}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/60 text-slate-600">
                        {entry.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {entry.sprint}
                      </span>
                      <span className="text-[11.5px] text-slate-400 font-medium">
                        {entry.date} à {entry.time}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <span
                      className="text-[11px] font-extrabold uppercase tracking-wide mr-2"
                      style={{ color: entry.badgeColor }}
                    >
                      [{entry.action}]
                    </span>
                    <span className="text-[13.5px] font-medium text-slate-700">{entry.detail}</span>
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

/* ============================== AUTRES VIEWS ============================== */

function TachesView({ tasks }) {
  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-black text-slate-900 tracking-tight mb-1">Répertoire des tâches</h1>
          <p className="text-[13.5px] text-slate-500">Gérez et suivez les tâches de conformité d'audit d'entreprise.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm">
          <SlidersHorizontal size={14} /> Filtrer
        </button>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex items-center rounded-xl p-1 bg-slate-100 border border-slate-200/60">
          <button className="px-4 py-1.5 rounded-lg text-[13px] font-bold text-white bg-blue-600 shadow-sm">
            Toutes les tâches
          </button>
          <button className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 hover:text-blue-600">
            Assignées à moi
          </button>
          <button className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 hover:text-blue-600">
            En retard
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100">
              {["TITRE DE LA TÂCHE", "STATUT", "PRIORITÉ", "ASSIGNÉ", "DATE D'ÉCHÉANCE", "CONTEXTE DU PROJET"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const Icon = t.icon || FileText;
              return (
                <tr key={t.id} className="hover:bg-blue-50/40 transition-colors border-b border-slate-100/60 last:border-none">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Icon size={18} color={t.iconColor || "#0066CC"} strokeWidth={2} />
                      <span className="text-[13.5px] font-semibold text-slate-800">{t.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide"
                      style={{ color: t.statusColor, backgroundColor: t.statusBg }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full" style={{ width: 7, height: 7, backgroundColor: t.priorityColor }} />
                      <span className="text-[12.5px] font-semibold text-slate-600">{t.priority}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar initials={t.initials} bg={t.avatarBg} />
                      <span className="text-[13px] font-medium text-slate-700">{t.assignee}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] font-semibold" style={{ color: t.dueRed ? "#DC2626" : "#0066CC" }}>
                      {t.due}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] text-slate-400 italic">{t.project}</span>
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
        <h1 className="text-[26px] font-black text-slate-900 tracking-tight mb-1">Calendrier des échéances</h1>
      </div>

      <div className="flex gap-6 items-start">
        <div className="rounded-2xl p-5 flex-1 border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[16px] font-bold text-slate-900">
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 border border-slate-200">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-slate-100 border border-slate-200">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[11px] font-bold text-slate-400 uppercase py-1">
                {w}
              </div>
            ))}
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
                  className={`flex flex-col items-center justify-center rounded-xl py-3 transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30"
                      : dayTasks.length
                      ? "bg-blue-50/70 text-blue-900 font-bold hover:bg-blue-100"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="text-[13px]">{d}</span>
                  {dayTasks.length > 0 && (
                    <span className={`rounded-full mt-1 ${isSelected ? "bg-lime-400" : "bg-blue-600"}`} style={{ width: 5, height: 5 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-5 shrink-0 border border-slate-100 bg-white shadow-sm" style={{ width: 300 }}>
          <h3 className="text-[14px] font-bold text-slate-900 mb-1">
            {selectedDay ? `${selectedDay} ${MONTH_NAMES[calMonth]} ${calYear}` : "Sélectionnez une date"}
          </h3>
          <p className="text-[12px] text-slate-400 mb-4">{selectedTasks.length} tâche(s)</p>

          {selectedTasks.length === 0 && (
            <div className="text-[13px] text-slate-400 italic py-6 text-center">Aucune tâche ce jour-là.</div>
          )}

          <div className="space-y-2">
            {selectedTasks.map((t) => (
              <div key={t.id} className="rounded-xl p-3 bg-blue-50/50 border border-blue-100">
                <div className="text-[12.5px] font-bold text-blue-900 mb-1">{t.title}</div>
                <div className="text-[11px] text-slate-500">Assigné: {t.assignee}</div>
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
          <h1 className="text-[26px] font-black text-slate-900 tracking-tight mb-1">Équipe Agile</h1>
          <p className="text-[13.5px] text-slate-500">Membres de l'équipe de développement et parties prenantes.</p>
        </div>
        <button
          onClick={() => setShowAddMember(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white bg-blue-600 shadow-md shadow-blue-500/20 hover:bg-blue-700"
        >
          <UserPlus size={16} /> Ajouter un membre
        </button>
      </div>

      {showAddMember && (
        <div className="rounded-2xl p-5 mb-5 border border-slate-100 bg-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-bold text-slate-900">Ajouter un membre</span>
            <button onClick={() => setShowAddMember(false)} className="text-slate-400"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <input
              className="rounded-xl px-3 py-2 text-[13px] border border-slate-200 outline-none focus:border-blue-500"
              placeholder="Nom complet"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            />
            <input
              className="rounded-xl px-3 py-2 text-[13px] border border-slate-200 outline-none focus:border-blue-500"
              placeholder="Rôle (Dev, QA, PO...)"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            />
            <input
              className="rounded-xl px-3 py-2 text-[13px] border border-slate-200 outline-none focus:border-blue-500"
              placeholder="Email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
          </div>
          <button onClick={addMember} className="px-4 py-2 rounded-xl text-[13px] font-bold text-white bg-blue-600">
            Valider
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {team.map((m) => (
          <div key={m.id} className="rounded-2xl p-4 border border-slate-100 bg-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar initials={m.initials} bg={m.avatarBg} size={40} />
              <div>
                <div className="text-[14px] font-bold text-slate-900">{m.name}</div>
                <div className="text-[12px] text-blue-600 font-medium">{m.role}</div>
                <div className="text-[11px] text-slate-400">{m.email}</div>
              </div>
            </div>
            <button onClick={() => removeMember(m.id)} className="text-slate-300 hover:text-red-500 p-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function ParametresView({ profile, setProfile }) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-[26px] font-black text-slate-900 tracking-tight mb-1">Paramètres du profil</h1>
      <p className="text-[13.5px] text-slate-500 mb-6">Modifiez vos informations personnelles.</p>

      <div className="rounded-2xl p-6 border border-slate-100 bg-white shadow-sm space-y-4">
        <div>
          <label className="block text-[12px] font-bold text-slate-600 mb-1">Nom complet</label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-[13.5px] outline-none focus:border-blue-500"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-slate-600 mb-1">Adresse Email</label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-[13.5px] outline-none focus:border-blue-500"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}