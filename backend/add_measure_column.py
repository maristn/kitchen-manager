#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para adicionar a coluna 'measure' à tabela frozen_meals
"""

from app import create_app
from models import db
import sqlite3
import os

def add_measure_column():
    """Adiciona a coluna measure à tabela frozen_meals"""
    app = create_app()
    
    with app.app_context():
        # Verificar banco de dados em uso
        db_path = str(db.engine.url).replace('sqlite:///', '')
        abs_db_path = os.path.abspath(db_path)
        
        print("="*60)
        print("Adicionando coluna 'measure' à tabela frozen_meals")
        print("="*60)
        print(f"📁 Banco de dados: {abs_db_path}")
        
        # Conectar diretamente ao SQLite
        conn = sqlite3.connect(abs_db_path)
        cursor = conn.cursor()
        
        try:
            # Verificar se a coluna já existe
            cursor.execute("PRAGMA table_info(frozen_meals)")
            columns = [col[1] for col in cursor.fetchall()]
            
            if 'measure' in columns:
                print("✅ Coluna 'measure' já existe!")
            else:
                print("➕ Adicionando coluna 'measure'...")
                # Adicionar a coluna
                cursor.execute("ALTER TABLE frozen_meals ADD COLUMN measure VARCHAR(20)")
                conn.commit()
                print("✅ Coluna 'measure' adicionada com sucesso!")
            
            # Verificar estrutura final
            cursor.execute("PRAGMA table_info(frozen_meals)")
            columns = cursor.fetchall()
            print("\n📊 Estrutura da tabela frozen_meals:")
            for col in columns:
                print(f"   - {col[1]} ({col[2]})")
            
        except Exception as e:
            print(f"❌ Erro: {e}")
            conn.rollback()
        finally:
            conn.close()
        
        print("="*60)

if __name__ == '__main__':
    add_measure_column()
