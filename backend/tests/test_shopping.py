"""
Testes unitários para rotas de lista de compras
"""
import pytest
import json
from models import ShoppingList, Ingredient


class TestGetShoppingList:
    """Testes para GET /api/shopping-list"""
    
    def test_get_all_shopping_items(self, client, sample_shopping_item):
        """Testar listar todos os itens da lista de compras"""
        response = client.get('/api/shopping-list')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) >= 1
        assert any(item['id'] == sample_shopping_item.id for item in data)
    
    def test_get_shopping_list_filter_purchased(self, client, db_session, sample_ingredient):
        """Testar filtro por status de compra"""
        # Criar item comprado
        purchased_item = ShoppingList(
            ingredient_id=sample_ingredient.id,
            quantity_needed=3.0,
            purchased=True
        )
        db_session.add(purchased_item)
        db_session.commit()
        
        response = client.get('/api/shopping-list?purchased=true')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert all(item['purchased'] is True for item in data)
    
    def test_get_shopping_list_filter_not_purchased(self, client, sample_shopping_item):
        """Testar filtro por não comprados"""
        response = client.get('/api/shopping-list?purchased=false')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert all(item['purchased'] is False for item in data)


class TestGetShoppingItem:
    """Testes para GET /api/shopping-list/<id>"""
    
    def test_get_shopping_item_by_id(self, client, sample_shopping_item):
        """Testar obter item por ID"""
        response = client.get(f'/api/shopping-list/{sample_shopping_item.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == sample_shopping_item.id
        assert data['quantity_needed'] == 5.0
    
    def test_get_nonexistent_shopping_item(self, client):
        """Testar obter item inexistente"""
        response = client.get('/api/shopping-list/99999')
        
        assert response.status_code == 404


class TestAddToShoppingList:
    """Testes para POST /api/shopping-list"""
    
    def test_add_to_shopping_list_success(self, client, sample_ingredient):
        """Testar adicionar item à lista de compras"""
        data = {
            'ingredient_id': sample_ingredient.id,
            'quantity_needed': 10.0
        }
        response = client.post(
            '/api/shopping-list',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        result = json.loads(response.data)
        assert result['ingredient_id'] == sample_ingredient.id
        assert result['quantity_needed'] == 10.0
    
    def test_add_to_shopping_list_missing_ingredient_id(self, client):
        """Testar adicionar sem ingredient_id"""
        data = {'quantity_needed': 5.0}
        response = client.post(
            '/api/shopping-list',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        result = json.loads(response.data)
        assert 'obrigatório' in result['error']
    
    def test_add_to_shopping_list_duplicate(self, client, sample_shopping_item):
        """Testar adicionar item já existente"""
        data = {
            'ingredient_id': sample_shopping_item.ingredient_id,
            'quantity_needed': 3.0
        }
        response = client.post(
            '/api/shopping-list',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        result = json.loads(response.data)
        assert 'já está na lista' in result['error']


class TestMarkAsPurchased:
    """Testes para POST /api/shopping-list/<id>/purchase"""
    
    def test_mark_as_purchased_success(self, client, sample_shopping_item):
        """Testar marcar item como comprado"""
        response = client.post(
            f'/api/shopping-list/{sample_shopping_item.id}/purchase',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['item']['purchased'] is True
        assert result['item']['purchased_at'] is not None
    
    def test_mark_as_purchased_add_to_stock(self, client, sample_shopping_item):
        """Testar marcar como comprado e adicionar ao estoque"""
        initial_quantity = sample_shopping_item.ingredient.quantity
        
        data = {
            'add_to_stock': True,
            'quantity_purchased': 5.0
        }
        response = client.post(
            f'/api/shopping-list/{sample_shopping_item.id}/purchase',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['added_to_stock'] is True
        assert result['quantity_added'] == 5.0
        
        # Verificar que quantidade foi adicionada
        ing_response = client.get(f'/api/ingredients/{sample_shopping_item.ingredient_id}')
        ingredient = json.loads(ing_response.data)
        assert ingredient['quantity'] == initial_quantity + 5.0


class TestDeleteShoppingItem:
    """Testes para DELETE /api/shopping-list/<id>"""
    
    def test_delete_shopping_item_success(self, client, db_session, sample_ingredient):
        """Testar deletar item da lista"""
        item = ShoppingList(ingredient_id=sample_ingredient.id, quantity_needed=3.0)
        db_session.add(item)
        db_session.commit()
        
        response = client.delete(f'/api/shopping-list/{item.id}')
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'removido' in result['message']


class TestCheckLowStock:
    """Testes para POST /api/shopping-list/check-low-stock"""
    
    def test_check_low_stock_adds_items(self, client, db_session):
        """Testar verificação de estoque baixo"""
        # Criar ingrediente com estoque baixo
        ing = Ingredient(
            name='Ingrediente Baixo',
            quantity=1.0,
            unit='unidades',
            minimum_quantity=5.0
        )
        db_session.add(ing)
        db_session.commit()
        
        response = client.post('/api/shopping-list/check-low-stock')
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['message'] is not None
        assert 'Ingrediente Baixo' in result['added_items']


class TestClearPurchasedItems:
    """Testes para DELETE /api/shopping-list/clear-purchased"""
    
    def test_clear_purchased_items(self, client, db_session, sample_ingredient):
        """Testar limpar itens comprados"""
        # Criar item comprado
        purchased_item = ShoppingList(
            ingredient_id=sample_ingredient.id,
            quantity_needed=2.0,
            purchased=True
        )
        db_session.add(purchased_item)
        db_session.commit()
        
        response = client.delete('/api/shopping-list/clear-purchased')
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'removidos' in result['message']


class TestGetShoppingStats:
    """Testes para GET /api/shopping-list/stats"""
    
    def test_get_shopping_stats(self, client, sample_shopping_item):
        """Testar obter estatísticas da lista de compras"""
        response = client.get('/api/shopping-list/stats')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'total' in data
        assert 'pending' in data
        assert 'purchased' in data
        assert data['total'] >= 1
