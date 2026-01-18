# Guide de Migration MineralTax vers Infomaniak

Ce guide detaille toutes les etapes pour migrer l'application MineralTax de Replit vers un hebergement Infomaniak en Suisse.

---

## Table des matieres

1. [Prerequis](#1-prerequis)
2. [Configuration du site Node.js](#2-configuration-du-site-nodejs)
3. [Configuration de la base de donnees PostgreSQL](#3-configuration-de-la-base-de-donnees-postgresql)
4. [Transfert des fichiers via FileZilla](#4-transfert-des-fichiers-via-filezilla)
5. [Configuration des variables d'environnement](#5-configuration-des-variables-denvironnement)
6. [Installation et demarrage](#6-installation-et-demarrage)
7. [Configuration Stripe et Twint](#7-configuration-stripe-et-twint)
8. [Configuration Resend (emails)](#8-configuration-resend-emails)
9. [Tests post-migration](#9-tests-post-migration)

---

## 1. Prerequis

### Comptes requis

| Service | Usage | Cout estime |
|---------|-------|-------------|
| Infomaniak | Hebergement Node.js + PostgreSQL | ~15-30 CHF/mois |
| Stripe | Paiements (deja configure) | Commission par transaction |
| Resend | Emails transactionnels | Gratuit (3000 emails/mois) |
| OpenAI (optionnel) | Assistant chat IA | ~5-20 CHF/mois selon usage |

### Outils necessaires

- **FileZilla** : [filezilla-project.org](https://filezilla-project.org/) (client SFTP gratuit)
- **Navigateur web** : Acces au Manager Infomaniak

### Fichiers a telecharger depuis Replit

Dans Replit, cliquez sur les **3 points** en haut a gauche -> **"Download as zip"**

---

## 2. Configuration du site Node.js

### Etape 2.1 : Acceder au Manager

1. Connectez-vous a [manager.infomaniak.com](https://manager.infomaniak.com)
2. Selectionnez votre hebergement **mineraltax.ch**

### Etape 2.2 : Verifier la configuration Node.js

Dans le **Tableau de bord** du site :
- Node.js doit etre **Actif** (point vert)
- Notez le serveur SSH : `57-106659.ssh.hosting-ik.com` (ou similaire)

### Etape 2.3 : Creer un utilisateur FTP/SSH

1. Menu lateral -> **FTP / SSH**
2. Cliquez **"Ajouter un utilisateur"**
3. Remplissez :
   - **Nom d'utilisateur** : `mineraltax` (ou autre)
   - **Mot de passe** : Choisissez un mot de passe fort
   - **Type d'acces** : FTP + SSH
4. **Enregistrez** et notez les identifiants

---

## 3. Configuration de la base de donnees PostgreSQL

### Etape 3.1 : Creer la base de donnees

1. Menu lateral -> **Base de donnees**
2. Cliquez **+ Ajouter une base de donnees**
3. Choisissez **PostgreSQL**
4. Notez les informations :
   - **Hote** : `xxxxxx.myd.infomaniak.com`
   - **Port** : `5432`
   - **Nom de la base** : `mineraltax`
   - **Utilisateur** : `mineraltax_user`
   - **Mot de passe** : (conservez-le precieusement)

### Etape 3.2 : Importer le schema

1. Accedez a **phpPgAdmin** depuis le Manager
2. Selectionnez votre base de donnees
3. Onglet **SQL**
4. Copiez le contenu du fichier `exports/mineraltax_fresh_install.sql`
5. Collez et **executez**

### Etape 3.3 : Verifier l'import

Executez cette requete :

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Tables attendues : `users`, `sessions`, `machines`, `fuel_entries`, `reports`, `subscriptions`, `invoices`

---

## 4. Transfert des fichiers via FileZilla

### Etape 4.1 : Telecharger le projet

1. Dans **Replit**, cliquez sur les **3 points** -> **"Download as zip"**
2. **Decompressez** le ZIP sur votre ordinateur
3. **Supprimez** le dossier `node_modules/` (sera reinstalle sur le serveur)

### Etape 4.2 : Configurer FileZilla

Ouvrez FileZilla et configurez :

| Champ | Valeur |
|-------|--------|
| **Hote** | `sftp://57-106659.ssh.hosting-ik.com` |
| **Identifiant** | Le username cree (ex: `mineraltax`) |
| **Mot de passe** | Le mot de passe cree |
| **Port** | `22` |

Cliquez **Connexion rapide**

### Etape 4.3 : Transferer les fichiers

**Panneau gauche (local)** : Naviguez vers votre dossier decompresse

**Panneau droit (serveur)** : Vous etes dans le dossier du site

**Transferez tous les fichiers suivants** :

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
components.json
```

**Ne PAS transferer** :
- `node_modules/`
- `.git/`
- `exports/`
- `attached_assets/`
- `.env` (sera cree manuellement)

---

## 5. Configuration des variables d'environnement

### Important : Fichier .env

Infomaniak n'a pas d'interface graphique pour les variables d'environnement. Vous devez creer un fichier `.env` a la racine du site.

### Etape 5.1 : Creer le fichier .env

Creez un fichier texte nomme `.env` avec ce contenu :

```env
# Base de donnees PostgreSQL (OBLIGATOIRE)
DATABASE_URL=postgres://UTILISATEUR:MOT_DE_PASSE@HOTE:5432/NOM_BASE

# Session (OBLIGATOIRE)
# Generez avec: openssl rand -hex 32
SESSION_SECRET=votre_chaine_aleatoire_de_64_caracteres

# Environnement (OBLIGATOIRE)
NODE_ENV=production

# URL de base (OBLIGATOIRE pour Stripe)
BASE_URL=https://mineraltax.ch

# Stripe - Paiements (OBLIGATOIRE)
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete
STRIPE_PUBLIC_KEY=pk_live_votre_cle_publique
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook

# Resend - Emails (OPTIONNEL)
RESEND_API_KEY=re_votre_cle_resend
```

### Etape 5.2 : Exemple DATABASE_URL

Remplacez avec vos vraies valeurs :

```
postgres://mineraltax_user:MonMotDePasse123@pg-xxxxx.myd.infomaniak.com:5432/mineraltax
```

### Etape 5.3 : Generer SESSION_SECRET

Dans un terminal :

```bash
openssl rand -hex 32
```

Resultat exemple : `a3f8b2c1d4e5f67890123456789012345678...`

### Etape 5.4 : Transferer le fichier .env

Via FileZilla, transferez le fichier `.env` a la **racine du site** (meme niveau que package.json)

---

## 6. Installation et demarrage

### Etape 6.1 : Ouvrir la console SSH

Dans le Manager Infomaniak :
1. Allez dans **FTP / SSH**
2. Cote **Node.js**, cliquez **"Console SSH"**

### Etape 6.2 : Installer les dependances

Dans la console SSH, tapez :

```bash
npm install
```

Attendez la fin de l'installation (peut prendre 2-5 minutes).

### Etape 6.3 : Construire l'application

```bash
npm run build
```

### Etape 6.4 : Configurer le demarrage

Dans le Manager -> **Tableau de bord** du site :
1. Section **"Construction de l'application"**
2. **Commande de build** : `npm run build`
3. **Commande de lancement** : `npm start`

### Etape 6.5 : Demarrer l'application

Cliquez sur **"Redemarrer"** dans le tableau de bord du site.

---

## 7. Configuration Stripe et Twint

### Etape 7.1 : Activer Twint dans Stripe

**Important** : Twint doit etre active manuellement dans Stripe.

1. Connectez-vous a [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Desactivez le mode Test** (switch en haut a droite)
3. Allez dans **Parametres** -> **Moyens de paiement**
4. Trouvez **Twint** et cliquez **Activer**
5. Suivez les instructions de configuration

### Etape 7.2 : Creer le webhook de production

1. Developpeurs -> **Webhooks**
2. **+ Ajouter un endpoint** :
   - URL : `https://mineraltax.ch/api/stripe/webhook`
   - Evenements a ecouter :
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
3. Copiez le **Signing secret** -> Mettez-le dans `.env` comme `STRIPE_WEBHOOK_SECRET`

### Etape 7.3 : Obtenir les cles live

1. Stripe Dashboard -> Developpeurs -> **Cles API**
2. Copiez :
   - **Cle secrete** (`sk_live_...`) -> `STRIPE_SECRET_KEY`
   - **Cle publiable** (`pk_live_...`) -> `STRIPE_PUBLIC_KEY`

### Etape 7.4 : Mettre a jour le fichier .env

Via FileZilla, modifiez le fichier `.env` pour ajouter les cles Stripe, puis **redemarrez** l'application.

### Options de paiement disponibles

MineralTax propose deux options de paiement :

| Option | Mode | Methodes | Renouvellement |
|--------|------|----------|----------------|
| Abonnement carte | `subscription` | Carte bancaire | Automatique |
| Paiement unique | `payment` | Twint, Carte, Link | Manuel (rappels email) |

---

## 8. Configuration Resend (emails)

### Pourquoi Resend ?

Resend envoie les emails transactionnels :
- **Email de bienvenue** apres paiement
- **Rappels de renouvellement** a J-30, J-7, J-1 (licences uniques seulement)

### Etape 8.1 : Creer un compte Resend

1. Allez sur [resend.com](https://resend.com) et creez un compte
2. Plan gratuit : 3000 emails/mois (suffisant pour MineralTax)

### Etape 8.2 : Verifier le domaine

1. Dans Resend, allez dans **Domains**
2. Cliquez **Add Domain** et entrez `mineraltax.ch`
3. Ajoutez les enregistrements DNS requis chez Infomaniak :

| Type | Nom | Valeur |
|------|-----|--------|
| TXT | @ | (copier la valeur SPF de Resend) |
| CNAME | resend._domainkey | (copier la valeur DKIM de Resend) |

4. Attendez la verification (quelques minutes a quelques heures)

### Etape 8.3 : Obtenir la cle API

1. Dans Resend, allez dans **API Keys**
2. Cliquez **Create API Key**
3. Copiez la cle (commence par `re_`)
4. Ajoutez-la dans `.env` : `RESEND_API_KEY=re_votre_cle`

### Etape 8.4 : Tester

Apres redemarrage de l'application, les emails seront envoyes automatiquement.

**Si RESEND_API_KEY n'est pas configure**, les emails sont ignores silencieusement (pas d'erreur).

---

## 9. Tests post-migration

### Checklist de verification

| Fonctionnalite | Test | OK |
|----------------|------|-----|
| Page d'accueil | https://mineraltax.ch charge correctement | |
| Inscription | Creer un compte email/mot de passe | |
| Connexion | Se connecter avec le compte cree | |
| Dashboard | Les statistiques s'affichent | |
| Flotte | Ajouter une machine | |
| Carburant | Ajouter une entree | |
| Rapports | Generer un rapport PDF | |
| Export CSV | Telecharger le fichier | |
| Paiement carte | Checkout Stripe fonctionne | |
| Paiement Twint | Option Twint visible au checkout | |
| Email bienvenue | Recu apres paiement | |

### Consulter les logs

Dans le Manager -> Tableau de bord du site -> **"Ouvrir la console"**

Les logs de l'application s'affichent en temps reel.

### Verifier les emails

```bash
# Dans les logs, chercher les mentions d'email
grep -i email /chemin/vers/logs
```

---

## Resume des fichiers importants

| Fichier | Description |
|---------|-------------|
| `exports/mineraltax_fresh_install.sql` | Schema de base de donnees |
| `.env.example` | Modele pour le fichier .env |
| `GUIDE_MIGRATION_HEBERGEUR_SUISSE.md` | Guide general de migration |

---

## Variables d'environnement - Resume

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | Oui | URL PostgreSQL |
| `SESSION_SECRET` | Oui | Cle session (32+ car.) |
| `NODE_ENV` | Oui | `production` |
| `BASE_URL` | Oui | `https://mineraltax.ch` |
| `STRIPE_SECRET_KEY` | Oui | Cle secrete Stripe |
| `STRIPE_PUBLIC_KEY` | Oui | Cle publique Stripe |
| `STRIPE_WEBHOOK_SECRET` | Oui | Secret webhook |
| `RESEND_API_KEY` | Non | Cle API Resend |

---

## Contacts support

| Service | Contact |
|---------|---------|
| Infomaniak | support@infomaniak.com / 0848 800 800 |
| Stripe | [support.stripe.com](https://support.stripe.com) |
| Resend | [resend.com/support](https://resend.com/support) |

---

## Historique du document

| Date | Version | Modifications |
|------|---------|---------------|
| 2026-01-17 | 1.0 | Creation du guide |
| 2026-01-18 | 2.0 | Mise a jour : FileZilla, .env, console SSH |
| 2026-01-18 | 3.0 | Ajout : Twint, Resend emails, variables env completes, correction liste fichiers |
