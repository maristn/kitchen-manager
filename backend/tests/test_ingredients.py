"""
Testes unitários para rotas de ingredientes
"""
import pytest
import json
from datetime import date, timedelta
from models import Ingredient


class TestGetIngredients:
    """Testes para GET /api/ingredients"""
    
    def test_get_all_ingredients(self, client, multiple_ingredients):
        """Testar listar todos os ingredientes"""
        response = client.get('/api/ingredients')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 4
    
    def test_get_ingredients_filter_by_category(self, client, multiple_ingredients):
        """Testar filtro por categoria"""
        response = client.get('/api/ingredients?category=Temperos')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 1
        assert data[0]['category'] == 'Temperos'
    
    def test_get_ingredients_filter_by_location(self, client, multiple_ingredients):
        """Testar filtro por localização"""
        response = client.get('/api/ingredients?location=Geladeira')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 1
        assert data[0]['location'] == 'Geladeira'


class TestGetIngredient:
    """Testes para GET /api/ingredients/<id>"""
    
    def test_get_ingredient_by_id(self, client, sample_ingredient):
        """Testar obter ingrediente por ID"""
        response = client.get(f'/api/ingredients/{sample_ingredient.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == sample_ingredient.id
        assert data['name'] == 'Tomate'
    
    def test_get_nonexistent_ingredient(self, client):
        """Testar obter ingrediente inexistente"""
        response = client.get('/api/ingredients/99999')
        
        assert response.status_code == 404


class TestCreateIngredient:
    """Testes para POST /api/ingredients"""
    
    def test_create_ingredient_success(self, client):
        """Testar criação de ingrediente com sucesso"""
        data = {
            'name': 'Cebola',
            'quantity': 3.0,
            'unit': 'unidades',
            'category': 'Vegetais',
            'location': 'Geladeira'
        }
        response = client.post(
            '/api/ingredients',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        result = json.loads(response.data)
        assert result['name'] == 'Cebola'
        assert result['quantity'] == 3.0
    
    def test_create_ingredient_missing_name(self, client):
        """Testar criação sem nome"""
        data = {'quantity': 1.0, 'unit': 'unidades'}
        response = client.post(
            '/api/ingredients',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        result = json.loads(response.data)
        assert 'Nome é obrigatório' in result['error']
    
    def test_create_ingredient_missing_unit(self, client):
        """Testar criação sem unidade"""
        data = {'name': 'Teste', 'quantity': 1.0}
        response = client.post(
            '/api/ingredients',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        result = json.loads(response.data)
        assert 'Unidade é obrigatória' in result['error']
    
    def test_create_duplicate_ingredient(self, client, sample_ingredient):
        """Testar criação de ingrediente duplicado"""
        data = {
            'name': 'Tomate',
            'quantity': 1.0,
            'unit': 'unidades'
        }
        response = client.post(
            '/api/ingredients',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        result = json.loads(response.data)
        assert 'já existe' in result['error']
    
    def test_create_ingredient_with_expiry_date(self, client):
        """Testar criação com data de validade"""
        expiry = (date.today() + timedelta(days=7)).isoformat()
        data = {
            'name': 'Iogurte',
            'quantity': 2.0,
            'unit': 'unidades',
            'expiry_date': expiry
        }
        response = client.post(
            '/api/ingredients',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        result = json.loads(response.data)
        assert result['expiry_date'] == expiry


class TestUpdateIngredient:
    """Testes para PUT /api/ingredients/<id>"""
    
    def test_update_ingredient_success(self, client, sample_ingredient):
        """Testar atualização de ingrediente"""
        data = {'quantity': 10.0, 'category': 'Frutas'}
        response = client.put(
            f'/api/ingredients/{sample_ingredient.id}',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['quantity'] == 10.0
        assert result['category'] == 'Frutas'
    
    def test_update_ingredient_name_duplicate(self, client, sample_ingredient, multiple_ingredients):
        """Testar atualização com nome duplicado"""
        data = {'name': 'Água'}  # Nome que já existe
        response = client.put(
            f'/api/ingredients/{sample_ingredient.id}',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        result = json.loads(response.data)
        assert 'já existe' in result['error']
    
    def test_update_ingredient_zero_quantity_adds_to_shopping(self, client, db_session, sample_ingredient):
        """Testar que quantidade zero adiciona à lista de compras"""
        sample_ingredient.minimum_quantity = 5.0
        db_session.commit()
        
        data = {'quantity': 0}
        response = client.put(
            f'/api/ingredients/{sample_ingredient.id}',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        
        # Verificar se foi adicionado à lista de compras
        shopping_response = client.get('/api/shopping-list')
        shopping_data = json.loads(shopping_response.data)
        assert len(shopping_data) > 0
        assert any(item['ingredient_id'] == sample_ingredient.id for item in shopping_data)


class TestDeleteIngredient:
    """Testes para DELETE /api/ingredients/<id>"""
    
    def test_delete_ingredient_without_recipes(self, client, db_session):
        """Testar deletar ingrediente sem receitas"""
        ing = Ingredient(name='Teste', quantity=1, unit='unidades')
        db_session.add(ing)
        db_session.commit()
        
        response = client.delete(f'/api/ingredients/{ing.id}')
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'deletado' in result['message']
    
    def test_delete_ingredient_with_recipes(self, client, sample_recipe):
        """Testar deletar ingrediente usado em receitas"""
        ingredient_id = sample_recipe.recipe_ingredients[0].ingredient_id
        
        response = client.delete(f'/api/ingredients/{ingredient_id}')
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'preservadas' in result['message']
        assert 'recipes_preserved' in result


class TestGetExpiringIngredients:
    """Testes para GET /api/ingredients/expiring"""
    
    def test_get_expiring_ingredients(self, client, db_session):
        """Testar obter ingredientes próximos do vencimento"""
        from models import Ingredient
        
        # Criar ingrediente vencendo em 5 dias
        expiring_ing = Ingredient(
            name='Leite Expirando',
            quantity=1,
            unit='L',
            expiry_date=date.today() + timedelta(days=5)
        )
        db_session.add(expiring_ing)
        
        # Criar ingrediente vencendo em 10 dias (não deve aparecer)
        future_ing = Ingredient(
            name='Leite Futuro',
            quantity=1,
            unit='L',
            expiry_date=date.today() + timedelta(days=10)
        )
        db_session.add(future_ing)
        db_session.commit()
        
        response = client.get('/api/ingredients/expiring')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) >= 1
        assert any(ing['name'] == 'Leite Expirando' for ing in data)


class TestGetCategories:
    """Testes para GET /api/ingredients/categories"""
    
    def test_get_categories(self, client, multiple_ingredients):
        """Testar obter lista de categorias"""
        response = client.get('/api/ingredients/categories')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert 'Temperos' in data


class TestGetLocations:
    """Testes para GET /api/ingredients/locations"""
    
    def test_get_locations(self, client, multiple_ingredients):
        """Testar obter lista de localizações"""
        response = client.get('/api/ingredients/locations')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert 'Despensa' in data
