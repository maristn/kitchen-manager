# Plano de Deploy - Kitchen Manager para Raspberry Pi

## Visão Geral
Este documento descreve o plano completo para fazer o deploy da aplicação Kitchen Manager em um servidor Ubuntu rodando em Raspberry Pi 5 (IP: 192.168.0.2).

## Arquitetura
- **Backend**: Flask (Python) rodando na porta 5000
- **Frontend**: React/Vite build estático servido via Nginx
- **Banco de Dados**: SQLite (arquivo local)
- **Servidor Web**: Nginx como reverse proxy
- **Process Manager**: systemd para gerenciar o serviço Flask

## Pré-requisitos

### No Raspberry Pi (Ubuntu Server)
- Ubuntu Server instalado e atualizado
- Acesso SSH configurado
- Usuário com privilégios sudo
- IP estático configurado (192.168.0.2)

### No seu computador local
- Acesso SSH ao Raspberry Pi
- Git instalado (para fazer push do código)
- Chave SSH configurada (opcional, mas recomendado)

## Passo a Passo

### Fase 1: Preparação do Servidor

#### 1.1 Conectar via SSH
```bash
ssh usuario@192.168.0.2
```

#### 1.2 Atualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.3 Instalar dependências básicas
```bash
sudo apt install -y python3 python3-pip python3-venv git nginx
```

#### 1.4 Criar usuário e diretório da aplicação
```bash
sudo useradd -m -s /bin/bash kitchen-manager
sudo mkdir -p /opt/kitchen-manager
sudo chown kitchen-manager:kitchen-manager /opt/kitchen-manager
```

### Fase 2: Deploy do Código

#### 2.1 Opção A: Via Git (Recomendado)
```bash
# No Raspberry Pi
cd /opt/kitchen-manager
sudo -u kitchen-manager git clone <seu-repositorio-git> .
```

#### 2.2 Opção B: Via SCP (Transferência direta)
```bash
# No seu computador local
scp -r /caminho/para/kitchen-project/* usuario@192.168.0.2:/opt/kitchen-manager/
```

#### 2.3 Opção C: Via rsync (Sincronização)
```bash
# No seu computador local
rsync -avz --exclude 'node_modules' --exclude '__pycache__' \
  /caminho/para/kitchen-project/ usuario@192.168.0.2:/opt/kitchen-manager/
```

### Fase 3: Configuração do Backend

#### 3.1 Criar ambiente virtual Python
```bash
cd /opt/kitchen-manager/backend
sudo -u kitchen-manager python3 -m venv venv
sudo -u kitchen-manager source venv/bin/activate
sudo -u kitchen-manager pip install --upgrade pip
sudo -u kitchen-manager pip install -r requirements.txt
```

#### 3.2 Criar diretório para banco de dados
```bash
sudo -u kitchen-manager mkdir -p /opt/kitchen-manager/backend/instance
```

#### 3.3 Testar backend localmente
```bash
cd /opt/kitchen-manager/backend
sudo -u kitchen-manager source venv/bin/activate
sudo -u kitchen-manager python app.py
# Testar em outro terminal: curl http://localhost:5000/api/ingredients
```

### Fase 4: Build do Frontend

#### 4.1 Instalar Node.js (se necessário)
```bash
# Instalar Node.js 18+ via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 4.2 Build do frontend
```bash
cd /opt/kitchen-manager/frontend
sudo -u kitchen-manager npm install
sudo -u kitchen-manager npm run build
# Isso cria o diretório dist/ com os arquivos estáticos
```

#### 4.3 Configurar API endpoint no frontend
Editar `/opt/kitchen-manager/frontend/src/services/api.js` antes do build para apontar para o IP do servidor, ou usar variável de ambiente.

### Fase 5: Configuração do Nginx

#### 5.1 Criar configuração do Nginx
```bash
sudo nano /etc/nginx/sites-available/kitchen-manager
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name 192.168.0.2;  # ou seu domínio se tiver

    # Frontend estático
    root /opt/kitchen-manager/frontend/dist;
    index index.html;

    # Servir arquivos estáticos do frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API Flask
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Headers para CORS (se necessário)
    add_header Access-Control-Allow-Origin *;
}
```

#### 5.2 Ativar site
```bash
sudo ln -s /etc/nginx/sites-available/kitchen-manager /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar configuração
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Fase 6: Configuração do Systemd (Serviço Flask)

