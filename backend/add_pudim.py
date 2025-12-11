#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Adicionar receita: Pudim de Leite Condensado - Receitas Nestlé
"""

from app import create_app
from models import db, Ingredient, Recipe, RecipeIngredient

def add_pudim():
    app = create_app()
    
    with app.app_context():
        print("Adicionando receita: Pudim de Leite Condensado")
        print("="*60)
        
        # 1. Criar ingredientes necessários
        print("\n1. Criando ingredientes...")
        
        ingredientes_data = [
            {'name': 'Açúcar', 'quantity': 0, 'unit': 'g', 'category': 'Doces', 'location': 'Despensa', 'emoji': '🍬', 'vegan': True},
            {'name': 'Água', 'quantity': 0, 'unit': 'ml', 'category': 'Líquidos', 'location': 'Despensa', 'emoji': '💧', 'vegan': True, 'unlimited': True},
            {'name': 'Leite Condensado', 'quantity': 0, 'unit': 'g', 'category': 'Laticínios', 'location': 'Despensa', 'emoji': '🥛', 'vegan': False},
            {'name': 'Leite', 'quantity': 0, 'unit': 'ml', 'category': 'Laticínios', 'location': 'Geladeira', 'emoji': '🥛', 'vegan': False},
            {'name': 'Ovos', 'quantity': 0, 'unit': 'unidade(s)', 'category': 'Proteínas', 'location': 'Geladeira', 'emoji': '🥚', 'vegan': False},
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
            name='Pudim de Leite Condensado',
            servings=16,
            prep_time=10,
            cook_time=90,  # 1h30 no forno (geladeira não conta como cook_time)
            emoji='🍮',
            instructions="""**CALDA:**

1. Em uma panela de fundo largo, derreta o açúcar até ficar dourado.

2. Junte a água quente e mexa com uma colher. Deixe ferver até dissolver os torrões de açúcar e a calda engrossar.

3. Forre com a calda uma forma com furo central (19 cm de diâmetro) e reserve.

**PUDIM:**

4. Em um liquidificador, acrescente o Leite Condensado, o leite e os ovos. Bata até obter uma consistência homogênea e despeje na forma reservada.

5. Cubra com papel-alumínio e leve ao forno médio (180°C), em banho-maria, por cerca de 1 hora e 30 minutos.

6. Depois de frio, leve o pudim para gelar por cerca de 6 horas. Desenforme e sirva a seguir.

**DICAS:**

• É essencial que o pudim seja preparado em banho-maria para que asse de forma lenta e controlada, para atingir a textura ideal.

• Para que o seu pudim não forme furinhos, verifique se a temperatura do forno está regulada (180°C). Leve a forma ao forno na grade superior, longe da chama.

• Pudim COM furinhos: use forno alto (220°C).
• Pudim SEM furinhos: use forno médio (180°C).

Fonte: https://www.receitasnestle.com.br/receitas/pudim-de-leite-moca"""
        )
        
        db.session.add(receita)
        db.session.flush()
        print(f"  ✓ Receita criada: {receita.name}")
        
        # 3. Adicionar ingredientes à receita
        print("\n3. Adicionando ingredientes à receita...")
        
        receita_ingredientes = [
            ('Açúcar', 200, 'g'),  # 1 xícara de chá
            ('Água', 120, 'ml'),  # 1/2 xícara de chá
            ('Leite Condensado', 395, 'g'),  # 1 lata
            ('Leite', 600, 'ml'),  # 2 medidas da lata
            ('Ovos', 3, 'unidade(s)'),
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
        print(f"\n🍮 {receita.name}")
        print(f"🍽️  {receita.servings} porções")
        print(f"⏱️  Preparo: {receita.prep_time} min | Forno: {receita.cook_time} min")
        print(f"❄️  + 6 horas na geladeira")
        print(f"🥚 NÃO é vegana (contém ovos, leite e leite condensado)")
        print(f"\n🔗 Fonte: https://www.receitasnestle.com.br/receitas/pudim-de-leite-moca")

if __name__ == '__main__':
    add_pudim()



