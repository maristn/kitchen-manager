# Checklist de Deploy

Use este checklist para garantir que todos os passos foram executados corretamente.

## Pré-Deploy

- [ ] Raspberry Pi está acessível via SSH
- [ ] IP estático configurado (192.168.0.2)
- [ ] Chave SSH configurada (opcional mas recomendado)
- [ ] Código está commitado e atualizado

## Deploy Inicial

### No Raspberry Pi
- [ ] Executar `setup_server.sh` ou instalar dependências manualmente
- [ ] Verificar que Python 3, Node.js e Nginx estão instalados
- [ ] Verificar que usuário `kitchen-manager` foi criado

### No Computador Local
- [ ] Executar `./deploy.sh usuario@192.168.0.2`
- [ ] Verificar que não houve erros durante o deploy

## Verificação Pós-Deploy

### Serviços
- [ ] Serviço Flask está rodando: `sudo systemctl status kitchen-manager`
- [ ] Nginx está rodando: `sudo systemctl status nginx`
- [ ] Porta 5000 está em uso: `sudo netstat -tlnp | grep 5000`
- [ ] Porta 80 está em uso: `sudo netstat -tlnp | grep 80`

### Testes de Funcionalidade
- [ ] API responde: `curl http://localhost:5000/api/ingredients`
- [ ] Frontend carrega: `curl http://localhost/`
- [ ] Acesso externo funciona: `http://192.168.0.2` no navegador
- [ ] API funciona via Nginx: `curl http://192.168.0.2/api/ingredients`

### Logs
- [ ] Logs do Flask sem erros: `sudo journalctl -u kitchen-manager -n 50`
- [ ] Logs do Nginx sem erros: `sudo tail -n 50 /var/log/nginx/error.log`

### Permissões
- [ ] Diretório da aplicação pertence ao usuário correto: `ls -la /opt/kitchen-manager`
- [ ] Banco de dados tem permissões corretas: `ls -la /opt/kitchen-manager/backend/instance/`

## Configuração de Segurança

- [ ] Firewall configurado (UFW)
- [ ] SSH configurado com chaves (opcional)
- [ ] Aplicação roda com usuário não-root
- [ ] Permissões de arquivos corretas

## Backup

- [ ] Script de backup configurado
- [ ] Primeiro backup executado com sucesso
- [ ] Local de backup verificado

## Documentação

- [ ] IP do servidor documentado
- [ ] Credenciais SSH documentadas (se aplicável)
- [ ] Comandos de manutenção documentados

## Próximos Passos (Opcional)

- [ ] Configurar domínio (se aplicável)
- [ ] Configurar SSL/HTTPS
- [ ] Configurar backup automático
- [ ] Configurar monitoramento
- [ ] Configurar atualizações automáticas
