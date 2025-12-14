#!/bin/bash

# Script para verificar logs do backend Flask

echo "=== Verificando processos do backend Flask ==="
echo ""

# Verificar processos Python rodando app.py
PROCESSES=$(ps aux | grep -E "python.*app.py|flask run" | grep -v grep)

if [ -z "$PROCESSES" ]; then
    echo "❌ Nenhum processo do backend Flask encontrado rodando."
    echo ""
    echo "Para iniciar o servidor, execute:"
    echo "  cd backend"
    echo "  python app.py"
    echo ""
    echo "Ou se estiver usando um ambiente virtual:"
    echo "  cd backend"
    echo "  source venv/bin/activate  # ou .venv/bin/activate"
    echo "  python app.py"
else
    echo "✅ Processos encontrados:"
    echo "$PROCESSES"
    echo ""
    echo "Os logs aparecem no terminal onde você iniciou o servidor."
    echo ""
    echo "Para ver os logs em tempo real, você pode:"
    echo "1. Verificar o terminal onde o servidor está rodando"
    echo "2. Ou reiniciar o servidor para ver os logs:"
    echo "   - Pare o servidor (CTRL+C)"
    echo "   - Execute: cd backend && python app.py"
fi

echo ""
echo "=== Verificando arquivos de log ==="
echo ""

# Verificar se há arquivos de log
if [ -f "app.log" ]; then
    echo "✅ Arquivo app.log encontrado"
    echo "Últimas 20 linhas:"
    tail -20 app.log
elif [ -f "../app.log" ]; then
    echo "✅ Arquivo app.log encontrado no diretório pai"
    echo "Últimas 20 linhas:"
    tail -20 ../app.log
else
    echo "ℹ️  Nenhum arquivo de log encontrado."
    echo "   Os logs aparecem apenas no terminal (modo debug)."
fi

echo ""
echo "=== Dica: Para capturar logs em arquivo ==="
echo "Execute o servidor com redirecionamento:"
echo "  python app.py 2>&1 | tee app.log"
echo ""
echo "Isso salvará os logs em app.log e também mostrará no terminal."
