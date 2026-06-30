# Docker Setup Guide

## Quick Start

### Build et lancer avec Docker Compose

```bash
docker-compose up --build
```

Cela va :

- ✅ Créer l'image Docker de l'application
- ✅ Démarrer un conteneur MySQL
- ✅ Exécuter les migrations Prisma
- ✅ Démarrer l'application sur `http://localhost:3001`

### Arrêter les conteneurs

```bash
docker-compose down
```

### Arrêter et supprimer les données

```bash
docker-compose down -v
```

---

## Construction manuelle

### Build l'image

```bash
docker build -t tasklist-backend .
```

### Lancer un conteneur

```bash
docker run -p 3001:3001 \
  -e DATABASE_URL="mysql://user:password@host:3306/tasklist" \
  tasklist-backend
```

---

## Configuration

Créez un fichier `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

Modifiez les variables si nécessaire :

```
DATABASE_URL=mysql://tasklist_user:password@db:3306/tasklist
PORT=3001
```

---

## Commandes utiles

### Accéder au shell du conteneur

```bash
docker-compose exec backend sh
```

### Voir les logs

```bash
docker-compose logs -f backend
```

### Relancer les migrations

```bash
docker-compose exec backend npx prisma migrate deploy
```

### Accéder à la BDD MySQL

```bash
docker-compose exec db mysql -u tasklist_user -p tasklist
```

---

## Taille de l'image

- **Avant optimisation** : ~500MB (avec node_modules complets)
- **Après multi-stage build** : ~150MB (seulement production)

Cette image est optimisée pour la production ! 🚀
