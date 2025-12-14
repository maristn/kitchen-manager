# Guia Rápido de Deploy

## Deploy Rápido (Recomendado)

### 1. No Raspberry Pi (primeira vez)
```bash
# Conectar via SSH
ssh usuario@192.168.0.2

# Executar script de configuração inicial
wget https://raw.githubusercontent.com/seu-repo/kitchen-project/main/setup_server.sh
chmod +x setup_server.sh
./setup_server.sh
```

### 2. No seu computador local
```bash
# Executar script de deploy
./deploy.sh usuario@192.168.0.2
```

### 3. Acessar aplicação
Abra no navegador: `http://192.168.0.2`

## Deploy Manual

Siga o guia completo em `DEPLOY_PLAN.md`

## Atualizações Futuras

Para atualizar o código após mudanças:

```bash
./update.sh usuario@192.168.0.2
```

## Comandos Úteis

### Ver status dos serviços
```bash
ssh usuario@192.168.0.2 "sudo systemctl status kitchen-manager"
```

### Ver logs em tempo real
```bash
ssh usuario@192.168.0.2 "sudo journalctl -u kitchen-manager -f"
```

### Reiniciar serviços
```bash
ssh usuario@192.168.0.2 "sudo systemctl restart kitchen-manager && sudo systemctl restart nginx"
```

### Backup do banco de dados
```bash
ssh usuario@192.168.0.2 "sudo cp /opt/kitchen-manager/backend/instance/database.db /opt/kitchen-manager/backups/database-\$(date +%Y%m%d-%H%M%S).db"
```

## Troubleshooting

### Erro de conexão SSH
- Verificar se SSH está habilitado no Raspberry Pi
- Verificar firewall: `sudo ufw status`
- Testar conexão: `ssh -v usuario@192.168.0.2`

### Backend não inicia
- Verificar logs: `sudo journalctl -u kitchen-manager -n 50`
- Verificar permissões: `ls -la /opt/kitchen-manager/backend/instance`
- Verificar porta: `sudo netstat -tlnp | grep 5000`

### Frontend não carrega
- Verificar build: `ls -la /opt/kitchen-manager/frontend/dist`
- Verificar Nginx: `sudo nginx -t`
- Verificar logs: `sudo tail -f /var/log/nginx/error.log`

## Configuração de IP

Se o IP mudar, atualize:
1. `frontend/.env.production` - variável `VITE_API_URL`
2. `/etc/nginx/sites-available/kitchen-manager` - `server_name`
3. Rebuild frontend e reinicie Nginx
