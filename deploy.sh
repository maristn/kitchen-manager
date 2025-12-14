#!/bin/bash

# Script de Deploy para Raspberry Pi
# Uso: ./deploy.sh usuario@192.168.0.2

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar argumentos
if [ -z "$1" ]; then
    echo -e "${RED}Erro: Forneça o endereço SSH${NC}"
    echo "Uso: ./deploy.sh usuario@192.168.0.2"
    exit 1
fi

SSH_HOST=$1
APP_DIR="/opt/kitchen-manager"
APP_USER="kitchen-manager"

echo -e "${GREEN}=== Deploy do Kitchen Manager ===${NC}"
echo "Servidor: $SSH_HOST"
echo "Diretório: $APP_DIR"
echo ""

# Função para executar comandos remotos
remote_exec() {
    ssh $SSH_HOST "$1"
}

# Função para executar comandos como usuário da aplicação
remote_exec_user() {
    ssh $SSH_HOST "sudo -u $APP_USER $1"
}

echo -e "${YELLOW}[1/8] Verificando conexão SSH...${NC}"
if ! ssh -o ConnectTimeout=5 $SSH_HOST "echo 'Conexão OK'" > /dev/null 2>&1; then
    echo -e "${RED}Erro: Não foi possível conectar via SSH${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Conexão estabelecida${NC}"

echo -e "${YELLOW}[2/8] Verificando dependências no servidor...${NC}"
remote_exec "command -v python3 >/dev/null 2>&1 || { echo 'Python3 não encontrado'; exit 1; }"
remote_exec "command -v nginx >/dev/null 2>&1 || { echo 'Nginx não encontrado'; exit 1; }"
echo -e "${GREEN}✓ Dependências verificadas${NC}"

echo -e "${YELLOW}[3/8] Criando estrutura de diretórios...${NC}"
remote_exec "sudo mkdir -p $APP_DIR/backend/instance $APP_DIR/frontend $APP_DIR/backups"
remote_exec "sudo useradd -m -s /bin/bash $APP_USER 2>/dev/null || true"
remote_exec "sudo chown -R $APP_USER:$APP_USER $APP_DIR"
echo -e "${GREEN}✓ Estrutura criada${NC}"

echo -e "${YELLOW}[4/8] Transferindo arquivos do backend...${NC}"
rsync -avz --exclude '__pycache__' --exclude '*.pyc' --exclude 'venv' \
    --exclude 'instance' --exclude '.pytest_cache' \
    backend/ $SSH_HOST:$APP_DIR/backend/
echo -e "${GREEN}✓ Backend transferido${NC}"

echo -e "${YELLOW}[5/8] Configurando ambiente virtual Python...${NC}"
remote_exec_user "cd $APP_DIR/backend && python3 -m venv venv"
remote_exec_user "cd $APP_DIR/backend && source venv/bin/activate && pip install --upgrade pip"
remote_exec_user "cd $APP_DIR/backend && source venv/bin/activate && pip install -r requirements.txt"
echo -e "${GREEN}✓ Ambiente Python configurado${NC}"

echo -e "${YELLOW}[6/8] Transferindo arquivos do frontend...${NC}"
rsync -avz --exclude 'node_modules' --exclude 'dist' \
    frontend/ $SSH_HOST:$APP_DIR/frontend/
echo -e "${GREEN}✓ Frontend transferido${NC}"

echo -e "${YELLOW}[7/8] Build do frontend...${NC}"
remote_exec "command -v node >/dev/null 2>&1 || { echo 'Node.js não encontrado. Instalando...'; curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs; }"

# Configurar variável de ambiente para produção
SERVER_IP=$(echo $SSH_HOST | cut -d'@' -f2)
echo "VITE_API_URL=http://${SERVER_IP}/api" | remote_exec_user "cat > $APP_DIR/frontend/.env.production"

remote_exec_user "cd $APP_DIR/frontend && npm install"
remote_exec_user "cd $APP_DIR/frontend && npm run build"
echo -e "${GREEN}✓ Frontend buildado${NC}"

echo -e "${YELLOW}[8/8] Configurando serviços...${NC}"

# Criar arquivo de serviço systemd
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

scp /tmp/kitchen-manager.service $SSH_HOST:/tmp/
remote_exec "sudo mv /tmp/kitchen-manager.service /etc/systemd/system/"
remote_exec "sudo systemctl daemon-reload"
remote_exec "sudo systemctl enable kitchen-manager"
remote_exec "sudo systemctl restart kitchen-manager"

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

scp /tmp/kitchen-manager-nginx $SSH_HOST:/tmp/
remote_exec "sudo mv /tmp/kitchen-manager-nginx /etc/nginx/sites-available/kitchen-manager"
remote_exec "sudo ln -sf /etc/nginx/sites-available/kitchen-manager /etc/nginx/sites-enabled/"
remote_exec "sudo nginx -t && sudo systemctl restart nginx"

echo -e "${GREEN}✓ Serviços configurados${NC}"

echo ""
echo -e "${GREEN}=== Deploy concluído com sucesso! ===${NC}"
echo ""
echo "Acesse a aplicação em: http://192.168.0.2"
echo ""
echo "Comandos úteis:"
echo "  Ver status: ssh $SSH_HOST 'sudo systemctl status kitchen-manager'"
echo "  Ver logs: ssh $SSH_HOST 'sudo journalctl -u kitchen-manager -f'"
echo "  Reiniciar: ssh $SSH_HOST 'sudo systemctl restart kitchen-manager'"
