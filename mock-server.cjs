const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');
const seedPath = path.join(__dirname, 'db.seed.json');

// db.json est gitignoré: chacun a ses propres données de test locales.
// S'il n'existe pas encore (premier clone, ou après un reset), on le
// recrée à partir du seed versionné.
if (!fs.existsSync(dbPath)) {
  fs.copyFileSync(seedPath, dbPath);
  console.log('db.json absent — recréé depuis db.seed.json');
}

function readDb() { return JSON.parse(fs.readFileSync(dbPath, 'utf-8')); }
function writeDb(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); }

// --- Auth ---
// Le JWT réel (Tâche B2) devra porter le(s) département(s) + le(s) rôle(s).
// Ici on simule juste la forme de la réponse: le front peut lire user.globalRoles
// et user.departmentRoles exactement comme si c'était décodé du token.

// Raccourcis pratiques pour tester rapidement chaque rôle sans retenir les vrais emails
const loginShortcuts = {
  'admin@aaprovidir.com': 1,   // Marcus Chen - ADMIN
  'scrum@aaprovidir.com': 2,   // Alex Rivera - SCRUM_MASTER (Dev)
  'member@aaprovidir.com': 3,  // Sarah Jenkins - MEMBER (Dev)
};

function findUserForLogin(email) {
  const db = readDb();
  const targetId = loginShortcuts[email];
  if (targetId) return db.users.find((u) => u.id === targetId);
  return db.users.find((u) => u.email === email) || db.users[2]; // fallback: Sarah, MEMBER
}

app.post('/api/v1/auth/signup', (req, res) => {
  // B2: l'inscription doit associer l'utilisateur à un département dès sa création
  const { departmentId } = req.body;
  if (!departmentId) {
    return res.status(400).json({ message: 'departmentId est requis' });
  }
  res.status(201).json({ message: 'Utilisateur enregistré avec succès !' });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email } = req.body;
  const user = findUserForLogin(email);

  res.json({
    token: 'fake-mock-token-' + Date.now(),
    type: 'Bearer',
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    globalRoles: user.globalRoles,
    departmentRoles: user.departmentRoles,
    mustChangePassword: user.mustChangePassword,
  });
});

// --- Departments (B5) ---
app.get('/api/v1/departments', (req, res) => {
  res.json(readDb().departments);
});

app.get('/api/v1/departments/:id/members', (req, res) => {
  const db = readDb();
  const departmentId = Number(req.params.id);
  const members = db.users.filter((u) =>
    u.departmentRoles.some((dr) => dr.departmentId === departmentId)
  );
  res.json(members);
});

// --- Projects ---
app.get('/api/v1/projects', (req, res) => {
  res.json(readDb().projects);
});

app.post('/api/v1/projects', (req, res) => {
  const db = readDb();
  const newProject = { id: Date.now(), status: 'A_FAIRE', ...req.body };
  db.projects.push(newProject);
  writeDb(db);
  res.status(201).json(newProject);
});

// --- Tasks ---
app.get('/api/v1/tasks', (req, res) => {
  res.json(readDb().tasks);
});

app.post('/api/v1/tasks', (req, res) => {
  const db = readDb();
  const newTask = { id: Date.now(), assigneeIds: [], ...req.body };
  db.tasks.push(newTask);
  writeDb(db);
  res.status(201).json(newTask);
});

app.put('/api/v1/tasks/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.tasks = db.tasks.map((t) => (t.id === id ? { ...t, ...req.body } : t));
  writeDb(db);
  res.json(db.tasks.find((t) => t.id === id));
});

app.delete('/api/v1/tasks/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.tasks = db.tasks.filter((t) => t.id !== id && t.parentTaskId !== id);
  writeDb(db);
  res.status(204).end();
});

// --- Task assignments (B4) ---
// Remplace l'ancien champ unique id_assigne: une tâche peut avoir plusieurs assignés.
app.post('/api/v1/tasks/:id/assignments', (req, res) => {
  const db = readDb();
  const taskId = Number(req.params.id);
  const { userId } = req.body;

  const task = db.tasks.find((t) => t.id === taskId);
  if (!task) return res.status(404).json({ message: 'Tâche introuvable' });

  if (!task.assigneeIds.includes(userId)) {
    task.assigneeIds.push(userId);
  }
  writeDb(db);
  res.status(201).json(task);
});

app.delete('/api/v1/tasks/:id/assignments/:userId', (req, res) => {
  const db = readDb();
  const taskId = Number(req.params.id);
  const userId = Number(req.params.userId);

  const task = db.tasks.find((t) => t.id === taskId);
  if (!task) return res.status(404).json({ message: 'Tâche introuvable' });

  task.assigneeIds = task.assigneeIds.filter((uid) => uid !== userId);
  writeDb(db);
  res.json(task);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Mock server sur http://localhost:${PORT}`));