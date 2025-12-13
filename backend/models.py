from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

db = SQLAlchemy()

class Ingredient(db.Model):
    __tablename__ = 'ingredients'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=0)
    unit = db.Column(db.String(20), nullable=False)  # g, kg, ml, L, unidades, etc.
    category = db.Column(db.String(50))  # Vegetais, Frutas, Laticínios, etc.
    location = db.Column(db.String(50))  # Geladeira, Freezer, Despensa
    emoji = db.Column(db.String(10))  # Emoji do ingrediente
    vegan = db.Column(db.Boolean, default=False)  # Se o ingrediente é vegano
    expiry_date = db.Column(db.Date, nullable=True)
    minimum_quantity = db.Column(db.Float, default=0)  # Para lista de compras
    unlimited = db.Column(db.Boolean, default=False)  # Se o ingrediente é ilimitado (água, sal, etc.)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    recipe_ingredients = db.relationship('RecipeIngredient', back_populates='ingredient')
    shopping_list_items = db.relationship('ShoppingList', back_populates='ingredient')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity,
            'unit': self.unit,
            'category': self.category,
            'location': self.location,
            'emoji': self.emoji,
            'vegan': self.vegan,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'minimum_quantity': self.minimum_quantity,
            'unlimited': self.unlimited,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Recipe(db.Model):
    __tablename__ = 'recipes'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    instructions = db.Column(db.Text)
    servings = db.Column(db.Integer, default=1)  # Porções padrão
    prep_time = db.Column(db.Integer)  # Minutos
    cook_time = db.Column(db.Integer)  # Minutos
    emoji = db.Column(db.String(10), default='🍽️')  # Emoji representativo da receita
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    recipe_ingredients = db.relationship('RecipeIngredient', back_populates='recipe', cascade='all, delete-orphan')
    cooking_history = db.relationship('CookingHistory', back_populates='recipe', cascade='all, delete-orphan')
    frozen_meals = db.relationship('FrozenMeal', back_populates='recipe', cascade='all, delete-orphan')
    
    def to_dict(self, include_ingredients=False):
        result = {
            'id': self.id,
            'name': self.name,
            'instructions': self.instructions,
            'servings': self.servings,
            'prep_time': self.prep_time,
            'cook_time': self.cook_time,
            'emoji': self.emoji or '🍽️',
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_ingredients:
            result['ingredients'] = [ri.to_dict() for ri in self.recipe_ingredients]
        
        # Verificar se a receita é vegana (todos os ingredientes são veganos)
        is_vegan = True
        if len(self.recipe_ingredients) > 0:
            for ri in self.recipe_ingredients:
                if ri.ingredient and not ri.ingredient.vegan:
                    is_vegan = False
                    break
        else:
            is_vegan = False
        
        result['is_vegan'] = is_vegan
        
        return result


class RecipeIngredient(db.Model):
    __tablename__ = 'recipe_ingredients'
    
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredients.id'), nullable=False)
    quantity_needed = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    
    # Relacionamentos
    recipe = db.relationship('Recipe', back_populates='recipe_ingredients')
    ingredient = db.relationship('Ingredient', back_populates='recipe_ingredients')
    
    def to_dict(self):
        return {
            'id': self.id,
            'recipe_id': self.recipe_id,
            'ingredient_id': self.ingredient_id,
            'ingredient_name': self.ingredient.name if self.ingredient else None,
            'quantity_needed': self.quantity_needed,
            'unit': self.unit,
            'available_quantity': self.ingredient.quantity if self.ingredient else 0,
            'vegan': self.ingredient.vegan if self.ingredient else False
        }


class CookingHistory(db.Model):
    __tablename__ = 'cooking_history'
    
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    servings_made = db.Column(db.Integer, nullable=False)
    cooked_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text, nullable=True)
    
    # Relacionamento
    recipe = db.relationship('Recipe', back_populates='cooking_history')
    
    def to_dict(self):
        return {
            'id': self.id,
            'recipe_id': self.recipe_id,
            'recipe_name': self.recipe.name if self.recipe else None,
            'servings_made': self.servings_made,
            'cooked_at': self.cooked_at.isoformat(),
            'notes': self.notes
        }


