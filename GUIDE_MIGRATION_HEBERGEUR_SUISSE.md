# Guide de Migration vers un Hebergeur Suisse

## Pourquoi migrer vers un hebergeur suisse ?

- **Conformite nLPD** (nouvelle Loi suisse sur la Protection des Donnees)
- **Confiance des clients B2B suisses** (donnees fiscales sensibles)
- **Proximite geographique** = meilleures performances
- **Support en francais/allemand**

---

## Options d'Hebergement Suisse

### 1. Infomaniak (Recommande pour simplicite)
- **Site** : https://www.infomaniak.com
- **Localisation** : Geneve, Suisse
- **Prix** : des 5.75 CHF/mois (Cloud Server)
- **Avantages** : 
  - Support 24/7 en francais
  - Certifie ISO 27001
  - 100% energie renouvelable
  - PostgreSQL manage disponible

### 2. Exoscale
- **Site** : https://www.exoscale.com
- **Localisation** : Geneve et Zurich
- **Prix** : des 11 CHF/mois
- **Avantages** :
  - Infrastructure cloud suisse
  - API compatible avec standards industrie
  - Base de donnees managee

### 3. Cyon
- **Site** : https://www.cyon.ch
- **Localisation** : Bale, Suisse
- **Prix** : des 12 CHF/mois
- **Avantages** :
  - Hebergement Node.js supporte
  - SSL gratuit
  - Support suisse-allemand

---

## Prerequis pour la Migration

### Technologies utilisees par MineralTax
- **Runtime** : Node.js 20+
- **Framework Backend** : Express.js
- **Frontend** : React (build statique via Vite)
- **Base de donnees** : PostgreSQL 15+
- **Authentification** : Email/mot de passe local (bcrypt)
- **Paiements** : Stripe (cartes + Twint)
- **Emails** : Resend

### Variables d'environnement requises

