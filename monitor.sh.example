#!/bin/bash
# Script de monitoring pour MineralTax sur Infomaniak

# Lire le mot de passe depuis la variable d'environnement
if [ -z "$SSHPASS" ]; then
    if [ -n "$INFOMANIAK_SSH_PASSWORD" ]; then
        export SSHPASS="$INFOMANIAK_SSH_PASSWORD"
    else
        echo "❌ Erreur : Mot de passe SSH non configuré"
        echo "Utilisez : SSHPASS='votre_mot_de_passe' ./monitor.sh [command]"
        exit 1
    fi
fi

echo "🔍 Monitoring MineralTax sur Infomaniak..."
echo ""

# Fonction pour afficher le statut
function status() {
    echo "📊 Statut de l'application:"
    sshpass -e ssh -o StrictHostKeyChecking=no \
        N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
        'cd sites/mineraltax.ch && ./node_modules/.bin/pm2 status'
}

# Fonction pour afficher les logs
function logs() {
    echo "📝 Derniers logs (appuyez sur Ctrl+C pour quitter):"
    sshpass -e ssh -o StrictHostKeyChecking=no \
        N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
        'cd sites/mineraltax.ch && ./node_modules/.bin/pm2 logs mineraltax --lines 30'
}

# Fonction pour afficher les infos détaillées
function info() {
    echo "ℹ️  Informations détaillées:"
    sshpass -e ssh -o StrictHostKeyChecking=no \
        N89UEvW6WcN_Mineraltax@57-106659.ssh.hosting-ik.com \
        'cd sites/mineraltax.ch && ./node_modules/.bin/pm2 show mineraltax'
}

# Fonction pour tester la connexion
function ping() {
    echo "🌐 Test de connexion à https://mineraltax.ch..."
    curl -s -o /dev/null -w "Status: %{http_code}\nTemps de réponse: %{time_total}s\n" https://mineraltax.ch
}

# Menu
case "$1" in
    status)
        status
        ;;
    logs)
        logs
        ;;
    info)
        info
        ;;
    ping)
        ping
        ;;
    *)
        echo "Usage: $0 {status|logs|info|ping}"
        echo ""
        echo "Commandes disponibles:"
        echo "  status  - Affiche le statut PM2 de l'application"
        echo "  logs    - Affiche les logs en temps réel"
        echo "  info    - Affiche les informations détaillées"
        echo "  ping    - Test la disponibilité du site"
        echo ""
        echo "Exemples:"
        echo "  ./monitor.sh status"
        echo "  ./monitor.sh logs"
        exit 1
        ;;
esac
