import React from "react";
import {
  Search,
  Bell,
  HelpCircle,
  LayoutGrid,
  FolderKanban,
  CheckSquare,
  Calendar,
  ScrollText,
  Users,
  Settings,
  Plus,
  LogOut,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Target,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

const navItems = [
  { label: "Tableau de bord", icon: LayoutGrid },
  { label: "Projets", icon: FolderKanban },
  { label: "Tâches", icon: CheckSquare, active: true },
  { label: "Calendrier", icon: Calendar },
  { label: "Journal d'audit", icon: ScrollText },
  { label: "Équipe", icon: Users },
  { label: "Paramètres", icon: Settings },
];

const tasks = [
  {
    icon: FileText,
    iconColor: "#2563EB",
    title: "Préparation de l'audit financier Q3",
    status: "EN COURS",
    statusColor: "#1D4ED8",
    statusBg: "#DBEAFE",
    priority: "CRITIQUE",
    priorityColor: "#DC2626",
    assignee: "M. Chen",
    initials: "MC",
    avatarBg: "#94A3B8",
    due: "24-11-2023",
    dueRed: false,
    project: "Stratégie de con...",
    titleRed: false,
  },
  {
    icon: Target,
    iconColor: "#64748B",
    title: "Collecte de preuves SOC2 Type II",
    status: "BACKLOG",
    statusColor: "#475569",
    statusBg: "#E2E8F0",
    priority: "MOYENNE",
    priorityColor: "#2563EB",
    assignee: "J. Doe",
    initials: "JD",
    avatarBg: "#64748B",
    due: "05-12-2023",
    dueRed: false,
    project: "Sécurité de l'infr...",
    titleRed: false,
  },
  {
    icon: ShieldCheck,
    iconColor: "#16A34A",
    title: "Mise à jour Politique de Confidentialité (GDPR v2)",
    status: "TERMINEE",
    statusColor: "#15803D",
    statusBg: "#DCFCE7",
    priority: "HAUTE",
    priorityColor: "#EA580C",
    assignee: "L. Thorne",
    initials: "LT",
    avatarBg: "#475569",
    due: "15-11-2023",
    dueRed: false,
    project: "Mise à jour c...",
    titleRed: false,
  },
  {
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
    avatarBg: "#7C3AED",
    due: "30-11-2023",
    dueRed: false,
    project: "Audit interne 2...",
    titleRed: false,
  },
  {
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
    avatarBg: "#334155",
    due: "18-11-2023",
    dueRed: true,
    project: "Sécurité de l'inf...",
    titleRed: true,
  },
];

function Avatar({ initials, bg }) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-white text-[10px] font-semibold shrink-0"
      style={{ width: 24, height: 24, backgroundColor: bg }}
    >
      {initials}
    </div>
  );
}

