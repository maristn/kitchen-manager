#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para inicializar o banco de dados do Kitchen Manager
"""

from app import create_app
from models import db

def init_database():
    """Cria todas as tabelas no banco de dados"""
    app = create_app()
    
    with app.app_context():
        print("Criando tabelas do banco de dados...")
        db.create_all()
        print("✓ Tabelas criadas com sucesso!")
        
        # Listar tabelas criadas
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        print(f"\nTabelas criadas ({len(tables)}):")
        for table in tables:
            print(f"  - {table}")

if __name__ == '__main__':
    init_database()



