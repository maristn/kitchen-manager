"""
Testes unitários para modelos
"""
import pytest
from datetime import datetime, date, timedelta
from models import Ingredient, Recipe, RecipeIngredient, FrozenMeal, CookingHistory, ShoppingList


class TestIngredient:
    """Testes para o modelo Ingredient"""
    
    def test_create_ingredient(self, db_session):
        """Testar criação de ingrediente"""
        ingredient = Ingredient(
            name='Cenoura',
            quantity=10.0,
            unit='unidades',
            category='Vegetais',
            location='Geladeira',
            vegan=True
        )
        db_session.add(ingredient)
        db_session.commit()
        
        assert ingredient.id is not None
        assert ingredient.name == 'Cenoura'
        assert ingredient.quantity == 10.0
        assert ingredient.vegan is True
        assert ingredient.created_at is not None
    
    def test_ingredient_to_dict(self, sample_ingredient):
        """Testar serialização para dicionário"""
        data = sample_ingredient.to_dict()
        
        assert data['id'] == sample_ingredient.id
        assert data['name'] == 'Tomate'
        assert data['quantity'] == 5.0
        assert data['unit'] == 'unidades'
        assert data['vegan'] is True
        assert 'created_at' in data
        assert 'updated_at' in data
    
    def test_ingredient_unique_name(self, db_session, sample_ingredient):
        """Testar que nome de ingrediente deve ser único"""
        duplicate = Ingredient(
            name='Tomate',
            quantity=1.0,
            unit='unidades'
        )
        db_session.add(duplicate)
        
        with pytest.raises(Exception):
            db_session.commit()


class TestRecipe:
    """Testes para o modelo Recipe"""
    
    def test_create_recipe(self, db_session):
        """Testar criação de receita"""
        recipe = Recipe(
            name='Bolo de Chocolate',
            instructions='Misturar ingredientes e assar',
            servings=8,
            prep_time=30,
            cook_time=45
        )
        db_session.add(recipe)
        db_session.commit()
        
        assert recipe.id is not None
        assert recipe.name == 'Bolo de Chocolate'
        assert recipe.servings == 8
        assert recipe.created_at is not None
    
    def test_recipe_to_dict(self, sample_recipe):
        """Testar serialização para dicionário"""
        data = sample_recipe.to_dict()
        
        assert data['id'] == sample_recipe.id
        assert data['name'] == 'Salada de Tomate'
        assert data['servings'] == 2
        assert 'created_at' in data
    
    def test_recipe_to_dict_with_ingredients(self, sample_recipe):
        """Testar serialização com ingredientes"""
        data = sample_recipe.to_dict(include_ingredients=True)
        
        assert 'ingredients' in data
        assert len(data['ingredients']) == 1
        assert data['ingredients'][0]['ingredient_name'] == 'Tomate'
    
    def test_recipe_is_vegan(self, db_session):
        """Testar detecção de receita vegana"""
        # Criar receita com ingredientes veganos
        vegan_ing1 = Ingredient(name='Tomate', quantity=1, unit='unidades', vegan=True)
        vegan_ing2 = Ingredient(name='Alface', quantity=1, unit='unidades', vegan=True)
        db_session.add_all([vegan_ing1, vegan_ing2])
        db_session.flush()
        
        recipe = Recipe(name='Salada Vegana', servings=1)
        db_session.add(recipe)
        db_session.flush()
        
        ri1 = RecipeIngredient(recipe_id=recipe.id, ingredient_id=vegan_ing1.id, quantity_needed=1, unit='unidades')
        ri2 = RecipeIngredient(recipe_id=recipe.id, ingredient_id=vegan_ing2.id, quantity_needed=1, unit='unidades')
        db_session.add_all([ri1, ri2])
        db_session.commit()
        
        data = recipe.to_dict()
        assert data['is_vegan'] is True
    
    def test_recipe_not_vegan(self, db_session):
        """Testar detecção de receita não vegana"""
        non_vegan_ing = Ingredient(name='Leite', quantity=1, unit='L', vegan=False)
        db_session.add(non_vegan_ing)
        db_session.flush()
        
        recipe = Recipe(name='Receita com Leite', servings=1)
        db_session.add(recipe)
        db_session.flush()
        
        ri = RecipeIngredient(recipe_id=recipe.id, ingredient_id=non_vegan_ing.id, quantity_needed=1, unit='L')
        db_session.add(ri)
        db_session.commit()
        
        data = recipe.to_dict()
        assert data['is_vegan'] is False


