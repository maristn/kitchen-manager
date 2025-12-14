#!/bin/bash
# Script de Atualização com senha
SSH_HOST="susan@192.168.0.2"
SSH_PASS="milomilo"
APP_DIR="/opt/kitchen-manager"
APP_USER="kitchen-manager"

echo "=== Atualizando Kitchen Manager ==="
echo "Servidor: $SSH_HOST"
echo ""

# Transferir backend
echo "[1/3] Atualizando backend..."
sshpass -p "$SSH_PASS" rsync -avz --exclude '__pycache__' --exclude '*.pyc' --exclude 'venv' \
    --exclude 'instance' --exclude '.pytest_cache' --exclude 'logs' \
    backend/ $SSH_HOST:$APP_DIR/backend/

# Transferir frontend
echo "[2/3] Atualizando frontend..."
sshpass -p "$SSH_PASS" rsync -avz --exclude 'node_modules' --exclude 'dist' \
    frontend/ $SSH_HOST:$APP_DIR/frontend/

# Rebuild e restart
echo "[3/3] Rebuild e restart..."
sshpass -p "$SSH_PASS" ssh $SSH_HOST "sudo -u $APP_USER bash -c 'cd $APP_DIR/frontend && npm run build'"
sshpass -p "$SSH_PASS" ssh $SSH_HOST "sudo systemctl restart kitchen-manager"
sshpass -p "$SSH_PASS" ssh $SSH_HOST "sudo systemctl reload nginx"

echo ""
echo "✓ Atualização concluída!"
