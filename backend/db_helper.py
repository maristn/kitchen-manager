#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Helper para garantir que todos os scripts usem o mesmo banco de dados
"""

import os
from app import create_app
from models import db

def get_app_with_correct_db():
    """
    Retorna uma app Flask configurada com o banco de dados correto.
    Garante que está usando instance/database.db (mesmo que o servidor)
    """
    app = create_app()
    
    # Verificar qual banco está sendo usado
    with app.app_context():
        db_path = str(db.engine.url).replace('sqlite:///', '')
        abs_db_path = os.path.abspath(db_path)
        
        # Garantir que está usando instance/database.db
        expected_path = os.path.join(os.path.dirname(__file__), 'instance', 'database.db')
        expected_abs_path = os.path.abspath(expected_path)
        
        if abs_db_path != expected_abs_path:
            print(f"⚠️  AVISO: Banco esperado: {expected_abs_path}")
            print(f"⚠️  Banco em uso: {abs_db_path}")
        else:
            print(f"✅ Usando banco correto: {expected_abs_path}")
    
    return app

def verify_db_path():
    """Verifica e mostra qual banco está sendo usado"""
    app = create_app()
    with app.app_context():
        db_path = str(db.engine.url).replace('sqlite:///', '')
        abs_db_path = os.path.abspath(db_path)
        exists = os.path.exists(abs_db_path)
        size = os.path.getsize(abs_db_path) if exists else 0
        
        print(f"📁 Banco de dados:")
        print(f"   Caminho: {abs_db_path}")
        print(f"   Existe: {'✅ SIM' if exists else '❌ NÃO'}")
        if exists:
            print(f"   Tamanho: {size:,} bytes ({size/1024:.1f} KB)")
        
        return abs_db_path
