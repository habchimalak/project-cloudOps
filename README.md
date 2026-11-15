# CloudOps Manager

> Projet réalisé dans le cadre du cours NestJS.

CloudOps Manager est une plateforme de gestion de projets, serveurs et applications cloud. Elle offre une supervision des métriques système (CPU, RAM) et un système d'alertes configurable. L'accès est sécurisé par authentification JWT avec trois niveaux de rôles (Admin, DevOps, Viewer).

---

## Technologies utilisées

| Côté | Stack |
|---|---|
| Backend | NestJS, TypeScript, Prisma ORM |
| Base de données | PostgreSQL (via Docker) |
| Sécurité | JWT, Passport, bcrypt |
| Infrastructure | Docker, Docker Compose |
| Frontend (à venir) | Next.js |
| Tests (à venir) | Jest |
| Documentation API (à venir) | Swagger / OpenAPI |

---

## Prérequis

- **Node.js** LTS (v20 ou plus) : https://nodejs.org
- **npm** (inclus avec Node.js)
- **Git** : https://git-scm.com
- **Docker Desktop** : https://www.docker.com/products/docker-desktop

---

## Installation et lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/sifaoui235/Projet-NestJS-CloudOps.git
cd Projet-NestJS-CloudOps
```

### 2. Lancer la base de données PostgreSQL

```bash
docker compose up -d db
```

### 3. Configurer les variables d'environnement

```bash
cd backend
cp .env.example .env
```

Sous Windows (invite de commandes), utilisez `copy .env.example .env`.
Ouvrez ensuite `.env` et vérifiez les valeurs (voir la section « Variables d'environnement »).

### 4. Installer les dépendances

```bash
npm install
```

### 5. Générer le client Prisma et appliquer les migrations

```bash
npx prisma generate
npx prisma migrate deploy
```

### 6. Charger les données de démonstration

```bash
npx prisma db seed
```

### 7. Démarrer le serveur

```bash
npm run start:dev
```

L'API est disponible sur : **http://localhost:4000/api**

---

## Variables d'environnement

Copiez `backend/.env.example` vers `backend/.env` et renseignez les valeurs suivantes :

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL. Avec Docker : `postgresql://cloudops:cloudops@localhost:5433/cloudops?schema=public` |
| `JWT_SECRET` | Clé secrète utilisée pour signer les tokens JWT. Choisissez une chaîne longue et aléatoire. |
| `JWT_EXPIRES_IN` | Durée de validité d'un token JWT (exemple : `7d`). |
| `PORT` | Port d'écoute du serveur NestJS (`4000` dans `.env.example`). |

---

## Comptes de démonstration

Les comptes suivants sont créés automatiquement par le seed (`npx prisma db seed`) :

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@cloudops.local` | `Password123!` | ADMIN |
| `devops@cloudops.local` | `Password123!` | DEVOPS |
| `viewer@cloudops.local` | `Password123!` | VIEWER |

---

## Documentation de l'API

> Swagger sera disponible à l'adresse **http://localhost:4000/api/docs** une fois le module installé.

### Authentification

1. Appelez `POST /api/auth/login` avec votre email et votre mot de passe :

```json
{
  "email": "admin@cloudops.local",
  "password": "Password123!"
}
```

2. Récupérez le champ `access_token` dans la réponse.

3. Ajoutez le token dans l'en-tête de chaque requête :

```
Authorization: Bearer <access_token>
```

### Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte (rôle VIEWER par défaut) |
| POST | `/api/auth/login` | Se connecter et obtenir un JWT |
| GET | `/api/auth/me` | Profil de l'utilisateur connecté |
| PATCH | `/api/users/:id/role` | Changer le rôle d'un utilisateur (ADMIN uniquement) |
| GET | `/api/projects` | Liste des projets |
| GET | `/api/servers` | Liste des serveurs |
| GET | `/api/alerts` | Liste des alertes |
| GET | `/api/metrics` | Liste des métriques |

Les modules teams, projects, environments, servers, applications, metrics et alerts exposent aussi les routes POST, PATCH et DELETE.

---

## Rôles et permissions

| Action | VIEWER | DEVOPS | ADMIN |
|---|---|---|---|
| Lire (GET) | Oui | Oui | Oui |
| Créer (POST) | Non | Oui | Oui |
| Modifier (PATCH) | Non | Oui | Oui |
| Supprimer (DELETE) | Non | Non | Oui |
| Changer les rôles | Non | Non | Oui |

---

## Structure du projet

```
Projet-NestJS-CloudOps/
  compose.yaml            Base de données PostgreSQL (Docker)
  backend/
    prisma/
      schema.prisma       Modèles de données
      migrations/         Historique des migrations SQL
      seed.ts             Données de démonstration
    src/
      auth/               Inscription, connexion, JWT
      users/              Gestion des utilisateurs
      teams/              Équipes
      projects/           Projets
      environments/       Environnements (dev, staging, prod)
      servers/            Serveurs cloud
      applications/       Applications déployées
      metrics/            Métriques système (CPU, RAM)
      alerts/             Alertes et incidents
      common/             Guards et décorateurs partagés
      prisma/             Module Prisma (service global)
```

---

## Tests

```bash
npm test
```

> Les tests Jest seront ajoutés dans une prochaine étape du projet.

---

## Docker (lancement complet)

> Un `docker-compose` global incluant le backend sera ajouté prochainement.

Pour l'instant, seule la base de données tourne dans Docker :

```bash
docker compose up -d db
```

---

## Déploiement

> Le lien de l'application déployée sera ajouté ici une fois le déploiement effectué.

---

## Équipe

| Membre | Partie réalisée |
|---|---|
| Rami | Analyse, modèle de données Prisma, migrations, seed, squelette des modules |
| Samar | Authentification JWT, rôles (RBAC), routes d'écriture, validation des DTO, README |
| Aziz | À compléter |
| Membre 4 | À compléter |
