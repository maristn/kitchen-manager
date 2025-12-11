#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para popular o banco de dados com dados de exemplo
"""

from app import create_app
from models import db, Ingredient, Recipe, RecipeIngredient
from datetime import datetime, timedelta

def seed_database():
    """Popula o banco com dados de exemplo"""
    app = create_app()
    
    with app.app_context():
        # Limpar dados existentes
        print("Limpando dados existentes...")
        db.session.query(RecipeIngredient).delete()
        db.session.query(Recipe).delete()
        db.session.query(Ingredient).delete()
        db.session.commit()
        
        print("Criando ingredientes...")
        
        # Ingredientes
        ingredients = [
            Ingredient(name='Água', quantity=999999, unit='L', category='Líquidos', location='Despensa', emoji='💧', vegan=True, unlimited=True),
            Ingredient(name='Arroz', quantity=500, unit='g', category='Grãos', location='Despensa', emoji='🍚', vegan=True),
            Ingredient(name='Feijão', quantity=300, unit='g', category='Grãos', location='Despensa', emoji='🫘', vegan=True),
            Ingredient(name='Tomate', quantity=400, unit='g', category='Vegetais', location='Geladeira', emoji='🍅', vegan=True),
            Ingredient(name='Cebola', quantity=200, unit='g', category='Vegetais', location='Despensa', emoji='🧅', vegan=True),
            Ingredient(name='Alho', quantity=50, unit='g', category='Temperos', location='Despensa', emoji='🧄', vegan=True),
            Ingredient(name='Azeite', quantity=500, unit='ml', category='Óleos', location='Despensa', emoji='🫒', vegan=True),
            Ingredient(name='Sal', quantity=1000, unit='g', category='Temperos', location='Despensa', emoji='🧂', vegan=True, unlimited=False),
            Ingredient(name='Macarrão', quantity=300, unit='g', category='Massas', location='Despensa', emoji='🍝', vegan=True),
            Ingredient(name='Molho de Tomate', quantity=250, unit='ml', category='Molhos', location='Despensa', emoji='🥫', vegan=True),
            Ingredient(name='Ovos', quantity=6, unit='unidade(s)', category='Proteínas', location='Geladeira', emoji='🥚', vegan=False),
            Ingredient(name='Leite', quantity=500, unit='ml', category='Laticínios', location='Geladeira', emoji='🥛', vegan=False),
            Ingredient(name='Farinha de Trigo', quantity=800, unit='g', category='Farinhas', location='Despensa', emoji='🌾', vegan=True),
            Ingredient(name='Açúcar', quantity=600, unit='g', category='Doces', location='Despensa', emoji='🍬', vegan=True),
            Ingredient(name='Manteiga', quantity=150, unit='g', category='Laticínios', location='Geladeira', emoji='🧈', vegan=False),
        ]
        
        for ing in ingredients:
            db.session.add(ing)
        
        db.session.commit()
        print(f"✓ {len(ingredients)} ingredientes criados!")
        
        print("\nCriando receitas...")
        
        # Receitas
        recipes_data = [
            {
                'name': 'Arroz e Feijão',
                'servings': 4,
                'prep_time': 10,
                'cook_time': 40,
                'instructions': '1. Lave o arroz\n2. Cozinhe o arroz com água\n3. Deixe o feijão de molho\n4. Cozinhe o feijão com temperos\n5. Sirva quente',
                'ingredients': [
                    ('Arroz', 200, 'g'),
                    ('Feijão', 150, 'g'),
                    ('Água', 500, 'ml'),
                    ('Alho', 5, 'g'),
                    ('Cebola', 50, 'g'),
                    ('Sal', 5, 'g'),
                ]
            },
            {
                'name': 'Macarrão ao Molho',
                'servings': 2,
                'prep_time': 5,
                'cook_time': 15,
                'instructions': '1. Cozinhe o macarrão em água fervente\n2. Aqueça o molho de tomate\n3. Refogue alho no azeite\n4. Misture tudo\n5. Sirva com temperos',
                'ingredients': [
                    ('Macarrão', 200, 'g'),
                    ('Molho de Tomate', 150, 'ml'),
                    ('Água', 2000, 'ml'),
                    ('Alho', 5, 'g'),
                    ('Azeite', 20, 'ml'),
                    ('Sal', 3, 'g'),
                ]
            },
            {
                'name': 'Omelete Simples',
                'servings': 1,
                'prep_time': 5,
                'cook_time': 10,
                'instructions': '1. Bata os ovos com sal\n2. Aqueça manteiga na frigideira\n3. Despeje os ovos\n4. Cozinhe em fogo baixo\n5. Dobre e sirva',
                'ingredients': [
                    ('Ovos', 3, 'unidade(s)'),
                    ('Manteiga', 10, 'g'),
                    ('Sal', 2, 'g'),
                    ('Leite', 50, 'ml'),
                ]
            },
            {
                'name': 'Bolo Simples',
                'servings': 8,
                'prep_time': 15,
                'cook_time': 40,
                'instructions': '1. Bata os ovos com açúcar\n2. Adicione farinha e leite\n3. Misture bem\n4. Asse em forno preaquecido\n5. Deixe esfriar',
                'ingredients': [
                    ('Farinha de Trigo', 300, 'g'),
                    ('Açúcar', 200, 'g'),
                    ('Ovos', 3, 'unidade(s)'),
                    ('Leite', 250, 'ml'),
                    ('Manteiga', 50, 'g'),
                ]
            },
            {
                'name': 'Salada de Tomate',
                'servings': 2,
                'prep_time': 10,
                'cook_time': 0,
                'instructions': '1. Corte os tomates\n2. Pique a cebola\n3. Tempere com azeite e sal\n4. Misture tudo\n5. Sirva fresco',
                'ingredients': [
                    ('Tomate', 300, 'g'),
                    ('Cebola', 50, 'g'),
                    ('Azeite', 15, 'ml'),
                    ('Sal', 2, 'g'),
                ]
            },
        ]
        
        for recipe_data in recipes_data:
            recipe = Recipe(
                name=recipe_data['name'],
                servings=recipe_data['servings'],
                prep_time=recipe_data['prep_time'],
                cook_time=recipe_data['cook_time'],
                instructions=recipe_data['instructions']
            )
            db.session.add(recipe)
            db.session.flush()  # Para obter o ID da receita
            
            # Adicionar ingredientes à receita
            for ing_name, qty, unit in recipe_data['ingredients']:
                ingredient = db.session.query(Ingredient).filter_by(name=ing_name).first()
                if ingredient:
                    recipe_ing = RecipeIngredient(
                        recipe_id=recipe.id,
                        ingredient_id=ingredient.id,
                        quantity_needed=qty,
                        unit=unit
                    )
                    db.session.add(recipe_ing)
        
        db.session.commit()
        print(f"✓ {len(recipes_data)} receitas criadas!")
        
        print("\n" + "="*60)
        print("✓ Banco de dados populado com sucesso!")
        print("="*60)
        print("\nResumo:")
        print(f"  - {len(ingredients)} ingredientes")
        print(f"  - {len(recipes_data)} receitas")
        print("\nAcesse http://localhost:5173 para ver!")

if __name__ == '__main__':
    seed_database()