class TestRecipeIngredient:
    """Testes para o modelo RecipeIngredient"""
    
    def test_create_recipe_ingredient(self, db_session, sample_recipe, sample_ingredient):
        """Testar criação de relacionamento receita-ingrediente"""
        ri = RecipeIngredient(
            recipe_id=sample_recipe.id,
            ingredient_id=sample_ingredient.id,
            quantity_needed=3.0,
            unit='unidades'
        )
        db_session.add(ri)
        db_session.commit()
        
        assert ri.id is not None
        assert ri.recipe_id == sample_recipe.id
        assert ri.ingredient_id == sample_ingredient.id
        assert ri.quantity_needed == 3.0
    
    def test_recipe_ingredient_to_dict(self, sample_recipe):
        """Testar serialização para dicionário"""
        ri = sample_recipe.recipe_ingredients[0]
        data = ri.to_dict()
        
        assert data['recipe_id'] == sample_recipe.id
        assert data['ingredient_name'] == 'Tomate'
        assert data['quantity_needed'] == 2.0
        assert 'available_quantity' in data


class TestFrozenMeal:
    """Testes para o modelo FrozenMeal"""
    
    def test_create_frozen_meal(self, db_session, sample_recipe):
        """Testar criação de refeição congelada"""
        frozen_at = datetime.utcnow()
        meal = FrozenMeal(
            recipe_id=sample_recipe.id,
            portions=4,
            frozen_at=frozen_at,
            measure='potes'
        )
        db_session.add(meal)
        db_session.commit()
        
        assert meal.id is not None
        assert meal.portions == 4
        assert meal.status == 'frozen'
        assert meal.expiry_date is not None  # Deve ser calculado automaticamente
    
    def test_frozen_meal_expiry_calculation(self, db_session, sample_recipe):
        """Testar cálculo automático de validade"""
        frozen_at = datetime(2024, 1, 1, 12, 0, 0)
        meal = FrozenMeal(
            recipe_id=sample_recipe.id,
            portions=2,
            frozen_at=frozen_at
        )
        db_session.add(meal)
        db_session.commit()
        
        expected_expiry = (frozen_at + timedelta(days=90)).date()
        assert meal.expiry_date == expected_expiry
    
    def test_frozen_meal_to_dict(self, sample_frozen_meal):
        """Testar serialização para dicionário"""
        data = sample_frozen_meal.to_dict()
        
        assert data['id'] == sample_frozen_meal.id
        assert data['portions'] == 4
        assert data['remaining_portions'] == 4
        assert data['consumed_portions'] == 0
        assert 'is_expired' in data
        assert 'days_until_expiry' in data
        assert 'is_available' in data
    
    def test_frozen_meal_remaining_portions(self, db_session, sample_recipe):
        """Testar cálculo de porções restantes"""
        meal = FrozenMeal(
            recipe_id=sample_recipe.id,
            portions=10,
            consumed_portions=3
        )
        db_session.add(meal)
        db_session.commit()
        
        data = meal.to_dict()
        assert data['remaining_portions'] == 7
    
    def test_frozen_meal_expired(self, db_session, sample_recipe):
        """Testar detecção de refeição vencida"""
        past_date = date.today() - timedelta(days=10)
        meal = FrozenMeal(
            recipe_id=sample_recipe.id,
            portions=2,
            expiry_date=past_date
        )
        db_session.add(meal)
        db_session.commit()
        
        data = meal.to_dict()
        assert data['is_expired'] is True
        assert data['is_available'] is False


class TestCookingHistory:
    """Testes para o modelo CookingHistory"""
    
    def test_create_cooking_history(self, db_session, sample_recipe):
        """Testar criação de histórico de cozimento"""
        history = CookingHistory(
            recipe_id=sample_recipe.id,
            servings_made=4,
            notes='Muito bom!'
        )
        db_session.add(history)
        db_session.commit()
        
        assert history.id is not None
        assert history.servings_made == 4
        assert history.cooked_at is not None
    
    def test_cooking_history_to_dict(self, sample_cooking_history):
        """Testar serialização para dicionário"""
        data = sample_cooking_history.to_dict()
        
        assert data['id'] == sample_cooking_history.id
        assert data['servings_made'] == 2
        assert data['notes'] == 'Ficou delicioso!'
        assert 'cooked_at' in data


class TestShoppingList:
    """Testes para o modelo ShoppingList"""
    
    def test_create_shopping_item(self, db_session, sample_ingredient):
        """Testar criação de item de lista de compras"""
        item = ShoppingList(
            ingredient_id=sample_ingredient.id,
            quantity_needed=5.0
        )
        db_session.add(item)
        db_session.commit()
        
        assert item.id is not None
        assert item.purchased is False
        assert item.added_at is not None
    
    def test_shopping_item_to_dict(self, sample_shopping_item):
        """Testar serialização para dicionário"""
        data = sample_shopping_item.to_dict()
        
        assert data['id'] == sample_shopping_item.id
        assert data['quantity_needed'] == 5.0
        assert data['purchased'] is False
        assert 'added_at' in data
