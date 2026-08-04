import { useState } from "react";
import TaskColumn from "../components/TaskColumn";
import TaskModal from "../components/TaskModal";
import NewTaskModal from "../components/NewTaskModal";
import "./AdminDashboard.css";
import "./Board.css";

function BoardPage({
  tasks,
  users,
  projects,
  currentUser,
  loading,
  error,
  selectedTask,
  setSelectedTask,
  actions,
  onStatusChange,
  onCreateTask,
  onCreateSubtask,
  onEditTask,
  onDeleteTask,
}) {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  if (loading) return <p className="loading-text">Chargement des tâches...</p>;
  if (error) return <p className="empty-state">Erreur : {error}</p>;

  // Seuls Admin et Scrum Master créent des tâches — un Membre ne fait que
  // consulter/avancer les siennes (cohérent avec la vue F4 "Membre").
  const isAdmin = currentUser?.globalRoles?.includes("ADMIN");
  const isScrumMaster = currentUser?.departmentRoles?.some((dr) => dr.role === "SCRUM_MASTER");
  const canCreateTask = isAdmin || isScrumMaster;

  const rootTasks = tasks.filter((t) => !t.parentTaskId);
  const aFaire = rootTasks.filter((t) => t.status === "A_FAIRE");
  const enCours = rootTasks.filter((t) => t.status === "EN_COURS");
  const termine = rootTasks.filter((t) => t.status === "TERMINE");

  return (
    <>
      <div className="board-page">
        <div className="board-header">
          {canCreateTask && (
            <button className="btn-new-task" onClick={() => setShowNewTaskModal(true)}>
              + Nouvelle tâche
            </button>
          )}
        </div>

        <div className="board-columns">
          <TaskColumn
            title="À faire"
            tasks={aFaire}
            users={users}
            onStatusChange={onStatusChange}
            onCardClick={setSelectedTask}
          />
          <TaskColumn
            title="En cours"
            tasks={enCours}
            users={users}
            onStatusChange={onStatusChange}
            onCardClick={setSelectedTask}
          />
          <TaskColumn
            title="Terminé"
            tasks={termine}
            users={users}
            onStatusChange={onStatusChange}
            onCardClick={setSelectedTask}
          />
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          allTasks={tasks}
          users={users}
          actions={actions}
          onClose={() => setSelectedTask(null)}
          onCreateSubtask={onCreateSubtask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      )}

      {showNewTaskModal && canCreateTask && (
        <NewTaskModal
          users={users}
          projects={projects}
          currentUser={currentUser}
          onClose={() => setShowNewTaskModal(false)}
          onCreate={onCreateTask}
        />
      )}
    </>
  );
}

export default BoardPage;