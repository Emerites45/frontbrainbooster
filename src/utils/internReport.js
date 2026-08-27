import { toISODate } from "./dashboardHelpers";

export function computeInternReport({ user, tasks, projects, entries, weeklyReports, comments, startDate, endDate }) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const rangeEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });
  const rangeReports = weeklyReports
    .filter((r) => { const d = new Date(r.weekStart); return d >= start && d <= end; })
    .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));
  const rangeComments = comments
    .filter((c) => { const d = new Date(c.weekStart); return d >= start && d <= end; })
    .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));

  const regularHours = rangeEntries.reduce((s, e) => s + (Number(e.regularHours) || 0), 0);
  const overtimeHours = rangeEntries.reduce((s, e) => s + (Number(e.overtimeHours) || 0), 0);
  const totalHours = regularHours + overtimeHours;

  const userTasks = tasks.filter((t) => (t.assignments || []).some((a) => a.userId === user.id && !a.unassignedAt));
  const completedTasks = userTasks.filter((t) => t.status === "TERMINE").length;
  const completionRate = userTasks.length === 0 ? 0 : Math.round((completedTasks / userTasks.length) * 100);

  const involvedProjectIds = new Set([
    ...rangeEntries.map((e) => e.projectId).filter(Boolean),
    ...userTasks.map((t) => t.projectId).filter(Boolean),
  ]);
  const involvedProjects = projects.filter((p) => involvedProjectIds.has(p.id) || involvedProjectIds.has(String(p.id)));

  const weeksCovered = new Set(rangeReports.map((r) => r.weekStart)).size || new Set(rangeEntries.map((e) => toISODate(new Date(e.date)))).size;

  return {
    totalHours, regularHours, overtimeHours,
    totalTasks: userTasks.length, completedTasks, completionRate,
    involvedProjects, rangeReports, rangeComments, weeksCovered,
    entryCount: rangeEntries.length,
  };
}

