#!/bin/bash

# Script de Deploy com suporte a senha
# Uso: ./deploy_with_password.sh

set -e

SSH_HOST="susan@192.168.0.2"
SSH_PASS="milomilo"
APP_DIR="/opt/kitchen-manager"
APP_USER="kitchen-manager"

# Verificar se sshpass está instalado
if ! command -v sshpass &> /dev/null; then
    echo "Instalando sshpass..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass 2>/dev/null || {
            echo "Erro: sshpass não encontrado. Instale com: brew install hudochenkov/sshpass/sshpass"
            exit 1
        }
    else
        sudo apt-get install -y sshpass 2>/dev/null || {
            echo "Erro: sshpass não encontrado. Instale com: sudo apt-get install sshpass"
            exit 1
        }
    fi
fi

# Função para executar comandos remotos com senha
remote_exec() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $SSH_HOST "$1"
}

# Função para executar comandos como usuário da aplicação
# Primeiro executa como susan, depois ajusta permissões
remote_exec_user() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $SSH_HOST "bash -c '$1'"
    # Ajustar permissões depois
    remote_exec_sudo "chown -R $APP_USER:$APP_USER $APP_DIR 2>/dev/null || true"
}

# Função para executar comandos sudo
remote_exec_sudo() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $SSH_HOST "echo '$SSH_PASS' | sudo -S bash -c '$1'"
}

# Função para copiar arquivos com senha
remote_copy() {
    sshpass -p "$SSH_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$1" $SSH_HOST:"$2"
}

echo "=== Deploy do Kitchen Manager ==="
echo "Servidor: $SSH_HOST"
echo ""

echo "[1/9] Verificando conexão SSH..."
if ! remote_exec "echo 'Conexão OK'" > /dev/null 2>&1; then
    echo "Erro: Não foi possível conectar via SSH"
    exit 1
fi
echo "✓ Conexão estabelecida"

echo "[2/9] Verificando e instalando dependências no servidor..."
remote_exec_sudo "command -v python3 >/dev/null 2>&1 || (apt update && apt install -y python3 python3-pip python3-venv)"
remote_exec_sudo "command -v nginx >/dev/null 2>&1 || apt install -y nginx"
remote_exec_sudo "command -v node >/dev/null 2>&1 || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs)"
echo "✓ Dependências verificadas"

echo "[3/9] Criando estrutura de diretórios..."
remote_exec_sudo "mkdir -p $APP_DIR/backend/instance $APP_DIR/frontend $APP_DIR/backups"
remote_exec_sudo "useradd -m -s /bin/bash $APP_USER 2>/dev/null || true"
remote_exec_sudo "chown -R $APP_USER:$APP_USER $APP_DIR"
echo "✓ Estrutura criada"

echo "[4/9] Transferindo arquivos do backend..."
# Transferir para diretório temporário primeiro
rsync -avz -e "sshpass -p '$SSH_PASS' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
    --exclude '__pycache__' --exclude '*.pyc' --exclude 'venv' \
    --exclude 'instance' --exclude '.pytest_cache' \
    backend/ $SSH_HOST:/tmp/backend-deploy/
# Mover e ajustar permissões
remote_exec_sudo "rm -rf $APP_DIR/backend/* && cp -r /tmp/backend-deploy/* $APP_DIR/backend/ && chown -R $APP_USER:$APP_USER $APP_DIR/backend && rm -rf /tmp/backend-deploy"
echo "✓ Backend transferido"

echo "[5/9] Configurando ambiente virtual Python..."
remote_exec_user "cd $APP_DIR/backend && python3 -m venv venv"
remote_exec_user "cd $APP_DIR/backend && source venv/bin/activate && pip install --upgrade pip"
remote_exec_user "cd $APP_DIR/backend && source venv/bin/activate && pip install -r requirements.txt"
echo "✓ Ambiente Python configurado"

echo "[6/9] Transferindo arquivos do frontend..."
# Transferir para diretório temporário primeiro
rsync -avz -e "sshpass -p '$SSH_PASS' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
    --exclude 'node_modules' --exclude 'dist' \
    frontend/ $SSH_HOST:/tmp/frontend-deploy/
# Mover e ajustar permissões
remote_exec_sudo "rm -rf $APP_DIR/frontend/* && cp -r /tmp/frontend-deploy/* $APP_DIR/frontend/ && chown -R $APP_USER:$APP_USER $APP_DIR/frontend && rm -rf /tmp/frontend-deploy"
echo "✓ Frontend transferido"

echo "[7/9] Configurando variável de ambiente e build do frontend..."
remote_exec_user "echo 'VITE_API_URL=http://192.168.0.2/api' > $APP_DIR/frontend/.env.production"
remote_exec_user "cd $APP_DIR/frontend && npm install"
remote_exec_user "cd $APP_DIR/frontend && npm run build"
echo "✓ Frontend buildado"

echo "[8/9] Configurando serviço systemd..."

# Criar arquivo de serviço
cat > /tmp/kitchen-manager.service << EOF
[Unit]
Description=Kitchen Manager Flask Application
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$APP_DIR/backend/venv/bin"
ExecStart=$APP_DIR/backend/venv/bin/python app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

remote_copy "/tmp/kitchen-manager.service" "/tmp/"
remote_exec_sudo "mv /tmp/kitchen-manager.service /etc/systemd/system/"
remote_exec_sudo "systemctl daemon-reload"
remote_exec_sudo "systemctl enable kitchen-manager"
remote_exec_sudo "systemctl restart kitchen-manager"

echo "[9/9] Configurando Nginx..."

# Criar configuração Nginx
cat > /tmp/kitchen-manager-nginx << EOF
server {
    listen 80;
    server_name 192.168.0.2;

    root $APP_DIR/frontend/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

remote_copy "/tmp/kitchen-manager-nginx" "/tmp/"
remote_exec_sudo "mv /tmp/kitchen-manager-nginx /etc/nginx/sites-available/kitchen-manager"
remote_exec_sudo "ln -sf /etc/nginx/sites-available/kitchen-manager /etc/nginx/sites-enabled/"
remote_exec_sudo "nginx -t && systemctl restart nginx"

echo ""
echo "=== Deploy concluído com sucesso! ==="
echo ""
echo "Acesse a aplicação em: http://192.168.0.2"
echo ""
echo "Verificando status dos serviços..."
remote_exec_sudo "systemctl status kitchen-manager --no-pager | head -10"
echo ""
echo "Para ver logs: sshpass -p '$SSH_PASS' ssh $SSH_HOST 'echo milomilo | sudo -S journalctl -u kitchen-manager -f'"