export default function TaskRepository() {
  return (
    <div
      className="flex w-full h-full min-h-screen"
      style={{ backgroundColor: "#FAF8F3", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0"
        style={{ width: 232, backgroundColor: "#FAF8F3", borderRight: "1px solid #E7E2D8" }}
      >
        <div className="flex items-center gap-2 px-5 pt-6 pb-8">
          <div
            className="flex items-center justify-center rounded-md"
            style={{ width: 30, height: 30, backgroundColor: "#1B3A6B" }}
          >
            <div className="w-3 h-3 rounded-sm bg-white" />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold text-slate-900">Aaprovidir</div>
            <div className="text-[9px] tracking-wide text-slate-400 font-medium">
              AUDIT D'ENTREPRISE
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ label, icon: Icon, active }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] cursor-pointer"
              style={{
                backgroundColor: active ? "#E4E9F7" : "transparent",
                color: active ? "#1B3A6B" : "#57534E",
                fontWeight: active ? 600 : 500,
              }}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </div>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <button
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13.5px] font-semibold text-white"
            style={{ backgroundColor: "#16233F" }}
          >
            <Plus size={16} /> Nouvelle tâche
          </button>
        </div>

        <div
          className="px-6 py-4 space-y-3"
          style={{ borderTop: "1px solid #E7E2D8" }}
        >
          <div className="flex items-center gap-2 text-[13px] text-slate-500 cursor-pointer">
            <HelpCircle size={16} />
            Centre d'aide
          </div>
          <div className="flex items-center gap-2 text-[13px] text-slate-500 cursor-pointer">
            <LogOut size={16} />
            Déconnexion
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div
          className="flex items-center justify-between px-8 py-4"
          style={{ borderBottom: "1px solid #E7E2D8" }}
        >
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 w-[340px]"
            style={{ backgroundColor: "#F1EEE6" }}
          >
            <Search size={16} className="text-slate-400" />
            <span className="text-[13px] text-slate-400">Rechercher dans les archives...</span>
          </div>
          <div className="flex items-center gap-5">
            <Bell size={18} className="text-slate-500" />
            <HelpCircle size={18} className="text-slate-500" />
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-semibold text-slate-800">Alex Rivera</span>
              <div
                className="rounded-full overflow-hidden"
                style={{ width: 30, height: 30, backgroundColor: "#CBD5E1" }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-7 flex-1">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-[26px] font-bold text-slate-900 mb-1">
                Répertoire des tâches
              </h1>
              <p className="text-[13.5px] text-slate-500">
                Gérez et suivez les tâches de conformité d'audit d'entreprise.
              </p>
            </div>
            <button
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-600"
              style={{ border: "1px solid #E2DED2", backgroundColor: "#FFFFFF" }}
            >
              <SlidersHorizontal size={14} /> Filtrer
            </button>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div
              className="inline-flex items-center rounded-lg p-1"
              style={{ backgroundColor: "#F1EEE6" }}
            >
              <button
                className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold text-white"
                style={{ backgroundColor: "#16233F" }}
              >
                Toutes les tâches
              </button>
              <button className="px-3.5 py-1.5 rounded-md text-[13px] font-medium text-slate-500">
                Assignées à moi
              </button>
              <button className="px-3.5 py-1.5 rounded-md text-[13px] font-medium text-slate-500">
                En retard
              </button>
            </div>
          </div>

          <div className="mb-3">
            <button
              className="flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[13px] font-medium text-slate-600"
              style={{ border: "1px solid #E2DED2", backgroundColor: "#FFFFFF" }}
            >
              <ArrowUpDown size={13} /> Trier
            </button>
          </div>

          {/* Table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid #E7E2D8", backgroundColor: "#FFFFFF" }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid #E7E2D8" }}>
                  {[
                    "TITRE DE LA TÂCHE",
                    "STATUT",
                    "PRIORITÉ",
                    "ASSIGNÉ",
                    "DATE D'ÉCHÉANCE",
                    "CONTEXTE DU PROJET",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[10.5px] font-semibold tracking-wide text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <tr
                      key={t.title}
                      style={{
                        borderBottom:
                          i !== tasks.length - 1 ? "1px solid #F0EDE4" : "none",
                      }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} color={t.iconColor} strokeWidth={2} />
                          <span
                            className="text-[13.5px] font-semibold"
                            style={{ color: t.titleRed ? "#DC2626" : "#1E293B" }}
                          >
                            {t.title}
                          </span>
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md ml-1"
                            style={{ color: t.statusColor, backgroundColor: t.statusBg }}
                          >
                            {t.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4" />
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="rounded-full"
                            style={{
                              width: 6,
                              height: 6,
                              backgroundColor: t.priorityColor,
                            }}
                          />
                          <span className="text-[12.5px] font-medium text-slate-600">
                            {t.priority}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar initials={t.initials} bg={t.avatarBg} />
                          <span className="text-[13px] text-slate-600">{t.assignee}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-[13px]"
                          style={{ color: t.dueRed ? "#DC2626" : "#475569", fontWeight: t.dueRed ? 600 : 400 }}
                        >
                          {t.due}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] italic text-slate-400">{t.project}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          <div className="flex items-center justify-between mt-4 px-1">
            <span className="text-[13px] text-slate-500">
              Affichage de <span className="font-semibold text-slate-700">1-7</span> sur{" "}
              <span className="font-semibold text-slate-700">142</span> tâches
            </span>
            <div className="flex items-center gap-1.5">
              <button
                className="flex items-center justify-center rounded-md text-slate-400"
                style={{ width: 26, height: 26, border: "1px solid #E2DED2" }}
              >
                <ChevronLeft size={14} />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  className="flex items-center justify-center rounded-md text-[12.5px] font-medium"
                  style={{
                    width: 26,
                    height: 26,
                    backgroundColor: n === 1 ? "#16233F" : "transparent",
                    color: n === 1 ? "#FFFFFF" : "#57534E",
                  }}
                >
                  {n}
                </button>
              ))}
              <span className="text-[12.5px] text-slate-400 px-1">...</span>
              <button
                className="flex items-center justify-center rounded-md text-[12.5px] font-medium text-slate-600"
                style={{ width: 26, height: 26 }}
              >
                20
              </button>
              <button
                className="flex items-center justify-center rounded-md text-slate-400"
                style={{ width: 26, height: 26, border: "1px solid #E2DED2" }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
