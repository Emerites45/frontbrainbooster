import { Bug, CheckSquare, BookOpen, Layers, Flag } from "lucide-react";

export const TASK_TYPES = {
  TASK: { label: "Tâche", icon: CheckSquare, color: "text-blue-600", bg: "bg-blue-50" },
  BUG: { label: "Bug", icon: Bug, color: "text-red-600", bg: "bg-red-50" },
  STORY: { label: "User Story", icon: BookOpen, color: "text-green-600", bg: "bg-green-50" },
  EPIC: { label: "Epic", icon: Layers, color: "text-purple-600", bg: "bg-purple-50" },
  MILESTONE: { label: "Jalon", icon: Flag, color: "text-amber-600", bg: "bg-amber-50" },
};

export function taskTypeConfig(type) {
  return TASK_TYPES[type] ?? TASK_TYPES.TASK;
}