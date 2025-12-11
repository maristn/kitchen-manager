#!/usr/bin/env python3
"""
Notion Food Storage & Recipe Manager Setup Script

This script creates two connected Notion databases:
1. Food Storage - tracks ingredients and quantities
2. Recipes - stores recipes with ingredient checking

Requirements:
- Notion API token set in NOTION_API_TOKEN environment variable
- Parent page ID set in NOTION_PARENT_PAGE_ID environment variable
"""

import os
import sys
from notion_client import Client
from typing import Dict, Any

def get_notion_client() -> Client:
    """Initialize and return Notion API client."""
    token = os.getenv('NOTION_API_TOKEN')
    if not token:
        print("Error: NOTION_API_TOKEN environment variable not set")
        print("Please set it with: export NOTION_API_TOKEN='your_token_here'")
        sys.exit(1)
    return Client(auth=token)

def create_food_storage_database(client: Client, parent_page_id: str) -> str:
    """Create Food Storage database and return its ID."""
    print("Creating Food Storage database...")
    
    properties = {
        "Name": {
            "title": {}
        },
        "Quantity": {
            "number": {
                "format": "number"
            }
        },
        "Unit": {
            "select": {
                "options": [
                    {"name": "g", "color": "blue"},
                    {"name": "kg", "color": "blue"},
                    {"name": "ml", "color": "green"},
                    {"name": "L", "color": "green"},
                    {"name": "pieces", "color": "yellow"},
                    {"name": "cups", "color": "orange"},
                    {"name": "tbsp", "color": "red"},
                    {"name": "tsp", "color": "pink"}
                ]
            }
        },
        "Category": {
            "select": {
                "options": [
                    {"name": "Vegetables", "color": "green"},
                    {"name": "Fruits", "color": "red"},
                    {"name": "Dairy", "color": "yellow"},
                    {"name": "Meat", "color": "red"},
                    {"name": "Pantry", "color": "brown"},
                    {"name": "Spices", "color": "orange"},
                    {"name": "Beverages", "color": "blue"},
                    {"name": "Frozen", "color": "gray"},
                    {"name": "Other", "color": "default"}
                ]
            }
        },
        "Expiry Date": {
            "date": {}
        },
        "Location": {
            "select": {
                "options": [
                    {"name": "Fridge", "color": "blue"},
                    {"name": "Freezer", "color": "gray"},
                    {"name": "Pantry", "color": "brown"},
                    {"name": "Counter", "color": "yellow"}
                ]
            }
        }
    }
    
    try:
        database = client.databases.create(
            parent={"type": "page_id", "page_id": parent_page_id},
            title=[{"type": "text", "text": {"content": "Food Storage"}}],
            properties=properties,
            description=[{"type": "text", "text": {"content": "Track your ingredients and their quantities"}}]
        )
        print(f"✓ Food Storage database created: {database['id']}")
        print(f"  URL: {database.get('url', 'N/A')}")
        return database['id']
    except Exception as e:
        print(f"Error creating Food Storage database: {e}")
        raise

def create_recipes_database(client: Client, parent_page_id: str, food_storage_db_id: str) -> str:
    """Create Recipes database with relation to Food Storage and return its ID."""
    print("Creating Recipes database...")
    
    properties = {
        "Name": {
            "title": {}
        },
        "Ingredients": {
            "relation": {
                "database_id": food_storage_db_id,
                "type": "single_property",
                "single_property": {}
            }
        },
        "Ingredient Quantities": {
            "rich_text": {}
        },
        "Instructions": {
            "rich_text": {}
        },
        "Can Make": {
            "checkbox": {}
        },
        "Missing Ingredients": {
            "rich_text": {}
        },
        "Servings": {
            "number": {
                "format": "number"
            }
        },
        "Prep Time (min)": {
            "number": {
                "format": "number"
            }
        },
        "Cook Time (min)": {
            "number": {
                "format": "number"
            }
        }
    }
    
    try:
        database = client.databases.create(
            parent={"type": "page_id", "page_id": parent_page_id},
            title=[{"type": "text", "text": {"content": "Recipes"}}],
            properties=properties,
            description=[{"type": "text", "text": {"content": "Store recipes and check ingredient availability"}}]
        )
        print(f"✓ Recipes database created: {database['id']}")
        print(f"  URL: {database.get('url', 'N/A')}")
        return database['id']
    except Exception as e:
        print(f"Error creating Recipes database: {e}")
        raise

def main():
    """Main setup function."""
    print("=" * 60)
    print("Notion Food Storage & Recipe Manager Setup")
    print("=" * 60)
    print()
    
    # Get parent page ID - default to Kitchen OS page if found
    parent_page_id = os.getenv('NOTION_PARENT_PAGE_ID', '2c5fc251-70f7-80c4-a87d-cba712ec453d')
    if not parent_page_id:
        print("Error: NOTION_PARENT_PAGE_ID environment variable not set")
        print("\nTo get a page ID:")
        print("1. Open the Notion page where you want to create the databases")
        print("2. Click '...' in the top right")
        print("3. Click 'Copy link'")
        print("4. The page ID is the long string between the last '/' and '?'")
        print("   Example: https://notion.so/My-Page-abc123def456?pvs=4")
        print("   Page ID: abc123def456")
        print("\nThen set it with: export NOTION_PARENT_PAGE_ID='your_page_id'")
        sys.exit(1)
    
    print(f"Using parent page ID: {parent_page_id}")
    print("(Defaulting to 'Kitchen OS' page)")
    print()
    
    # Initialize Notion client
    client = get_notion_client()
    
    # Create databases
    try:
        food_storage_db_id = create_food_storage_database(client, parent_page_id)
        recipes_db_id = create_recipes_database(client, parent_page_id, food_storage_db_id)
        
        print()
        print("=" * 60)
        print("Setup Complete!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Open your Notion page to see the new databases")
        print("2. Add ingredients to the Food Storage database")
        print("3. Add recipes to the Recipes database")
        print("4. Link ingredients to recipes using the 'Ingredients' relation")
        print("5. Use the 'Can Make' checkbox and 'Missing Ingredients' field")
        print("   to track which recipes you can prepare")
        print()
        print("Note: The 'Can Make' checkbox and 'Missing Ingredients' field")
        print("will need to be updated manually or via automation.")
        print("Consider using Notion's formula properties or automation")
        print("to automatically check ingredient availability.")
        
    except Exception as e:
        print(f"\nSetup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
