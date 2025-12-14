#!/bin/bash
SSH_HOST="susan@192.168.0.2"
SSH_PASS="milomilo"
SUDO_PASS="milomilo"
APP_DIR="/opt/kitchen-manager"
APP_USER="kitchen-manager"

echo "=== Atualizando Kitchen Manager ==="
echo "Servidor: $SSH_HOST"
echo ""

# Transferir backend (usando usuário correto)
echo "[1/3] Atualizando backend..."
sshpass -p "$SSH_PASS" rsync -avz --exclude '__pycache__' --exclude '*.pyc' --exclude 'venv' \
    --exclude 'instance' --exclude '.pytest_cache' --exclude 'logs' --exclude 'htmlcov' \
    --exclude '*.db' --exclude '*.log' --exclude '.coverage' \
    backend/ $SSH_HOST:/tmp/backend-update/

# Mover arquivos com sudo
sshpass -p "$SSH_PASS" ssh $SSH_HOST "echo '$SUDO_PASS' | sudo -S cp -r /tmp/backend-update/* $APP_DIR/backend/ && echo '$SUDO_PASS' | sudo -S chown -R $APP_USER:$APP_USER $APP_DIR/backend/"

# Transferir frontend
echo "[2/3] Atualizando frontend..."
sshpass -p "$SSH_PASS" rsync -avz --exclude 'node_modules' --exclude 'dist' \
    frontend/ $SSH_HOST:/tmp/frontend-update/

# Mover arquivos com sudo
sshpass -p "$SSH_PASS" ssh $SSH_HOST "echo '$SUDO_PASS' | sudo -S cp -r /tmp/frontend-update/* $APP_DIR/frontend/ && echo '$SUDO_PASS' | sudo -S chown -R $APP_USER:$APP_USER $APP_DIR/frontend/"

# Rebuild e restart
echo "[3/3] Rebuild e restart..."
sshpass -p "$SSH_PASS" ssh $SSH_HOST "echo '$SUDO_PASS' | sudo -S -u $APP_USER bash -c 'cd $APP_DIR/frontend && npm run build'"
sshpass -p "$SSH_PASS" ssh $SSH_HOST "echo '$SUDO_PASS' | sudo -S systemctl restart kitchen-manager"
sshpass -p "$SSH_PASS" ssh $SSH_HOST "echo '$SUDO_PASS' | sudo -S systemctl reload nginx"

echo ""
echo "✓ Atualização concluída!"
