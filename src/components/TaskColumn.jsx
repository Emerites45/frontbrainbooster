import TaskCard from './TaskCard';

function TaskColumn({ title, tasks, onStatusChange, onCardClick }) {
  return (
    <div style={{ flex: 1, padding: '12px' }}>
      <h2>{title} ({tasks.length})</h2>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          title={task.title}
          status={task.status}
          onStatusChange={() => onStatusChange(task.id)}
          onClick={() => onCardClick(task)}
        />
      ))}
    </div>
  );
}

export default TaskColumn;