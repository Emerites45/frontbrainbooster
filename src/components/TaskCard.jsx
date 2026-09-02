import { STATUS_LABEL, getAssigneeNames } from "../utils/dashboardHelpers";
import TaskTypeBadge from "./dashboard/TaskTypeBadge";


const STATUS_STYLES = {
  A_FAIRE: "bg-amber-50 text-amber-700",
  EN_COURS: "bg-blue-50 text-blue-700",
  TERMINE: "bg-green-50 text-green-700",
};

const PRIORITY_DOT = {
  BASSE: "bg-slate-300",
  MOYENNE: "bg-blue-400",
  HAUTE: "bg-orange-400",
  CRITIQUE: "bg-red-500",
};

function TaskCard({
  title,
  status,
  priority,
  type,
  assigneeIds = [],
  users = [],
  onStatusChange,
  onClick,
}) {
  function handleStatusClick(e) {
    e.stopPropagation();
    onStatusChange();
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-100 p-4 cursor-pointer hover:border-slate-200 hover:shadow-sm transition-all"
    >
      <h3 className="text-[13.5px] font-medium text-slate-800 mb-2.5">
        {title}
      </h3>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {type && <TaskTypeBadge type={type} size="xs" />}

        <span
          className={`inline-flex items-center rounded-full text-[10.5px] font-semibold px-2.5 py-1 ${
            STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {STATUS_LABEL[status] ?? status}
        </span>

        {priority && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              PRIORITY_DOT[priority] ?? "bg-slate-300"
            }`}
            title={priority}
          />
        )}
      </div>

      <p className="text-[12px] text-slate-400 mb-3 truncate">
        {getAssigneeNames(assigneeIds, users) || "Non assigné"}
      </p>

      <div className="pt-3 border-t border-slate-50">
        <button
          onClick={handleStatusClick}
          className="text-[12px] font-medium text-blue-600 hover:text-blue-700"
        >
          Changer statut →
        </button>
      </div>
    </div>
  );
}

export default TaskCard;