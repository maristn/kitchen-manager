from flask import Blueprint, request, jsonify
from models import db, Ingredient, ShoppingList
from datetime import datetime, date

ingredients_bp = Blueprint('ingredients', __name__)

@ingredients_bp.route('/ingredients', methods=['GET'])
def get_ingredients():
    """Listar todos os ingredientes com filtros opcionais"""
    try:
        # Filtros opcionais
        category = request.args.get('category')
        location = request.args.get('location')
        
        query = Ingredient.query
        
        if category:
            query = query.filter_by(category=category)
        if location:
            query = query.filter_by(location=location)
        
        ingredients = query.all()
        return jsonify([ing.to_dict() for ing in ingredients]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ingredients_bp.route('/ingredients/<int:id>', methods=['GET'])
def get_ingredient(id):
    """Obter detalhes de um ingrediente"""
    try:
        ingredient = Ingredient.query.get_or_404(id)
        return jsonify(ingredient.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@ingredients_bp.route('/ingredients', methods=['POST'])
def create_ingredient():
    """Criar novo ingrediente"""
    try:
        data = request.get_json()
        
        # Validações
        if not data.get('name'):
            return jsonify({'error': 'Nome é obrigatório'}), 400
        if not data.get('unit'):
            return jsonify({'error': 'Unidade é obrigatória'}), 400
        
        # Verificar se já existe
        existing = Ingredient.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({'error': 'Ingrediente já existe'}), 400
        
        # Criar ingrediente
        ingredient = Ingredient(
            name=data['name'],
            quantity=data.get('quantity', 0),
            unit=data['unit'],
            category=data.get('category'),
            location=data.get('location'),
            emoji=data.get('emoji'),
            vegan=data.get('vegan', False),
            minimum_quantity=data.get('minimum_quantity', 0),
            unlimited=data.get('unlimited', False)
        )
        
        # Processar data de validade se fornecida
        if data.get('expiry_date'):
            try:
                ingredient.expiry_date = datetime.fromisoformat(data['expiry_date']).date()
            except:
                pass
        
        db.session.add(ingredient)
        db.session.commit()
        
        return jsonify(ingredient.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@ingredients_bp.route('/ingredients/<int:id>', methods=['PUT'])
def update_ingredient(id):
    """Atualizar ingrediente"""
    try:
        ingredient = Ingredient.query.get_or_404(id)
        data = request.get_json()
        
        # Atualizar campos
        if 'name' in data:
            # Verificar se novo nome já existe em outro ingrediente
            existing = Ingredient.query.filter(
                Ingredient.name == data['name'],
                Ingredient.id != id
            ).first()
            if existing:
                return jsonify({'error': 'Nome já existe em outro ingrediente'}), 400
            ingredient.name = data['name']
        
        if 'quantity' in data:
            old_quantity = ingredient.quantity
            ingredient.quantity = data['quantity']
            
            # Se quantidade zerou, adicionar à lista de compras
            if old_quantity > 0 and ingredient.quantity <= 0:
                # Verificar se já não está na lista
                existing_shopping = ShoppingList.query.filter_by(
                    ingredient_id=id,
                    purchased=False
                ).first()
                
                if not existing_shopping:
                    shopping_item = ShoppingList(
                        ingredient_id=id,
                        quantity_needed=ingredient.minimum_quantity or 100  # Quantidade padrão
                    )
                    db.session.add(shopping_item)
        
        if 'unit' in data:
            ingredient.unit = data['unit']
        if 'category' in data:
            ingredient.category = data['category']
        if 'location' in data:
            ingredient.location = data['location']
        if 'emoji' in data:
            ingredient.emoji = data['emoji']
        if 'vegan' in data:
            ingredient.vegan = data['vegan']
        if 'unlimited' in data:
            ingredient.unlimited = data['unlimited']
        if 'minimum_quantity' in data:
            ingredient.minimum_quantity = data['minimum_quantity']
        if 'expiry_date' in data:
            try:
                ingredient.expiry_date = datetime.fromisoformat(data['expiry_date']).date()
            except:
                ingredient.expiry_date = None
        
        ingredient.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(ingredient.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@ingredients_bp.route('/ingredients/<int:id>', methods=['DELETE'])
def delete_ingredient(id):
    """Deletar ingrediente"""
    try:
        ingredient = Ingredient.query.get_or_404(id)
        db.session.delete(ingredient)
        db.session.commit()
        return jsonify({'message': 'Ingrediente deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@ingredients_bp.route('/ingredients/expiring', methods=['GET'])
def get_expiring_ingredients():
    """Obter ingredientes próximos do vencimento (próximos 7 dias)"""
    try:
        from datetime import timedelta
        
        today = date.today()
        week_from_now = today + timedelta(days=7)
        
        ingredients = Ingredient.query.filter(
            Ingredient.expiry_date.isnot(None),
            Ingredient.expiry_date <= week_from_now,
            Ingredient.expiry_date >= today
        ).all()
        
        return jsonify([ing.to_dict() for ing in ingredients]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ingredients_bp.route('/ingredients/categories', methods=['GET'])
def get_categories():
    """Obter lista de categorias únicas"""
    try:
        categories = db.session.query(Ingredient.category).distinct().filter(
            Ingredient.category.isnot(None)
        ).all()
        return jsonify([cat[0] for cat in categories if cat[0]]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ingredients_bp.route('/ingredients/locations', methods=['GET'])
def get_locations():
    """Obter lista de locais únicos"""
    try:
        locations = db.session.query(Ingredient.location).distinct().filter(
            Ingredient.location.isnot(None)
        ).all()
        return jsonify([loc[0] for loc in locations if loc[0]]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