Voir le fichier `.env.example` pour la liste complete. Variables principales :

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `DATABASE_URL` | Connexion PostgreSQL | Oui |
| `SESSION_SECRET` | Cle de session (32+ caracteres) | Oui |
| `NODE_ENV` | `production` | Oui |
| `BASE_URL` | URL de base (ex: https://mineraltax.ch) | Oui |
| `STRIPE_SECRET_KEY` | Cle secrete Stripe | Oui |
| `STRIPE_PUBLIC_KEY` | Cle publique Stripe | Oui |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | Oui |
| `RESEND_API_KEY` | Cle API Resend pour emails | Non |

---

## Systeme d'Authentification

MineralTax utilise une authentification email/mot de passe locale :

### Endpoints d'authentification
- `POST /api/auth/local/register` - Creer un compte
- `POST /api/auth/local/login` - Se connecter
- `POST /api/auth/local/logout` - Se deconnecter
- `GET /api/auth/local/user` - Obtenir l'utilisateur courant

### Securite
- Mots de passe haches avec bcrypt (cost factor 12)
- Exigences : 12+ caracteres, au moins 1 lettre et 1 chiffre
- Sessions stockees en base de donnees PostgreSQL

---

## Systeme de Paiement

### Deux options de paiement

1. **Abonnement carte (renouvellement automatique)**
   - Endpoint : `POST /api/checkout`
   - Mode Stripe : `subscription`
   - Methodes : carte bancaire

2. **Paiement unique Twint (renouvellement manuel)**
   - Endpoint : `POST /api/checkout/onetime`
   - Mode Stripe : `payment`
   - Methodes : Twint, carte, Link

### Configuration Twint dans Stripe
1. Aller sur https://dashboard.stripe.com/settings/payment_methods
2. Activer "Twint" dans la liste des methodes de paiement
3. Important : Twint ne fonctionne qu'avec les paiements uniques, pas les abonnements

### Webhook Stripe
- URL : `https://mineraltax.ch/api/stripe/webhook`
- Evenements a ecouter : `checkout.session.completed`

---

## Systeme d'Emails

### Configuration Resend
1. Creer un compte sur https://resend.com
2. Verifier le domaine `mineraltax.ch`
3. Copier la cle API dans `RESEND_API_KEY`

### Emails envoyes automatiquement
- **Email de bienvenue** : apres paiement reussi
- **Rappels de renouvellement** : J-30, J-7, J-1 avant expiration (licences uniques seulement)

### Si RESEND_API_KEY n'est pas configure
Les emails sont ignores silencieusement (pas d'erreur).

---

## Etapes de Migration

### Etape 1 : Exporter le Code Source

```bash
# Dans Replit, telecharger tout le projet
# Ou cloner depuis Git si vous avez connecte un repo

git clone <votre-repo-url>
cd mineraltax
```

### Etape 2 : Exporter la Base de Donnees

```bash
# Exporter les donnees depuis Replit PostgreSQL
pg_dump $DATABASE_URL > mineraltax_backup.sql
```

### Etape 3 : Preparer le Build de Production

```bash
# Installer les dependances
npm install

# Construire le frontend
npm run build

# Le dossier dist/ contient les fichiers statiques
```

### Etape 4 : Configuration pour Production

Copier `.env.example` vers `.env` et remplir les valeurs :

```bash
cp .env.example .env
nano .env
```

### Etape 5 : Deploiement sur Infomaniak (exemple)

#### A. Creer un Cloud Server
1. Aller sur https://manager.infomaniak.com
2. Creer un "Cloud Server" Ubuntu 22.04
3. Minimum 2 vCPU, 4 GB RAM

#### B. Installer Node.js sur le serveur
```bash
# Se connecter en SSH
ssh root@votre-ip

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 pour gerer le processus
npm install -g pm2
```

#### C. Configurer PostgreSQL
```bash
# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib

# Creer la base de donnees
sudo -u postgres createdb mineraltax
sudo -u postgres createuser mineraltax_user -P

# Importer les donnees
psql -U mineraltax_user -d mineraltax < mineraltax_backup.sql
```

#### D. Deployer l'application
```bash
# Cloner le code
git clone <votre-repo> /var/www/mineraltax
cd /var/www/mineraltax

# Installer et builder
npm install
npm run build

# Configurer les variables d'environnement
cp .env.example .env
nano .env  # Remplir les valeurs

# Lancer avec PM2
pm2 start npm --name "mineraltax" -- start
pm2 save
pm2 startup
```

#### E. Configurer Nginx (reverse proxy)
```nginx
# /etc/nginx/sites-available/mineraltax
server {
    listen 80;
    server_name mineraltax.ch www.mineraltax.ch;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/mineraltax /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### F. Configurer SSL avec Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d mineraltax.ch -d www.mineraltax.ch
```

---

## Configuration DNS

Modifier vos enregistrements DNS chez votre registrar :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | @ | IP-du-serveur-suisse | 3600 |
| A | www | IP-du-serveur-suisse | 3600 |

---

## Configuration Stripe Post-Migration

### Mettre a jour le webhook
1. Aller sur https://dashboard.stripe.com/webhooks
2. Supprimer l'ancien webhook Replit
3. Creer un nouveau webhook :
   - URL : `https://mineraltax.ch/api/stripe/webhook`
   - Evenements : `checkout.session.completed`
4. Copier le "Signing secret" dans `STRIPE_WEBHOOK_SECRET`

### Verifier Twint
1. Aller sur https://dashboard.stripe.com/settings/payment_methods
2. S'assurer que Twint est active

---

## Configuration Resend Post-Migration

### Verifier le domaine
1. Aller sur https://resend.com/domains
2. Ajouter `mineraltax.ch`
3. Ajouter les enregistrements DNS requis :
   - SPF
   - DKIM
   - DMARC (optionnel mais recommande)
4. Attendre la verification (quelques minutes a quelques heures)

### Tester l'envoi
```bash
# Dans le serveur, verifier les logs apres un paiement test
pm2 logs mineraltax | grep -i email
```

---

## Taches Planifiees

MineralTax execute des taches automatiques :

- **Rappels de renouvellement** : verification toutes les 24 heures
  - Envoye J-30, J-7, J-1 avant expiration
  - Seulement pour les licences uniques (pas d'abonnement Stripe)

Ces taches demarrent automatiquement 10 secondes apres le lancement du serveur.

---

## Checklist Post-Migration

- [ ] Application accessible sur https://mineraltax.ch
- [ ] Connexion email/mot de passe fonctionnelle
- [ ] Inscription nouveau compte fonctionnelle
- [ ] Base de donnees migree avec toutes les donnees
- [ ] Paiement par carte fonctionnel
- [ ] Paiement Twint fonctionnel
- [ ] Webhook Stripe configure et teste
- [ ] Certificat SSL valide
- [ ] Variables d'environnement configurees
- [ ] Domaine Resend verifie (si emails actives)
- [ ] Sauvegardes automatiques configurees
- [ ] Monitoring en place (uptimerobot.com, etc.)

---

## Commandes Utiles PM2

```bash
pm2 status          # Voir le statut
pm2 logs mineraltax # Voir les logs
pm2 restart all     # Redemarrer
pm2 monit           # Monitoring en temps reel
```

---

## En Cas de Probleme

### Verifier les logs
```bash
# Logs application
pm2 logs mineraltax

# Logs Nginx
sudo tail -f /var/log/nginx/error.log

# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Problemes courants

1. **502 Bad Gateway**
   - Verifier que l'app tourne : `pm2 status`
   - Redemarrer : `pm2 restart mineraltax`

2. **Erreur de connexion DB**
   - Verifier DATABASE_URL dans .env
   - Tester : `psql $DATABASE_URL -c "SELECT 1"`

3. **Emails non envoyes**
   - Verifier RESEND_API_KEY
   - Verifier que le domaine est verifie dans Resend

4. **Paiement Stripe echoue**
   - Verifier les cles Stripe (mode live vs test)
   - Verifier le webhook dans le dashboard Stripe

---

## Estimation des Couts Mensuels (Suisse)

| Service | Fournisseur | Prix/mois |
|---------|-------------|-----------|
| Cloud Server (2 vCPU, 4 GB) | Infomaniak | ~15 CHF |
| PostgreSQL manage | Infomaniak | ~10 CHF |
| Domaine .ch | Infomaniak | ~1 CHF |
| Emails (Resend) | Resend | 0 CHF (3000/mois gratuit) |
| **Total** | | **~26 CHF/mois** |

---

## Questions Frequentes

**Q: Puis-je continuer a developper sur Replit ?**
R: Oui ! Vous pouvez developper et tester sur Replit, puis deployer sur le serveur suisse.

**Q: Combien de temps prend la migration ?**
R: Environ 2-4 heures pour quelqu'un avec experience technique. Prevoir une journee si c'est votre premiere fois.

**Q: Dois-je refaire la configuration Stripe ?**
R: Non, les cles API restent les memes. Il faut juste mettre a jour l'URL du webhook.

**Q: Comment generer un SESSION_SECRET securise ?**
R: Utilisez la commande : `openssl rand -hex 32`

**Q: Twint ne fonctionne pas, que faire ?**
R: Verifiez que Twint est active dans Stripe Dashboard > Settings > Payment methods. Note : Twint ne fonctionne qu'avec les paiements uniques, pas les abonnements.

**Q: Les emails ne s'envoient pas, que faire ?**
R: 1) Verifiez RESEND_API_KEY. 2) Verifiez que le domaine est verifie dans Resend. 3) Consultez les logs : `pm2 logs mineraltax | grep -i email`
