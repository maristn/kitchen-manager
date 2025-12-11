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
        print("🗑️  Limpando banco de dados...")
        print("="*60)
        
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

if __name__ == '__main__':
    reset_database()



