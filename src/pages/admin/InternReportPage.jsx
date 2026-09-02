import { useState, useEffect } from "react";

import { FileDown, User, Calendar } from "lucide-react";

import {
  fetchUsers,
  fetchTimesheetEntries,
  fetchPerformanceComments,
} from "../../api/api";

import {
  computeInternReport,
  buildInternReportHtml,
} from "../../utils/internReport";

function InternReportPage({ tasks = [], projects = [] }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generating, setGenerating] = useState(false);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  const selectedUser = users.find(
    (u) => u.id === Number(selectedUserId)
  );

  async function handleDetectRange() {
    if (!selectedUserId) return;

    setDetecting(true);

    try {
      const entries = await fetchTimesheetEntries({
        userId: selectedUserId,
      });

      if (entries.length === 0) {
        alert(
          "Aucune donnée de suivi trouvée pour cet utilisateur — entrez les dates manuellement."
        );
        return;
      }

      const dates = entries.map((e) => e.date).sort();

      setStartDate(dates[0]);
      setEndDate(dates[dates.length - 1]);
    } finally {
      setDetecting(false);
    }
  }

  function handleGenerate() {
    if (!selectedUser || !startDate || !endDate) return;

    // Ouvrir la fenêtre IMMÉDIATEMENT et de façon synchrone (avant tout await),
    // sinon le navigateur bloque le popup car il ne le considère plus comme
    // une action directe de l'utilisateur.
    const win = window.open("", "_blank");

    if (!win) {
      alert(
        "Le navigateur a bloqué l'ouverture de la fenêtre. Autorisez les popups pour ce site puis réessayez."
      );
      return;
    }

    win.document.write(
      "<p style='font-family:sans-serif;padding:40px;color:#64748b'>Génération du rapport en cours...</p>"
    );

    setGenerating(true);

    (async () => {
      try {
        const [entries, comments] = await Promise.all([
          fetchTimesheetEntries({
            userId: selectedUser.id,
          }),
          fetchPerformanceComments({
            userId: selectedUser.id,
          }),
        ]);

        const report = computeInternReport({
          user: selectedUser,
          tasks,
          projects,
          entries,
          comments,
          startDate,
          endDate,
        });

        const logoUrl = `${window.location.origin}/assets/brand/logo.png`;

        const html = buildInternReportHtml({
          user: selectedUser,
          startDate,
          endDate,
          report,
          logoUrl,
        });

        win.document.open();
        win.document.write(html);
        win.document.close();

        setTimeout(() => win.print(), 300);
      } catch (err) {
        win.document.body.innerHTML = `
          <p style="font-family:sans-serif;padding:40px;color:#dc2626">
            Erreur lors de la génération : ${err.message}
          </p>
        `;
      } finally {
        setGenerating(false);
      }
    })();
  }

  return (
    <div className="px-8 py-6 space-y-6 max-w-[640px]">
      <div>
        <h1 className="text-[20px] font-semibold text-slate-900">
          Rapport de stage
        </h1>

        <p className="text-[13px] text-slate-400 mt-0.5">
          Génère un rapport PDF récapitulatif pour un stagiaire sur une période
          donnée — heures travaillées, tâches, bilans hebdomadaires et retours
          d'encadrement.
        </p>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200/70 p-5 space-y-4">
        <div>
          <label className="text-[12px] font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
            <User size={13} />
            Stagiaire
          </label>

          <select
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setStartDate("");
              setEndDate("");
            }}
            className="w-full rounded-lg border border-slate-200 bg-white text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
          >
            <option value="">Sélectionner un utilisateur</option>

            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5">
              <Calendar size={13} />
              Période
            </label>

            <button
              onClick={handleDetectRange}
              disabled={!selectedUserId || detecting}
              className="text-[11.5px] font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40"
            >
              {detecting
                ? "Détection..."
                : "Détecter automatiquement (1er au dernier jour)"}
            </button>
          </div>

          <div className="flex gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-white text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-white text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={
          !selectedUserId ||
          !startDate ||
          !endDate ||
          generating
        }
        className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-medium px-5 py-2.5 transition-colors disabled:opacity-50"
      >
        <FileDown size={16} />

        {generating
          ? "Génération..."
          : "Générer le rapport PDF"}
      </button>
    </div>
  );
}

export default InternReportPage;
