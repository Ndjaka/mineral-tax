# Guide de Migration MineralTax vers Infomaniak

Ce guide détaille toutes les étapes pour migrer l'application MineralTax de Replit vers un hébergement Infomaniak en Suisse.

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Commande de l'hébergement Infomaniak](#2-commande-de-lhébergement-infomaniak)
3. [Configuration de la base de données PostgreSQL](#3-configuration-de-la-base-de-données-postgresql)
4. [Préparation du code source](#4-préparation-du-code-source)
5. [Configuration des variables d'environnement](#5-configuration-des-variables-denvironnement)
6. [Déploiement de l'application](#6-déploiement-de-lapplication)
7. [Configuration DNS](#7-configuration-dns)
8. [Configuration SSL/TLS](#8-configuration-ssltls)
9. [Tests post-migration](#9-tests-post-migration)
10. [Désactivation de Replit](#10-désactivation-de-replit)

---

## 1. Prérequis

### Comptes requis

| Service | Usage | Coût estimé |
|---------|-------|-------------|
| Infomaniak | Hébergement Node.js + PostgreSQL | ~15-30 CHF/mois |
| Stripe | Paiements (déjà configuré) | Commission par transaction |
| OpenAI (optionnel) | Assistant chat IA | ~5-20 CHF/mois selon usage |

### Fichiers à télécharger depuis Replit

Téléchargez l'intégralité du projet depuis Replit :

```
mineraltax/
├── client/                           ← Code frontend React
├── server/                           ← Code backend Express
├── shared/                           ← Schémas partagés
├── exports/
│   └── mineraltax_infomaniak.sql    ← Export base de données
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── drizzle.config.ts
```

### Outils nécessaires sur votre ordinateur

- Git (pour gérer le code)
- Node.js 20+ (pour tester localement)
- Un client FTP/SFTP (FileZilla, Cyberduck)

---

## 2. Commande de l'hébergement Infomaniak

### Étape 2.1 : Créer un compte Infomaniak

1. Allez sur [infomaniak.com](https://www.infomaniak.com)
2. Créez un compte ou connectez-vous
3. Complétez la vérification d'identité suisse

### Étape 2.2 : Commander l'hébergement

1. Menu → **Hébergement Web** → **Commander**
2. Choisissez **Hébergement Web** (pas Managed Cloud)
3. Sélectionnez le plan **Business** ou supérieur (pour Node.js)
4. Options à activer :
   - ✅ Node.js
   - ✅ PostgreSQL
   - ✅ SSL Let's Encrypt

### Étape 2.3 : Associer le domaine mineraltax.ch

1. Si le domaine est déjà chez Infomaniak : associez-le à l'hébergement
2. Si le domaine est ailleurs : configurez les DNS (voir section 7)

---

## 3. Configuration de la base de données PostgreSQL

### Étape 3.1 : Créer la base de données

1. Manager Infomaniak → **Hébergement** → **Bases de données**
2. Cliquez **+ Ajouter une base de données**
3. Choisissez **PostgreSQL**
4. Notez les informations :
   - Hôte : `xxxxxx.myd.infomaniak.com`
   - Port : `5432`
   - Nom de la base : `mineraltax`
   - Utilisateur : `mineraltax_user`
   - Mot de passe : (à définir, conservez-le précieusement)

### Étape 3.2 : Importer les données

**Option A : Via phpPgAdmin (interface web)**

1. Accédez à phpPgAdmin depuis le Manager Infomaniak
2. Sélectionnez votre base de données
3. Onglet **SQL** → Collez le contenu de `exports/mineraltax_infomaniak.sql`
4. Exécutez

**Option B : Via ligne de commande (si accès SSH)**

```bash
psql -h xxxxxx.myd.infomaniak.com -U mineraltax_user -d mineraltax -f mineraltax_infomaniak.sql
```

### Étape 3.3 : Vérifier l'import

Exécutez cette requête pour vérifier :

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Tables attendues :
- users, sessions, machines, fuel_entries, reports, subscriptions, invoices

---

## 4. Préparation du code source

### Étape 4.1 : Désactiver Replit Auth

L'application dispose déjà d'un système d'authentification dual. Pour Infomaniak, seule l'authentification locale (email/mot de passe) sera utilisée.

**Fichier à modifier : `server/routes.ts`**

Recherchez et commentez l'import et l'appel de Replit Auth :

```typescript
// AVANT (commentez ces lignes) :
// import { setupReplitAuth } from "./replit_integrations/auth";
// ...
// await setupReplitAuth(app);

// L'authentification locale (server/localAuth.ts) reste active
```

**Fichier à modifier : `server/localAuth.ts`**

Vérifiez que les routes d'authentification locale sont bien activées :
- `POST /api/auth/local/register` - Inscription
- `POST /api/auth/local/login` - Connexion
- `POST /api/auth/local/logout` - Déconnexion
- `GET /api/auth/local/user` - Utilisateur courant

### Étape 4.2 : Adapter les pages de connexion

**Fichier : `client/src/App.tsx`**

Assurez-vous que les routes de connexion pointent vers l'auth locale :
- `/login` → Page de connexion email/mot de passe
- `/register` → Page d'inscription

Les pages `/login` et `/register` existent déjà et fonctionnent avec l'auth locale.

### Étape 4.3 : Créer le fichier .nvmrc

À la racine du projet, créez un fichier `.nvmrc` :

```
20
```

Cela indique à Infomaniak d'utiliser Node.js version 20.

---

## 5. Configuration des variables d'environnement

### Variables requises

Configurez ces variables dans le Manager Infomaniak → Hébergement → Variables d'environnement :

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `NODE_ENV` | `production` | Oui |
| `DATABASE_URL` | URL de connexion PostgreSQL | Oui |
| `SESSION_SECRET` | Clé secrète pour les sessions (32+ caractères aléatoires) | Oui |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (mode live) | Oui |
| `STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe (mode live) | Oui |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe | Oui |
| `OPENAI_API_KEY` | Clé API OpenAI | Non (désactive l'assistant IA si absent) |

### Construire DATABASE_URL

Format :
```
postgresql://UTILISATEUR:MOT_DE_PASSE@HOTE:5432/NOM_BASE?sslmode=require
```

Exemple :
```
postgresql://mineraltax_user:MonMotDePasse123@pg-xxxxx.myd.infomaniak.com:5432/mineraltax?sslmode=require
```

### Générer SESSION_SECRET

Utilisez une chaîne aléatoire de 32+ caractères. Exemple de génération :

```bash
openssl rand -hex 32
```

Résultat exemple : `a3f8b2c1d4e5f6789012345678901234567890abcdef1234567890abcdef1234`

### Obtenir les clés Stripe de production

1. Connectez-vous à [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Désactivez le mode Test** (switch en haut à droite)
3. Développeurs → Clés API
4. Copiez les clés **live** :
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_...`

### Configurer le webhook Stripe pour Infomaniak

1. Stripe Dashboard → Développeurs → Webhooks
2. **Ajoutez un nouveau endpoint** :
   - URL : `https://mineraltax.ch/api/stripe/webhook`
   - Version API : Dernière version
3. Événements à sélectionner :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
4. Cliquez "Ajouter l'endpoint"
5. Copiez le **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Obtenir une clé OpenAI (optionnel)

Si vous souhaitez conserver l'assistant IA :

1. Créez un compte sur [platform.openai.com](https://platform.openai.com)
2. Settings → Billing → Ajoutez des crédits (minimum 5 USD)
3. API Keys → Create new secret key
4. Copiez la clé → `OPENAI_API_KEY`

Sans cette clé, l'assistant IA sera simplement désactivé.

---

## 6. Déploiement de l'application

### Étape 6.1 : Préparer le code pour production

Sur votre ordinateur, dans le dossier du projet :

```bash
# Installer les dépendances
npm install

# Construire l'application pour la production
npm run build
```

Cela génère le dossier `dist/` avec le frontend compilé.

### Étape 6.2 : Structure à uploader

Uploadez ces fichiers/dossiers vers Infomaniak :

```
/
├── client/              ← Code source frontend
├── server/              ← Code source backend  
├── shared/              ← Schémas partagés
├── dist/                ← Build de production (généré par npm run build)
├── node_modules/        ← Dépendances (ou faire npm install sur le serveur)
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
└── .nvmrc
```

### Étape 6.3 : Upload via SFTP

1. Ouvrez FileZilla ou Cyberduck
2. Connexion SFTP :
   - Hôte : `ftp.infomaniak.com`
   - Utilisateur : votre identifiant Infomaniak
   - Port : `22` (SFTP)
3. Naviguez vers le dossier de votre site web
4. Uploadez tous les fichiers

### Étape 6.4 : Configurer l'application Node.js

Dans le Manager Infomaniak :

1. Hébergement → Sites → Votre site (mineraltax.ch)
2. Paramètres avancés → Node.js
3. Configuration :
   - **Version Node.js** : 20.x
   - **Point d'entrée** : `server/index.ts` ou le fichier compilé
   - **Commande de démarrage** : `npm run dev` ou `npm start`
   - **Port** : 3000 (ou celui attribué par Infomaniak)

### Étape 6.5 : Installer les dépendances sur le serveur

Si vous n'avez pas uploadé `node_modules/`, connectez-vous en SSH :

```bash
cd /path/to/your/site
npm install --production
```

### Étape 6.6 : Démarrer l'application

Via le panneau Infomaniak ou en SSH :

```bash
npm run dev
```

---

## 7. Configuration DNS

### Si le domaine est chez Infomaniak

La configuration est automatique. Vérifiez dans Manager → Domaines.

### Si le domaine est chez un autre registrar

Configurez ces enregistrements DNS chez votre registrar actuel :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | @ | `IP-de-votre-hebergement-infomaniak` | 3600 |
| A | www | `IP-de-votre-hebergement-infomaniak` | 3600 |

Trouvez l'IP dans : Manager Infomaniak → Hébergement → Informations techniques

**Délai de propagation** : 1 à 24 heures

---

## 8. Configuration SSL/TLS

### Certificat Let's Encrypt (gratuit)

1. Manager → Hébergement → Certificats SSL
2. Cliquez **+ Ajouter un certificat**
3. Choisissez **Let's Encrypt** (gratuit)
4. Sélectionnez :
   - `mineraltax.ch`
   - `www.mineraltax.ch`
5. Activez le **renouvellement automatique**

### Forcer HTTPS

Dans la configuration du site, activez :
- ✅ Redirection HTTP → HTTPS
- ✅ HSTS (HTTP Strict Transport Security)

---

## 9. Tests post-migration

### Checklist de vérification

Testez chaque fonctionnalité :

| Fonctionnalité | Test | OK |
|----------------|------|-----|
| Page d'accueil | https://mineraltax.ch charge | ☐ |
| Inscription | Créer un compte email/mot de passe | ☐ |
| Connexion | Se connecter avec le compte créé | ☐ |
| Dashboard | Les statistiques s'affichent | ☐ |
| Flotte | Ajouter une machine | ☐ |
| Carburant | Ajouter une entrée | ☐ |
| Rapports | Générer un rapport PDF | ☐ |
| Export CSV | Télécharger le fichier | ☐ |
| Abonnement | Page /subscription accessible | ☐ |
| Paiement Stripe | Checkout fonctionne | ☐ |
| Assistant IA | Réponse du chat (si OpenAI configuré) | ☐ |
| CGV | /cgv accessible | ☐ |
| Confidentialité | /confidentialite accessible | ☐ |
| Mobile | Site responsive sur smartphone | ☐ |

### Tester le webhook Stripe

1. Stripe Dashboard → Webhooks → mineraltax.ch
2. Cliquez **"Envoyer un événement de test"**
3. Choisissez `checkout.session.completed`
4. Vérifiez que le statut retourné est **200 OK**

### Consulter les logs

Si accès SSH disponible :

```bash
# Logs de l'application Node.js
pm2 logs mineraltax
# ou
tail -f /var/log/node/mineraltax.log
```

---

## 10. Désactivation de Replit

### Une fois la migration validée (tous les tests OK)

1. **Replit** :
   - Archivez le projet (ne supprimez pas tout de suite, au cas où)
   - Après 30 jours sans problème, vous pouvez supprimer

2. **Stripe** :
   - Dashboard → Webhooks
   - Supprimez l'ancien webhook Replit (`*.replit.dev`)

3. **Bookmarks / Raccourcis** :
   - Mettez à jour vos liens vers https://mineraltax.ch

### Conservation des sauvegardes

Gardez précieusement :
- `exports/mineraltax_infomaniak.sql` (backup initial)
- Le code source complet (dans un repo Git privé)
- Tous les secrets dans un gestionnaire de mots de passe (1Password, Bitwarden)

---

## Résumé des coûts mensuels

| Service | Coût |
|---------|------|
| Infomaniak Hébergement Business | ~25 CHF/mois |
| Domaine mineraltax.ch | ~15 CHF/an (~1.25 CHF/mois) |
| OpenAI API (optionnel) | ~5-20 CHF/mois selon usage |
| Stripe | 2.9% + 0.30 CHF par transaction |

**Total estimé : ~30-50 CHF/mois** (hors commissions Stripe)

---

## Contacts support

| Service | Contact |
|---------|---------|
| Infomaniak | support@infomaniak.com / 0848 800 800 |
| Stripe | [support.stripe.com](https://support.stripe.com) |
| OpenAI | [help.openai.com](https://help.openai.com) |

---

## Historique du document

| Date | Version | Modifications |
|------|---------|---------------|
| 2026-01-17 | 1.0 | Création du guide |
| 2026-01-17 | 1.1 | Correction : auth locale, structure projet, pas de modification package.json |

