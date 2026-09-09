import { useState, useEffect } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

function BackendStatusBadge() {
  const [status, setStatus] = useState("checking"); // checking | online | offline

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // Render peut être lent au réveil

    fetch(`${apiUrl}/api/v1/auth/login`, { method: "OPTIONS", signal: controller.signal })
      .then(() => setStatus("online"))
      .catch(() => setStatus("offline"))
      .finally(() => clearTimeout(timeout));

    return () => controller.abort();
  }, []);

  const config = {
    checking: { icon: Loader2, text: "Vérification...", color: "text-slate-400", spin: true },
    online: { icon: Wifi, text: "Backend en ligne", color: "text-green-600", spin: false },
    offline: { icon: WifiOff, text: "Backend injoignable", color: "text-red-500", spin: false },
  }[status];

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2 text-[12.5px]">
      <Icon size={14} className={`${config.color} ${config.spin ? "animate-spin" : ""}`} />
      <span className={config.color}>{config.text}</span>
      <span className="text-slate-300">·</span>
      <span className="text-slate-400 truncate">{import.meta.env.VITE_API_URL}</span>
    </div>
  );
}

export default BackendStatusBadge;