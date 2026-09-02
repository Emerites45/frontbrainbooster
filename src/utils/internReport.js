import { toISODate, getWeekStart } from "./dashboardHelpers";

export function computeInternReport({ user, tasks, projects, entries, comments, startDate, endDate }) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const rangeEntries = entries
    .filter((e) => { const d = new Date(e.date); return d >= start && d <= end; })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

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
    ...rangeEntries.map((e) => Number(e.projectId)).filter(Boolean),
    ...userTasks.map((t) => t.projectId).filter(Boolean),
  ]);
  const involvedProjects = projects.filter((p) => involvedProjectIds.has(p.id));

  const weekSet = new Set(rangeEntries.map((e) => toISODate(getWeekStart(new Date(e.date)))));
  const weeksCovered = weekSet.size;

  const dailyLogs = rangeEntries.map((e) => {
    const project = projects.find((p) => p.id === Number(e.projectId));
    const task = tasks.find((t) => t.id === Number(e.taskId));
    const hasRetro = ["difficulties", "solutions", "bilanPersonnel", "observations"].some((f) => e[f]?.trim());
    return {
      date: e.date,
      projectName: project?.name ?? null,
      taskTitle: task?.title ?? null,
      description: e.description ?? "",
      regularHours: Number(e.regularHours) || 0,
      overtimeHours: Number(e.overtimeHours) || 0,
      total: (Number(e.regularHours) || 0) + (Number(e.overtimeHours) || 0),
      hasRetro,
      difficulties: e.difficulties ?? "",
      solutions: e.solutions ?? "",
      bilanPersonnel: e.bilanPersonnel ?? "",
      observations: e.observations ?? "",
    };
  });

  return {
    totalHours, regularHours, overtimeHours,
    totalTasks: userTasks.length, completedTasks, completionRate,
    involvedProjects, dailyLogs, rangeComments, weeksCovered,
    entryCount: rangeEntries.length,
  };
}

