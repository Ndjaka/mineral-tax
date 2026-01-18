# Guide de Migration MineralTax vers Infomaniak

Ce guide détaille toutes les étapes pour migrer l'application MineralTax de Replit vers un hébergement Infomaniak en Suisse.

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Configuration du site Node.js](#2-configuration-du-site-nodejs)
3. [Configuration de la base de données PostgreSQL](#3-configuration-de-la-base-de-données-postgresql)
4. [Transfert des fichiers via FileZilla](#4-transfert-des-fichiers-via-filezilla)
5. [Configuration des variables d'environnement](#5-configuration-des-variables-denvironnement)
6. [Installation et démarrage](#6-installation-et-démarrage)
7. [Configuration Stripe](#7-configuration-stripe)
8. [Tests post-migration](#8-tests-post-migration)

---

## 1. Prérequis

### Comptes requis

| Service | Usage | Coût estimé |
|---------|-------|-------------|
| Infomaniak | Hébergement Node.js + PostgreSQL | ~15-30 CHF/mois |
| Stripe | Paiements (déjà configuré) | Commission par transaction |
| OpenAI (optionnel) | Assistant chat IA | ~5-20 CHF/mois selon usage |

### Outils nécessaires

- **FileZilla** : [filezilla-project.org](https://filezilla-project.org/) (client SFTP gratuit)
- **Navigateur web** : Accès au Manager Infomaniak

### Fichiers à télécharger depuis Replit

Dans Replit, cliquez sur les **3 points** en haut à gauche → **"Download as zip"**

---

## 2. Configuration du site Node.js

### Étape 2.1 : Accéder au Manager

1. Connectez-vous à [manager.infomaniak.com](https://manager.infomaniak.com)
2. Sélectionnez votre hébergement **mineraltax.ch**

### Étape 2.2 : Vérifier la configuration Node.js

Dans le **Tableau de bord** du site :
- Node.js doit être **Actif** (point vert)
- Notez le serveur SSH : `57-106659.ssh.hosting-ik.com` (ou similaire)

### Étape 2.3 : Créer un utilisateur FTP/SSH

1. Menu latéral → **FTP / SSH**
2. Cliquez **"Ajouter un utilisateur"**
3. Remplissez :
   - **Nom d'utilisateur** : `mineraltax` (ou autre)
   - **Mot de passe** : Choisissez un mot de passe fort
   - **Type d'accès** : FTP + SSH
4. **Enregistrez** et notez les identifiants

---

## 3. Configuration de la base de données PostgreSQL

### Étape 3.1 : Créer la base de données

1. Menu latéral → **Base de données**
2. Cliquez **+ Ajouter une base de données**
3. Choisissez **PostgreSQL**
4. Notez les informations :
   - **Hôte** : `xxxxxx.myd.infomaniak.com`
   - **Port** : `5432`
   - **Nom de la base** : `mineraltax`
   - **Utilisateur** : `mineraltax_user`
   - **Mot de passe** : (conservez-le précieusement)

### Étape 3.2 : Importer le schéma

1. Accédez à **phpPgAdmin** depuis le Manager
2. Sélectionnez votre base de données
3. Onglet **SQL**
4. Copiez le contenu du fichier `exports/mineraltax_fresh_install.sql`
5. Collez et **exécutez**

### Étape 3.3 : Vérifier l'import

Exécutez cette requête :

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Tables attendues : `users`, `sessions`, `machines`, `fuel_entries`, `reports`, `subscriptions`, `invoices`

---

## 4. Transfert des fichiers via FileZilla

### Étape 4.1 : Télécharger le projet

1. Dans **Replit**, cliquez sur les **3 points** → **"Download as zip"**
2. **Décompressez** le ZIP sur votre ordinateur
3. **Supprimez** le dossier `node_modules/` (sera réinstallé sur le serveur)

### Étape 4.2 : Configurer FileZilla

Ouvrez FileZilla et configurez :

| Champ | Valeur |
|-------|--------|
| **Hôte** | `sftp://57-106659.ssh.hosting-ik.com` |
| **Identifiant** | Le username créé (ex: `mineraltax`) |
| **Mot de passe** | Le mot de passe créé |
| **Port** | `22` |

Cliquez **Connexion rapide**

### Étape 4.3 : Transférer les fichiers

**Panneau gauche (local)** : Naviguez vers votre dossier décompressé

**Panneau droit (serveur)** : Vous êtes dans le dossier du site

**Transférez tous les fichiers suivants** :

```
client/
server/
shared/
package.json
package-lock.json
tsconfig.json
vite.config.ts
tailwind.config.ts
postcss.config.js
drizzle.config.ts
theme.json
components.json
```

**Ne PAS transférer** :
- `node_modules/`
- `.git/`
- `exports/`
- `attached_assets/`

---

## 5. Configuration des variables d'environnement

### Important : Fichier .env

Infomaniak n'a pas d'interface graphique pour les variables d'environnement. Vous devez créer un fichier `.env` à la racine du site.

### Étape 5.1 : Créer le fichier .env

Créez un fichier texte nommé `.env` avec ce contenu :

```env
# Base de données PostgreSQL
DATABASE_URL=postgres://UTILISATEUR:MOT_DE_PASSE@HOTE:5432/NOM_BASE

# Session (générez avec: openssl rand -hex 32)
SESSION_SECRET=votre_chaine_aleatoire_de_64_caracteres

# Environnement
NODE_ENV=production

# Stripe (optionnel - pour les paiements)
STRIPE_SECRET_KEY=sk_live_votre_cle
STRIPE_WEBHOOK_SECRET=whsec_votre_secret
```

### Étape 5.2 : Exemple DATABASE_URL

Remplacez avec vos vraies valeurs :

```
postgres://mineraltax_user:MonMotDePasse123@pg-xxxxx.myd.infomaniak.com:5432/mineraltax
```

### Étape 5.3 : Générer SESSION_SECRET

Dans un terminal :

```bash
openssl rand -hex 32
```

Résultat exemple : `a3f8b2c1d4e5f67890123456789012345678...`

### Étape 5.4 : Transférer le fichier .env

Via FileZilla, transférez le fichier `.env` à la **racine du site** (même niveau que package.json)

---

## 6. Installation et démarrage

### Étape 6.1 : Ouvrir la console SSH

Dans le Manager Infomaniak :
1. Allez dans **FTP / SSH**
2. Côté **Node.js**, cliquez **"Console SSH"**

### Étape 6.2 : Installer les dépendances

Dans la console SSH, tapez :

```bash
npm install
```

Attendez la fin de l'installation (peut prendre 2-5 minutes).

### Étape 6.3 : Construire l'application

```bash
npm run build
```

### Étape 6.4 : Configurer le démarrage

Dans le Manager → **Tableau de bord** du site :
1. Section **"Construction de l'application"**
2. **Commande de build** : `npm run build`
3. **Commande de lancement** : `npm start`

### Étape 6.5 : Démarrer l'application

Cliquez sur **"Redémarrer"** dans le tableau de bord du site.

---

## 7. Configuration Stripe

### Étape 7.1 : Créer le webhook de production

1. Connectez-vous à [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Désactivez le mode Test** (switch en haut à droite)
3. Développeurs → **Webhooks**
4. **+ Ajouter un endpoint** :
   - URL : `https://mineraltax.ch/api/stripe/webhook`
   - Événements :
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
5. Copiez le **Signing secret** → Mettez-le dans `.env` comme `STRIPE_WEBHOOK_SECRET`

### Étape 7.2 : Obtenir les clés live

1. Stripe Dashboard → Développeurs → **Clés API**
2. Copiez :
   - **Clé secrète** (`sk_live_...`) → `STRIPE_SECRET_KEY`

### Étape 7.3 : Mettre à jour le fichier .env

Via FileZilla, modifiez le fichier `.env` pour ajouter les clés Stripe, puis **redémarrez** l'application.

---

## 8. Tests post-migration

### Checklist de vérification

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
| Paiement Stripe | Checkout fonctionne | ☐ |

### Consulter les logs

Dans le Manager → Tableau de bord du site → **"Ouvrir la console"**

Les logs de l'application s'affichent en temps réel.

---

## Résumé des fichiers importants

| Fichier | Description |
|---------|-------------|
| `exports/mineraltax_fresh_install.sql` | Schéma de base de données |
| `exports/.env.example` | Modèle pour le fichier .env |
| `exports/DEPLOY_SFTP_INSTRUCTIONS.md` | Instructions détaillées SFTP |

---

## Contacts support

| Service | Contact |
|---------|---------|
| Infomaniak | support@infomaniak.com / 0848 800 800 |
| Stripe | [support.stripe.com](https://support.stripe.com) |

---

## Historique du document

| Date | Version | Modifications |
|------|---------|---------------|
| 2026-01-17 | 1.0 | Création du guide |
| 2026-01-18 | 2.0 | Mise à jour complète : FileZilla, .env, console SSH, structure simplifiée |
