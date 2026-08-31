import { useState, useMemo } from "react";
import { Search, Activity, TrendingUp, User, GitCommit, Download } from "lucide-react";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/dashboard/Pagination";
import StatsGrid from "../../components/dashboard/StatsGrid";
import ExportModal from "../../components/dashboard/ExportModal";

const TYPE_LABELS = {
  CREATION: "Création",
  CHANGEMENT_STATUT: "Changement de statut",
  MODIFICATION: "Modification",
};

const TYPE_STYLES = {
  CREATION: { badge: "bg-green-50 text-green-700", dot: "bg-green-500" },
  CHANGEMENT_STATUT: { badge: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  MODIFICATION: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
};

function formatDateTime(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) +
    " à " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}

function libelleAction(action) {
  if (action.type_action === "CHANGEMENT_STATUT") {
    return `a changé le statut de ${action.ancienne_valeur ?? "?"} à ${action.nouvelle_valeur ?? "?"}`;
  }
  if (action.type_action === "CREATION") return "a créé une tâche";
  return `a modifié ${action.champ_modifie ?? "un champ"}`;
}

function taskContext(action, tasks, projects) {
  const task = tasks.find((t) => String(t.id) === String(action.id_tache));
  if (!task) return { title: "Tâche supprimée", project: "—", projectId: null };
  const project = projects.find((p) => p.id === task.projectId);
  return { title: task.title, project: project?.name ?? "—", projectId: task.projectId ?? null };
}