function esc(str = "") {
  return String(str).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

export function buildInternReportHtml({ user, startDate, endDate, report }) {
  const roleLabel = user.globalRoles?.includes("ADMIN")
    ? "Administrateur"
    : (user.departmentRoles || []).map((dr) => `${dr.role === "SCRUM_MASTER" ? "Scrum Master" : "Membre"} · ${dr.departmentName}`).join(", ") || "—";

  const fmtDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  const statsCards = [
    { label: "Heures totales", value: `${report.totalHours.toFixed(1)}h` },
    { label: "Heures normales", value: `${report.regularHours.toFixed(1)}h` },
    { label: "Heures supplémentaires", value: `${report.overtimeHours.toFixed(1)}h` },
    { label: "Semaines couvertes", value: report.weeksCovered },
    { label: "Tâches assignées", value: report.totalTasks },
    { label: "Tâches terminées", value: report.completedTasks },
    { label: "Taux de complétion", value: `${report.completionRate}%` },
    { label: "Projets impliqués", value: report.involvedProjects.length },
  ];

  const projectsList = report.involvedProjects.length
    ? report.involvedProjects.map((p) => `<li>${esc(p.name)}</li>`).join("")
    : "<li style='color:#94a3b8'>Aucun projet enregistré sur cette période.</li>";

  const retroBlocks = report.rangeReports.length
    ? report.rangeReports.map((r) => `
        <div class="retro-week">
          <h4>Semaine du ${fmtDate(r.weekStart)}</h4>
          <div class="retro-grid">
            <div><strong>Difficultés rencontrées</strong><p>${esc(r.difficulties) || "—"}</p></div>
            <div><strong>Solutions proposées</strong><p>${esc(r.solutions) || "—"}</p></div>
            <div><strong>Bilan personnel</strong><p>${esc(r.bilanPersonnel) || "—"}</p></div>
            <div><strong>Observations</strong><p>${esc(r.observations) || "—"}</p></div>
          </div>
        </div>`).join("")
    : "<p style='color:#94a3b8;font-size:13px'>Aucun bilan hebdomadaire enregistré sur cette période.</p>";

  const commentsBlock = report.rangeComments.length
    ? `<ul class="comments-list">${report.rangeComments.map((c) => `
        <li><strong>${esc(c.authorName)}</strong> — semaine du ${fmtDate(c.weekStart)}<p>${esc(c.content)}</p></li>`).join("")}</ul>`
    : "<p style='color:#94a3b8;font-size:13px'>Aucun commentaire d'encadrement enregistré.</p>";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Rapport de stage — ${esc(user.firstName)} ${esc(user.lastName)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 40px 48px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0B438C; padding-bottom: 20px; margin-bottom: 28px; }
  .brand { font-size: 20px; font-weight: 700; color: #0B438C; }
  .brand-sub { font-size: 11px; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 18px; margin: 0; color: #1e293b; }
  .doc-title p { font-size: 12px; color: #64748b; margin: 4px 0 0; }
  .intern-card { display: flex; justify-content: space-between; align-items: center; background: #FBF7F3; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; }
  .intern-name { font-size: 22px; font-weight: 700; color: #0B438C; }
  .intern-meta { font-size: 13px; color: #64748b; margin-top: 4px; }
  .badge { display: inline-block; background: #0B438C; color: white; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 999px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 32px; }
  .stat-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
  .stat-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; font-weight: 600; }
  .stat-value { font-size: 22px; font-weight: 700; color: #0B438C; margin-top: 4px; }
  h2.section { font-size: 15px; color: #0B438C; border-left: 4px solid #20A036; padding-left: 10px; margin: 32px 0 14px; }
  ul.plain-list { margin: 0; padding-left: 18px; font-size: 13px; }
  .retro-week { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px; page-break-inside: avoid; }
  .retro-week h4 { margin: 0 0 12px; font-size: 13px; color: #0B438C; }
  .retro-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .retro-grid strong { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; }
  .retro-grid p { font-size: 12.5px; margin: 4px 0 0; color: #334155; white-space: pre-wrap; }
  .comments-list { list-style: none; padding: 0; margin: 0; }
  .comments-list li { border-left: 3px solid #FFDE21; background: #fffbea; border-radius: 6px; padding: 10px 14px; margin-bottom: 10px; font-size: 12.5px; }
  .comments-list p { margin: 4px 0 0; color: #334155; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print { body { padding: 24px 32px; } }
</style></head>
<body>
  <div class="header">
    <div>
      <div class="brand">Aaprovidir</div>
      <div class="brand-sub">BrainBooster</div>
    </div>
    <div class="doc-title">
      <h1>Rapport de stage</h1>
      <p>Du ${fmtDate(startDate)} au ${fmtDate(endDate)}</p>
    </div>
  </div>

  <div class="intern-card">
    <div>
      <div class="intern-name">${esc(user.firstName)} ${esc(user.lastName)}</div>
      <div class="intern-meta">${esc(user.email)}</div>
      <div class="intern-meta">${esc(roleLabel)}</div>
    </div>
    <span class="badge">Stage validé</span>
  </div>

  <h2 class="section">Synthèse d'activité</h2>
  <div class="stats-grid">
    ${statsCards.map((s) => `<div class="stat-card"><div class="stat-label">${esc(s.label)}</div><div class="stat-value">${esc(s.value)}</div></div>`).join("")}
  </div>

  <h2 class="section">Projets sur lesquels ${esc(user.firstName)} a travaillé</h2>
  <ul class="plain-list">${projectsList}</ul>

  <h2 class="section">Bilans hebdomadaires</h2>
  ${retroBlocks}

  <h2 class="section">Retours de l'encadrement</h2>
  ${commentsBlock}

  <div class="footer">Document généré automatiquement depuis BrainBooster — Aaprovidir · ${new Date().toLocaleDateString("fr-FR")}</div>
</body></html>`;
}