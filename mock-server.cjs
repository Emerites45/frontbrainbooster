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

// --- AUTH (prefixed to match the frontend's /api/v1/auth/* calls) ---

app.post('/api/v1/auth/signup', (req, res) => {
  res.status(403).send("Inscription publique désactivée. Contactez un administrateur pour obtenir un accès.");
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();

  const user = (db.users || []).find(
    (u) => u.email.toLowerCase() === String(email || '').toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  // NOTE: this mock has no real password check yet — db.seed.json doesn't
  // store a password field. Any password will currently succeed for a known
  // email. If you want the mock to actually validate a password, add a
  // "password" field per user in db.seed.json and uncomment the check below.
  //
  // if (password !== user.password) {
  //   return res.status(401).json({ message: 'Identifiants invalides' });
  // }

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

app.post('/api/v1/auth/forgot-password', (req, res) => {
  const { email } = req.query;
  const db = readDb();
  const user = (db.users || []).find(
    (u) => u.email.toLowerCase() === String(email || '').toLowerCase()
  );

  if (!user) {
    return res.status(404).send("Aucun compte associé à cet email.");
  }

  // Mock: doesn't send a real email, just simulates success.
  console.log(`[mock] Code de vérification envoyé (simulé) à ${email}`);
  res.send("Un code de vérification a été envoyé à votre adresse email.");
});

app.post('/api/v1/auth/reset-password', (req, res) => {
  const { email, otp, newPassword } = req.body;
  const db = readDb();
  const user = (db.users || []).find(
    (u) => u.email.toLowerCase() === String(email || '').toLowerCase()
  );

  if (!user) {
    return res.status(404).send("Aucun compte associé à cet email.");
  }

  // Mock: doesn't validate the OTP for real, just simulates success.
  user.mustChangePassword = false;
  writeDb(db);
  res.send("Mot de passe réinitialisé avec succès.");
});

app.post('/api/v1/auth/change-password', (req, res) => {
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

// --- SPRINTS (Phase C — backlog & sprints) ---
// GET filtrable par projectId. POST/PATCH/DELETE suivent exactement le même
// patron que les routes /projects ci-dessus.
app.get('/sprints', (req, res) => {
  const db = readDb();
  const { projectId } = req.query;
  let sprints = db.sprints || [];
  if (projectId) sprints = sprints.filter((s) => s.projectId === Number(projectId));
  res.json(sprints);
});
app.post('/sprints', (req, res) => {
  const db = readDb();
  const newSprint = { id: Date.now(), status: "ACTIVE", ...req.body };

  db.sprints = db.sprints || [];

  // Un seul sprint ACTIVE à la fois par projet — sinon activeSprintId
  // côté front devient ambigu (find() prend le premier trouvé, pas
  // forcément le dernier créé).
  if (newSprint.status === "ACTIVE") {
    const alreadyActive = db.sprints.find(
      (s) => s.projectId === newSprint.projectId && s.status === "ACTIVE"
    );
    if (alreadyActive) {
      return res.status(409).json({
        message: `Un sprint est déjà actif sur ce projet : "${alreadyActive.name}". Clôturez-le avant d'en créer un nouveau.`,
      });
    }
  }

  db.sprints.push(newSprint);
  writeDb(db);
  res.status(201).json(newSprint);
});
app.patch('/sprints/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.sprints = (db.sprints || []).map((s) => (s.id === id ? { ...s, ...req.body } : s));
  writeDb(db);
  res.json(db.sprints.find((s) => s.id === id));
});

app.delete('/sprints/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  // On détache les tâches du sprint supprimé plutôt que de les perdre.
  db.tasks = (db.tasks || []).map((t) =>
    t.sprintId === id ? { ...t, sprintId: null } : t
  );
  db.sprints = (db.sprints || []).filter((s) => s.id !== id);
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

app.get('/timesheet-entries', (req, res) => {
  const db = readDb();
  const { userId, weekStart } = req.query;
  let entries = db.timesheetEntries || [];
  if (userId) entries = entries.filter((e) => e.userId === Number(userId));
  if (weekStart) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    entries = entries.filter((e) => { const d = new Date(e.date); return d >= start && d < end; });
  }
  res.json(entries);
});

// POST fait un upsert : une entrée par (userId, date), pas de doublon possible.
app.post('/timesheet-entries', (req, res) => {
  const db = readDb();
  db.timesheetEntries = db.timesheetEntries || [];
  const { userId, date } = req.body;
  const idx = db.timesheetEntries.findIndex((e) => e.userId === userId && e.date === date);
  if (idx >= 0) {
    db.timesheetEntries[idx] = { ...db.timesheetEntries[idx], ...req.body };
    writeDb(db);
    return res.json(db.timesheetEntries[idx]);
  }
  const newEntry = { id: Date.now(), ...req.body };
  db.timesheetEntries.push(newEntry);
  writeDb(db);
  res.status(201).json(newEntry);
});

app.get('/performance-comments', (req, res) => {
  const db = readDb();
  const { userId, weekStart } = req.query;
  let comments = db.performanceComments || [];
  if (userId) comments = comments.filter((c) => c.targetUserId === Number(userId));
  if (weekStart) comments = comments.filter((c) => c.weekStart === weekStart);
  res.json(comments);
});

app.post('/performance-comments', (req, res) => {
  const db = readDb();
  const newComment = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
  db.performanceComments = db.performanceComments || [];
  db.performanceComments.push(newComment);
  writeDb(db);
  res.status(201).json(newComment);
});

app.get('/notifications', (req, res) => {
  const db = readDb();
  const { userId } = req.query;
  let notifications = db.notifications || [];
  if (userId) notifications = notifications.filter((n) => n.userId === Number(userId));
  res.json(notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post('/notifications', (req, res) => {
  const db = readDb();
  const newNotif = { id: Date.now() + Math.random(), read: false, ...req.body, createdAt: new Date().toISOString() };
  db.notifications = db.notifications || [];
  db.notifications.push(newNotif);
  writeDb(db);
  res.status(201).json(newNotif);
});

app.patch('/notifications/:id', (req, res) => {
  const db = readDb();
  const id = req.params.id;
  db.notifications = (db.notifications || []).map((n) => (String(n.id) === id ? { ...n, ...req.body } : n));
  writeDb(db);
  res.json(db.notifications.find((n) => String(n.id) === id));
});

app.post('/notifications/mark-all-read', (req, res) => {
  const db = readDb();
  const { userId } = req.body;
  db.notifications = (db.notifications || []).map((n) => (n.userId === Number(userId) ? { ...n, read: true } : n));
  writeDb(db);
  res.status(204).end();
});

// --- WEEKLY REPORTS ---
// weekStart fourni → un seul rapport (upsert unique par userId+weekStart).
// weekStart absent → tableau complet des rapports de l'utilisateur (utilisé
// par le rapport de stage).
app.get('/weekly-reports', (req, res) => {
  const db = readDb();
  const { userId, weekStart } = req.query;
  const all = db.weeklyReports || [];
  if (weekStart) {
    const report = all.find((r) => r.userId === Number(userId) && r.weekStart === weekStart);
    return res.json(report || null);
  }
  res.json(all.filter((r) => r.userId === Number(userId)));
});

// Même logique d'upsert : un seul rapport par (userId, weekStart).
app.post('/weekly-reports', (req, res) => {
  const db = readDb();
  db.weeklyReports = db.weeklyReports || [];
  const { userId, weekStart } = req.body;
  const idx = db.weeklyReports.findIndex((r) => r.userId === userId && r.weekStart === weekStart);
  if (idx >= 0) {
    db.weeklyReports[idx] = { ...db.weeklyReports[idx], ...req.body };
    writeDb(db);
    return res.json(db.weeklyReports[idx]);
  }
  const newReport = { id: Date.now(), ...req.body };
  db.weeklyReports.push(newReport);
  writeDb(db);
  res.status(201).json(newReport);
});


const PORT = 3001;
app.listen(PORT, () => console.log(`Mock server sur http://localhost:${PORT}`));