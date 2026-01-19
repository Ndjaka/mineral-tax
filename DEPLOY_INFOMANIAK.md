# 🚀 Guide Rapide de Déploiement - Infomaniak

Ce guide contient les commandes essentielles pour mettre à jour MineralTax sur le serveur Infomaniak.

## 1. Transférer les fichiers (Depuis votre Mac)

Exécutez cette commande `rsync` pour copier uniquement les fichiers nécessaires.

```bash
rsync -avz \
  client server shared script dist \
  package.json package-lock.json tsconfig.json vite.config.ts \
  tailwind.config.ts postcss.config.js drizzle.config.ts components.json .env \
  N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com:sites/mineraltax.ch/
```

## 2. Actions sur le serveur (Via SSH)

1. **Se connecter** :
   ```bash
   ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com
   ```

2. **Mettre à jour et compiler** :
   ```bash
   cd sites/mineraltax.ch
   npm install
   npm run build
   ```

## 3. Redémarrer l'application

Une fois le build terminé, allez dans votre **Manager Infomaniak** :
- Hébergement Web > **mineraltax.ch**
- Cliquez sur **Redémarrer** dans le tableau de bord Node.js.

---

### 📂 Rappel des fichiers transférés :
- Code source : `client/`, `server/`, `shared/`
- Scripts de build : `script/`
- Build de production : `dist/`
- Configuration Node : `package.json`, `package-lock.json`, `tsconfig.json`
- Configuration Build/Styling : `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- Configuration Base de données : `drizzle.config.ts`, `components.json`, `.env`
