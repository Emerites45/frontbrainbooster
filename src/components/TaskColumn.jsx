import TaskCard from "./TaskCard";
import { getAssigneeIds } from "../utils/dashboardHelpers";

function TaskColumn({
  title,
  tasks,
  users,
  onStatusChange,
  onCardClick,
}) {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h2 className="text-[13px] font-semibold text-slate-700">
          {title}
        </h2>

        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold w-5 h-5">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {tasks.length === 0 && (
          <p className="text-[12.5px] text-slate-300 text-center py-6">
            Aucune tâche.
          </p>
        )}

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            status={task.status}
            priority={task.priority}
            type={task.type}
            assigneeIds={getAssigneeIds(task)}
            users={users}
            onStatusChange={() => onStatusChange(task.id)}
            onClick={() => onCardClick(task)}
          />
        ))}
      </div>
    </div>
  );
}

export default TaskColumn;