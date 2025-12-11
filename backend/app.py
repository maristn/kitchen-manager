from flask import Flask
from flask_cors import CORS
from models import db
import os

def create_app():
    app = Flask(__name__)
    
    # Configurações
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JSON_AS_ASCII'] = False  # Para suportar caracteres UTF-8
    
    # Inicializar extensões
    CORS(app)
    db.init_app(app)
    
    # Registrar blueprints
    from routes.ingredients import ingredients_bp
    from routes.recipes import recipes_bp
    from routes.shopping import shopping_bp
    from routes.history import history_bp
    
    app.register_blueprint(ingredients_bp, url_prefix='/api')
    app.register_blueprint(recipes_bp, url_prefix='/api')
    app.register_blueprint(shopping_bp, url_prefix='/api')
    app.register_blueprint(history_bp, url_prefix='/api')
    
    # Criar tabelas
    with app.app_context():
        db.create_all()
    
    @app.route('/')
    def index():
        return {'message': 'Kitchen Manager API', 'status': 'running'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    print('=' * 60)
    print('Kitchen Manager API Server')
    print('=' * 60)
    print('Server running on http://localhost:5000')
    print('Press CTRL+C to stop')
    print('=' * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
