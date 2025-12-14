#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para resetar o banco: apaga todas as receitas e ingredientes EXCETO Água
Garante que está usando o banco de dados correto (instance/database.db)
"""

from app import create_app
from models import db, Ingredient, Recipe, RecipeIngredient, CookingHistory, ShoppingList
import os

def reset_to_zero():
    """Limpa tudo exceto água, garantindo uso do banco correto"""
    app = create_app()
    
    with app.app_context():
        # Verificar qual banco está sendo usado
        db_path = str(db.engine.url).replace('sqlite:///', '')
        abs_db_path = os.path.abspath(db_path)
        
        print("="*60)
        print("🔄 RESETANDO BANCO DE DADOS")
        print("="*60)
        print(f"\n📁 Banco de dados em uso:")
        print(f"   {abs_db_path}")
        print(f"   Existe: {'✅ SIM' if os.path.exists(abs_db_path) else '❌ NÃO'}")
        if os.path.exists(abs_db_path):
            size = os.path.getsize(abs_db_path)
            print(f"   Tamanho: {size:,} bytes ({size/1024:.1f} KB)")
        
        # Contar dados atuais
        recipe_count = Recipe.query.count()
        ingredient_count = Ingredient.query.count()
        agua = Ingredient.query.filter_by(name='Água').first()
        
        print(f"\n📊 Dados atuais:")
        print(f"   - Receitas: {recipe_count}")
        print(f"   - Ingredientes: {ingredient_count}")
        if agua:
            print(f"   - Água encontrada: ✅ (ID: {agua.id}, Qtd: {agua.quantity} {agua.unit})")
        else:
            print(f"   - Água encontrada: ❌ (será criada)")
        
        # Confirmar
        print("\n⚠️  Esta operação vai:")
        print("   ✅ Manter Água (ou criar se não existir)")
        print("   🗑️  DELETAR todas as receitas")
        print("   🗑️  DELETAR todos os outros ingredientes")
        print("   🗑️  DELETAR histórico de preparo")
        print("   🗑️  DELETAR lista de compras")
        print("="*60)
        
        response = input("\n❓ Confirmar reset? (digite 'SIM' para confirmar): ")
        
        if response != 'SIM':
            print("\n❌ Operação cancelada. Nenhum dado foi alterado.")
            return
        
        print("\n🗑️  Limpando banco de dados...")
        
        # Salvar água se existir
        agua_data = None
        if agua:
            agua_data = {
                'name': agua.name,
                'quantity': agua.quantity,
                'unit': agua.unit,
                'category': agua.category,
                'location': agua.location,
                'emoji': agua.emoji,
                'vegan': agua.vegan,
                'unlimited': agua.unlimited,
                'minimum_quantity': agua.minimum_quantity,
                'expiry_date': agua.expiry_date
            }
            print(f"   💾 Salvando dados da Água...")
        
        # Deletar tudo
        print("   🗑️  Deletando relacionamentos...")
        RecipeIngredient.query.delete()
        CookingHistory.query.delete()
        ShoppingList.query.delete()
        
        print("   🗑️  Deletando receitas...")
        Recipe.query.delete()
        
        print("   🗑️  Deletando ingredientes...")
        Ingredient.query.delete()
        
        db.session.commit()
        
        # Recriar água
        if agua_data:
            print("   ✅ Recriando Água...")
            agua = Ingredient(**agua_data)
        else:
            print("   ✅ Criando Água (não existia antes)...")
            agua = Ingredient(
                name='Água',
                quantity=999999,
                unit='L',
                category='Líquidos',
                location='Despensa',
                emoji='💧',
                vegan=True,
                unlimited=True
            )
        
        db.session.add(agua)
        db.session.commit()
        
        # Verificar resultado
        final_recipe_count = Recipe.query.count()
        final_ingredient_count = Ingredient.query.count()
        final_agua = Ingredient.query.filter_by(name='Água').first()
        
        print("\n" + "="*60)
        print("✅ Reset concluído!")
        print("="*60)
        print(f"\n📊 Resultado final:")
        print(f"   - Receitas: {final_recipe_count} (deve ser 0)")
        print(f"   - Ingredientes: {final_ingredient_count} (deve ser 1)")
        if final_agua:
            print(f"   - Água: ✅ (ID: {final_agua.id}, Qtd: {final_agua.quantity} {final_agua.unit})")
        else:
            print(f"   - Água: ❌ ERRO!")
        
        print(f"\n📁 Banco usado: {abs_db_path}")
        print("="*60)
        
        if final_recipe_count == 0 and final_ingredient_count == 1 and final_agua:
            print("\n✅ ✅ ✅ Tudo certo! Banco resetado com sucesso!")
        else:
            print("\n⚠️  Algo pode ter dado errado. Verifique os dados acima.")

if __name__ == '__main__':
    reset_to_zero()
