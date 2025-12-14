#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Adicionar coluna emoji à tabela recipes e atualizar receitas existentes
"""

from app import create_app
from models import db

def add_emoji_column():
    app = create_app()
    
    with app.app_context():
        print("Adicionando coluna emoji à tabela recipes...")
        print("="*60)
        
        try:
            # Adicionar coluna emoji
            db.session.execute(db.text("""
                ALTER TABLE recipes ADD COLUMN emoji VARCHAR(10) DEFAULT '🍽️'
            """))
            db.session.commit()
            print("✓ Coluna emoji adicionada com sucesso!")
            
            # Atualizar receitas existentes com emojis apropriados
            print("\nAtualizando receitas existentes...")
            
            # Molho de tomate
            db.session.execute(db.text("""
                UPDATE recipes 
                SET emoji = '🍅' 
                WHERE name LIKE '%Molho de tomate%'
            """))
            
            # Pudim
            db.session.execute(db.text("""
                UPDATE recipes 
                SET emoji = '🍮' 
                WHERE name LIKE '%Pudim%'
            """))
            
            # Bolo de banana
            db.session.execute(db.text("""
                UPDATE recipes 
                SET emoji = '🍌' 
                WHERE name LIKE '%Bolo%Banana%'
            """))
            
            db.session.commit()
            print("✓ Receitas atualizadas com emojis!")
            
            # Verificar
            from models import Recipe
            recipes = Recipe.query.all()
            print("\n" + "="*60)
            print("Receitas no banco:")
            for r in recipes:
                print(f"  {r.emoji} {r.name}")
            print("="*60)
            
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("⚠️  Coluna emoji já existe, apenas atualizando valores...")
                
                # Atualizar receitas existentes
                from models import Recipe
                db.session.execute(db.text("""
                    UPDATE recipes 
                    SET emoji = '🍅' 
                    WHERE name LIKE '%Molho de tomate%'
                """))
                
                db.session.execute(db.text("""
                    UPDATE recipes 
                    SET emoji = '🍮' 
                    WHERE name LIKE '%Pudim%'
                """))
                
                db.session.execute(db.text("""
                    UPDATE recipes 
                    SET emoji = '🍌' 
                    WHERE name LIKE '%Bolo%Banana%'
                """))
                
                db.session.commit()
                print("✓ Emojis atualizados!")
                
                recipes = Recipe.query.all()
                print("\n" + "="*60)
                print("Receitas no banco:")
                for r in recipes:
                    print(f"  {r.emoji} {r.name}")
                print("="*60)
            else:
                print(f"❌ Erro: {e}")
                db.session.rollback()

if __name__ == '__main__':
    add_emoji_column()



