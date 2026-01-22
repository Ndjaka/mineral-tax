#!/bin/bash
# Script pour déployer le fichier .env sur le serveur Infomaniak

# Lire le mot de passe depuis la variable d'environnement
if [ -z "$SSHPASS" ]; then
    if [ -n "$INFOMANIAK_SSH_PASSWORD" ]; then
        export SSHPASS="$INFOMANIAK_SSH_PASSWORD"
    else
        echo "❌ Erreur : Mot de passe SSH non configuré"
        echo "Utilisez : SSHPASS='votre_mot_de_passe' ./deploy-env.sh"
        exit 1
    fi
fi

echo "🔐 Transfert du fichier .env vers le serveur..."

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
    echo "❌ Erreur : fichier .env introuvable"
    exit 1
fi

# Transférer le .env
sshpass -e rsync -avz \
  -e "ssh -o StrictHostKeyChecking=no" \
  .env \
  N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com:sites/mineraltax.ch/.env

if [ $? -eq 0 ]; then
    echo "✅ Fichier .env transféré avec succès"
    echo ""
    echo "🔄 Redémarrage de l'application pour charger les nouvelles variables..."
    
    # Redémarrer l'application pour charger les nouvelles variables
    sshpass -e ssh -o StrictHostKeyChecking=no \
      N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
      'cd sites/mineraltax.ch && ./node_modules/.bin/pm2 restart mineraltax' || true
    
    echo "✅ Application redémarrée"
else
    echo "❌ Erreur lors du transfert"
    exit 1
fi
