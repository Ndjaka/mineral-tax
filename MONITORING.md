# 📊 Guide de Monitoring - MineralTax

Guide complet pour surveiller votre application MineralTax en production sur Infomaniak.

---

## 🚀 Utilisation rapide

### Script de monitoring local

Depuis votre Mac, dans le dossier `/Users/eugenendjaka/Downloads/MineralTax` :

```bash
# Voir le statut de l'application
./monitor.sh status

# Voir les logs en temps réel (Ctrl+C pour quitter)
./monitor.sh logs

# Voir les informations détaillées
./monitor.sh info

# Tester la disponibilité du site
./monitor.sh ping
```

---

## 📋 Commandes PM2 sur le serveur

### Connexion au serveur

```bash
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com
cd sites/mineraltax.ch
```

### Commandes de base

```bash
# Statut de l'application
./node_modules/.bin/pm2 status

# Monitoring en temps réel (appuyez sur Q pour quitter)
./node_modules/.bin/pm2 monit

# Voir les logs
./node_modules/.bin/pm2 logs mineraltax

# Voir les 100 dernières lignes de logs
./node_modules/.bin/pm2 logs mineraltax --lines 100

# Informations détaillées
./node_modules/.bin/pm2 show mineraltax
```

### Gestion de l'application

```bash
# Redémarrer l'application
./node_modules/.bin/pm2 restart mineraltax

# Arrêter l'application
./node_modules/.bin/pm2 stop mineraltax

# Démarrer l'application
./node_modules/.bin/pm2 start dist/index.mjs --name mineraltax

# Recharger sans downtime (0-downtime reload)
./node_modules/.bin/pm2 reload mineraltax

# Supprimer du gestionnaire
./node_modules/.bin/pm2 delete mineraltax
```

### Gestion des logs

```bash
# Voir uniquement les erreurs
./node_modules/.bin/pm2 logs mineraltax --err

# Voir uniquement la sortie standard
./node_modules/.bin/pm2 logs mineraltax --out

# Vider les logs (si trop volumineux)
./node_modules/.bin/pm2 flush

# Logs avec timestamps
./node_modules/.bin/pm2 logs --timestamp
```

---

## 📊 Indicateurs à surveiller

### 1. Statut de l'application

Résultat de `./monitor.sh status` :

```
┌────┬───────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name          │ version     │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │
├────┼───────────────┼─────────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ mineraltax    │ 1.0.0       │ fork    │ 4508     │ 10m    │ 33   │ online    │ 0%       │ 98.5mb   │
└────┴───────────────┴─────────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┘
```

**Indicateurs clés :**

| Indicateur | Valeur normale | ⚠️ Attention si |
|------------|----------------|-----------------|
| **status** | `online` (vert) | `stopped`, `errored`, `launching` |
| **↺ (restarts)** | < 50 | > 100 (crashs fréquents) |
| **cpu** | 0-20% | > 50% (charge élevée) |
| **mem** | < 150mb | > 200mb (possible fuite mémoire) |
| **uptime** | Plusieurs heures/jours | < 5 minutes (redémarrages fréquents) |

### 2. Performance du site

Résultat de `./monitor.sh ping` :

```
🌐 Test de connexion à https://mineraltax.ch...
Status: 200
Temps de réponse: 0.234s
```

**Valeurs acceptables :**
- ✅ **Status: 200** → Site accessible
- ✅ **Temps < 1s** → Performance correcte
- ⚠️ **Temps 1-3s** → Performance dégradée
- ❌ **Status: 5xx** → Erreur serveur
- ❌ **Temps > 3s** → Problème de performance

---

## 🚨 Résolution de problèmes

### Problème 1 : Application stopped/errored

**Symptôme :** `status = stopped` ou `errored` dans PM2

**Solution :**

```bash
# 1. Voir les logs d'erreur
./monitor.sh logs

# 2. Redémarrer l'application
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
  'cd sites/mineraltax.ch && ./node_modules/.bin/pm2 restart mineraltax'
```

### Problème 2 : Trop de redémarrages

**Symptôme :** `↺` > 100 redémarrages

**Solution :**

```bash
# 1. Voir les logs pour identifier la cause
./monitor.sh logs

# 2. Vérifier les dernières erreurs
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
  'cd sites/mineraltax.ch && ./node_modules/.bin/pm2 logs mineraltax --err --lines 50'

# 3. Si nécessaire, redéployer depuis GitHub Actions
# Aller sur https://github.com/Ndjaka/MineralTax/actions
# Cliquer sur "Deploy to Infomaniak" → "Run workflow"
```

### Problème 3 : Utilisation mémoire élevée

