from flask import Blueprint, request, jsonify
from models import db, FrozenMeal, Recipe
from datetime import datetime, date, timedelta

frozen_meals_bp = Blueprint('frozen_meals', __name__)

@frozen_meals_bp.route('/frozen-meals', methods=['GET'])
def get_frozen_meals():
    """Listar todas as refeições congeladas"""
    try:
        status = request.args.get('status')  # frozen, thawed, consumed
        expired_only = request.args.get('expired_only', 'false').lower() == 'true'
        
        query = FrozenMeal.query
        
        if status:
            query = query.filter_by(status=status)
        
        frozen_meals = query.order_by(FrozenMeal.frozen_at.desc()).all()
        
        result = [meal.to_dict() for meal in frozen_meals]
        
        # Filtrar por vencidos se solicitado
        if expired_only:
            result = [meal for meal in result if meal['is_expired']]
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@frozen_meals_bp.route('/frozen-meals/<int:id>', methods=['GET'])
def get_frozen_meal(id):
    """Obter detalhes de uma refeição congelada"""
    try:
        meal = FrozenMeal.query.get_or_404(id)
        return jsonify(meal.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@frozen_meals_bp.route('/frozen-meals', methods=['POST'])
def create_frozen_meal():
    """Congelar porções de uma receita"""
    try:
        data = request.get_json()
        
        # Validações
        if not data.get('recipe_id'):
            return jsonify({'error': 'recipe_id é obrigatório'}), 400
        if not data.get('portions') or data.get('portions', 0) <= 0:
            return jsonify({'error': 'portions deve ser maior que zero'}), 400
        
        recipe = Recipe.query.get_or_404(data['recipe_id'])
        
        # Preparar dados para criação
        meal_data = {
            'recipe_id': data['recipe_id'],
            'portions': data['portions'],
            'measure': data.get('measure'),
            'notes': data.get('notes'),
            'status': 'frozen'
        }
        
        # Se foi especificada data de congelamento, usar ela
        if data.get('frozen_at'):
            try:
                meal_data['frozen_at'] = datetime.fromisoformat(data['frozen_at'])
            except:
                meal_data['frozen_at'] = datetime.utcnow()
        else:
            meal_data['frozen_at'] = datetime.utcnow()
        
        # Se foi especificada data de validade, usar ela
        if data.get('expiry_date'):
            try:
                meal_data['expiry_date'] = datetime.fromisoformat(data['expiry_date']).date()
            except:
                pass
        
        # Criar refeição congelada (o __init__ calculará expiry_date se não foi fornecido)
        frozen_meal = FrozenMeal(**meal_data)
        
        db.session.add(frozen_meal)
        db.session.commit()
        
        return jsonify(frozen_meal.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@frozen_meals_bp.route('/frozen-meals/<int:id>', methods=['PUT'])
def update_frozen_meal(id):
    """Atualizar refeição congelada"""
    try:
        meal = FrozenMeal.query.get_or_404(id)
        data = request.get_json()
        
        if 'portions' in data:
            meal.portions = data['portions']
        if 'measure' in data:
            meal.measure = data['measure']
        if 'notes' in data:
            meal.notes = data['notes']
        if 'status' in data:
            meal.status = data['status']
        if 'frozen_at' in data:
            try:
                meal.frozen_at = datetime.fromisoformat(data['frozen_at'])
                # Recalcular expiry_date se frozen_at mudou
                if not data.get('expiry_date'):
                    meal.expiry_date = (meal.frozen_at + timedelta(days=90)).date()
            except:
                pass
        if 'expiry_date' in data:
            try:
                meal.expiry_date = datetime.fromisoformat(data['expiry_date']).date()
            except:
                meal.expiry_date = None
        
        meal.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(meal.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@frozen_meals_bp.route('/frozen-meals/<int:id>/consume', methods=['POST'])
def consume_frozen_meal(id):
    """Consumir porções de uma refeição congelada"""
    try:
        meal = FrozenMeal.query.get_or_404(id)
        data = request.get_json()
        
        portions_to_consume = data.get('portions', 1)
        
        if portions_to_consume <= 0:
            return jsonify({'error': 'Quantidade de porções deve ser maior que zero'}), 400
        
        remaining = meal.portions - meal.consumed_portions
        
        if portions_to_consume > remaining:
            return jsonify({
                'error': f'Apenas {remaining} porções disponíveis',
                'available': remaining
            }), 400
        
        # Atualizar porções consumidas
        meal.consumed_portions += portions_to_consume
        
        # Se consumiu todas as porções, marcar como consumido
        if meal.consumed_portions >= meal.portions:
            meal.status = 'consumed'
            meal.consumed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': f'{portions_to_consume} porção(ões) consumida(s)',
            'meal': meal.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@frozen_meals_bp.route('/frozen-meals/<int:id>', methods=['DELETE'])
def delete_frozen_meal(id):
    """Deletar refeição congelada"""
    try:
        meal = FrozenMeal.query.get_or_404(id)
        db.session.delete(meal)
        db.session.commit()
        return jsonify({'message': 'Refeição congelada deletada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@frozen_meals_bp.route('/frozen-meals/stats', methods=['GET'])
def get_frozen_meals_stats():
    """Obter estatísticas das refeições congeladas"""
    try:
        all_meals = FrozenMeal.query.all()
        
        total_meals = len(all_meals)
        total_portions = sum(meal.portions for meal in all_meals)
        total_consumed = sum(meal.consumed_portions for meal in all_meals)
        total_remaining = total_portions - total_consumed
        
        frozen_count = len([m for m in all_meals if m.status == 'frozen'])
        consumed_count = len([m for m in all_meals if m.status == 'consumed'])
        
        # Contar vencidos
        today = date.today()
        expired_count = len([m for m in all_meals if m.expiry_date and m.expiry_date < today and m.status == 'frozen'])
        
        # Próximos a vencer (próximos 7 dias)
        week_from_now = today + timedelta(days=7)
        expiring_soon = [
            m.to_dict() for m in all_meals 
            if m.expiry_date and m.expiry_date <= week_from_now and m.expiry_date >= today and m.status == 'frozen'
        ]
        
        return jsonify({
            'total_meals': total_meals,
            'total_portions': total_portions,
            'total_consumed': total_consumed,
            'total_remaining': total_remaining,
            'frozen_count': frozen_count,
            'consumed_count': consumed_count,
            'expired_count': expired_count,
            'expiring_soon_count': len(expiring_soon),
            'expiring_soon': expiring_soon
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
