import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare, RefreshCw, MessageSquare, Star, Bell, CheckCheck } from "lucide-react";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../api/api";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/dashboard/Pagination";

const TYPE_ICON = { TASK_ASSIGNED: CheckSquare, STATUS_CHANGE: RefreshCw, COMMENT: MessageSquare, PERFORMANCE_COMMENT: Star };
const TYPE_LABEL = { TASK_ASSIGNED: "Assignation", STATUS_CHANGE: "Changement de statut", COMMENT: "Commentaire", PERFORMANCE_COMMENT: "Commentaire performance" };

function timeAgo(iso) {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  return `il y a ${Math.floor(diffH / 24)}j`;
}

function NotificationsPage({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const navigate = useNavigate();

  function load() {
    setLoading(true);
    fetchNotifications(currentUser.id).then(setNotifications).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [currentUser?.id]);

  const filtered = useMemo(() => {
    if (tab === "UNREAD") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, tab]);

  const { pageItems, page, totalPages, rangeStart, rangeEnd, totalItems, goToPage } = usePagination(filtered, 12);
  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleClick(n) {
    if (!n.read) await markNotificationRead(n.id);
    load();
    if (n.link) navigate(n.link);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead(currentUser.id);
    load();
  }

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900">Notifications</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">{unreadCount} non lue{unreadCount > 1 ? "s" : ""} sur {notifications.length}.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-medium px-4 py-2.5 transition-colors">
            <CheckCheck size={15} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="inline-flex items-center rounded-xl p-1 bg-slate-100">
        {[["ALL", "Toutes"], ["UNREAD", "Non lues"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <p className="text-[13px] text-slate-400 text-center py-12">Chargement...</p>
        ) : pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Bell size={28} className="text-slate-300 mb-3" />
            <p className="text-[13.5px] text-slate-400">Aucune notification{tab === "UNREAD" ? " non lue" : ""}.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {pageItems.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Bell;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-slate-50/60 transition-colors ${!n.read ? "bg-blue-50/30" : ""}`}
                  >
                    <span className="flex items-center justify-center rounded-full bg-slate-100 text-slate-500 w-9 h-9 shrink-0">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-slate-800">{n.title}</p>
                      <p className="text-[12.5px] text-slate-500 mt-0.5">{n.message}</p>
                      <span className="text-[11px] text-slate-400 mt-1 inline-block">{timeAgo(n.createdAt)}</span>
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded-full text-[10.5px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-500">
                      {TYPE_LABEL[n.type] ?? n.type}
                    </span>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={page} totalPages={totalPages} rangeStart={rangeStart} rangeEnd={rangeEnd} totalItems={totalItems} onPageChange={goToPage} itemLabel="notifications" />
      </div>
    </div>
  );
}

export default NotificationsPage;