import { useState } from "react";

function ArchivesPage({
  tasks = [],
  projects = [],
  onRestoreTask,
  onRestoreProject,
}) {
  const [tab, setTab] = useState("tasks");

  const archivedTasks = tasks.filter((t) => t.archived);
  const archivedProjects = projects.filter((p) => p.archived);

  const projectNameFor = (projectId) =>
    projects.find((p) => p.id === projectId)?.name ?? "—";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Archives
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Retrouvez ici les tâches et projets archivés. Vous pouvez les
        restaurer à tout moment.
      </p>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("tasks")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "tasks"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Tâches ({archivedTasks.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("projects")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "projects"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Projets ({archivedProjects.length})
        </button>
      </div>

      {tab === "tasks" && (
        <div className="mt-4">
          {archivedTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Aucune tâche archivée.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {archivedTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {task.title}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {projectNameFor(task.projectId)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRestoreTask?.(task.id, "A_FAIRE")}
                      className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      À faire
                    </button>
                    <button
                      type="button"
                      onClick={() => onRestoreTask?.(task.id, "EN_COURS")}
                      className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      En cours
                    </button>
                    <button
                      type="button"
                      onClick={() => onRestoreTask?.(task.id, "TERMINE")}
                      className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Terminé
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "projects" && (
        <div className="mt-4">
          {archivedProjects.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Aucun projet archivé.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {archivedProjects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <p className="truncate font-medium text-gray-900">
                    {project.name}
                  </p>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRestoreProject?.(project.id, "A_FAIRE")}
                      className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      À faire
                    </button>
                    <button
                      type="button"
                      onClick={() => onRestoreProject?.(project.id, "EN_COURS")}
                      className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      En cours
                    </button>
                    <button
                      type="button"
                      onClick={() => onRestoreProject?.(project.id, "TERMINE")}
                      className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Terminé
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default ArchivesPage;