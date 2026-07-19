const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');
function readDb() { return JSON.parse(fs.readFileSync(dbPath, 'utf-8')); }
function writeDb(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); }

// --- Auth, imite exactement la forme du vrai backend ---
app.post('/auth/signup', (req, res) => {
  res.status(201).json({ message: 'Utilisateur enregistré avec succès !' });
});

app.post('/auth/login', (req, res) => {
  const { email } = req.body;
  res.json({
    token: 'fake-mock-token-' + Date.now(),
    type: 'Bearer',
    id: 1,
    name: email ? email.split('@')[0] : 'Utilisateur Test',
    email: email || 'test@aaprovidir.com',
    role: 'USER',
  });
});

// --- Tasks, lit/écrit vraiment dans db.json ---
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

const PORT = 3001;
app.listen(PORT, () => console.log(`Mock server sur http://localhost:${PORT}`));