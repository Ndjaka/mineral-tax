# 🔐 Gestion des Variables d'Environnement (.env)

Guide pour gérer le fichier `.env` en production sur Infomaniak.

---

## ⚠️ Règles de sécurité

### ❌ NE JAMAIS FAIRE

- ❌ **NE JAMAIS** commiter le `.env` dans Git
- ❌ **NE JAMAIS** partager le `.env` publiquement
- ❌ **NE JAMAIS** inclure le `.env` dans le déploiement automatique

### ✅ À FAIRE

- ✅ Garder le `.env` en local uniquement
- ✅ Utiliser `.env.example` pour la documentation
- ✅ Transférer manuellement le `.env` quand nécessaire
- ✅ Redémarrer l'application après modification du `.env`

---

## 🚀 Méthodes de déploiement du .env

### **Méthode 1 : Script automatique (Recommandé)**

#### Configuration initiale (une seule fois)

**Option A : Variable d'environnement globale (recommandé)**

Ajoutez dans votre `~/.zshrc` (ou `~/.bashrc`) :

```bash
# Ajouter cette ligne à la fin du fichier
export INFOMANIAK_SSH_PASSWORD='Kombi1989*'
```

Puis rechargez votre configuration :
```bash
source ~/.zshrc
```

**Option B : Passer le mot de passe à chaque exécution**

```bash
SSHPASS='Kombi1989*' ./deploy-env.sh
```

#### Utilisation

Une fois configuré, utilisez simplement :

```bash
# Depuis le dossier du projet
./deploy-env.sh
```

**Ce que fait le script :**
1. ✅ Lit le mot de passe depuis `$INFOMANIAK_SSH_PASSWORD` ou `$SSHPASS`
2. ✅ Vérifie que le fichier `.env` existe
3. ✅ Transfère le `.env` sur le serveur via rsync
4. ✅ Redémarre automatiquement l'application PM2
5. ✅ Affiche un message de confirmation

**Exemple d'utilisation :**

```bash
# 1. Modifier le .env en local
nano .env

# 2. Déployer sur le serveur
./deploy-env.sh

# Résultat :
# 🔐 Transfert du fichier .env vers le serveur...
# ✅ Fichier .env transféré avec succès
# 🔄 Redémarrage de l'application...
# ✅ Application redémarrée
```

---

### **Méthode 2 : Transfert manuel via rsync**

Si vous préférez contrôler le transfert manuellement :

```bash
# Définir le mot de passe SSH
export SSHPASS='Kombi1989*'

# Transférer le .env
sshpass -e rsync -avz \
  -e "ssh -o StrictHostKeyChecking=no" \
  .env \
  N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com:sites/mineraltax.ch/.env

# Redémarrer l'application
sshpass -e ssh -o StrictHostKeyChecking=no \
  N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
  'cd sites/mineraltax.ch && ./node_modules/.bin/pm2 restart mineraltax'
```

---

### **Méthode 3 : Édition directe sur le serveur**

Si vous voulez modifier le `.env` directement en production :

```bash
# 1. Se connecter au serveur
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com

# 2. Aller dans le dossier du projet
cd sites/mineraltax.ch

# 3. Éditer le .env
nano .env

# 4. Sauvegarder (Ctrl+O, Enter, Ctrl+X)

# 5. Redémarrer l'application
./node_modules/.bin/pm2 restart mineraltax

# 6. Vérifier que tout fonctionne
./node_modules/.bin/pm2 logs mineraltax --lines 20
```

---

## 📋 Structure du fichier .env

### **Variables essentielles**

```bash
# Base de données
DATABASE_URL="file:./mineraltax.db"

# Session
SESSION_SECRET="votre-secret-aleatoire-tres-long"

# Stripe (Paiements)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend (Emails)
RESEND_API_KEY="re_..."
FROM_EMAIL="no-reply@mineraltax.ch"

# Configuration
NODE_ENV="production"
SKIP_EMAIL_VERIFICATION="false"
```

### **Variables optionnelles**

```bash
# Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Logs
LOG_LEVEL="info"

# Sécurité
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW_MS="900000"
```

---

## 🔄 Workflow de mise à jour du .env

### **Scénario 1 : Ajouter une nouvelle variable**

```bash
# 1. Modifier le .env local
echo "NOUVELLE_VARIABLE=valeur" >> .env

# 2. Déployer sur le serveur
./deploy-env.sh

# 3. Vérifier le déploiement
./monitor.sh logs
```

### **Scénario 2 : Modifier une clé API (Stripe, Resend, etc.)**

```bash
# 1. Modifier le .env local
nano .env
# Changer la valeur de STRIPE_SECRET_KEY par exemple

# 2. Déployer sur le serveur
./deploy-env.sh

# 3. Tester l'application
curl -I https://mineraltax.ch
```

