#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Adicionar receita: Molho de tomate caseiro - Panelinha
Fonte: https://panelinha.com.br/receita/molho-de-tomate-caseiro
"""

from app import create_app
from models import db, Ingredient, Recipe, RecipeIngredient

def add_molho_tomate():
    app = create_app()
    
    with app.app_context():
        # Verificar banco de dados em uso
        import os
        db_path = str(db.engine.url).replace('sqlite:///', '')
        abs_db_path = os.path.abspath(db_path)
        expected_path = os.path.join(os.path.dirname(__file__), 'instance', 'database.db')
        expected_abs_path = os.path.abspath(expected_path)
        
        print("Adicionando receita: Molho de tomate caseiro")
        print("="*60)
        print(f"📁 Banco de dados: {abs_db_path}")
        if abs_db_path != expected_abs_path:
            print(f"⚠️  AVISO: Esperado: {expected_abs_path}")
        else:
            print(f"✅ Banco correto confirmado")
        print("="*60)
        
        # 1. Criar ingredientes necessários
        print("\n1. Criando ingredientes...")
        
        ingredientes_data = [
            {'name': 'Tomate Italiano', 'quantity': 0, 'unit': 'kg', 'category': 'Vegetais', 'location': 'Despensa', 'emoji': '🍅', 'vegan': True},
            {'name': 'Cebola', 'quantity': 0, 'unit': 'g', 'category': 'Vegetais', 'location': 'Despensa', 'emoji': '🧅', 'vegan': True},
            {'name': 'Azeite', 'quantity': 0, 'unit': 'ml', 'category': 'Óleos', 'location': 'Despensa', 'emoji': '🫒', 'vegan': True},
            {'name': 'Sal', 'quantity': 0, 'unit': 'g', 'category': 'Temperos', 'location': 'Despensa', 'emoji': '🧂', 'vegan': True},
            {'name': 'Pimenta-do-Reino', 'quantity': 0, 'unit': 'g', 'category': 'Temperos', 'location': 'Despensa', 'emoji': '🌶️', 'vegan': True},
            {'name': 'Manjericão', 'quantity': 0, 'unit': 'ramo(s)', 'category': 'Ervas', 'location': 'Geladeira', 'emoji': '🌿', 'vegan': True},
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
            prep_time=30,  # Tempo para descascar e preparar tomates
            cook_time=90,  # 1 hora de cozimento + tempo de refogado
            emoji='🍝',
            instructions="""**PREPARO:**

1. Descasque e pique fino as cebolas.

2. Leve uma panela grande com água ao fogo alto para ferver. Enquanto isso, lave os tomates e, com uma faca, corte um X na base de cada um. Separe uma tigela grande com água e gelo.

3. Assim que a água começar a ferver, mergulhe cerca de 6 tomates de cada vez e deixe cozinhar até que a pele comece a rachar. Com uma escumadeira, transfira os tomates para a tigela com água e gelo — com o choque térmico, fica mais fácil descascar. A partir do corte em X, puxe e descarte a pele. Reserve os tomates pelados numa tigela e repita o processo com o restante — reponha o gelo na tigela quantas vezes forem necessárias para manter a água bem fria.

4. Leve uma panela grande ao fogo médio para aquecer. Regue com o azeite, adicione a cebola picada e tempere com uma pitada de sal e uma de pimenta. Deixe a cebola cozinhar por cerca de 10 minutos, mexendo de vez em quando, até ficar bem macia e com a cor mais amarelada — essa etapa do refogado é essencial, porque deixa a cebola com o sabor mais adocicado e, com isso, o molho menos ácido.

5. Enquanto isso, corte os tomates ao meio e descarte as sementes. Transfira os tomates para o liquidificador em etapas e bata sem acrescentar água: para preparar um molho mais rústico, com pedaços, bata no modo pulsar para triturar; se preferir um molho tradicional mais fluido bata até ficar liso.

6. Junte os tomates batidos à cebola refogada, tempere com sal e misture bem. Deixe cozinhar em fogo médio até começar a ferver. Abaixe o fogo e deixe cozinhar por cerca de 1 hora, mexendo de vez em quando, até que o molho fique encorpado — atenção, dependendo do tamanho de sua panela, mais funda ou mais larga, o tempo total de cozimento pode variar.

7. Prove o molho e, se necessário, acerte o sal. Se quiser, adicione os ramos de manjericão (folhas e galhos) ao molho e deixe cozinhar por mais 2 minutos para perfumar.

**ARMAZENAMENTO:**

• Use a seguir ou armazene na geladeira por até 3 dias
• Ou no congelador, por até 3 meses
• Para conservar fora da geladeira, porcione o molho ainda quente em potes de vidro higienizados e tampe. Transfira os potes para uma panela sobre um pano de prato dobrado e cubra com água quente; deixe ferver por 30 minutos. Com cuidado, retire os vidros da panela com uma pinça e deixe esfriar sobre um pano de prato limpo — observe se houve a formação de vácuo pressionando a tampa com o indicador. Armazene num local seco por até 1 mês.

**DICAS:**

• A etapa do refogado da cebola é essencial para deixar o molho menos ácido
• O tempo de cozimento pode variar dependendo do tamanho da panela
• Para um molho mais rústico, bata os tomates no modo pulsar
• Para um molho mais fluido, bata até ficar liso

Fonte: https://panelinha.com.br/receita/molho-de-tomate-caseiro"""
        )
        
        db.session.add(receita)
        db.session.flush()
        print(f"  ✓ Receita criada: {receita.name}")
        
        # 3. Adicionar ingredientes à receita
        print("\n3. Adicionando ingredientes à receita...")
        
        receita_ingredientes = [
            ('Tomate Italiano', 3, 'kg'),  # 3 kg de tomate italiano maduro
            ('Cebola', 150, 'g'),  # 1½ cebola (aproximadamente 150g)
            ('Azeite', 30, 'ml'),  # 2 colheres (sopa) ≈ 30ml
            ('Sal', 5, 'g'),  # a gosto (quantidade pequena para referência)
            ('Pimenta-do-Reino', 2, 'g'),  # a gosto (quantidade pequena para referência)
            ('Manjericão', 6, 'ramo(s)'),  # 6 ramos (opcional)
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
            else:
                print(f"  ⚠️  {ing_name} não encontrado (pode precisar criar manualmente)")
        
        db.session.commit()
        
        print("\n" + "="*60)
        print("✅ Receita adicionada com sucesso!")
        print("="*60)
        print(f"\n🍝 {receita.name}")
        print(f"🍽️  {receita.servings} porções (rende 1,2 kg)")
        print(f"⏱️  Preparo: {receita.prep_time} min | Cozimento: {receita.cook_time} min")
        print(f"🌱 É vegana!")
        print(f"\n💡 Dica: O molho pode ser armazenado na geladeira por até 3 dias ou congelado por até 3 meses")
        print(f"\n🔗 Fonte: https://panelinha.com.br/receita/molho-de-tomate-caseiro")

if __name__ == '__main__':
    add_molho_tomate()
