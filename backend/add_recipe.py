#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Adicionar receita: Molho de tomate caseiro - Panelinha
"""

from app import create_app
from models import db, Ingredient, Recipe, RecipeIngredient

def add_molho_tomate():
    app = create_app()
    
    with app.app_context():
        print("Adicionando receita: Molho de tomate caseiro")
        print("="*60)
        
        # 1. Criar ingredientes necessários
        print("\n1. Criando ingredientes...")
        
        ingredientes_data = [
            {'name': 'Tomate', 'quantity': 0, 'unit': 'g', 'category': 'Vegetais', 'location': 'Geladeira', 'emoji': '🍅', 'vegan': True},
            {'name': 'Cebola', 'quantity': 0, 'unit': 'g', 'category': 'Vegetais', 'location': 'Despensa', 'emoji': '🧅', 'vegan': True},
            {'name': 'Azeite', 'quantity': 0, 'unit': 'ml', 'category': 'Óleos', 'location': 'Despensa', 'emoji': '🫒', 'vegan': True},
            {'name': 'Sal', 'quantity': 0, 'unit': 'g', 'category': 'Temperos', 'location': 'Despensa', 'emoji': '🧂', 'vegan': True, 'unlimited': False},
            {'name': 'Pimenta-do-reino', 'quantity': 0, 'unit': 'g', 'category': 'Temperos', 'location': 'Despensa', 'emoji': '🌶️', 'vegan': True},
            {'name': 'Manjericão', 'quantity': 0, 'unit': 'g', 'category': 'Temperos', 'location': 'Geladeira', 'emoji': '🌿', 'vegan': True},
        ]
        
        ingredientes_criados = []
        for ing_data in ingredientes_data:
            # Verificar se já existe
            ing = Ingredient.query.filter_by(name=ing_data['name']).first()
            if not ing:
                ing = Ingredient(**ing_data)
                db.session.add(ing)
                db.session.flush()
                print(f"  ✓ Criado: {ing.name}")
            else:
                print(f"  → Já existe: {ing.name}")
            ingredientes_criados.append(ing)
        
        db.session.commit()
        
        # 2. Criar receita
        print("\n2. Criando receita...")
        
        receita = Recipe(
            name='Molho de tomate caseiro',
            servings=6,
            prep_time=10,
            cook_time=70,
            emoji='🍅',
            instructions="""1. Descasque e pique fino as cebolas.

2. Leve uma panela grande com água ao fogo alto para ferver. Enquanto isso, lave os tomates e, com uma faca, corte um X na base de cada um. Separe uma tigela grande com água e gelo.

3. Assim que a água começar a ferver, mergulhe cerca de 6 tomates de cada vez e deixe cozinhar até que a pele comece a rachar. Com uma escumadeira, transfira os tomates para a tigela com água e gelo — com o choque térmico, fica mais fácil descascar. A partir do corte em X, puxe e descarte a pele. Reserve os tomates pelados numa tigela e repita o processo com o restante.

4. Leve uma panela grande ao fogo médio para aquecer. Regue com o azeite, adicione a cebola picada e tempere com uma pitada de sal e uma de pimenta. Deixe a cebola cozinhar por cerca de 10 minutos, mexendo de vez em quando, até ficar bem macia e com a cor mais amarelada.

5. Enquanto isso, corte os tomates ao meio e descarte as sementes. Transfira os tomates para o liquidificador em etapas e bata sem acrescentar água: para preparar um molho mais rústico, com pedaços, bata no modo pulsar para triturar; se preferir um molho tradicional mais fluido bata até ficar liso.

6. Junte os tomates batidos à cebola refogada, tempere com sal e misture bem. Deixe cozinhar em fogo médio até começar a ferver. Abaixe o fogo e deixe cozinhar por cerca de 1 hora, mexendo de vez em quando, até que o molho fique encorpado.

7. Prove o molho e, se necessário, acerte o sal. Se quiser, adicione os ramos de manjericão (folhas e galhos) ao molho e deixe cozinhar por mais 2 minutos para perfumar.

Fonte: https://panelinha.com.br/receita/molho-de-tomate-caseiro"""
        )
        
        db.session.add(receita)
        db.session.flush()
        print(f"  ✓ Receita criada: {receita.name}")
        
        # 3. Adicionar ingredientes à receita
        print("\n3. Adicionando ingredientes à receita...")
        
        receita_ingredientes = [
            ('Tomate', 3000, 'g'),
            ('Cebola', 225, 'g'),  # 1.5 cebolas ≈ 225g
            ('Azeite', 30, 'ml'),  # 2 colheres de sopa
            ('Sal', 5, 'g'),  # a gosto
            ('Pimenta-do-reino', 2, 'g'),  # a gosto
            ('Manjericão', 10, 'g'),  # 6 ramos (opcional)
        ]
        
        for ing_name, qty, unit in receita_ingredientes:
            ingrediente = Ingredient.query.filter_by(name=ing_name).first()
            if ingrediente:
                recipe_ing = RecipeIngredient(
                    recipe_id=receita.id,
                    ingredient_id=ingrediente.id,
                    quantity_needed=qty,
                    unit=unit
                )
                db.session.add(recipe_ing)
                print(f"  ✓ {ing_name}: {qty} {unit}")
        
        db.session.commit()
        
        print("\n" + "="*60)
        print("✅ Receita adicionada com sucesso!")
        print("="*60)
        print(f"\n📋 {receita.name}")
        print(f"🍽️  {receita.servings} porções")
        print(f"⏱️  {receita.prep_time + receita.cook_time} minutos")
        print(f"🌱 Vegana: Sim")
        print(f"\n🔗 Fonte: https://panelinha.com.br/receita/molho-de-tomate-caseiro")

if __name__ == '__main__':
    add_molho_tomate()



