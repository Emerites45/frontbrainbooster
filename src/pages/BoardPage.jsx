import { useState } from "react";
import TaskColumn from "../components/TaskColumn";
import TaskModal from "../components/TaskModal";
import NewTaskModal from "../components/NewTaskModal";

function BoardPage({
  tasks,
  loading,
  error,
  selectedTask,
  setSelectedTask,
  actions,
  onStatusChange,
  onCreateTask,
  onCreateSubtask,
  onEditTask,    // <-- AJOUTÉ ICI
  onDeleteTask,  // <-- AJOUTÉ ICI
}) {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  if (loading) return <p>Chargement des tâches...</p>;
  if (error) return <p>Erreur : {error}</p>;

  const rootTasks = tasks.filter((t) => !t.parentTaskId);
  const aFaire = rootTasks.filter((t) => t.status === "A_FAIRE");
  const enCours = rootTasks.filter((t) => t.status === "EN_COURS");
  const termine = rootTasks.filter((t) => t.status === "TERMINE");

  return (
    <>
      <div style={{ padding: "24px 40px" }}>
        <button onClick={() => setShowNewTaskModal(true)}>
          + Nouvelle tâche
        </button>

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          <TaskColumn
            title="À faire"
            tasks={aFaire}
            onStatusChange={onStatusChange}
            onCardClick={setSelectedTask}
          />
          <TaskColumn
            title="En cours"
            tasks={enCours}
            onStatusChange={onStatusChange}
            onCardClick={setSelectedTask}
          />
          <TaskColumn
            title="Terminé"
            tasks={termine}
            onStatusChange={onStatusChange}
            onCardClick={setSelectedTask}
          />
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          allTasks={tasks}
          actions={actions}
          onClose={() => setSelectedTask(null)}
          onCreateSubtask={onCreateSubtask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      )}

      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onCreate={onCreateTask}
        />
      )}
    </>
  );
}

export default BoardPage;