function AdminActivityPage({ actions = [], tasks = [], projects = [] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [userFilter, setUserFilter] = useState("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [showExport, setShowExport] = useState(false);

  const sortedActions = useMemo(
    () => [...actions].sort((a, b) => new Date(b.date_action) - new Date(a.date_action)),
    [actions]
  );

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const actionsToday = actions.filter((a) => new Date(a.date_action) >= startOfToday).length;
  const actionsThisWeek = actions.filter((a) => new Date(a.date_action) >= sevenDaysAgo).length;

  const mostActiveUser = useMemo(() => {
    const map = {};
    actions.forEach((a) => { map[a.nom_user] = (map[a.nom_user] || 0) + 1; });
    const entries = Object.entries(map);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0];
  }, [actions]);

  const typeBreakdown = useMemo(() => {
    const map = { CREATION: 0, CHANGEMENT_STATUT: 0, MODIFICATION: 0 };
    actions.forEach((a) => { map[a.type_action] = (map[a.type_action] || 0) + 1; });
    return map;
  }, [actions]);

  const dailyCounts = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const count = actions.filter((a) => {
        const t = new Date(a.date_action);
        return t >= d && t < next;
      }).length;
      days.push({ label: d.toLocaleDateString("fr-FR", { weekday: "short" }), count });
    }
    return days;
  }, [actions]);
  const maxDaily = Math.max(1, ...dailyCounts.map((d) => d.count));

  const distinctUsers = useMemo(() => [...new Set(actions.map((a) => a.nom_user))], [actions]);

  const dateCutoff = useMemo(() => {
    if (dateRangeFilter === "ALL") return null;
    const days = dateRangeFilter === "7D" ? 7 : 30;
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [dateRangeFilter]);

  const filteredActions = useMemo(() => {
    return sortedActions.filter((a) => {
      const matchesType = typeFilter === "ALL" || a.type_action === typeFilter;
      const matchesUser = userFilter === "ALL" || a.nom_user === userFilter;
      const ctx = taskContext(a, tasks, projects);
      const matchesProject = projectFilter === "ALL" || String(ctx.projectId) === projectFilter;
      const matchesDate = !dateCutoff || new Date(a.date_action) >= dateCutoff;
      const matchesSearch =
        !search ||
        ctx.title.toLowerCase().includes(search.toLowerCase()) ||
        a.nom_user?.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesUser && matchesProject && matchesDate && matchesSearch;
    });
  }, [sortedActions, typeFilter, userFilter, projectFilter, dateCutoff, search, tasks, projects]);

  const { pageItems, page, totalPages, rangeStart, rangeEnd, totalItems, goToPage } = usePagination(filteredActions, 12);

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900">Journal d'audit</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Historique complet des actions sur l'ensemble de l'organisation.</p>
        </div>
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-medium px-4 py-2.5 transition-colors"
        >
          <Download size={15} />
          Exporter
        </button>
      </div>

      <StatsGrid
        items={[
          { label: "Actions totales", value: actions.length, icon: Activity, accent: "#1D4ED8", accentBg: "#DBEAFE" },
          { label: "Aujourd'hui", value: actionsToday, icon: TrendingUp, accent: "#16A34A", accentBg: "#DCFCE7" },
          { label: "Cette semaine", value: actionsThisWeek, icon: GitCommit, accent: "#7C3AED", accentBg: "#EDE9FE" },
          {
            label: "Plus actif",
            value: mostActiveUser ? mostActiveUser[0].split(" ")[0] : "—",
            hint: mostActiveUser ? `${mostActiveUser[1]} actions` : undefined,
            icon: User,
            accent: "#EA580C",
            accentBg: "#FFEDD5",
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-[14.5px] font-semibold text-slate-900 mb-5">Activité des 7 derniers jours</h2>
          <div className="flex items-end gap-3 h-[140px]">
            {dailyCounts.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md bg-blue-500"
                    style={{ height: `${Math.max(4, (d.count / maxDaily) * 100)}%` }}
                    title={`${d.count} action${d.count > 1 ? "s" : ""}`}
                  />
                </div>
                <span className="text-[11px] text-slate-400 capitalize">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-[14.5px] font-semibold text-slate-900 mb-4">Répartition par type</h2>
          <div className="space-y-4">
            {Object.entries(typeBreakdown).map(([type, count]) => {
              const pct = actions.length === 0 ? 0 : Math.round((count / actions.length) * 100);
              const style = TYPE_STYLES[type] ?? { dot: "bg-slate-300" };
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-[12.5px] text-slate-600">
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      {TYPE_LABELS[type] ?? type}
                    </span>
                    <span className="text-[12px] text-slate-400">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${style.dot}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 flex-1 min-w-[240px] bg-slate-50 border border-slate-100">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par tâche ou utilisateur..."
            className="bg-transparent text-[13px] outline-none w-full text-slate-700 placeholder-slate-400"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none">
          <option value="ALL">Tous les types</option>
          <option value="CREATION">Création</option>
          <option value="CHANGEMENT_STATUT">Changement de statut</option>
          <option value="MODIFICATION">Modification</option>
        </select>
        <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none">
          <option value="ALL">Tous les utilisateurs</option>
          {distinctUsers.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <select value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)} className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none">
          <option value="ALL">Toute la période</option>
          <option value="7D">7 derniers jours</option>
          <option value="30D">30 derniers jours</option>
        </select>
        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="rounded-lg border border-slate-200 text-[13px] text-slate-600 px-3 py-2 outline-none">
          <option value="ALL">Tous les projets</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {pageItems.length === 0 ? (
          <p className="text-[13px] text-slate-400 text-center py-10">Aucune action ne correspond à ces filtres.</p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {pageItems.map((a) => {
              const ctx = taskContext(a, tasks, projects);
              const style = TYPE_STYLES[a.type_action] ?? { badge: "bg-slate-100 text-slate-600", dot: "bg-slate-300" };
              return (
                <li key={a.id} className="flex items-start gap-3 px-5 py-4">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-slate-700 leading-snug">
                      <span className="font-medium text-slate-900">{a.nom_user}</span> {libelleAction(a)}{" "}
                      <span className="text-slate-400">— {ctx.title}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ctx.project} · {formatDateTime(a.date_action)}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full text-[10.5px] font-semibold px-2 py-0.5 ${style.badge}`}>
                    {TYPE_LABELS[a.type_action] ?? a.type_action}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={page} totalPages={totalPages} rangeStart={rangeStart} rangeEnd={rangeEnd} totalItems={totalItems} onPageChange={goToPage} itemLabel="actions" />
      </div>

      {showExport && (
        <ExportModal
          data={filteredActions.map((a) => {
            const ctx = taskContext(a, tasks, projects);
            return {
              date: formatDateTime(a.date_action),
              utilisateur: a.nom_user,
              type: TYPE_LABELS[a.type_action] ?? a.type_action,
              tache: ctx.title,
              projet: ctx.project,
            };
          })}
          filenameBase="journal-audit"
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

export default AdminActivityPage;