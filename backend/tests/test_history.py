"""
Testes unitários para rotas de histórico de cozimento
"""
import pytest
import json
from datetime import datetime, timedelta
from models import CookingHistory


class TestGetHistory:
    """Testes para GET /api/history"""
    
    def test_get_all_history(self, client, sample_cooking_history):
        """Testar listar todo o histórico"""
        response = client.get('/api/history')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) >= 1
        assert any(h['id'] == sample_cooking_history.id for h in data)
    
    def test_get_history_filter_by_recipe_id(self, client, sample_cooking_history):
        """Testar filtro por recipe_id"""
        response = client.get(f'/api/history?recipe_id={sample_cooking_history.recipe_id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert all(h['recipe_id'] == sample_cooking_history.recipe_id for h in data)
    
    def test_get_history_filter_by_days(self, client, db_session, sample_recipe):
        """Testar filtro por dias"""
        # Criar histórico recente
        recent_history = CookingHistory(
            recipe_id=sample_recipe.id,
            servings_made=1,
            cooked_at=datetime.utcnow() - timedelta(days=2)
        )
        db_session.add(recent_history)
        
        # Criar histórico antigo
        old_history = CookingHistory(
            recipe_id=sample_recipe.id,
            servings_made=1,
            cooked_at=datetime.utcnow() - timedelta(days=30)
        )
        db_session.add(old_history)
        db_session.commit()
        
        response = client.get('/api/history?days=7')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert any(h['id'] == recent_history.id for h in data)
        assert not any(h['id'] == old_history.id for h in data)
    
    def test_get_history_with_limit(self, client, db_session, sample_recipe):
        """Testar limite de resultados"""
        # Criar múltiplos históricos
        for i in range(5):
            history = CookingHistory(recipe_id=sample_recipe.id, servings_made=1)
            db_session.add(history)
        db_session.commit()
        
        response = client.get('/api/history?limit=3')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) <= 3


class TestGetHistoryItem:
    """Testes para GET /api/history/<id>"""
    
    def test_get_history_item_by_id(self, client, sample_cooking_history):
        """Testar obter item do histórico por ID"""
        response = client.get(f'/api/history/{sample_cooking_history.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == sample_cooking_history.id
        assert data['servings_made'] == 2
        assert data['notes'] == 'Ficou delicioso!'
    
    def test_get_nonexistent_history_item(self, client):
        """Testar obter item inexistente"""
        response = client.get('/api/history/99999')
        
        assert response.status_code == 404


class TestUpdateHistory:
    """Testes para PUT /api/history/<id>"""
    
    def test_update_history_notes(self, client, sample_cooking_history):
        """Testar atualizar notas do histórico"""
        data = {'notes': 'Notas atualizadas'}
        response = client.put(
            f'/api/history/{sample_cooking_history.id}',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['notes'] == 'Notas atualizadas'


class TestDeleteHistory:
    """Testes para DELETE /api/history/<id>"""
    
    def test_delete_history_success(self, client, db_session, sample_recipe):
        """Testar deletar item do histórico"""
        history = CookingHistory(recipe_id=sample_recipe.id, servings_made=1)
        db_session.add(history)
        db_session.commit()
        
        response = client.delete(f'/api/history/{history.id}')
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'deletado' in result['message']


class TestGetHistoryStats:
    """Testes para GET /api/history/stats"""
    
    def test_get_history_stats(self, client, sample_cooking_history):
        """Testar obter estatísticas do histórico"""
        response = client.get('/api/history/stats')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'total_recipes_cooked' in data
        assert 'cooked_this_week' in data
        assert 'cooked_this_month' in data
        assert 'most_cooked_recipes' in data
        assert isinstance(data['most_cooked_recipes'], list)


class TestGetRecentHistory:
    """Testes para GET /api/history/recent"""
    
    def test_get_recent_history(self, client, db_session, sample_recipe):
        """Testar obter histórico recente"""
        # Criar histórico recente
        recent = CookingHistory(
            recipe_id=sample_recipe.id,
            servings_made=1,
            cooked_at=datetime.utcnow() - timedelta(days=2)
        )
        db_session.add(recent)
        
        # Criar histórico antigo
        old = CookingHistory(
            recipe_id=sample_recipe.id,
            servings_made=1,
            cooked_at=datetime.utcnow() - timedelta(days=10)
        )
        db_session.add(old)
        db_session.commit()
        
        response = client.get('/api/history/recent')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert any(h['id'] == recent.id for h in data)
        assert not any(h['id'] == old.id for h in data)


class TestGetRecipeHistory:
    """Testes para GET /api/history/recipe/<recipe_id>"""
    
    def test_get_recipe_history(self, client, sample_cooking_history):
        """Testar obter histórico de uma receita específica"""
        response = client.get(f'/api/history/recipe/{sample_cooking_history.recipe_id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert all(h['recipe_id'] == sample_cooking_history.recipe_id for h in data)
        assert any(h['id'] == sample_cooking_history.id for h in data)
