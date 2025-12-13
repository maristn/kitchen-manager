# Testes Unitários

Este diretório contém os testes unitários para o projeto Kitchen Manager.

## Estrutura

- `conftest.py`: Configuração e fixtures compartilhadas
- `test_models.py`: Testes para modelos (Ingredient, Recipe, FrozenMeal, etc.)
- `test_ingredients.py`: Testes para rotas de ingredientes
- `test_recipes.py`: Testes para rotas de receitas
- `test_frozen_meals.py`: Testes para rotas de refeições congeladas
- `test_shopping.py`: Testes para rotas de lista de compras
- `test_history.py`: Testes para rotas de histórico de cozimento

## Executando os Testes

### Executar todos os testes:
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

### Executar um arquivo específico:
```bash
pytest tests/test_models.py -v
```

### Executar um teste específico:
```bash
pytest tests/test_models.py::TestIngredient::test_create_ingredient -v
```

### Executar com cobertura:
```bash
pytest tests/ --cov=. --cov-report=html
```

## Fixtures Disponíveis

- `app`: Aplicação Flask configurada para testes
- `client`: Cliente de teste Flask
- `db_session`: Sessão do banco de dados
- `sample_ingredient`: Ingrediente de exemplo
- `sample_recipe`: Receita de exemplo com ingrediente
- `sample_frozen_meal`: Refeição congelada de exemplo
- `sample_cooking_history`: Histórico de cozimento de exemplo
- `sample_shopping_item`: Item de lista de compras de exemplo
- `multiple_ingredients`: Múltiplos ingredientes para testes
- `multiple_recipes`: Múltiplas receitas para testes

## Cobertura de Testes

Os testes cobrem:
- ✅ Criação, leitura, atualização e exclusão (CRUD) de todos os modelos
- ✅ Validações de entrada
- ✅ Casos de erro e edge cases
- ✅ Relacionamentos entre modelos
- ✅ Lógica de negócio (estoque, validade, etc.)
- ✅ Endpoints da API REST

## Notas

- Cada teste usa um banco de dados temporário isolado
- Os testes são independentes e podem ser executados em qualquer ordem
- Warnings sobre `datetime.utcnow()` são esperados (deprecation warnings do Python 3.13)
