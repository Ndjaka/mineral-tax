# Guide de déploiement MineralTax via SFTP

## Fichiers à transférer

Transférez TOUS les fichiers/dossiers suivants :

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
design_guidelines.md
```

## Fichiers à NE PAS transférer

```
node_modules/          (sera installé sur le serveur)
.env                   (transférer séparément, contient les secrets)
.git/                  (pas nécessaire)
exports/               (fichiers d'aide, pas pour la production)
attached_assets/       (fichiers de développement)
```

## Configuration FileZilla

1. **Fichier** → **Gestionnaire de sites** → **Nouveau site**
2. Paramètres :
   - **Protocole** : SFTP - SSH File Transfer Protocol
   - **Hôte** : votre-serveur.myd.infomaniak.com
   - **Port** : 22
   - **Type d'authentification** : Normale
   - **Utilisateur** : votre-username
   - **Mot de passe** : votre-password
3. **Connexion**

## Étapes de déploiement

### 1. Premier transfert
- Connectez-vous via FileZilla
- Naviguez vers le dossier de votre site Node.js
- Transférez tous les fichiers listés ci-dessus

### 2. Créer le fichier .env sur le serveur
- Copiez le contenu de `exports/.env.example`
- Créez un fichier `.env` à la racine du site
- Remplissez avec vos vraies valeurs

### 3. Connexion SSH pour installer les dépendances
```bash
ssh votre-username@votre-serveur.myd.infomaniak.com
cd /chemin/vers/votre/site
npm install
npm run build
```

### 4. Configuration dans le Manager Infomaniak
- **Commande de build** : `npm run build`
- **Commande de lancement** : `npm start`
- **Port** : Le port défini sera disponible via process.env.PORT

### 5. Importer la base de données
- Accédez à phpPgAdmin ou utilisez psql
- Exécutez le contenu de `exports/mineraltax_fresh_install.sql`

### 6. Démarrer l'application
- Dans le Manager, cliquez sur **Start** ou **Restart**
- Vérifiez les logs pour confirmer le démarrage

## Mises à jour futures

Pour les mises à jour, transférez uniquement les fichiers modifiés :
1. Transférez les fichiers modifiés via SFTP
2. Connectez-vous en SSH
3. Exécutez `npm install` si package.json a changé
4. Exécutez `npm run build`
5. Redémarrez l'application dans le Manager

## Vérification

Après déploiement, testez :
- [ ] Page d'accueil accessible
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard s'affiche
