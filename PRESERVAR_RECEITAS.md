# 🔒 Preservação de Receitas

## Problema Resolvido

Anteriormente, alguns scripts deletavam todas as receitas ao adicionar ingredientes. Isso foi corrigido!

## ✅ O que foi corrigido:

1. **`seed_data.py`** - Agora preserva receitas existentes por padrão
   - Use `seed_database(clear_existing=True)` apenas se quiser limpar tudo
   - Por padrão, apenas adiciona ingredientes novos sem deletar receitas

2. **`add_ingredients_only.py`** - Novo script seguro
   - Adiciona apenas ingredientes
   - **NUNCA** deleta receitas
   - Use este script quando quiser adicionar ingredientes sem risco

3. **`reset_database.py`** - Agora pede confirmação
   - Requer digitar 'SIM' para confirmar
   - Mostra quantas receitas serão deletadas antes de confirmar

4. **Rota de deletar ingrediente** - Protege receitas
   - Se um ingrediente está em receitas, apenas remove o relacionamento
   - As receitas são preservadas

## 📝 Como usar:

### Adicionar ingredientes SEM deletar receitas:
```bash
python add_ingredients_only.py
```

### Popular banco preservando receitas existentes:
```bash
python seed_data.py
# Por padrão, preserva receitas e ingredientes existentes
```

### Popular banco DELETANDO tudo (use com cuidado!):
```bash
# Edite seed_data.py e mude a última linha para:
seed_database(clear_existing=True)
```

### Resetar banco completamente (pede confirmação):
```bash
python reset_database.py
# Digite 'SIM' para confirmar
```

## 🎯 Garantias:

- ✅ Receitas são sempre preservadas ao adicionar ingredientes
- ✅ Scripts pedem confirmação antes de deletar
- ✅ Receitas não são deletadas quando ingredientes são removidos
- ✅ Banco de receitas permanece intacto

## 💡 Dica:

Sempre use `add_ingredients_only.py` quando quiser adicionar ingredientes sem risco de perder receitas!
