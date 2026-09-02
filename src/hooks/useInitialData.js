import { useState, useEffect } from "react";
import { fetchTasks } from "../api/tasks.api";
import { fetchProjects, createProject, updateProject, deleteProject } from "../api/projects.api";
import { fetchUsers, fetchDepartments } from "../api/users.api";
import { fetchActions, createAction } from "../api/actions.api";
import { normalizeAssignments } from "../utils/dashboardHelpers";

const NEXT_STATUS = {
  A_FAIRE: "EN_COURS",
  EN_COURS: "TERMINE",
  TERMINE: "A_FAIRE",
};

function generateActionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useInitialData(currentUser) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchTasks(),
      fetchProjects(),
      fetchUsers(),
      fetchActions(),
      fetchDepartments(),
    ])
      .then(([tasksData, projectsData, usersData, actionsData, departmentsData]) => {
        setTasks(tasksData);
        setProjects(projectsData);
        setUsers(usersData);
        setActions(actionsData);
        setDepartments(departmentsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function persistAction(action) {
    try {
      await createAction(action);
    } catch (err) {
      console.error("Impossible d'enregistrer l'action dans l'historique :", err);
    }
  }

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      setProjects((prev) => [...prev, newProject]);
    } catch (err) {
      alert("Erreur lors de la création du projet");
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      const updated = await updateProject(projectId, updates);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updated } : p))
      );
    } catch (err) {
      alert("Erreur lors de la modification du projet");
      throw err;
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      alert("Erreur lors de la suppression du projet");
    }
  };

  function handleStatusChange(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const ancienStatut = task.status;
    const nouveauStatut = NEXT_STATUS[ancienStatut];

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: nouveauStatut } : t
      )
    );

    const newAction = {
      id: generateActionId(),
      id_tache: taskId,
      id_user: currentUser?.email ?? "inconnu",
      nom_user: currentUser?.firstName ?? "Utilisateur",
      type_action: "CHANGEMENT_STATUT",
      champ_modifie: "statut",
      ancienne_valeur: ancienStatut,
      nouvelle_valeur: nouveauStatut,
      date_action: new Date().toISOString(),
    };

    setActions((prevActions) => [...prevActions, newAction]);
    persistAction(newAction);
  }

  function handleCreateTask(newTask) {
    const normalized = normalizeAssignments(newTask.assignments, currentUser);

    const assignments =
      normalized.length > 0
        ? normalized
        : currentUser?.id
          ? [
              {
                userId: currentUser.id,
                assignedBy: currentUser.id,
                assignedAt: new Date().toISOString(),
              },
            ]
          : [];

    const taskWithMeta = {
      ...newTask,
      creatorId: currentUser?.id ?? null,
      assignments,
    };

    setTasks((prevTasks) => [...prevTasks, taskWithMeta]);

    const newAction = {
      id: generateActionId(),
      id_tache: taskWithMeta.id,
      id_user: currentUser?.email ?? "inconnu",
      nom_user: currentUser?.firstName ?? "Utilisateur",
      type_action: "CREATION",
      champ_modifie: null,
      ancienne_valeur: null,
      nouvelle_valeur: null,
      date_action: new Date().toISOString(),
    };

    setActions((prevActions) => [...prevActions, newAction]);
    persistAction(newAction);
  }

  function handleCreateSubtask(parentTaskId, title, assignments) {
    handleCreateTask({
      id: Date.now(),
      title,
      description: "",
      status: "A_FAIRE",
      parentTaskId,
      assignments,
    });
  }

  function handleEditTask(taskId, updatedFields) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, ...updatedFields } : t))
    );

    const changedActions = [];

    if (updatedFields.title !== undefined && updatedFields.title !== task.title) {
      changedActions.push({
        champ_modifie: "titre",
        ancienne_valeur: task.title,
        nouvelle_valeur: updatedFields.title,
      });
    }

    if (
      updatedFields.description !== undefined &&
      updatedFields.description !== task.description
    ) {
      changedActions.push({
        champ_modifie: "description",
        ancienne_valeur: task.description,
        nouvelle_valeur: updatedFields.description,
      });
    }

    if (changedActions.length === 0) return;

    const newActions = changedActions.map((a) => ({
      id: generateActionId(),
      id_tache: taskId,
      id_user: currentUser?.email ?? "inconnu",
      nom_user: currentUser?.firstName ?? "Utilisateur",
      type_action: "MODIFICATION",
      ...a,
      date_action: new Date().toISOString(),
    }));

    setActions((prevActions) => [...prevActions, ...newActions]);
    newActions.forEach(persistAction);
  }

  function handleDeleteTask(taskId) {
    setTasks((prevTasks) => {
      const idsToDelete = new Set([taskId]);
      let changed = true;

      while (changed) {
        changed = false;
        prevTasks.forEach((t) => {
          if (
            t.parentTaskId &&
            idsToDelete.has(t.parentTaskId) &&
            !idsToDelete.has(t.id)
          ) {
            idsToDelete.add(t.id);
            changed = true;
          }
        });
      }

      return prevTasks.filter((t) => !idsToDelete.has(t.id));
    });
  }

  // Tâches visibles calculées selon l'utilisateur
  const visibleTasks = (() => {
    if (!currentUser) return [];

    const isAdminUser = currentUser.globalRoles?.includes("ADMIN");
    if (isAdminUser) return tasks;

    const myDeptRoles = currentUser.departmentRoles || [];

    const isScrumMasterOf = (deptId) =>
      myDeptRoles.some(
        (dr) => dr.departmentId === deptId && dr.role === "SCRUM_MASTER"
      );

    const isAssignedToMe = (t) =>
      (t.assignments || []).some(
        (a) => a.userId === currentUser.id && !a.unassignedAt
      );

    const isDirectlyVisible = (t) => {
      if (myDeptRoles.some((dr) => dr.role === "SCRUM_MASTER")) {
        const project = projects.find((p) => p.id === t.projectId);
        if (project && isScrumMasterOf(project.departmentId)) {
          return true;
        }
      }
      return isAssignedToMe(t);
    };

    const visibleIds = new Set(tasks.filter(isDirectlyVisible).map((t) => t.id));

    let changed = true;
    while (changed) {
      changed = false;
      tasks.forEach((t) => {
        if (visibleIds.has(t.id) && t.parentTaskId && !visibleIds.has(t.parentTaskId)) {
          visibleIds.add(t.parentTaskId);
          changed = true;
        }
        if (t.parentTaskId && visibleIds.has(t.parentTaskId) && !visibleIds.has(t.id)) {
          visibleIds.add(t.id);
          changed = true;
        }
      });
    }

    return tasks.filter((t) => visibleIds.has(t.id));
  })();

  return {
    tasks,
    visibleTasks,
    projects,
    users,
    actions,
    departments,
    loading,
    error,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleStatusChange,
    handleCreateTask,
    handleCreateSubtask,
    handleEditTask,
    handleDeleteTask,
  };
}