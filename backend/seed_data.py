#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para popular o banco de dados com dados de exemplo
"""

from app import create_app
from models import db, Ingredient, Recipe, RecipeIngredient
from datetime import datetime, timedelta

def seed_database(clear_existing=False):
    """Popula o banco com dados de exemplo
    
    Args:
        clear_existing: Se True, limpa todos os dados antes de popular.
                       Se False (padrão), preserva receitas e ingredientes existentes.
    """
    app = create_app()
    
    with app.app_context():
        if clear_existing:
            # Limpar dados existentes APENAS se explicitamente solicitado
            print("⚠️  ATENÇÃO: Limpando TODOS os dados existentes...")
            db.session.query(RecipeIngredient).delete()
            db.session.query(Recipe).delete()
            db.session.query(Ingredient).delete()
            db.session.commit()
        else:
            print("📝 Modo preservação: receitas e ingredientes existentes serão mantidos")
            print("   (Use seed_database(clear_existing=True) para limpar tudo)")
        
        print("\nCriando/adicionando ingredientes...")
        
        # Ingredientes (como dicionários para facilitar verificação)
        ingredients_data = [
            {'name': 'Água', 'quantity': 999999, 'unit': 'L', 'category': 'Líquidos', 'location': 'Despensa', 'emoji': '💧', 'vegan': True, 'unlimited': True},
            {'name': 'Arroz', 'quantity': 500, 'unit': 'g', 'category': 'Grãos', 'location': 'Despensa', 'emoji': '🍚', 'vegan': True},
            {'name': 'Feijão', 'quantity': 300, 'unit': 'g', 'category': 'Grãos', 'location': 'Despensa', 'emoji': '🫘', 'vegan': True},
            {'name': 'Tomate', 'quantity': 400, 'unit': 'g', 'category': 'Vegetais', 'location': 'Geladeira', 'emoji': '🍅', 'vegan': True},
            {'name': 'Cebola', 'quantity': 200, 'unit': 'g', 'category': 'Vegetais', 'location': 'Despensa', 'emoji': '🧅', 'vegan': True},
            {'name': 'Alho', 'quantity': 50, 'unit': 'g', 'category': 'Temperos', 'location': 'Despensa', 'emoji': '🧄', 'vegan': True},
            {'name': 'Azeite', 'quantity': 500, 'unit': 'ml', 'category': 'Óleos', 'location': 'Despensa', 'emoji': '🫒', 'vegan': True},
            {'name': 'Sal', 'quantity': 1000, 'unit': 'g', 'category': 'Temperos', 'location': 'Despensa', 'emoji': '🧂', 'vegan': True, 'unlimited': False},
            {'name': 'Macarrão', 'quantity': 300, 'unit': 'g', 'category': 'Massas', 'location': 'Despensa', 'emoji': '🍝', 'vegan': True},
            {'name': 'Molho de Tomate', 'quantity': 250, 'unit': 'ml', 'category': 'Molhos', 'location': 'Despensa', 'emoji': '🥫', 'vegan': True},
            {'name': 'Ovos', 'quantity': 6, 'unit': 'unidade(s)', 'category': 'Proteínas', 'location': 'Geladeira', 'emoji': '🥚', 'vegan': False},
            {'name': 'Leite', 'quantity': 500, 'unit': 'ml', 'category': 'Laticínios', 'location': 'Geladeira', 'emoji': '🥛', 'vegan': False},
            {'name': 'Farinha de Trigo', 'quantity': 800, 'unit': 'g', 'category': 'Farinhas', 'location': 'Despensa', 'emoji': '🌾', 'vegan': True},
            {'name': 'Açúcar', 'quantity': 600, 'unit': 'g', 'category': 'Doces', 'location': 'Despensa', 'emoji': '🍬', 'vegan': True},
            {'name': 'Manteiga', 'quantity': 150, 'unit': 'g', 'category': 'Laticínios', 'location': 'Geladeira', 'emoji': '🧈', 'vegan': False},
        ]
        
        created_count = 0
        skipped_count = 0
        
        for ing_data in ingredients_data:
            # Verificar se ingrediente já existe
            existing = Ingredient.query.filter_by(name=ing_data['name']).first()
            if existing:
                skipped_count += 1
                print(f"  ⏭️  {ing_data['name']} já existe, pulando...")
            else:
                ing = Ingredient(**ing_data)
                db.session.add(ing)
                created_count += 1
        
        db.session.commit()
        print(f"✓ {created_count} ingredientes criados!")
        if skipped_count > 0:
            print(f"  ⏭️  {skipped_count} ingredientes já existiam e foram preservados")
        
        print("\nCriando/adicionando receitas de exemplo...")
        
        # Verificar receitas existentes
        existing_recipes = Recipe.query.all()
        if existing_recipes and not clear_existing:
            print(f"  ⚠️  {len(existing_recipes)} receitas já existem e serão preservadas")
            print("  (Use seed_database(clear_existing=True) para substituir)")
            skip_recipes = True
        else:
            skip_recipes = False
        
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
        
        if skip_recipes:
            print("  ⏭️  Pulando criação de receitas (receitas existentes preservadas)")
            recipes_created = 0
        else:
            recipes_created = 0
            for recipe_data in recipes_data:
                # Verificar se receita já existe
                existing_recipe = Recipe.query.filter_by(name=recipe_data['name']).first()
                if existing_recipe:
                    print(f"  ⏭️  Receita '{recipe_data['name']}' já existe, pulando...")
                    continue
                
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
                
                recipes_created += 1
            
            db.session.commit()
            print(f"✓ {recipes_created} receitas criadas!")
        
        print("\n" + "="*60)
        print("✓ Processo concluído!")
        print("="*60)
        print("\nResumo:")
        print(f"  - {created_count} ingredientes criados")
        if skipped_count > 0:
            print(f"  - {skipped_count} ingredientes já existiam")
        print(f"  - {recipes_created} receitas criadas")
        if skip_recipes:
            print(f"  - Receitas existentes foram preservadas")
        print("\nAcesse http://localhost:5173 para ver!")

if __name__ == '__main__':
    seed_database()



