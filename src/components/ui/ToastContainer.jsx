import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { subscribeToast, getToasts } from "../../utils/toast";

const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
const STYLES = { success: "bg-green-600", error: "bg-red-600", warning: "bg-amber-500", info: "bg-blue-600" };

function ToastContainer() {
  const [toasts, setToasts] = useState(getToasts());

  useEffect(() => subscribeToast(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-[90vw] sm:max-w-[340px]">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] ?? Info;
        return (
          <div key={t.id} className={`flex items-center gap-2.5 rounded-xl text-white text-[13px] font-medium px-4 py-3 shadow-lg ${STYLES[t.type] ?? STYLES.info}`}>
            <Icon size={16} className="shrink-0" />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;