class ShoppingList(db.Model):
    __tablename__ = 'shopping_list'
    
    id = db.Column(db.Integer, primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredients.id'), nullable=False)
    quantity_needed = db.Column(db.Float, nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    purchased = db.Column(db.Boolean, default=False)
    purchased_at = db.Column(db.DateTime, nullable=True)
    
    # Relacionamento
    ingredient = db.relationship('Ingredient', back_populates='shopping_list_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'ingredient_id': self.ingredient_id,
            'ingredient_name': self.ingredient.name if self.ingredient else None,
            'ingredient_unit': self.ingredient.unit if self.ingredient else None,
            'quantity_needed': self.quantity_needed,
            'added_at': self.added_at.isoformat(),
            'purchased': self.purchased,
            'purchased_at': self.purchased_at.isoformat() if self.purchased_at else None
        }


class FrozenMeal(db.Model):
    __tablename__ = 'frozen_meals'
    
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    portions = db.Column(db.Integer, nullable=False)  # Quantidade de porções congeladas
    frozen_at = db.Column(db.DateTime, default=datetime.utcnow)  # Data de congelamento
    expiry_date = db.Column(db.Date, nullable=True)  # Data de validade (padrão: 3 meses)
    consumed_at = db.Column(db.DateTime, nullable=True)  # Quando foi consumido
    consumed_portions = db.Column(db.Integer, default=0)  # Porções já consumidas
    measure = db.Column(db.String(20), nullable=True)  # Medida (g, kg, ml, L, potes, etc)
    notes = db.Column(db.Text, nullable=True)  # Notas sobre o congelamento/preparação
    status = db.Column(db.String(20), default='frozen')  # frozen, thawed, consumed
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento
    recipe = db.relationship('Recipe', back_populates='frozen_meals')
    
    def __init__(self, *args, **kwargs):
        # Extrair expiry_date antes de chamar super para não sobrescrever
        expiry_date_provided = kwargs.get('expiry_date')
        frozen_at_provided = kwargs.get('frozen_at', datetime.utcnow())
        
        super(FrozenMeal, self).__init__(*args, **kwargs)
        
        # Se não foi especificada data de validade, usar 3 meses a partir da data de congelamento
        if not expiry_date_provided and not self.expiry_date:
            if isinstance(frozen_at_provided, datetime):
                self.expiry_date = (frozen_at_provided + timedelta(days=90)).date()
            elif isinstance(self.frozen_at, datetime):
                self.expiry_date = (self.frozen_at + timedelta(days=90)).date()
            else:
                self.expiry_date = (datetime.utcnow() + timedelta(days=90)).date()
    
    def to_dict(self):
        from datetime import date
        today = date.today()
        
        # Calcular porções restantes
        remaining_portions = self.portions - self.consumed_portions
        
        # Verificar se está vencido
        is_expired = False
        days_until_expiry = None
        if self.expiry_date:
            is_expired = today > self.expiry_date
            if not is_expired:
                days_until_expiry = (self.expiry_date - today).days
        
        return {
            'id': self.id,
            'recipe_id': self.recipe_id,
            'recipe_name': self.recipe.name if self.recipe else None,
            'recipe_emoji': self.recipe.emoji if self.recipe else '🍽️',
            'portions': self.portions,
            'remaining_portions': remaining_portions,
            'consumed_portions': self.consumed_portions,
            'frozen_at': self.frozen_at.isoformat() if self.frozen_at else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'consumed_at': self.consumed_at.isoformat() if self.consumed_at else None,
            'measure': self.measure,
            'notes': self.notes,
            'status': self.status,
            'is_expired': is_expired,
            'days_until_expiry': days_until_expiry,
            'is_available': remaining_portions > 0 and self.status == 'frozen' and not is_expired
        }
