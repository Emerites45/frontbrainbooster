import { useState } from "react";
import { X, FileText, Table2, Braces } from "lucide-react";

function toCsv(rows) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  return lines.join("\n");
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ExportModal({ data, filenameBase = "export", onClose }) {
  const [format, setFormat] = useState("CSV");

  function handleExport() {
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "CSV") {
      downloadBlob(toCsv(data), `${filenameBase}-${stamp}.csv`, "text/csv");
    } else if (format === "JSON") {
      downloadBlob(JSON.stringify(data, null, 2), `${filenameBase}-${stamp}.json`, "application/json");
    } else {
      // PDF — MVP via impression navigateur (pas de lib PDF ajoutée pour l'instant).
      const rows = data.map((r) => `<tr>${Object.values(r).map((v) => `<td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px">${v ?? "—"}</td>`).join("")}</tr>`).join("");
      const headers = data[0] ? Object.keys(data[0]).map((h) => `<th style="text-align:left;padding:6px 10px;font-size:11px;color:#666">${h}</th>`).join("") : "";
      const win = window.open("", "_blank");
      win.document.write(`<html><head><title>${filenameBase}</title></head><body><h2>${filenameBase}</h2><table style="border-collapse:collapse;width:100%">${headers ? `<thead><tr>${headers}</tr></thead>` : ""}<tbody>${rows}</tbody></table></body></html>`);
      win.document.close();
      win.print();
    }
    onClose();
  }

  const options = [
    { key: "PDF", label: "PDF", desc: "Ouvre l'aperçu d'impression", icon: FileText },
    { key: "CSV", label: "CSV", desc: "Compatible Excel", icon: Table2 },
    { key: "JSON", label: "JSON", desc: "Format structuré", icon: Braces },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[440px] p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-[17px] font-semibold text-slate-900">Exporter les données</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <p className="text-[13px] text-slate-400 mb-5">
          Exporte les {data.length} entrée{data.length > 1 ? "s" : ""} actuellement filtrée{data.length > 1 ? "s" : ""}.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {options.map((o) => {
            const Icon = o.icon;
            const active = format === o.key;
            return (
              <button
                key={o.key}
                onClick={() => setFormat(o.key)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                  active ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon size={22} className={active ? "text-blue-600" : "text-slate-400"} />
                <span className="text-[13px] font-medium text-slate-800">{o.label}</span>
                <span className="text-[10.5px] text-slate-400 text-center">{o.desc}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleExport}
          disabled={data.length === 0}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-medium py-2.5 transition-colors disabled:opacity-50"
        >
          Générer l'export
        </button>
      </div>
    </div>
  );
}

export default ExportModal;