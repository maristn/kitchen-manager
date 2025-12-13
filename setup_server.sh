#!/bin/bash

# Script para executar no servidor Raspberry Pi
# Configura o ambiente inicial

set -e

APP_DIR="/opt/kitchen-manager"
APP_USER="kitchen-manager"

echo "=== Configuração Inicial do Servidor ==="

# Atualizar sistema
echo "[1/6] Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependências
echo "[2/6] Instalando dependências..."
sudo apt install -y python3 python3-pip python3-venv git nginx

# Instalar Node.js
echo "[3/6] Instalando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Criar usuário
echo "[4/6] Criando usuário da aplicação..."
sudo useradd -m -s /bin/bash $APP_USER 2>/dev/null || true

# Criar diretórios
echo "[5/6] Criando estrutura de diretórios..."
sudo mkdir -p $APP_DIR/backend/instance $APP_DIR/frontend $APP_DIR/backups
sudo chown -R $APP_USER:$APP_USER $APP_DIR

# Configurar firewall
echo "[6/6] Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ""
echo "✓ Configuração inicial concluída!"
echo ""
echo "Próximos passos:"
echo "1. Execute o deploy.sh do seu computador local"
echo "2. Ou transfira os arquivos manualmente e configure os serviços"
