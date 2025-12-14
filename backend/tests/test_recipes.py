"""
Testes unitários para rotas de receitas
"""
import pytest
import json
from models import Recipe, RecipeIngredient, Ingredient, CookingHistory


class TestGetRecipes:
    """Testes para GET /api/recipes"""
    
    def test_get_all_recipes(self, client, multiple_recipes):
        """Testar listar todas as receitas"""
        response = client.get('/api/recipes')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 3
    
    def test_get_recipe_with_ingredients(self, client, sample_recipe):
        """Testar que receitas incluem ingredientes"""
        response = client.get('/api/recipes')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        recipe = next(r for r in data if r['id'] == sample_recipe.id)
        assert 'ingredients' in recipe
        assert len(recipe['ingredients']) == 1


class TestGetRecipe:
    """Testes para GET /api/recipes/<id>"""
    
    def test_get_recipe_by_id(self, client, sample_recipe):
        """Testar obter receita por ID"""
        response = client.get(f'/api/recipes/{sample_recipe.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == sample_recipe.id
        assert data['name'] == 'Salada de Tomate'
        assert 'ingredients' in data
    
    def test_get_nonexistent_recipe(self, client):
        """Testar obter receita inexistente"""
        response = client.get('/api/recipes/99999')
        
        assert response.status_code == 404


class TestCreateRecipe:
    """Testes para POST /api/recipes"""
    
    def test_create_recipe_success(self, client, sample_ingredient):
        """Testar criação de receita com sucesso"""
        data = {
            'name': 'Bolo de Chocolate',
            'instructions': 'Misturar e assar',
            'servings': 8,
            'ingredients': [
                {
                    'ingredient_id': sample_ingredient.id,
                    'quantity_needed': 2.0,
                    'unit': 'unidades'
                }
            ]
        }
        response = client.post(
            '/api/recipes',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        result = json.loads(response.data)
        assert result['name'] == 'Bolo de Chocolate'
        assert len(result['ingredients']) == 1
    
    def test_create_recipe_missing_name(self, client):
        """Testar criação sem nome"""
        data = {'instructions': 'Teste'}
        response = client.post(
            '/api/recipes',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        result = json.loads(response.data)
        assert 'Nome é obrigatório' in result['error']
    
    def test_create_recipe_with_new_ingredient_name(self, client):
        """Testar criação de receita com nome de ingrediente novo"""
        data = {
            'name': 'Receita Nova',
            'ingredients': [
                {
                    'ingredient_name': 'Ingrediente Novo',
                    'quantity_needed': 1.0,
                    'unit': 'unidades'
                }
            ]
        }
        response = client.post(
            '/api/recipes',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        result = json.loads(response.data)
        assert len(result['ingredients']) == 1
        
        # Verificar se ingrediente foi criado
        ing_response = client.get('/api/ingredients')
        ingredients = json.loads(ing_response.data)
        assert any(ing['name'] == 'Ingrediente Novo' for ing in ingredients)


class TestUpdateRecipe:
    """Testes para PUT /api/recipes/<id>"""
    
    def test_update_recipe_success(self, client, sample_recipe):
        """Testar atualização de receita"""
        data = {
            'name': 'Salada Atualizada',
            'servings': 4
        }
        response = client.put(
            f'/api/recipes/{sample_recipe.id}',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['name'] == 'Salada Atualizada'
        assert result['servings'] == 4
    
    def test_update_recipe_ingredients(self, client, sample_recipe, multiple_ingredients):
        """Testar atualização de ingredientes da receita"""
        data = {
            'ingredients': [
                {
                    'ingredient_id': multiple_ingredients[0].id,
                    'quantity_needed': 5.0,
                    'unit': 'unidades'
                }
            ]
        }
        response = client.put(
            f'/api/recipes/{sample_recipe.id}',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert len(result['ingredients']) == 1
        assert result['ingredients'][0]['quantity_needed'] == 5.0


class TestDeleteRecipe:
    """Testes para DELETE /api/recipes/<id>"""
    
    def test_delete_recipe_success(self, client, db_session):
        """Testar deletar receita"""
        recipe = Recipe(name='Receita Temporária', servings=1)
        db_session.add(recipe)
        db_session.commit()
        
        response = client.delete(f'/api/recipes/{recipe.id}')
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'deletada' in result['message']


class TestCanMakeRecipe:
    """Testes para GET /api/recipes/<id>/can-make"""
    
    def test_can_make_recipe_with_enough_ingredients(self, client, sample_recipe):
        """Testar que pode fazer receita com ingredientes suficientes"""
        response = client.get(f'/api/recipes/{sample_recipe.id}/can-make')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['can_make'] is True
        assert len(data['missing_ingredients']) == 0
    
    def test_cannot_make_recipe_without_enough_ingredients(self, client, db_session):
        """Testar que não pode fazer receita sem ingredientes suficientes"""
        # Criar receita que precisa de mais do que temos
        ing = Ingredient(name='Ingrediente Raro', quantity=1.0, unit='unidades')
        db_session.add(ing)
        db_session.flush()
        
        recipe = Recipe(name='Receita Difícil', servings=1)
        db_session.add(recipe)
        db_session.flush()
        
        ri = RecipeIngredient(recipe_id=recipe.id, ingredient_id=ing.id, quantity_needed=10.0, unit='unidades')
        db_session.add(ri)
        db_session.commit()
        
        response = client.get(f'/api/recipes/{recipe.id}/can-make')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['can_make'] is False
        assert len(data['missing_ingredients']) > 0
    
    def test_can_make_recipe_with_custom_servings(self, client, sample_recipe):
        """Testar verificação com porções customizadas"""
        response = client.get(f'/api/recipes/{sample_recipe.id}/can-make?servings=4')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['servings_requested'] == 4


class TestCookRecipe:
    """Testes para POST /api/recipes/<id>/cook"""
    
    def test_cook_recipe_success(self, client, sample_recipe, db_session):
        """Testar fazer receita com sucesso"""
        # Garantir que temos ingredientes suficientes
        sample_recipe.recipe_ingredients[0].ingredient.quantity = 10.0
        db_session.commit()
        
        data = {'servings': 2, 'notes': 'Ficou ótimo!'}
        response = client.post(
            f'/api/recipes/{sample_recipe.id}/cook',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'feita com sucesso' in result['message']
        assert 'history_id' in result
        
        # Verificar que ingredientes foram deduzidos
        ing_response = client.get(f'/api/ingredients/{sample_recipe.recipe_ingredients[0].ingredient_id}')
        ingredient = json.loads(ing_response.data)
        assert ingredient['quantity'] < 10.0
    
    def test_cook_recipe_insufficient_ingredients(self, client, db_session):
        """Testar fazer receita sem ingredientes suficientes"""
        ing = Ingredient(name='Ingrediente Pouco', quantity=1.0, unit='unidades')
        db_session.add(ing)
        db_session.flush()
        
        recipe = Recipe(name='Receita Grande', servings=1)
        db_session.add(recipe)
        db_session.flush()
        
        ri = RecipeIngredient(recipe_id=recipe.id, ingredient_id=ing.id, quantity_needed=10.0, unit='unidades')
        db_session.add(ri)
        db_session.commit()
        
        response = client.post(
            f'/api/recipes/{recipe.id}/cook',
            data=json.dumps({'servings': 1}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        result = json.loads(response.data)
        assert 'insuficientes' in result['error']
    
    def test_cook_recipe_creates_history(self, client, sample_recipe, db_session):
        """Testar que fazer receita cria histórico"""
        # Garantir ingredientes suficientes
        sample_recipe.recipe_ingredients[0].ingredient.quantity = 10.0
        db_session.commit()
        
        response = client.post(
            f'/api/recipes/{sample_recipe.id}/cook',
            data=json.dumps({'servings': 2}),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        
        # Verificar histórico
        history_response = client.get('/api/history')
        history = json.loads(history_response.data)
        assert len(history) > 0
        assert any(h['recipe_id'] == sample_recipe.id for h in history)


class TestGetAvailableRecipes:
    """Testes para GET /api/recipes/can-make-now"""
    
    def test_get_available_recipes(self, client, sample_recipe, db_session):
        """Testar obter receitas disponíveis"""
        # Garantir ingredientes suficientes
        sample_recipe.recipe_ingredients[0].ingredient.quantity = 10.0
        db_session.commit()
        
        response = client.get('/api/recipes/can-make-now')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) > 0
        assert any(r['id'] == sample_recipe.id for r in data)
