const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');
const seedPath = path.join(__dirname, 'db.seed.json');

function ensureDbExists() {
  if (!fs.existsSync(dbPath)) {
    if (!fs.existsSync(seedPath)) {
      throw new Error('db.seed.json introuvable — impossible de démarrer sans seed.');
    }
    fs.copyFileSync(seedPath, dbPath);
    console.log('db.json absent — recréé automatiquement depuis db.seed.json.');
  }
}
ensureDbExists();

function readDb() { return JSON.parse(fs.readFileSync(dbPath, 'utf-8')); }
function writeDb(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); }

app.post('/auth/signup', (req, res) => {
  res.status(403).json({
    message: "Inscription publique désactivée. Contactez un administrateur pour obtenir un accès.",
  });
});

app.post('/auth/login', (req, res) => {
  const { email } = req.body;
  const db = readDb();

  const user = (db.users || []).find(
    (u) => u.email.toLowerCase() === String(email || '').toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  res.json({
    token: 'fake-mock-token-' + Date.now() + '-' + user.id,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      globalRoles: user.globalRoles || [],
      departmentRoles: user.departmentRoles || [],
      mustChangePassword: !!user.mustChangePassword,
    },
  });
});

app.post('/auth/change-password', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const user = db.users.find((u) => u.id === Number(userId));

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  user.mustChangePassword = false;
  writeDb(db);
  res.json({ message: 'Mot de passe mis à jour' });
});

app.post('/admin/users', (req, res) => {
  const { firstName, lastName, email, departmentId, departmentName, departmentRole, globalRole } = req.body;
  const db = readDb();

  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    email,
    globalRoles: globalRole ? [globalRole] : [],
    departmentRoles: departmentId
      ? [{ departmentId, departmentName, role: departmentRole || 'MEMBER' }]
      : [],
    mustChangePassword: true,
  };

  db.users.push(newUser);
  writeDb(db);
  res.status(201).json(newUser);
});

app.get('/departments', (req, res) => {
  res.json(readDb().departments || []);
});

app.get('/users', (req, res) => {
  res.json(readDb().users || []);
});

app.get('/projects', (req, res) => {
  res.json(readDb().projects);
});

app.post('/projects', (req, res) => {
  const db = readDb();
  const newProject = { id: Date.now(), ...req.body };
  db.projects.push(newProject);
  writeDb(db);
  res.status(201).json(newProject);
});

app.patch('/projects/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.projects = db.projects.map((p) => (p.id === id ? { ...p, ...req.body } : p));
  writeDb(db);
  res.json(db.projects.find((p) => p.id === id));
});

app.delete('/projects/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.projects = db.projects.filter((p) => p.id !== id);
  writeDb(db);
  res.status(204).end();
});


app.get('/tasks', (req, res) => {
  res.json(readDb().tasks);
});

app.post('/tasks', (req, res) => {
  const db = readDb();
  const newTask = { id: Date.now(), ...req.body };
  db.tasks.push(newTask);
  writeDb(db);
  res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.tasks = db.tasks.map((t) => (t.id === id ? { ...t, ...req.body } : t));
  writeDb(db);
  res.json(db.tasks.find((t) => t.id === id));
});

app.delete('/tasks/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.tasks = db.tasks.filter((t) => t.id !== id && t.parentTaskId !== id);
  writeDb(db);
  res.status(204).end();
});

// --- Journal d'actions (ACTION_HISTORY) — F5 ---
// GET renvoie tout l'historique ; POST ajoute une entrée telle qu'envoyée par le
// front (App.jsx génère déjà un id côté client via generateActionId(), on le
// respecte s'il est fourni plutôt que d'en recréer un).
app.get('/actions', (req, res) => {
  res.json(readDb().actions || []);
});

app.post('/actions', (req, res) => {
  const db = readDb();
  const newAction = { id: req.body.id ?? Date.now(), ...req.body };
  db.actions = db.actions || [];
  db.actions.push(newAction);
  writeDb(db);
  res.status(201).json(newAction);
});

app.patch('/users/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.users = db.users.map((u) => (u.id === id ? { ...u, ...req.body } : u));
  writeDb(db);
  res.json(db.users.find((u) => u.id === id));
});

app.get('/attachments', (req, res) => {
  const db = readDb();
  const { taskId, projectId } = req.query;
  let attachments = db.attachments || [];
  if (taskId) {
    attachments = attachments.filter((a) => a.taskId === Number(taskId));
  } else if (projectId) {
    const taskIds = (db.tasks || []).filter((t) => t.projectId === Number(projectId)).map((t) => t.id);
    attachments = attachments.filter((a) => taskIds.includes(a.taskId));
  }
  res.json(attachments);
});

app.post('/attachments', (req, res) => {
  const db = readDb();
  const newAttachment = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
  db.attachments = db.attachments || [];
  db.attachments.push(newAttachment);
  writeDb(db);
  res.status(201).json(newAttachment);
});

app.delete('/attachments/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.attachments = (db.attachments || []).filter((a) => a.id !== id);
  writeDb(db);
  res.status(204).end();
});


app.get('/comments', (req, res) => {
  const db = readDb();
  const { taskId } = req.query;
  let comments = db.comments || [];
  if (taskId) comments = comments.filter((c) => c.taskId === Number(taskId));
  res.json(comments);
});

app.post('/comments', (req, res) => {
  const db = readDb();
  const newComment = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
  db.comments = db.comments || [];
  db.comments.push(newComment);
  writeDb(db);
  res.status(201).json(newComment);
});

app.delete('/comments/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.comments = (db.comments || []).filter((c) => c.id !== id);
  writeDb(db);
  res.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Mock server sur http://localhost:${PORT}`));