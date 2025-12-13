#!/bin/bash

# Script de Atualização Rápida
# Uso: ./update.sh usuario@192.168.0.2

set -e

SSH_HOST=${1:-"usuario@192.168.0.2"}
APP_DIR="/opt/kitchen-manager"
APP_USER="kitchen-manager"

echo "=== Atualizando Kitchen Manager ==="
echo "Servidor: $SSH_HOST"
echo ""

# Transferir backend
echo "[1/3] Atualizando backend..."
rsync -avz --exclude '__pycache__' --exclude '*.pyc' --exclude 'venv' \
    --exclude 'instance' --exclude '.pytest_cache' \
    backend/ $SSH_HOST:$APP_DIR/backend/

# Transferir frontend
echo "[2/3] Atualizando frontend..."
rsync -avz --exclude 'node_modules' --exclude 'dist' \
    frontend/ $SSH_HOST:$APP_DIR/frontend/

# Rebuild e restart
echo "[3/3] Rebuild e restart..."
ssh $SSH_HOST "sudo -u $APP_USER cd $APP_DIR/frontend && npm run build"
ssh $SSH_HOST "sudo systemctl restart kitchen-manager"
ssh $SSH_HOST "sudo systemctl reload nginx"

echo ""
echo "✓ Atualização concluída!"
