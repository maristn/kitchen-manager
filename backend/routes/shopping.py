from flask import Blueprint, request, jsonify
from models import db, ShoppingList, Ingredient
from datetime import datetime

shopping_bp = Blueprint('shopping', __name__)

@shopping_bp.route('/shopping-list', methods=['GET'])
def get_shopping_list():
    """Listar todos os itens da lista de compras"""
    try:
        # Filtro opcional por status
        purchased = request.args.get('purchased')
        
        query = ShoppingList.query
        
        if purchased is not None:
            purchased_bool = purchased.lower() in ['true', '1', 'yes']
            query = query.filter_by(purchased=purchased_bool)
        
        items = query.order_by(ShoppingList.added_at.desc()).all()
        return jsonify([item.to_dict() for item in items]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@shopping_bp.route('/shopping-list/<int:id>', methods=['GET'])
def get_shopping_item(id):
    """Obter detalhes de um item da lista"""
    try:
        item = ShoppingList.query.get_or_404(id)
        return jsonify(item.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@shopping_bp.route('/shopping-list', methods=['POST'])
def add_to_shopping_list():
    """Adicionar item manualmente à lista de compras"""
    try:
        data = request.get_json()
        
        if not data.get('ingredient_id'):
            return jsonify({'error': 'ID do ingrediente é obrigatório'}), 400
        
        # Verificar se ingrediente existe
        ingredient = Ingredient.query.get(data['ingredient_id'])
        if not ingredient:
            return jsonify({'error': 'Ingrediente não encontrado'}), 404
        
        # Verificar se já não está na lista (não comprado)
        existing = ShoppingList.query.filter_by(
            ingredient_id=data['ingredient_id'],
            purchased=False
        ).first()
        
        if existing:
            return jsonify({'error': 'Ingrediente já está na lista de compras'}), 400
        
        # Criar item
        item = ShoppingList(
            ingredient_id=data['ingredient_id'],
            quantity_needed=data.get('quantity_needed', ingredient.minimum_quantity or 100)
        )
        
        db.session.add(item)
        db.session.commit()
        
        return jsonify(item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@shopping_bp.route('/shopping-list/<int:id>/purchase', methods=['POST'])
def mark_as_purchased(id):
    """Marcar item como comprado e opcionalmente adicionar ao estoque"""
    try:
        item = ShoppingList.query.get_or_404(id)
        data = request.get_json() or {}
        
        # Marcar como comprado
        item.purchased = True
        item.purchased_at = datetime.utcnow()
        
        # Se solicitado, adicionar quantidade ao estoque
        add_to_stock = data.get('add_to_stock', False)
        quantity_purchased = data.get('quantity_purchased', item.quantity_needed)
        
        if add_to_stock:
            ingredient = item.ingredient
            ingredient.quantity += quantity_purchased
            ingredient.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Item marcado como comprado',
            'item': item.to_dict(),
            'added_to_stock': add_to_stock,
            'quantity_added': quantity_purchased if add_to_stock else 0
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@shopping_bp.route('/shopping-list/<int:id>', methods=['DELETE'])
def delete_shopping_item(id):
    """Remover item da lista de compras"""
    try:
        item = ShoppingList.query.get_or_404(id)
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item removido da lista de compras'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@shopping_bp.route('/shopping-list/check-low-stock', methods=['POST'])
def check_low_stock():
    """Verificar e adicionar ingredientes com estoque baixo à lista de compras"""
    try:
        # Buscar ingredientes com quantidade abaixo do mínimo
        low_stock_ingredients = Ingredient.query.filter(
            Ingredient.quantity <= Ingredient.minimum_quantity,
            Ingredient.minimum_quantity > 0
        ).all()
        
        added_items = []
        
        for ingredient in low_stock_ingredients:
            # Verificar se já não está na lista (não comprado)
            existing = ShoppingList.query.filter_by(
                ingredient_id=ingredient.id,
                purchased=False
            ).first()
            
            if not existing:
                item = ShoppingList(
                    ingredient_id=ingredient.id,
                    quantity_needed=ingredient.minimum_quantity
                )
                db.session.add(item)
                added_items.append(ingredient.name)
        
        db.session.commit()
        
        return jsonify({
            'message': f'{len(added_items)} ingredientes adicionados à lista de compras',
            'added_items': added_items
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@shopping_bp.route('/shopping-list/clear-purchased', methods=['DELETE'])
def clear_purchased_items():
    """Remover todos os itens comprados da lista"""
    try:
        deleted_count = ShoppingList.query.filter_by(purchased=True).delete()
        db.session.commit()
        
        return jsonify({
            'message': f'{deleted_count} itens comprados removidos da lista'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@shopping_bp.route('/shopping-list/stats', methods=['GET'])
def get_shopping_stats():
    """Obter estatísticas da lista de compras"""
    try:
        total = ShoppingList.query.count()
        pending = ShoppingList.query.filter_by(purchased=False).count()
        purchased = ShoppingList.query.filter_by(purchased=True).count()
        
        return jsonify({
            'total': total,
            'pending': pending,
            'purchased': purchased
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
