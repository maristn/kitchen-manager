from flask import Blueprint, request, jsonify
from models import db, CookingHistory, Recipe
from datetime import datetime, timedelta

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['GET'])
def get_history():
    """Obter histórico de receitas feitas com filtros opcionais"""
    try:
        # Filtros opcionais
        recipe_id = request.args.get('recipe_id', type=int)
        days = request.args.get('days', type=int)  # Últimos X dias
        limit = request.args.get('limit', type=int)
        
        query = CookingHistory.query
        
        if recipe_id:
            query = query.filter_by(recipe_id=recipe_id)
        
        if days:
            since_date = datetime.utcnow() - timedelta(days=days)
            query = query.filter(CookingHistory.cooked_at >= since_date)
        
        query = query.order_by(CookingHistory.cooked_at.desc())
        
        if limit:
            query = query.limit(limit)
        
        history = query.all()
        return jsonify([h.to_dict() for h in history]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@history_bp.route('/history/<int:id>', methods=['GET'])
def get_history_item(id):
    """Obter detalhes de um registro do histórico"""
    try:
        history = CookingHistory.query.get_or_404(id)
        return jsonify(history.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@history_bp.route('/history/<int:id>', methods=['PUT'])
def update_history(id):
    """Atualizar notas de um registro do histórico"""
    try:
        history = CookingHistory.query.get_or_404(id)
        data = request.get_json()
        
        if 'notes' in data:
            history.notes = data['notes']
        
        db.session.commit()
        return jsonify(history.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@history_bp.route('/history/<int:id>', methods=['DELETE'])
def delete_history(id):
    """Deletar registro do histórico"""
    try:
        history = CookingHistory.query.get_or_404(id)
        db.session.delete(history)
        db.session.commit()
        return jsonify({'message': 'Registro deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@history_bp.route('/history/stats', methods=['GET'])
def get_stats():
    """Obter estatísticas do histórico"""
    try:
        # Total de receitas feitas
        total_cooked = CookingHistory.query.count()
        
        # Receitas mais feitas
        from sqlalchemy import func
        most_cooked = db.session.query(
            Recipe.id,
            Recipe.name,
            func.count(CookingHistory.id).label('count')
        ).join(
            CookingHistory, Recipe.id == CookingHistory.recipe_id
        ).group_by(
            Recipe.id, Recipe.name
        ).order_by(
            func.count(CookingHistory.id).desc()
        ).limit(10).all()
        
        most_cooked_list = [
            {'recipe_id': r.id, 'recipe_name': r.name, 'times_cooked': r.count}
            for r in most_cooked
        ]
        
        # Última semana
        week_ago = datetime.utcnow() - timedelta(days=7)
        cooked_this_week = CookingHistory.query.filter(
            CookingHistory.cooked_at >= week_ago
        ).count()
        
        # Último mês
        month_ago = datetime.utcnow() - timedelta(days=30)
        cooked_this_month = CookingHistory.query.filter(
            CookingHistory.cooked_at >= month_ago
        ).count()
        
        return jsonify({
            'total_recipes_cooked': total_cooked,
            'cooked_this_week': cooked_this_week,
            'cooked_this_month': cooked_this_month,
            'most_cooked_recipes': most_cooked_list
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@history_bp.route('/history/recent', methods=['GET'])
def get_recent_history():
    """Obter receitas feitas recentemente (últimos 7 dias)"""
    try:
        week_ago = datetime.utcnow() - timedelta(days=7)
        history = CookingHistory.query.filter(
            CookingHistory.cooked_at >= week_ago
        ).order_by(CookingHistory.cooked_at.desc()).all()
        
        return jsonify([h.to_dict() for h in history]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@history_bp.route('/history/recipe/<int:recipe_id>', methods=['GET'])
def get_recipe_history(recipe_id):
    """Obter histórico de uma receita específica"""
    try:
        history = CookingHistory.query.filter_by(
            recipe_id=recipe_id
        ).order_by(CookingHistory.cooked_at.desc()).all()
        
        return jsonify([h.to_dict() for h in history]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
