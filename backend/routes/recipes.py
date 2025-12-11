from flask import Blueprint, request, jsonify
from models import db, Recipe, RecipeIngredient, Ingredient, CookingHistory, ShoppingList
from datetime import datetime

recipes_bp = Blueprint('recipes', __name__)

@recipes_bp.route('/recipes', methods=['GET'])
def get_recipes():
    """Listar todas as receitas"""
    try:
        recipes = Recipe.query.all()
        return jsonify([recipe.to_dict(include_ingredients=True) for recipe in recipes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@recipes_bp.route('/recipes/<int:id>', methods=['GET'])
def get_recipe(id):
    """Obter detalhes de uma receita com ingredientes"""
    try:
        recipe = Recipe.query.get_or_404(id)
        return jsonify(recipe.to_dict(include_ingredients=True)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@recipes_bp.route('/recipes', methods=['POST'])
def create_recipe():
    """Criar nova receita com ingredientes"""
    try:
        data = request.get_json()
        
        # Validações
        if not data.get('name'):
            return jsonify({'error': 'Nome é obrigatório'}), 400
        
        # Criar receita
        recipe = Recipe(
            name=data['name'],
            instructions=data.get('instructions', ''),
            servings=data.get('servings', 1),
            prep_time=data.get('prep_time'),
            cook_time=data.get('cook_time')
        )
        
        db.session.add(recipe)
        db.session.flush()  # Para obter o ID da receita
        
        # Adicionar ingredientes
        if data.get('ingredients'):
            for ing_data in data['ingredients']:
                ingredient_id = ing_data.get('ingredient_id')
                
                # Se não tem ID mas tem nome, criar/buscar o ingrediente
                if not ingredient_id and ing_data.get('ingredient_name'):
                    ing_name = ing_data['ingredient_name']
                    # Buscar se já existe
                    existing_ing = Ingredient.query.filter_by(name=ing_name).first()
                    if existing_ing:
                        ingredient_id = existing_ing.id
                    else:
                        # Criar novo ingrediente com quantidade 0 (placeholder)
                        new_ing = Ingredient(
                            name=ing_name,
                            quantity=0,
                            unit=ing_data.get('unit', 'unidades'),
                            category='Outros',
                            location='Despensa'
                        )
                        db.session.add(new_ing)
                        db.session.flush()
                        ingredient_id = new_ing.id
                
                if ingredient_id:
                    recipe_ingredient = RecipeIngredient(
                        recipe_id=recipe.id,
                        ingredient_id=ingredient_id,
                        quantity_needed=ing_data.get('quantity_needed', 0),
                        unit=ing_data.get('unit', '')
                    )
                    db.session.add(recipe_ingredient)
        
        db.session.commit()
        
        return jsonify(recipe.to_dict(include_ingredients=True)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@recipes_bp.route('/recipes/<int:id>', methods=['PUT'])
def update_recipe(id):
    """Atualizar receita"""
    try:
        recipe = Recipe.query.get_or_404(id)
        data = request.get_json()
        
        # Atualizar campos básicos
        if 'name' in data:
            recipe.name = data['name']
        if 'instructions' in data:
            recipe.instructions = data['instructions']
        if 'servings' in data:
            recipe.servings = data['servings']
        if 'prep_time' in data:
            recipe.prep_time = data['prep_time']
        if 'cook_time' in data:
            recipe.cook_time = data['cook_time']
        
        # Atualizar ingredientes se fornecidos
        if 'ingredients' in data:
            # Remover ingredientes existentes
            RecipeIngredient.query.filter_by(recipe_id=id).delete()
            
            # Adicionar novos ingredientes
            for ing_data in data['ingredients']:
                if not ing_data.get('ingredient_id'):
                    continue
                
                recipe_ingredient = RecipeIngredient(
                    recipe_id=recipe.id,
                    ingredient_id=ing_data['ingredient_id'],
                    quantity_needed=ing_data.get('quantity_needed', 0),
                    unit=ing_data.get('unit', '')
                )
                db.session.add(recipe_ingredient)
        
        recipe.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(recipe.to_dict(include_ingredients=True)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@recipes_bp.route('/recipes/<int:id>', methods=['DELETE'])
def delete_recipe(id):
    """Deletar receita"""
    try:
        recipe = Recipe.query.get_or_404(id)
        db.session.delete(recipe)
        db.session.commit()
        return jsonify({'message': 'Receita deletada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@recipes_bp.route('/recipes/<int:id>/can-make', methods=['GET'])
def can_make_recipe(id):
    """Verificar se pode fazer a receita com estoque atual"""
    try:
        recipe = Recipe.query.get_or_404(id)
        servings = request.args.get('servings', recipe.servings, type=int)
        
        can_make = True
        missing_ingredients = []
        ingredient_status = []
        
        for recipe_ing in recipe.recipe_ingredients:
            ingredient = recipe_ing.ingredient
            
            # Calcular quantidade necessária baseada nas porções
            quantity_needed = (recipe_ing.quantity_needed / recipe.servings) * servings
            
            has_enough = ingredient.quantity >= quantity_needed
            
            ingredient_status.append({
                'ingredient_id': ingredient.id,
                'ingredient_name': ingredient.name,
                'quantity_needed': quantity_needed,
                'quantity_available': ingredient.quantity,
                'unit': recipe_ing.unit,
                'has_enough': has_enough,
                'missing': max(0, quantity_needed - ingredient.quantity)
            })
            
            if not has_enough:
                can_make = False
                missing_ingredients.append({
                    'ingredient_id': ingredient.id,
                    'ingredient_name': ingredient.name,
                    'quantity_needed': quantity_needed,
                    'quantity_available': ingredient.quantity,
                    'missing': quantity_needed - ingredient.quantity,
                    'unit': recipe_ing.unit
                })
        
        return jsonify({
            'can_make': can_make,
            'servings_requested': servings,
            'ingredient_status': ingredient_status,
            'missing_ingredients': missing_ingredients
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@recipes_bp.route('/recipes/<int:id>/cook', methods=['POST'])
def cook_recipe(id):
    """Fazer receita: deduzir ingredientes do estoque e criar histórico"""
    try:
        recipe = Recipe.query.get_or_404(id)
        data = request.get_json()
        servings = data.get('servings', recipe.servings)
        
        # Verificar se pode fazer
        can_make = True
        missing_ingredients = []
        
        for recipe_ing in recipe.recipe_ingredients:
            ingredient = recipe_ing.ingredient
            quantity_needed = (recipe_ing.quantity_needed / recipe.servings) * servings
            
            if ingredient.quantity < quantity_needed:
                can_make = False
                missing_ingredients.append({
                    'ingredient_name': ingredient.name,
                    'quantity_needed': quantity_needed,
                    'quantity_available': ingredient.quantity,
                    'missing': quantity_needed - ingredient.quantity,
                    'unit': recipe_ing.unit
                })
        
        if not can_make:
            return jsonify({
                'error': 'Ingredientes insuficientes',
                'missing_ingredients': missing_ingredients
            }), 400
        
        # Deduzir ingredientes do estoque
        ingredients_to_shopping = []
        
        for recipe_ing in recipe.recipe_ingredients:
            ingredient = recipe_ing.ingredient
            quantity_needed = (recipe_ing.quantity_needed / recipe.servings) * servings
            
            # Deduzir quantidade
            ingredient.quantity -= quantity_needed
            
            # Se chegou a zero ou abaixo do mínimo, adicionar à lista de compras
            if ingredient.quantity <= 0 or ingredient.quantity <= ingredient.minimum_quantity:
                # Verificar se já não está na lista de compras
                existing = ShoppingList.query.filter_by(
                    ingredient_id=ingredient.id,
                    purchased=False
                ).first()
                
                if not existing:
                    shopping_item = ShoppingList(
                        ingredient_id=ingredient.id,
                        quantity_needed=ingredient.minimum_quantity if ingredient.minimum_quantity > 0 else 100
                    )
                    db.session.add(shopping_item)
                    ingredients_to_shopping.append(ingredient.name)
            
            ingredient.updated_at = datetime.utcnow()
        
        # Criar registro no histórico
        history = CookingHistory(
            recipe_id=recipe.id,
            servings_made=servings,
            notes=data.get('notes')
        )
        db.session.add(history)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Receita feita com sucesso!',
            'recipe_name': recipe.name,
            'servings_made': servings,
            'ingredients_added_to_shopping': ingredients_to_shopping,
            'history_id': history.id
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@recipes_bp.route('/recipes/can-make-now', methods=['GET'])
def get_available_recipes():
    """Obter receitas que podem ser feitas com o estoque atual"""
    try:
        recipes = Recipe.query.all()
        available_recipes = []
        
        for recipe in recipes:
            can_make = True
            
            for recipe_ing in recipe.recipe_ingredients:
                ingredient = recipe_ing.ingredient
                quantity_needed = recipe_ing.quantity_needed
                
                if ingredient.quantity < quantity_needed:
                    can_make = False
                    break
            
            if can_make:
                available_recipes.append(recipe.to_dict(include_ingredients=True))
        
        return jsonify(available_recipes), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
