import { taskTypeConfig } from "../../utils/taskTypes";

function TaskTypeBadge({ type, size = "sm" }) {
  const config = taskTypeConfig(type);
  const Icon = config.icon;
  const isXs = size === "xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${config.bg} ${config.color} ${isXs ? "text-[9.5px] px-1.5 py-0.5" : "text-[10.5px] px-2 py-0.5"}`}>
      <Icon size={isXs ? 9 : 11} />
      {config.label}
    </span>
  );
}

export default TaskTypeBadge;