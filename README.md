# Frontend — Brain-Booster (Aaprovidir)

Application de gestion de tâches (MVP) pour l'équipe Aaprovidir. React + Vite.

## Stack
- React 19 + React Router
- Vite
- Mock backend maison (`mock-server.cjs`) en attendant le vrai backend Spring Boot

## Lancer le projet en local

1. Installer les dépendances :
```bash
   npm install
```

2. Configurer l'URL de l'API dans `.env` :
VITE_API_URL=http://localhost:3001
(mettre `http://localhost:8080/api/v1` pour pointer vers le vrai backend une fois qu'il expose `/tasks`)

3. Lancer le serveur mock (dans un terminal) :
```bash
   npm run mock-api
```

4. Lancer l'app (dans un autre terminal) :
```bash
   npm run dev
```

5. Ouvrir `http://localhost:5173`

## Comptes de test (mock uniquement)
- `admin@aaprovidir.com` → rôle ADMIN, voit toutes les tâches
- `scrum@aaprovidir.com` → rôle SCRUM_MASTER, voit ses tâches + celles de son équipe
- `member@aaprovidir.com` → rôle MEMBER, voit ses tâches assignées
(n'importe quel mot de passe fonctionne en mode mock)

## Fonctionnalités actuelles
- Auth (signup / login / logout, persistée en localStorage)
- Board Kanban (À faire / En cours / Terminé)
- Création / édition / suppression de tâches et sous-tâches
- Historique des actions par tâche
- Dashboard avec statistiques
- Filtrage par rôle utilisateur

## À faire
- Connecter le vrai backend Spring Boot dès que `/api/v1/tasks` est disponible