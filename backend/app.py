from flask import Flask
from flask_cors import CORS
from models import db
import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime

def create_app():
    app = Flask(__name__)
    
    # Configurações
    # Usar instance/database.db quando rodando como aplicação Flask
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, 'instance', 'database.db')
    # Se instance não existir, usar database.db na raiz
    if not os.path.exists(os.path.join(basedir, 'instance')):
        os.makedirs(os.path.join(basedir, 'instance'), exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JSON_AS_ASCII'] = False  # Para suportar caracteres UTF-8
    
    # Configurar logging
    logs_dir = os.path.join(basedir, 'logs')
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir, exist_ok=True)
    
    log_file = os.path.join(logs_dir, 'app.log')
    
    if not app.debug:
        # Em produção, apenas arquivo
        file_handler = RotatingFileHandler(log_file, maxBytes=10240000, backupCount=10, encoding='utf-8')
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Kitchen Manager startup')
    else:
        # Em modo debug, salvar em arquivo E mostrar no console
        
        # Handler para arquivo (rotação automática quando atinge 10MB)
        file_handler = RotatingFileHandler(
            log_file, 
            maxBytes=10240000,  # 10MB
            backupCount=10,     # Manter 10 arquivos de backup
            encoding='utf-8'
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s [%(levelname)s] %(message)s [%(pathname)s:%(lineno)d]',
            datefmt='%Y-%m-%d %H:%M:%S'
        ))
        file_handler.setLevel(logging.DEBUG)
        
        # Handler para console
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s [%(levelname)s] %(message)s',
            datefmt='%H:%M:%S'
        ))
        console_handler.setLevel(logging.DEBUG)
        
        # Adicionar ambos os handlers
        app.logger.addHandler(file_handler)
        app.logger.addHandler(console_handler)
        app.logger.setLevel(logging.DEBUG)
        
        # Desabilitar log padrão do Werkzeug (muito verboso)
        logging.getLogger('werkzeug').setLevel(logging.WARNING)
        
        app.logger.info('=' * 60)
        app.logger.info('Kitchen Manager API Server - Debug Mode')
        app.logger.info(f'Started at {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
        app.logger.info('=' * 60)
    
    # Inicializar extensões
    CORS(app)
    db.init_app(app)
    
    # Registrar blueprints
    from routes.ingredients import ingredients_bp
    from routes.recipes import recipes_bp
    from routes.shopping import shopping_bp
    from routes.history import history_bp
    from routes.frozen_meals import frozen_meals_bp
    
    app.register_blueprint(ingredients_bp, url_prefix='/api')
    app.register_blueprint(recipes_bp, url_prefix='/api')
    app.register_blueprint(shopping_bp, url_prefix='/api')
    app.register_blueprint(history_bp, url_prefix='/api')
    app.register_blueprint(frozen_meals_bp, url_prefix='/api')
    
    # Criar tabelas
    with app.app_context():
        db.create_all()
    
    @app.route('/')
    def index():
        return {'message': 'Kitchen Manager API', 'status': 'running'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    basedir = os.path.abspath(os.path.dirname(__file__))
    log_file = os.path.join(basedir, 'logs', 'app.log')
    print('=' * 60)
    print('Kitchen Manager API Server')
    print('=' * 60)
    print('Server running on http://localhost:5000')
    print(f'Logs sendo salvos em: {log_file}')
    print('Para ver logs em tempo real: tail -f logs/app.log')
    print('Press CTRL+C to stop')
    print('=' * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
