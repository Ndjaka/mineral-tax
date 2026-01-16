# Guide de Migration vers un Hébergeur Suisse

## Pourquoi migrer vers un hébergeur suisse ?

- **Conformité nLPD** (nouvelle Loi suisse sur la Protection des Données)
- **Confiance des clients B2B suisses** (données fiscales sensibles)
- **Proximité géographique** = meilleures performances
- **Support en français/allemand**

---

## Options d'Hébergement Suisse

### 1. Infomaniak (Recommandé pour simplicité)
- **Site** : https://www.infomaniak.com
- **Localisation** : Genève, Suisse
- **Prix** : dès 5.75 CHF/mois (Cloud Server)
- **Avantages** : 
  - Support 24/7 en français
  - Certifié ISO 27001
  - 100% énergie renouvelable
  - PostgreSQL managé disponible

### 2. Exoscale
- **Site** : https://www.exoscale.com
- **Localisation** : Genève et Zurich
- **Prix** : dès 11 CHF/mois
- **Avantages** :
  - Infrastructure cloud suisse
  - API compatible avec standards industrie
  - Base de données managée

### 3. Cyon
- **Site** : https://www.cyon.ch
- **Localisation** : Bâle, Suisse
- **Prix** : dès 12 CHF/mois
- **Avantages** :
  - Hébergement Node.js supporté
  - SSL gratuit
  - Support suisse-allemand

---

## Prérequis pour la Migration

### Technologies utilisées par MineralTax
- **Runtime** : Node.js 20+
- **Framework Backend** : Express.js
- **Frontend** : React (build statique via Vite)
- **Base de données** : PostgreSQL 15+
- **Variables d'environnement requises** :
  - `DATABASE_URL` - Connexion PostgreSQL
  - `SESSION_SECRET` - Clé de session
  - `STRIPE_SECRET_KEY` - Paiements Stripe
  - `OPENAI_API_KEY` - Assistant IA (optionnel)

---

## Étapes de Migration

### Étape 1 : Exporter le Code Source

```bash
# Dans Replit, télécharger tout le projet
# Ou cloner depuis Git si vous avez connecté un repo

git clone <votre-repo-url>
cd mineraltax
```

### Étape 2 : Exporter la Base de Données

```bash
# Exporter les données depuis Replit PostgreSQL
pg_dump $DATABASE_URL > mineraltax_backup.sql
```

### Étape 3 : Préparer le Build de Production

```bash
# Installer les dépendances
npm install

# Construire le frontend
npm run build

# Le dossier dist/ contient les fichiers statiques
```

### Étape 4 : Configuration pour Production

Créer un fichier `.env.production` :

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/mineraltax
SESSION_SECRET=votre-secret-tres-long-et-securise
STRIPE_SECRET_KEY=sk_live_xxxxx
```

### Étape 5 : Déploiement sur Infomaniak (exemple)

#### A. Créer un Cloud Server
1. Aller sur https://manager.infomaniak.com
2. Créer un "Cloud Server" Ubuntu 22.04
3. Minimum 2 vCPU, 4 GB RAM

#### B. Installer Node.js sur le serveur
```bash
# Se connecter en SSH
ssh root@votre-ip

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 pour gérer le processus
npm install -g pm2
```

#### C. Configurer PostgreSQL
```bash
# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres createdb mineraltax
sudo -u postgres createuser mineraltax_user -P

# Importer les données
psql -U mineraltax_user -d mineraltax < mineraltax_backup.sql
```

#### D. Déployer l'application
```bash
# Cloner le code
git clone <votre-repo> /var/www/mineraltax
cd /var/www/mineraltax

# Installer et builder
npm install
npm run build

# Configurer les variables d'environnement
cp .env.production .env

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

## Migration de la Base de Données Managée (Alternative)

Si vous préférez ne pas gérer PostgreSQL vous-même :

### Infomaniak Database Cloud
1. Créer une instance PostgreSQL managée
2. Noter l'URL de connexion
3. Importer avec : `psql <DATABASE_URL> < mineraltax_backup.sql`

### Exoscale DBaaS
1. Créer un service PostgreSQL
2. Configurer les règles de firewall
3. Importer les données

---

## Stripe : Mise à jour du Webhook

Après migration, mettre à jour l'URL du webhook Stripe :

1. Aller sur https://dashboard.stripe.com/webhooks
2. Modifier le webhook existant
3. Nouvelle URL : `https://mineraltax.ch/api/stripe/webhook`

---

## Checklist Post-Migration

- [ ] Application accessible sur https://mineraltax.ch
- [ ] Connexion utilisateur fonctionnelle
- [ ] Base de données migrée avec toutes les données
- [ ] Paiements Stripe fonctionnels (tester en mode test d'abord)
- [ ] Certificat SSL valide
- [ ] Variables d'environnement configurées
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring en place (uptimerobot.com, etc.)

---

## Support et Ressources

### Documentation Infomaniak
- https://www.infomaniak.com/fr/support/faq/cloud

### Commandes utiles PM2
```bash
pm2 status          # Voir le statut
pm2 logs mineraltax # Voir les logs
pm2 restart all     # Redémarrer
```

### En cas de problème
- Vérifier les logs : `pm2 logs`
- Vérifier Nginx : `sudo tail -f /var/log/nginx/error.log`
- Vérifier PostgreSQL : `sudo tail -f /var/log/postgresql/postgresql-15-main.log`

---

## Estimation des Coûts Mensuels (Suisse)

| Service | Fournisseur | Prix/mois |
|---------|-------------|-----------|
| Cloud Server (2 vCPU, 4 GB) | Infomaniak | ~15 CHF |
| PostgreSQL managé | Infomaniak | ~10 CHF |
| Domaine .ch | Infomaniak | ~1 CHF |
| **Total** | | **~26 CHF/mois** |

Comparé à ~25 USD/mois sur Replit, le coût est similaire mais avec l'avantage de l'hébergement 100% suisse.

---

## Questions Fréquentes

**Q: Puis-je continuer à développer sur Replit ?**
R: Oui ! Vous pouvez développer et tester sur Replit, puis déployer sur le serveur suisse.

**Q: Combien de temps prend la migration ?**
R: Environ 2-4 heures pour quelqu'un avec expérience technique. Prévoir une journée si c'est votre première fois.

**Q: Dois-je refaire la configuration Stripe ?**
R: Non, les clés API restent les mêmes. Il faut juste mettre à jour l'URL du webhook.

**Q: Et pour l'authentification Replit Auth ?**
R: Vous devrez implémenter une autre solution d'authentification (email/mot de passe, OAuth avec Google/Microsoft, etc.) car Replit Auth ne fonctionne que sur Replit.