function esc(str = "") {
  return String(str).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

export function buildInternReportHtml({ user, startDate, endDate, report, logoUrl }) {
  const roleLabel = user.globalRoles?.includes("ADMIN")
    ? "Administrateur"
    : (user.departmentRoles || []).map((dr) => `${dr.role === "SCRUM_MASTER" ? "Scrum Master" : "Membre"} · ${dr.departmentName}`).join(", ") || "—";

  const fmtDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const fmtDateShort = (d) => new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" });

  const statsCards = [
    { label: "Heures totales", value: `${report.totalHours.toFixed(1)}h` },
    { label: "Heures normales", value: `${report.regularHours.toFixed(1)}h` },
    { label: "Heures supplémentaires", value: `${report.overtimeHours.toFixed(1)}h` },
    { label: "Semaines couvertes", value: report.weeksCovered },
    { label: "Jours de présence", value: report.entryCount },
    { label: "Tâches terminées", value: report.completedTasks },
    { label: "Taux de complétion", value: `${report.completionRate}%` },
    { label: "Projets impliqués", value: report.involvedProjects.length },
  ];

  const projectsList = report.involvedProjects.length
    ? report.involvedProjects.map((p) => `<li>${esc(p.name)}</li>`).join("")
    : "<li style='color:#94a3b8'>Aucun projet enregistré sur cette période.</li>";

  const dailyRows = report.dailyLogs.length
    ? report.dailyLogs.map((d) => `
        <tr>
          <td>${fmtDateShort(d.date)}</td>
          <td>${esc(d.projectName) || "—"}</td>
          <td>${esc(d.taskTitle) || "—"}</td>
          <td>${esc(d.description) || "—"}</td>
          <td style="text-align:center">${d.regularHours.toFixed(1)}</td>
          <td style="text-align:center">${d.overtimeHours.toFixed(1)}</td>
          <td style="text-align:center;font-weight:600">${d.total.toFixed(1)}</td>
        </tr>`).join("")
    : `<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:20px">Aucune journée enregistrée sur cette période.</td></tr>`;

  const retroDays = report.dailyLogs.filter((d) => d.hasRetro);
  const retroBlocks = retroDays.length
    ? retroDays.map((d) => `
        <div class="retro-day">
          <h4>${fmtDate(d.date)}</h4>
          <div class="retro-grid">
            <div><strong>Difficultés rencontrées</strong><p>${esc(d.difficulties) || "—"}</p></div>
            <div><strong>Solutions proposées</strong><p>${esc(d.solutions) || "—"}</p></div>
            <div><strong>Bilan de la journée</strong><p>${esc(d.bilanPersonnel) || "—"}</p></div>
            <div><strong>Observations</strong><p>${esc(d.observations) || "—"}</p></div>
          </div>
        </div>`).join("")
    : "<p style='color:#94a3b8;font-size:13px'>Aucun bilan journalier enregistré sur cette période.</p>";

  const commentsBlock = report.rangeComments.length
    ? `<ul class="comments-list">${report.rangeComments.map((c) => `
        <li><strong>${esc(c.authorName)}</strong> — semaine du ${fmtDate(c.weekStart)}<p>${esc(c.content)}</p></li>`).join("")}</ul>`
    : "<p style='color:#94a3b8;font-size:13px'>Aucun commentaire d'encadrement enregistré.</p>";

  const logoBlock = logoUrl
    ? `<img src="${logoUrl}" alt="Aaprovidir" style="height:44px;object-fit:contain" />`
    : `<div style="font-size:20px;font-weight:700;color:#0B438C">Aaprovidir</div>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Attestation de stage — ${esc(user.firstName)} ${esc(user.lastName)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 40px 48px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0B438C; padding-bottom: 20px; margin-bottom: 28px; }
  .brand-sub { font-size: 11px; color: #20A036; letter-spacing: 0.5px; margin-top: 4px; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 17px; margin: 0; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; }
  .doc-title p { font-size: 12px; color: #64748b; margin: 4px 0 0; }
  .intern-card { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #FBF7F3, #eef4ea); border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; }
  .intern-name { font-size: 22px; font-weight: 700; color: #0B438C; }
  .intern-meta { font-size: 13px; color: #64748b; margin-top: 4px; }
  .badge { display: inline-block; background: #20A036; color: white; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 999px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 32px; }
  .stat-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
  .stat-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; font-weight: 600; }
  .stat-value { font-size: 22px; font-weight: 700; color: #0B438C; margin-top: 4px; }
  h2.section { font-size: 15px; color: #0B438C; border-left: 4px solid #20A036; padding-left: 10px; margin: 32px 0 14px; page-break-after: avoid; }
  ul.plain-list { margin: 0; padding-left: 18px; font-size: 13px; }
  table.daily-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  table.daily-table th { text-align: left; background: #FBF7F3; padding: 8px 10px; font-size: 10px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
  table.daily-table td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
  .retro-day { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px; page-break-inside: avoid; }
  .retro-day h4 { margin: 0 0 12px; font-size: 13px; color: #0B438C; }
  .retro-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .retro-grid strong { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; }
  .retro-grid p { font-size: 12.5px; margin: 4px 0 0; color: #334155; white-space: pre-wrap; }
  .comments-list { list-style: none; padding: 0; margin: 0; }
  .comments-list li { border-left: 3px solid #FFDE21; background: #fffbea; border-radius: 6px; padding: 10px 14px; margin-bottom: 10px; font-size: 12.5px; }
  .comments-list p { margin: 4px 0 0; color: #334155; }
  .signatures { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
  .signature-box { width: 45%; text-align: center; }
  .signature-line { border-top: 1px solid #94a3b8; margin-top: 50px; padding-top: 6px; font-size: 11px; color: #64748b; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print { body { padding: 24px 32px; } }
</style></head>
<body>
  <div class="header">
    <div>
      ${logoBlock}
      <div class="brand-sub">Nourrir un avenir radieux</div>
    </div>
    <div class="doc-title">
      <h1>Attestation de stage</h1>
      <p>Du ${fmtDate(startDate)} au ${fmtDate(endDate)}</p>
    </div>
  </div>

  <div class="intern-card">
    <div>
      <div class="intern-name">${esc(user.firstName)} ${esc(user.lastName)}</div>
      <div class="intern-meta">${esc(user.email)}</div>
      <div class="intern-meta">${esc(roleLabel)}</div>
    </div>
    <span class="badge">Stage effectué chez Aaprovidir</span>
  </div>

  <h2 class="section">Synthèse d'activité</h2>
  <div class="stats-grid">
    ${statsCards.map((s) => `<div class="stat-card"><div class="stat-label">${esc(s.label)}</div><div class="stat-value">${esc(s.value)}</div></div>`).join("")}
  </div>

  <h2 class="section">Projets sur lesquels ${esc(user.firstName)} a travaillé</h2>
  <ul class="plain-list">${projectsList}</ul>

  <h2 class="section">Journal quotidien</h2>
  <table class="daily-table">
    <thead><tr><th>Date</th><th>Projet</th><th>Tâche</th><th>Description</th><th>Normales</th><th>Sup.</th><th>Total</th></tr></thead>
    <tbody>${dailyRows}</tbody>
  </table>

  <h2 class="section">Bilans journaliers</h2>
  ${retroBlocks}

  <h2 class="section">Retours de l'encadrement</h2>
  ${commentsBlock}

  <div class="signatures">
    <div class="signature-box"><div class="signature-line">Signature du Scrum Master / Encadrant</div></div>
    <div class="signature-box"><div class="signature-line">Cachet Aaprovidir</div></div>
  </div>

  <div class="footer">Document généré automatiquement depuis BrainBooster — Aaprovidir · ${new Date().toLocaleDateString("fr-FR")}</div>
</body></html>`;
}