#### 6.1 Criar arquivo de serviço
```bash
sudo nano /etc/systemd/system/kitchen-manager.service
```

Conteúdo:
```ini
[Unit]
Description=Kitchen Manager Flask Application
After=network.target

[Service]
Type=simple
User=kitchen-manager
WorkingDirectory=/opt/kitchen-manager/backend
Environment="PATH=/opt/kitchen-manager/backend/venv/bin"
ExecStart=/opt/kitchen-manager/backend/venv/bin/python app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 6.2 Ativar e iniciar serviço
```bash
sudo systemctl daemon-reload
sudo systemctl enable kitchen-manager
sudo systemctl start kitchen-manager
sudo systemctl status kitchen-manager
```

### Fase 7: Configuração de Firewall

#### 7.1 Configurar UFW (se ativo)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (se usar SSL)
sudo ufw enable
```

### Fase 8: Verificação e Testes

#### 8.1 Verificar serviços
```bash
# Verificar Flask
sudo systemctl status kitchen-manager
curl http://localhost:5000/api/ingredients

# Verificar Nginx
sudo systemctl status nginx
curl http://localhost/api/ingredients

# Verificar logs
sudo journalctl -u kitchen-manager -f
sudo tail -f /var/log/nginx/error.log
```

#### 8.2 Testar acesso externo
No navegador ou outro dispositivo na mesma rede:
```
http://192.168.0.2
```

## Scripts de Automação

### Script de Deploy Completo
Ver `deploy.sh` - script automatizado para fazer deploy completo

### Script de Atualização
Ver `update.sh` - script para atualizar código sem parar serviços

## Manutenção

### Atualizar código
```bash
cd /opt/kitchen-manager
sudo -u kitchen-manager git pull  # se usar Git
# ou usar update.sh
```

### Rebuild frontend após mudanças
```bash
cd /opt/kitchen-manager/frontend
sudo -u kitchen-manager npm run build
sudo systemctl reload nginx
```

### Ver logs
```bash
# Logs do Flask
sudo journalctl -u kitchen-manager -n 50 -f

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Reiniciar serviços
```bash
sudo systemctl restart kitchen-manager
sudo systemctl restart nginx
```

### Backup do banco de dados
```bash
sudo cp /opt/kitchen-manager/backend/instance/database.db \
  /opt/kitchen-manager/backups/database-$(date +%Y%m%d-%H%M%S).db
```

## Segurança

### Recomendações
1. **SSL/HTTPS**: Configurar certificado SSL (Let's Encrypt) para produção
2. **Firewall**: Manter UFW ativo e configurado
3. **SSH**: Usar chaves SSH ao invés de senha
4. **Usuário**: Rodar aplicação com usuário não-root
5. **Permissões**: Manter permissões corretas nos arquivos

### Configurar SSL (Opcional)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## Troubleshooting

### Backend não inicia
- Verificar logs: `sudo journalctl -u kitchen-manager -n 50`
- Verificar permissões: `ls -la /opt/kitchen-manager/backend/instance`
- Verificar porta: `sudo netstat -tlnp | grep 5000`

### Frontend não carrega
- Verificar Nginx: `sudo nginx -t`
- Verificar arquivos: `ls -la /opt/kitchen-manager/frontend/dist`
- Verificar logs: `sudo tail -f /var/log/nginx/error.log`

### API não responde
- Verificar CORS no backend
- Verificar proxy do Nginx
- Verificar firewall

## Próximos Passos

1. Configurar domínio (opcional)
2. Configurar SSL/HTTPS
3. Configurar backup automático
4. Configurar monitoramento
5. Configurar atualizações automáticas
