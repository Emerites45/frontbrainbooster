import {
  STATUS_LABEL,
  initials,
  projectProgress,
  projectTeam,
} from "../../utils/dashboardHelpers";
import Pagination from "./Pagination";

const STATUS_STYLES = {
  A_FAIRE: "bg-amber-50 text-amber-700",
  EN_COURS: "bg-blue-50 text-blue-700",
  TERMINE: "bg-green-50 text-green-700",
};

function ProjectsTable({
  title = "Projets",
  projects = [],
  tasks = [],
  users = [],
  departments = [],
  showDepartment = false,
  showTeam = false,
  onProjectClick,
  pagination,
}) {
  const deptName = (id) =>
    departments.find((d) => d.id === id)?.name ?? "—";

  const columnCount =
    3 + (showDepartment ? 1 : 0) + (showTeam ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Title */}
      {title && (
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-slate-900">
            {title}
          </h2>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Projet
              </th>

              {showDepartment && (
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Département
                </th>
              )}

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Statut
              </th>

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Progression
              </th>

              {showTeam && (
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Équipe
                </th>
              )}

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Échéance
              </th>
            </tr>
          </thead>

          <tbody>
            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  Aucun projet.
                </td>
              </tr>
            )}

            {projects.map((project, index) => {
              const progress = projectProgress(project, tasks);

              const team = showTeam
                ? projectTeam(project, tasks, users)
                : [];

              return (
                <tr
                  key={project.id}
                  className={
                    index !== projects.length - 1
                      ? "border-b border-slate-50"
                      : ""
                  }
                >
                  {/* Project */}
                  <td
                    className={`px-5 py-3.5 text-[13.5px] font-medium ${
                      onProjectClick
                        ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                        : "text-slate-800"
                    }`}
                    onClick={() => onProjectClick?.(project)}
                  >
                    {project.name}
                  </td>

                  {/* Department */}
                  {showDepartment && (
                    <td className="px-5 py-3.5 text-[13px] text-slate-600">
                      {deptName(project.departmentId)}
                    </td>
                  )}

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        STATUS_STYLES[project.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {STATUS_LABEL[project.status] ??
                        project.status?.replace("_", " ")}
                    </span>
                  </td>

                  {/* Progress */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <span className="text-[12px] font-medium text-slate-600">
                        {progress}%
                      </span>
                    </div>
                  </td>

                  {/* Team */}
                  {showTeam && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center">
                        {team.slice(0, 3).map((user, index) => (
                          <span
                            key={user.id}
                            title={`${user.firstName} ${user.lastName}`}
                            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-[10.5px] font-semibold text-white ${
                              index !== 0 ? "-ml-2" : ""
                            }`}
                          >
                            {initials(
                              user.firstName,
                              user.lastName
                            )}
                          </span>
                        ))}

                        {team.length > 3 && (
                          <span className="ml-1 text-xs font-medium text-slate-500">
                            +{team.length - 3}
                          </span>
                        )}

                        {team.length === 0 && (
                          <span className="text-sm text-slate-400">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Deadline */}
                  <td className="px-5 py-3.5 text-[13px] text-slate-600">
                    {project.endDate ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Optional pagination */}
      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          rangeStart={pagination.rangeStart}
          rangeEnd={pagination.rangeEnd}
          totalItems={pagination.totalItems}
          onPageChange={pagination.onPageChange}
          itemLabel="projets"
        />
      )}
    </div>
  );
}

export default ProjectsTable;