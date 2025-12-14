#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Adicionar receita: Bolo de Banana sem Ovo - Tudo Gostoso
"""

from app import create_app
from models import db, Ingredient, Recipe, RecipeIngredient

def add_bolo_banana():
    app = create_app()
    
    with app.app_context():
        print("Adicionando receita: Bolo de Banana sem Ovo")
        print("="*60)
        
        # 1. Criar ingredientes necessários
        print("\n1. Criando ingredientes...")
        
        ingredientes_data = [
            {'name': 'Margarina', 'quantity': 0, 'unit': 'g', 'category': 'Laticínios', 'location': 'Geladeira', 'emoji': '🧈', 'vegan': False},
            {'name': 'Açúcar', 'quantity': 0, 'unit': 'g', 'category': 'Doces', 'location': 'Despensa', 'emoji': '🍬', 'vegan': True},
            {'name': 'Leite', 'quantity': 0, 'unit': 'ml', 'category': 'Laticínios', 'location': 'Geladeira', 'emoji': '🥛', 'vegan': False},
            {'name': 'Farinha de Trigo', 'quantity': 0, 'unit': 'g', 'category': 'Grãos', 'location': 'Despensa', 'emoji': '🌾', 'vegan': True},
            {'name': 'Fermento em Pó', 'quantity': 0, 'unit': 'g', 'category': 'Ingredientes de Panificação', 'location': 'Despensa', 'emoji': '🥖', 'vegan': True},
            {'name': 'Banana', 'quantity': 0, 'unit': 'unidade(s)', 'category': 'Frutas', 'location': 'Despensa', 'emoji': '🍌', 'vegan': True},
            {'name': 'Canela', 'quantity': 0, 'unit': 'g', 'category': 'Temperos', 'location': 'Despensa', 'emoji': '🌰', 'vegan': True},
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
            name='Bolo de Banana sem Ovo',
            servings=12,
            prep_time=15,
            cook_time=50,
            emoji='🍌',
            instructions="""1. Bata bem a margarina com o açúcar até obter uma mistura fofa.

2. Adicione, alternadamente, a farinha de trigo e o leite, misturando bem. Por último, incorpore o fermento.

3. Despeje a massa em uma forma untada.

4. Corte as bananas em tiras e distribua sobre a massa.

5. Misture a canela com o açúcar reservado e polvilhe sobre as bananas.

6. Leve ao forno preaquecido a 180°C por aproximadamente 50 minutos, ou até que o bolo esteja assado.

**Dicas:**
• Use bananas bem maduras para melhor sabor
• Unte bem a forma para desenformar com facilidade
• Teste o bolo com palito antes de retirar do forno

Fonte: https://www.tudogostoso.com.br/receita/19336-bolo-de-banana-sem-ovo.html"""
        )
        
        db.session.add(receita)
        db.session.flush()
        print(f"  ✓ Receita criada: {receita.name}")
        
        # 3. Adicionar ingredientes à receita
        print("\n3. Adicionando ingredientes à receita...")
        
        receita_ingredientes = [
            ('Margarina', 30, 'g'),  # 2 colheres de sopa ≈ 30g
            ('Açúcar', 300, 'g'),  # 1.5 xícara (base)
            ('Açúcar', 200, 'g'),  # 1 xícara (cobertura) - será somado no total
            ('Leite', 360, 'ml'),  # 1.5 xícara
            ('Farinha de Trigo', 450, 'g'),  # 3 xícaras
            ('Fermento em Pó', 12, 'g'),  # 1 colher de sopa
            ('Banana', 6, 'unidade(s)'),  # 6 bananas
            ('Canela', 8, 'g'),  # 1 colher de sopa
        ]
        
        # Agrupar ingredientes repetidos (açúcar)
        ingredientes_agrupados = {}
        for nome, qtd, unidade in receita_ingredientes:
            if nome in ingredientes_agrupados:
                ingredientes_agrupados[nome]['quantidade'] += qtd
            else:
                ingredientes_agrupados[nome] = {'quantidade': qtd, 'unidade': unidade}
        
        for ing_name, dados in ingredientes_agrupados.items():
            ingrediente = Ingredient.query.filter_by(name=ing_name).first()
            if ingrediente:
                recipe_ing = RecipeIngredient(
                    recipe_id=receita.id,
                    ingredient_id=ingrediente.id,
                    quantity_needed=dados['quantidade'],
                    unit=dados['unidade']
                )
                db.session.add(recipe_ing)
                print(f"  ✓ {ing_name}: {dados['quantidade']} {dados['unidade']}")
        
        db.session.commit()
        
        print("\n" + "="*60)
        print("✅ Receita adicionada com sucesso!")
        print("="*60)
        print(f"\n🍌 {receita.name}")
        print(f"🍽️  {receita.servings} porções")
        print(f"⏱️  Preparo: {receita.prep_time} min | Forno: {receita.cook_time} min")
        print(f"🌡️  Temperatura: 180°C")
        print(f"🥚 SEM OVOS!")
        print(f"🌱 NÃO é vegana (contém margarina e leite)")
        print(f"\n🔗 Fonte: https://www.tudogostoso.com.br/receita/19336-bolo-de-banana-sem-ovo.html")

if __name__ == '__main__':
    add_bolo_banana()



