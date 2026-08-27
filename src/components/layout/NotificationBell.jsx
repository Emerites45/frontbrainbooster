import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckSquare, RefreshCw, MessageSquare, Star } from "lucide-react";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../../api/api";

const TYPE_ICON = {
  TASK_ASSIGNED: CheckSquare,
  STATUS_CHANGE: RefreshCw,
  COMMENT: MessageSquare,
  PERFORMANCE_COMMENT: Star,
};

function timeAgo(iso) {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  return `il y a ${Math.floor(diffH / 24)}j`;
}

function NotificationBell({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  function load() {
    if (!currentUser?.id) return;
    fetchNotifications(currentUser.id).then(setNotifications);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recent = notifications.slice(0, 6);

  async function handleItemClick(n) {
    if (!n.read) {
      await markNotificationRead(n.id);
      load();
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead(currentUser.id);
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-slate-400 hover:text-blue-600 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold w-4 h-4">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
            <span className="text-[13.5px] font-semibold text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-[11.5px] font-medium text-blue-600 hover:text-blue-700">
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {recent.length === 0 ? (
              <p className="text-[13px] text-slate-400 text-center py-8">Aucune notification.</p>
            ) : (
              recent.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-50 last:border-none hover:bg-slate-50/70 transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}
                  >
                    <span className="flex items-center justify-center rounded-full bg-slate-100 text-slate-500 w-8 h-8 shrink-0">
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-medium text-slate-800 truncate">{n.title}</p>
                      <p className="text-[12px] text-slate-500 truncate">{n.message}</p>
                      <span className="text-[10.5px] text-slate-400">{timeAgo(n.createdAt)}</span>
                    </div>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
          <button
            onClick={() => { setOpen(false); navigate("/notifications"); }}
            className="w-full text-center text-[12.5px] font-medium text-blue-600 hover:text-blue-700 py-2.5 border-t border-slate-50"
          >
            Voir toutes les notifications
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;