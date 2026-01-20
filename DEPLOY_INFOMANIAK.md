# 🚀 Guide Rapide de Déploiement - Infomaniak

Ce guide contient les commandes essentielles pour mettre à jour MineralTax sur le serveur Infomaniak.

## 1. Transférer les fichiers (Depuis votre Mac)

Exécutez cette commande `rsync` pour copier **tous** les fichiers nécessaires (code, assets, config).

```bash
rsync -avz --exclude 'node_modules' --exclude '.git' \
  client server shared script dist attached_assets \
  package.json package-lock.json tsconfig.json vite.config.ts \
  tailwind.config.ts postcss.config.js drizzle.config.ts components.json .env \
  N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com:sites/mineraltax.ch/
```

## 2. Actions sur le serveur (Via SSH)

1. **Se connecter** :
   ```bash
   ssh N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com
   ```

2. **Mettre à jour** (optionnel si build local déjà fait) :
   ```bash
   cd sites/mineraltax.ch
   npm install
   # PAS de npm run build si vous avez transféré le dossier 'dist'
   ```

## 3. Configuration & Redémarrage

### ✅ Activer les Emails (Production)
Vérifiez que le fichier `.env` est correct pour la prod :
```bash
nano .env
```
Assurez-vous d'avoir :
```ini
SKIP_EMAIL_VERIFICATION=false
RESEND_API_KEY=re_votre_cle_api_resend
```

### 🔄 Redémarrer l'application (Node.js)
```bash
# Arrêter proprement le processus actuel
lsof -ti:3000 | xargs kill -9

# Démarrer en production
npm start
```

## 4. SEO & Vérification

- **Sitemap** : Accessible sur `https://mineraltax.ch/sitemap.xml`
- **Robots** : Accessible sur `https://mineraltax.ch/robots.txt`
- **Google Search Console** : Vérification DNS (TXT) ou via fichier HTML (si besoin).

---

### 📂 Rappel des fichiers transférés :
- Code source : `client/`, `server/`, `shared/`
- Scripts de build : `script/`
- Build de production : `dist/` (Site compilé)
- Assets & Images générées : `attached_assets/`
- Configuration Node : `package.json`, `package-lock.json`, `tsconfig.json`
- Configuration Build/Styling : `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- Configuration Base de données : `drizzle.config.ts`, `components.json`, `.env`
