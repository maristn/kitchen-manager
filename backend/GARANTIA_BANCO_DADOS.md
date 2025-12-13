# 🔒 Garantia de Uso do Banco de Dados Correto

## ✅ Status Atual

- **Banco de dados correto**: `/Users/anacarol/code/kitchen-project/backend/instance/database.db`
- **Banco configurado em**: `app.py` (linha 16)
- **Todos os scripts usam**: `create_app()` que garante o banco correto

## 📁 Estrutura do Banco

O Flask, por padrão, procura o banco em `instance/database.db` quando roda como aplicação. O `app.py` foi configurado para:

1. Sempre usar `instance/database.db`
2. Criar a pasta `instance/` se não existir
3. Garantir que todos os scripts usem o mesmo banco

## ✅ Verificações Implementadas

### 1. Script `reset_to_zero.py`
- Mostra qual banco está sendo usado antes de executar
- Confirma o caminho absoluto do banco
- Verifica o resultado após a operação

### 2. Script `add_molho_tomate.py` (atualizado)
- Verifica e mostra qual banco está sendo usado
- Alerta se o banco não for o esperado

### 3. Helper `db_helper.py`
- Função `verify_db_path()` para verificar o banco
- Função `get_app_with_correct_db()` para garantir o banco correto

## 🔍 Como Verificar o Banco em Uso

```python
from app import create_app
from models import db
import os

app = create_app()
with app.app_context():
    db_path = str(db.engine.url).replace('sqlite:///', '')
    abs_db_path = os.path.abspath(db_path)
    print(f"Banco em uso: {abs_db_path}")
```

## 📝 Padrão para Novos Scripts

Todos os scripts devem seguir este padrão:

```python
from app import create_app
from models import db, Ingredient, Recipe
import os

def meu_script():
    app = create_app()
    
    with app.app_context():
        # Verificar banco (opcional, mas recomendado)
        db_path = str(db.engine.url).replace('sqlite:///', '')
        abs_db_path = os.path.abspath(db_path)
        expected_path = os.path.join(os.path.dirname(__file__), 'instance', 'database.db')
        expected_abs_path = os.path.abspath(expected_path)
        
        if abs_db_path != expected_abs_path:
            print(f"⚠️  AVISO: Esperado {expected_abs_path}, usando {abs_db_path}")
        else:
            print(f"✅ Banco correto: {abs_db_path}")
        
        # Seu código aqui...
        # ...
```

## ✅ Status do Reset

Após o reset:
- ✅ 0 receitas
- ✅ 1 ingrediente (Água)
- ✅ Banco correto em uso
- ✅ API funcionando corretamente

## 🎯 Próximos Passos

Ao adicionar novos dados:
1. Sempre use `create_app()` do `app.py`
2. O banco será automaticamente `instance/database.db`
3. Verifique o resultado após inserir dados
4. Teste na API: `curl http://localhost:5000/api/recipes`
