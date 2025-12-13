#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para adicionar ingredientes SEM deletar receitas existentes
Este script preserva todas as receitas e ingredientes já cadastrados
"""

from app import create_app
from models import db, Ingredient

def add_ingredients_only():
    """Adiciona ingredientes de exemplo sem deletar receitas"""
    app = create_app()
    
    with app.app_context():
        print("="*60)
        print("➕ Adicionando ingredientes (modo preservação)")
        print("="*60)
        print("✅ Todas as receitas existentes serão preservadas!")
        print("✅ Ingredientes existentes serão preservados!")
        print("="*60)
        
        # Ingredientes para adicionar
        ingredients_to_add = [
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
        
        print(f"\nProcessando {len(ingredients_to_add)} ingredientes...\n")
        
        for ing_data in ingredients_to_add:
            # Verificar se ingrediente já existe
            existing = Ingredient.query.filter_by(name=ing_data['name']).first()
            if existing:
                skipped_count += 1
                print(f"  ⏭️  {ing_data['name']} já existe (quantidade: {existing.quantity} {existing.unit})")
            else:
                ing = Ingredient(**ing_data)
                db.session.add(ing)
                created_count += 1
                print(f"  ✅ {ing_data['name']} adicionado")
        
        db.session.commit()
        
        # Contar receitas existentes
        from models import Recipe
        existing_recipes = Recipe.query.count()
        
        print("\n" + "="*60)
        print("✓ Processo concluído!")
        print("="*60)
        print(f"\nResumo:")
        print(f"  ✅ {created_count} ingredientes criados")
        if skipped_count > 0:
            print(f"  ⏭️  {skipped_count} ingredientes já existiam (preservados)")
        print(f"  📝 {existing_recipes} receitas preservadas no banco")
        print("\n💡 Suas receitas estão seguras e intactas!")
        print("="*60)

if __name__ == '__main__':
    add_ingredients_only()
