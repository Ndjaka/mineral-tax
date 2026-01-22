# 🔒 Sécurité - Scripts avec Mot de Passe

## ✅ Configuration sécurisée

Les scripts suivants nécessitent le mot de passe SSH mais **ne le contiennent PLUS en clair** :

### **Fichiers personnels (⚠️ Non commitables)**

| Fichier | Status | Description |
|---------|--------|-------------|
| `deploy-env.sh` | ⛔ Dans .gitignore | Script pour déployer le .env |
| `monitor.sh` | ⛔ Dans .gitignore | Script de monitoring |

Ces fichiers **ne seront jamais committé** car ils sont dans `.gitignore`.

### **Fichiers templates (✅ Commitables)**

| Fichier | Status | Description |
|---------|--------|-------------|
| `deploy-env.sh.example` | ✅ Versionné | Template sans mot de passe |
| `monitor.sh.example` | ✅ Versionné | Template sans mot de passe |

---

## 🔐 Comment configurer

### Option 1 : Variable d'environnement globale (Recommandé)

Ajoutez dans `~/.zshrc` :

```bash
# MineralTax - Mot de passe SSH Infomaniak
export INFOMANIAK_SSH_PASSWORD='votre_mot_de_passe'
```

Rechargez :
```bash
source ~/.zshrc
```

**Avantage** : Le mot de passe est stocké une seule fois et fonctionne pour tous les scripts.

### Option 2 : Passer le mot de passe temporairement

```bash
SSHPASS='votre_mot_de_passe' ./deploy-env.sh
SSHPASS='votre_mot_de_passe' ./monitor.sh status
```

**Avantage** : Le mot de passe n'est pas persisté.

---

## 🚀 Première installation sur une nouvelle machine

```bash
# 1. Copier les templates
cp deploy-env.sh.example deploy-env.sh
cp monitor.sh.example monitor.sh

# 2. Configurer le mot de passe (choisir une option)

# Option A : Variable d'environnement (recommandé)
echo "export INFOMANIAK_SSH_PASSWORD='votre_mot_de_passe'" >> ~/.zshrc
source ~/.zshrc

# Option B : Passer à chaque fois
# SSHPASS='votre_mot_de_passe' ./script.sh

# 3. Vérifier que tout fonctionne
./monitor.sh status
./deploy-env.sh
```

---

## 🛡️ Vérification de sécurité

### Fichiers qui ne doivent JAMAIS être committé :

```bash
# Vérifier le .gitignore
cat .gitignore | grep -E "(deploy-env.sh|monitor.sh|.env)$"

# Devrait afficher :
# .env
# deploy-env.sh  
# monitor.sh
```

### Vérifier qu'aucun mot de passe n'est dans Git :

```bash
# Chercher le mot de passe dans les fichiers versionés
git ls-files | xargs grep -l "votre_mot_de_passe_réel" || echo "✅ Aucun mot de passe trouvé"
```

---

## 📋 Checklist de sécurité

Avant de commit et push :

- [ ] `deploy-env.sh` est dans `.gitignore`
- [ ] `monitor.sh` est dans `.gitignore`
- [ ] `.env` est dans `.gitignore`
- [ ] Les fichiers `.example` ne contiennent pas de mot de passe réel
- [ ] Les guides `.md` utilisent des placeholders (`votre_mot_de_passe`)
- [ ] La variable `INFOMANIAK_SSH_PASSWORD` est configurée dans `~/.zshrc`

---

## 🆘 En cas de fuite du mot de passe

Si vous avez accidentellement committé un mot de passe :

### 1. Changer le mot de passe immédiatement

Contactez Infomaniak pour changer le mot de passe SSH.

### 2. Nettoyer l'historique Git

```bash
# Option 1 : Utiliser git filter-repo (recommandé)
pip install git-filter-repo
git filter-repo --invert-paths --path deploy-env.sh --force

# Option 2 : Si le mot de passe est dans les commits récents
git rebase -i HEAD~5  # Modifier les 5 derniers commits
# Supprimer les lignes avec le mot de passe

# Force push (⚠️ Attention)
git push origin main --force
```

### 3. Mettre à jour partout

Mettez à jour le nouveau mot de passe :
- Dans `~/.zshrc` (variable `INFOMANIAK_SSH_PASSWORD`)
- Dans GitHub Secrets (`SSH_PASSWORD`)
- Dans tous vos terminaux ouverts

---

## 📚 Documentation connexe

- **Configuration** : `README-deploy-env.md`
- **Gestion .env** : `GESTION_ENV.md`
- **Déploiement** : `DEPLOY_INFOMANIAK.md`
- **Monitoring** : `MONITORING.md`

---

**Dernière mise à jour** : 22 janvier 2026