**Symptôme :** `mem` > 200mb

**Solution :**

```bash
# Redémarrer l'application pour libérer la mémoire
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
  'cd sites/mineraltax.ch && ./node_modules/.bin/pm2 restart mineraltax'
```

### Problème 4 : Site inaccessible (Status: 5xx)

**Solution :**

```bash
# 1. Vérifier si l'application tourne
./monitor.sh status

# 2. Si stopped, redémarrer
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
  'cd sites/mineraltax.ch && ./node_modules/.bin/pm2 restart mineraltax'

# 3. Vérifier les logs
./monitor.sh logs

# 4. Vérifier la base de données
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
  'cd sites/mineraltax.ch && ls -lah mineraltax.db'
```

---

## 📁 Emplacements des fichiers importants

### Sur le serveur Infomaniak

```
/srv/customer/sites/mineraltax.ch/
├── dist/                    # Application compilée
│   └── index.mjs           # Serveur Node.js
├── node_modules/           # Dépendances
│   └── .bin/pm2           # PM2
├── mineraltax.db           # Base de données SQLite
├── .env                    # Variables d'environnement
└── app.log                 # Logs de l'application (si créé)

/srv/customer/.pm2/
├── logs/                   # Logs PM2
│   ├── mineraltax-out.log # Logs de sortie
│   └── mineraltax-error.log # Logs d'erreur
└── dump.pm2               # Configuration PM2 sauvegardée
```

### En local

```
/Users/eugenendjaka/Downloads/MineralTax/
├── monitor.sh             # Script de monitoring
├── dist/                  # Build local
└── .github/workflows/
    └── deploy.yml        # Workflow de déploiement automatique
```

---

## 🔔 Monitoring avancé (optionnel)

### Option 1 : PM2 Plus (Dashboard web)

**Gratuit pour 1 serveur**

1. Créez un compte sur https://pm2.io/
2. Connectez votre serveur :
   ```bash
   ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com
   cd sites/mineraltax.ch
   ./node_modules/.bin/pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
   ```
3. Dashboard web avec :
   - CPU/RAM en temps réel
   - Logs centralisés
   - Alertes email/Slack
   - Historique de performance

### Option 2 : UptimeRobot (Monitoring uptime)

**Gratuit pour 50 moniteurs**

1. Créez un compte sur https://uptimerobot.com/
2. Ajoutez un moniteur :
   - Type : HTTP(s)
   - URL : https://mineraltax.ch
   - Intervalle : 5 minutes
3. Configurez les alertes :
   - Email
   - SMS (payant)
   - Webhook

### Option 3 : Google Analytics

Pour surveiller l'activité utilisateur :
- Nombre de visiteurs
- Pages vues
- Erreurs JavaScript côté client
- Performance du chargement

---

## 📅 Routine de surveillance recommandée

### Quotidienne (1 minute)

```bash
./monitor.sh status
./monitor.sh ping
```

Vérifiez :
- ✅ Status = online
- ✅ Memory < 150mb
- ✅ Site répond en < 1s

### Hebdomadaire (5 minutes)

```bash
./monitor.sh info
./monitor.sh logs
```

Vérifiez :
- Nombre de redémarrages (↺)
- Logs d'erreur inhabituels
- Uptime de la semaine

### Mensuelle (15 minutes)

```bash
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com
cd sites/mineraltax.ch

# Vérifier la taille de la base de données
ls -lh mineraltax.db

# Vérifier l'espace disque
df -h

# Nettoyer les vieux logs PM2
./node_modules/.bin/pm2 flush
```

---

## 🆘 Support d'urgence

### Si tout est cassé

1. **Vérifier GitHub Actions** : https://github.com/Ndjaka/MineralTax/actions
   - Le dernier déploiement a-t-il réussi ?

2. **Redéployer manuellement** :
   ```bash
   cd /Users/eugenendjaka/Downloads/MineralTax
   npm run build
   export SSHPASS='Kombi1989*'
   sshpass -e rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" \
     dist/ N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com:sites/mineraltax.ch/dist/
   
   sshpass -e ssh -o StrictHostKeyChecking=no \
     N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
     'cd sites/mineraltax.ch && ./node_modules/.bin/pm2 restart mineraltax'
   ```

3. **Contacter le support Infomaniak** si problème serveur
   - https://www.infomaniak.com/fr/support

---

## 📞 Contacts

- **GitHub Repository** : https://github.com/Ndjaka/MineralTax
- **Site en production** : https://mineraltax.ch
- **Support Infomaniak** : https://www.infomaniak.com/fr/support

---

**Dernière mise à jour** : 22 janvier 2026
