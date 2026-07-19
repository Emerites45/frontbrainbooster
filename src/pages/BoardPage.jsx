import { useState } from "react";
import TaskColumn from "../components/TaskColumn";
import TaskModal from "../components/TaskModal";
import NewTaskModal from "../components/NewTaskModal";

function BoardPage({ tasks, loading, error, selectedTask, setSelectedTask, actions, onStatusChange, onCreateTask }) {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  if (loading) return <p>Chargement des tâches...</p>;
  if (error) return <p>Erreur : {error}</p>;

  const rootTasks = tasks.filter((t) => !t.parentTaskId);
  const aFaire = rootTasks.filter((t) => t.status === "A_FAIRE");
  const enCours = rootTasks.filter((t) => t.status === "EN_COURS");
  const termine = rootTasks.filter((t) => t.status === "TERMINE");

  return (
    <>
      <button onClick={() => setShowNewTaskModal(true)}>+ Nouvelle tâche</button>
      <div style={{ display: "flex" }}>
        <TaskColumn title="À faire" tasks={aFaire} onStatusChange={onStatusChange} onCardClick={setSelectedTask} />
        <TaskColumn title="En cours" tasks={enCours} onStatusChange={onStatusChange} onCardClick={setSelectedTask} />
        <TaskColumn title="Terminé" tasks={termine} onStatusChange={onStatusChange} onCardClick={setSelectedTask} />
      </div>
      {selectedTask && (
        <TaskModal task={selectedTask} allTasks={tasks} actions={actions} onClose={() => setSelectedTask(null)} />
      )}
      {showNewTaskModal && (
        <NewTaskModal onClose={() => setShowNewTaskModal(false)} onCreate={onCreateTask} />
      )}
    </>
  );
}

export default BoardPage;