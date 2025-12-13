# Deploy Rápido - Kitchen Manager

## Opção 1: Deploy Automatizado (Recomendado)

### Passo 1: No Raspberry Pi (primeira vez apenas)
```bash
ssh usuario@192.168.0.2

# Baixar e executar script de setup
curl -O https://raw.githubusercontent.com/seu-repo/kitchen-project/main/setup_server.sh
chmod +x setup_server.sh
./setup_server.sh
```

### Passo 2: No seu computador
```bash
cd /caminho/para/kitchen-project
./deploy.sh usuario@192.168.0.2
```

### Passo 3: Acessar
Abra no navegador: `http://192.168.0.2`

---

## Opção 2: Deploy Manual

### 1. Conectar ao servidor
```bash
ssh usuario@192.168.0.2
```

### 2. Instalar dependências
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git nginx nodejs npm
```

### 3. Criar estrutura
```bash
sudo mkdir -p /opt/kitchen-manager
sudo useradd -m -s /bin/bash kitchen-manager
sudo chown kitchen-manager:kitchen-manager /opt/kitchen-manager
```

### 4. Transferir código (do seu computador)
```bash
rsync -avz --exclude 'node_modules' --exclude '__pycache__' \
  /caminho/para/kitchen-project/ usuario@192.168.0.2:/opt/kitchen-manager/
```

### 5. Configurar backend (no servidor)
```bash
cd /opt/kitchen-manager/backend
sudo -u kitchen-manager python3 -m venv venv
sudo -u kitchen-manager source venv/bin/activate
sudo -u kitchen-manager pip install -r requirements.txt
```

### 6. Build frontend (no servidor)
```bash
cd /opt/kitchen-manager/frontend
sudo -u kitchen-manager npm install
# Criar .env.production com: VITE_API_URL=http://192.168.0.2/api
sudo -u kitchen-manager npm run build
```

### 7. Configurar Nginx
Criar `/etc/nginx/sites-available/kitchen-manager`:
```nginx
server {
    listen 80;
    server_name 192.168.0.2;
    root /opt/kitchen-manager/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/kitchen-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Configurar serviço Flask
Criar `/etc/systemd/system/kitchen-manager.service`:
```ini
[Unit]
Description=Kitchen Manager Flask App
After=network.target

[Service]
Type=simple
User=kitchen-manager
WorkingDirectory=/opt/kitchen-manager/backend
Environment="PATH=/opt/kitchen-manager/backend/venv/bin"
ExecStart=/opt/kitchen-manager/backend/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Ativar:
```bash
sudo systemctl daemon-reload
sudo systemctl enable kitchen-manager
sudo systemctl start kitchen-manager
```

---

## Atualizações Futuras

```bash
./update.sh usuario@192.168.0.2
```

---

## Comandos Úteis

```bash
# Status
ssh usuario@192.168.0.2 "sudo systemctl status kitchen-manager"

# Logs
ssh usuario@192.168.0.2 "sudo journalctl -u kitchen-manager -f"

# Reiniciar
ssh usuario@192.168.0.2 "sudo systemctl restart kitchen-manager"
```

---

Para mais detalhes, veja `DEPLOY_PLAN.md`
