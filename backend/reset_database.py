#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Limpar banco de dados e resetar
"""

from app import create_app
from models import db, Ingredient, Recipe, RecipeIngredient

def reset_database():
    app = create_app()
    
    with app.app_context():
        # Contar dados existentes antes de deletar
        recipe_count = Recipe.query.count()
        ingredient_count = Ingredient.query.count()
        
        print("="*60)
        print("⚠️  ATENÇÃO: LIMPEZA COMPLETA DO BANCO DE DADOS")
        print("="*60)
        print(f"\n📊 Dados que serão DELETADOS:")
        print(f"   - {recipe_count} receitas")
        print(f"   - {ingredient_count} ingredientes")
        print(f"   - Todos os relacionamentos")
        print(f"   - Todo o histórico de preparo")
        print(f"   - Toda a lista de compras")
        print("\n⚠️  Esta ação NÃO PODE SER DESFEITA!")
        print("="*60)
        
        # Confirmar antes de deletar
        response = input("\n❓ Tem certeza que deseja continuar? (digite 'SIM' para confirmar): ")
        
        if response != 'SIM':
            print("\n❌ Operação cancelada. Nenhum dado foi deletado.")
            return
        
        print("\n🗑️  Limpando banco de dados...")
        
        # Deletar todos os dados
        RecipeIngredient.query.delete()
        Recipe.query.delete()
        Ingredient.query.delete()
        
        db.session.commit()
        
        print("✅ Banco de dados limpo com sucesso!")
        print("="*60)
        print("\nAgora você pode adicionar suas receitas com:")
        print("  python add_recipe.py")
        print("  python add_pudim.py")
        print("\n💡 Os ingredientes serão criados SEM estoque (quantidade = 0)")
        print("   Você adiciona o estoque manualmente pela interface! 🎯")
        print("\n💡 Para adicionar ingredientes SEM deletar receitas, use:")
        print("   python add_ingredients_only.py")

if __name__ == '__main__':
    reset_database()



