# 🔧 Configuration du script deploy-env.sh

## ⚡ Configuration rapide

Le script `deploy-env.sh` nécessite votre mot de passe SSH. Pour des raisons de sécurité, ce mot de passe **n'est pas stocké dans le script**.

### Option 1 : Variable d'environnement globale (Recommandé)

Ajoutez cette ligne à votre `~/.zshrc` :

```bash
export INFOMANIAK_SSH_PASSWORD='votre_mot_de_passe'
```

Puis rechargez :
```bash
source ~/.zshrc
```

### Option 2 : Passer le mot de passe à chaque fois

```bash
SSHPASS='votre_mot_de_passe' ./deploy-env.sh
```

## 📄 Fichiers du projet

- `deploy-env.sh` → Script personnel (⚠️ dans .gitignore, ne sera pas commité)
- `deploy-env.sh.example` → Template sans mot de passe (peut être commité)

## 🔒 Sécurité

- ✅ `deploy-env.sh` est dans `.gitignore`
- ✅ Le mot de passe n'est jamais commité dans Git
- ✅ Utilisez les variables d'environnement pour le stocker

## 📚 Documentation complète

Voir `GESTION_ENV.md` pour plus d'informations.