### **Scénario 3 : Basculer entre dev et production**

```bash
# En local (développement)
NODE_ENV="development"
SKIP_EMAIL_VERIFICATION="true"

# Sur le serveur (production)
NODE_ENV="production"
SKIP_EMAIL_VERIFICATION="false"
```

---

## 🔍 Vérification du .env sur le serveur

### **Vérifier que le .env existe**

```bash
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
  'ls -lah sites/mineraltax.ch/.env'
```

**Résultat attendu :**
```
-rw-r--r-- 1 client client 523 Jan 22 22:00 sites/mineraltax.ch/.env
```

### **Voir le contenu du .env (⚠️ Attention : contient des secrets)**

```bash
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
  'cat sites/mineraltax.ch/.env'
```

### **Vérifier qu'une variable spécifique existe**

```bash
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
  'grep STRIPE_SECRET_KEY sites/mineraltax.ch/.env'
```

---

## 🛡️ Sécurité du .env

### **Permissions correctes**

Le fichier `.env` doit avoir des permissions restrictives :

```bash
# Sur le serveur, vérifier les permissions
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
  'ls -l sites/mineraltax.ch/.env'

# Résultat attendu :
# -rw-r--r-- (644) ou mieux -rw------- (600)

# Si nécessaire, corriger les permissions
ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
  'chmod 600 sites/mineraltax.ch/.env'
```

### **Backup du .env**

Gardez une copie sécurisée du `.env` :

```bash
# En local, créer un backup chiffré (optionnel)
tar -czf env-backup-$(date +%Y%m%d).tar.gz .env
# Stocker dans un endroit sûr (1Password, LastPass, etc.)
```

### **Gitignore**

Vérifiez que `.env` est bien dans `.gitignore` :

```bash
# Vérifier
grep ".env" .gitignore

# Si absent, ajouter
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: ajouter .env dans gitignore"
```

---

## 📝 Fichier .env.example

Pour documenter les variables nécessaires sans exposer les secrets :

```bash
# .env.example (peut être commité dans Git)
DATABASE_URL="file:./mineraltax.db"
SESSION_SECRET="changez-moi-avec-un-secret-aleatoire"
STRIPE_SECRET_KEY="sk_test_ou_sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_test_ou_pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RESEND_API_KEY="re_..."
FROM_EMAIL="no-reply@votredomaine.ch"
NODE_ENV="production"
SKIP_EMAIL_VERIFICATION="false"
```

**Usage :**
```bash
# Nouveau développeur
cp .env.example .env
nano .env  # Remplir avec les vraies valeurs
```

---

## 🚨 En cas de fuite du .env

Si le `.env` a été accidentellement exposé :

### **Actions immédiates**

1. **Révoquer toutes les clés API** :
   - Stripe : https://dashboard.stripe.com/apikeys
   - Resend : https://resend.com/api-keys

2. **Générer de nouvelles clés**

3. **Mettre à jour le .env local et serveur** :
   ```bash
   # Modifier le .env local
   nano .env
   
   # Déployer sur le serveur
   ./deploy-env.sh
   ```

4. **Si commité dans Git, supprimer l'historique** :
   ```bash
   # Utiliser git-filter-repo ou BFG Repo-Cleaner
   # Ou créer un nouveau repo si nécessaire
   ```

---

## ❓ FAQ

### **Q : Dois-je transférer le .env à chaque déploiement ?**
**R :** Non, seulement quand vous modifiez une variable d'environnement. Le code lui se déploie automatiquement via GitHub Actions.

### **Q : Puis-je automatiser le transfert du .env ?**
**R :** Non recommandé. Le `.env` contient des secrets et ne doit être transféré que manuellement et consciemment.

### **Q : Comment tester si le .env est bien chargé ?**
**R :** Vérifiez les logs de l'application :
```bash
./monitor.sh logs
# Cherchez des messages d'erreur liés aux variables manquantes
```

### **Q : Que faire si l'application ne démarre pas après modification du .env ?**
**R :** 
1. Vérifier les logs : `./monitor.sh logs`
2. Vérifier que le fichier existe : `ssh ... 'ls -l sites/mineraltax.ch/.env'`
3. Vérifier la syntaxe (pas d'espaces autour du `=`, pas de guillemets manquants)

---

## 📚 Ressources

- **Script de déploiement** : `./deploy-env.sh`
- **Monitoring** : `./monitor.sh status`
- **Guide de déploiement** : `DEPLOY_INFOMANIAK.md`
- **Guide de monitoring** : `MONITORING.md`

---

**Dernière mise à jour** : 22 janvier 2026
