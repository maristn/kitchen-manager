"""
Testes unitários para rotas de refeições congeladas
"""
import pytest
import json
from datetime import datetime, date, timedelta
from models import FrozenMeal


class TestGetFrozenMeals:
    """Testes para GET /api/frozen-meals"""
    
    def test_get_all_frozen_meals(self, client, sample_frozen_meal):
        """Testar listar todas as refeições congeladas"""
        response = client.get('/api/frozen-meals')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) >= 1
        assert any(meal['id'] == sample_frozen_meal.id for meal in data)
    
    def test_get_frozen_meals_filter_by_status(self, client, sample_frozen_meal):
        """Testar filtro por status"""
        response = client.get('/api/frozen-meals?status=frozen')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert all(meal['status'] == 'frozen' for meal in data)
    
    def test_get_frozen_meals_expired_only(self, client, db_session, sample_recipe):
        """Testar filtro por vencidos"""
        # Criar refeição vencida
        expired_meal = FrozenMeal(
            recipe_id=sample_recipe.id,
            portions=2,
            expiry_date=date.today() - timedelta(days=5),
            status='frozen'
        )
        db_session.add(expired_meal)
        db_session.commit()
        
        response = client.get('/api/frozen-meals?expired_only=true')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) >= 1
        assert all(meal['is_expired'] is True for meal in data)


class TestGetFrozenMeal:
    """Testes para GET /api/frozen-meals/<id>"""
    
    def test_get_frozen_meal_by_id(self, client, sample_frozen_meal):
        """Testar obter refeição congelada por ID"""
        response = client.get(f'/api/frozen-meals/{sample_frozen_meal.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == sample_frozen_meal.id
        assert data['portions'] == 4
        assert 'is_expired' in data
        assert 'days_until_expiry' in data
    
    def test_get_nonexistent_frozen_meal(self, client):
        """Testar obter refeição congelada inexistente"""
        response = client.get('/api/frozen-meals/99999')
        
        assert response.status_code == 404


class TestCreateFrozenMeal:
    """Testes para POST /api/frozen-meals"""
    
    def test_create_frozen_meal_success(self, client, sample_recipe):
        """Testar criação de refeição congelada"""
        data = {
            'recipe_id': sample_recipe.id,
            'portions': 6,
            'measure': 'potes'
        }
        response = client.post(
            '/api/frozen-meals',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        result = json.loads(response.data)
        assert result['portions'] == 6
        assert result['measure'] == 'potes'
        assert result['expiry_date'] is not None  # Deve ser calculado
    
    def test_create_frozen_meal_missing_recipe_id(self, client):
        """Testar criação sem recipe_id"""
        data = {'portions': 2}
        response = client.post(
            '/api/frozen-meals',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        result = json.loads(response.data)
        assert 'recipe_id é obrigatório' in result['error']
    
    def test_create_frozen_meal_invalid_portions(self, client, sample_recipe):
        """Testar criação com porções inválidas"""
        data = {
            'recipe_id': sample_recipe.id,
            'portions': 0
        }
        response = client.post(
            '/api/frozen-meals',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        result = json.loads(response.data)
        assert 'maior que zero' in result['error']
    
    def test_create_frozen_meal_with_custom_date(self, client, sample_recipe):
        """Testar criação com data customizada"""
        frozen_at = datetime(2024, 1, 1, 12, 0, 0).isoformat()
        data = {
            'recipe_id': sample_recipe.id,
            'portions': 3,
            'frozen_at': frozen_at
        }
        response = client.post(
            '/api/frozen-meals',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        result = json.loads(response.data)
        assert result['frozen_at'] == frozen_at


class TestUpdateFrozenMeal:
    """Testes para PUT /api/frozen-meals/<id>"""
    
    def test_update_frozen_meal_success(self, client, sample_frozen_meal):
        """Testar atualização de refeição congelada"""
        data = {
            'portions': 8,
            'measure': 'bandejas',
            'notes': 'Atualizado'
        }
        response = client.put(
            f'/api/frozen-meals/{sample_frozen_meal.id}',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['portions'] == 8
        assert result['measure'] == 'bandejas'
        assert result['notes'] == 'Atualizado'
    
    def test_update_frozen_meal_date_recalculates_expiry(self, client, sample_frozen_meal):
        """Testar que atualizar data recalcula validade"""
        new_frozen_at = datetime(2024, 1, 1, 12, 0, 0).isoformat()
        data = {'frozen_at': new_frozen_at}
        response = client.put(
            f'/api/frozen-meals/{sample_frozen_meal.id}',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        result = json.loads(response.data)
        expected_expiry = (datetime.fromisoformat(new_frozen_at) + timedelta(days=90)).date().isoformat()
        assert result['expiry_date'] == expected_expiry


class TestConsumeFrozenMeal:
    """Testes para POST /api/frozen-meals/<id>/consume"""
    
    def test_consume_frozen_meal_success(self, client, sample_frozen_meal):
        """Testar consumir porções de refeição congelada"""
        data = {'portions': 2}
        response = client.post(
            f'/api/frozen-meals/{sample_frozen_meal.id}/consume',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        result = json.loads(response.data)
        meal = result['meal']
        assert meal['consumed_portions'] == 2
        assert meal['remaining_portions'] == 2
    
    def test_consume_frozen_meal_all_portions(self, client, db_session, sample_recipe):
        """Testar consumir todas as porções marca como consumido"""
        meal = FrozenMeal(recipe_id=sample_recipe.id, portions=2, status='frozen')
        db_session.add(meal)
        db_session.commit()
        
        data = {'portions': 2}
        response = client.post(
            f'/api/frozen-meals/{meal.id}/consume',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['meal']['status'] == 'consumed'
        assert result['meal']['consumed_at'] is not None
    
    def test_consume_frozen_meal_too_many_portions(self, client, sample_frozen_meal):
        """Testar consumir mais porções do que disponível"""
        data = {'portions': 10}  # Mais do que temos (4)
        response = client.post(
            f'/api/frozen-meals/{sample_frozen_meal.id}/consume',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        result = json.loads(response.data)
        assert 'disponíveis' in result['error']


class TestDeleteFrozenMeal:
    """Testes para DELETE /api/frozen-meals/<id>"""
    
    def test_delete_frozen_meal_success(self, client, db_session, sample_recipe):
        """Testar deletar refeição congelada"""
        meal = FrozenMeal(recipe_id=sample_recipe.id, portions=2)
        db_session.add(meal)
        db_session.commit()
        
        response = client.delete(f'/api/frozen-meals/{meal.id}')
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'deletada' in result['message']


class TestGetFrozenMealsStats:
    """Testes para GET /api/frozen-meals/stats"""
    
    def test_get_frozen_meals_stats(self, client, sample_frozen_meal):
        """Testar obter estatísticas de refeições congeladas"""
        response = client.get('/api/frozen-meals/stats')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'total_meals' in data
        assert 'total_portions' in data
        assert 'total_consumed' in data
        assert 'total_remaining' in data
        assert 'frozen_count' in data
        assert 'expired_count' in data
        assert 'expiring_soon_count' in data
        assert data['total_meals'] >= 1
