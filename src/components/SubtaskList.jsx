function SubtaskList({ subtasks }) {
  if (subtasks.length === 0) {
    return <p>Aucune sous-tâche.</p>;
  }

  return (
    <ul>
      {subtasks.map((subtask) => (
        <li key={subtask.id}>
          <input type="checkbox" checked={subtask.status === "TERMINE"} readOnly />
          {subtask.title}
        </li>
      ))}
    </ul>
  );
}

export default SubtaskList;