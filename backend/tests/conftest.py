"""
Configuração e fixtures para testes
"""
import pytest
import os
import tempfile
from datetime import datetime, date, timedelta
from flask import Flask
from app import create_app
from models import db, Ingredient, Recipe, RecipeIngredient, FrozenMeal, CookingHistory, ShoppingList


@pytest.fixture(scope='function')
def app():
    """Criar aplicação Flask para testes com banco de dados temporário"""
    # Criar arquivo temporário para o banco de dados
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()
        db.session.close()
    
    os.close(db_fd)
    if os.path.exists(db_path):
        os.unlink(db_path)


@pytest.fixture(scope='function')
def client(app):
    """Cliente de teste Flask"""
    return app.test_client()


@pytest.fixture(scope='function')
def db_session(app):
    """Sessão do banco de dados"""
    with app.app_context():
        yield db.session


@pytest.fixture
def sample_ingredient(db_session):
    """Criar ingrediente de exemplo"""
    ingredient = Ingredient(
        name='Tomate',
        quantity=5.0,
        unit='unidades',
        category='Vegetais',
        location='Geladeira',
        emoji='🍅',
        vegan=True,
        minimum_quantity=2.0
    )
    db_session.add(ingredient)
    db_session.commit()
    return ingredient


@pytest.fixture
def sample_recipe(db_session, sample_ingredient):
    """Criar receita de exemplo com ingrediente"""
    recipe = Recipe(
        name='Salada de Tomate',
        instructions='Cortar tomates e servir',
        servings=2,
        prep_time=10,
        cook_time=0,
        emoji='🥗'
    )
    db_session.add(recipe)
    db_session.flush()
    
    recipe_ingredient = RecipeIngredient(
        recipe_id=recipe.id,
        ingredient_id=sample_ingredient.id,
        quantity_needed=2.0,
        unit='unidades'
    )
    db_session.add(recipe_ingredient)
    db_session.commit()
    return recipe


@pytest.fixture
def sample_frozen_meal(db_session, sample_recipe):
    """Criar refeição congelada de exemplo"""
    frozen_at = datetime.utcnow()
    expiry_date = (frozen_at + timedelta(days=90)).date()
    
    meal = FrozenMeal(
        recipe_id=sample_recipe.id,
        portions=4,
        frozen_at=frozen_at,
        expiry_date=expiry_date,
        measure='potes',
        status='frozen'
    )
    db_session.add(meal)
    db_session.commit()
    return meal


@pytest.fixture
def sample_cooking_history(db_session, sample_recipe):
    """Criar histórico de cozimento de exemplo"""
    history = CookingHistory(
        recipe_id=sample_recipe.id,
        servings_made=2,
        notes='Ficou delicioso!'
    )
    db_session.add(history)
    db_session.commit()
    return history


@pytest.fixture
def sample_shopping_item(db_session, sample_ingredient):
    """Criar item de lista de compras de exemplo"""
    item = ShoppingList(
        ingredient_id=sample_ingredient.id,
        quantity_needed=5.0
    )
    db_session.add(item)
    db_session.commit()
    return item


@pytest.fixture
def multiple_ingredients(db_session):
    """Criar múltiplos ingredientes para testes"""
    ingredients = [
        Ingredient(name='Água', quantity=1000.0, unit='ml', unlimited=True),
        Ingredient(name='Sal', quantity=500.0, unit='g', unlimited=True),
        Ingredient(name='Açúcar', quantity=1000.0, unit='g', category='Temperos', location='Despensa'),
        Ingredient(name='Leite', quantity=2.0, unit='L', category='Laticínios', location='Geladeira', expiry_date=date.today() + timedelta(days=3)),
    ]
    for ing in ingredients:
        db_session.add(ing)
    db_session.commit()
    return ingredients


@pytest.fixture
def multiple_recipes(db_session, multiple_ingredients):
    """Criar múltiplas receitas para testes"""
    recipes = []
    for i, name in enumerate(['Receita 1', 'Receita 2', 'Receita 3']):
        recipe = Recipe(
            name=name,
            instructions=f'Instruções da {name}',
            servings=i+1,
            emoji='🍽️'
        )
        db_session.add(recipe)
        db_session.flush()
        
        # Adicionar primeiro ingrediente a cada receita
        if multiple_ingredients:
            ri = RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=multiple_ingredients[0].id,
                quantity_needed=1.0,
                unit='unidades'
            )
            db_session.add(ri)
        recipes.append(recipe)
    
    db_session.commit()
    return recipes
