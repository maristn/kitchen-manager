#!/usr/bin/env python3
"""
Direct Notion API database creation using urllib (built-in)
No external dependencies required!
"""

import os
import sys
import json
import urllib.request
import urllib.parse

# Parent page ID (Kitchen OS)
PARENT_PAGE_ID = "2c5fc251-70f7-80c4-a87d-cba712ec453d"

def get_token():
    """Get Notion API token from environment."""
    token = os.getenv('NOTION_API_TOKEN')
    if not token:
        print("=" * 60)
        print("NOTION_API_TOKEN not found!")
        print("=" * 60)
        print("\nTo get your token:")
        print("1. Go to https://www.notion.so/my-integrations")
        print("2. Click '+ New integration'")
        print("3. Name it 'Food Storage Manager'")
        print("4. Copy the token (starts with 'secret_')")
        print("\nThen run:")
        print("  export NOTION_API_TOKEN='your_token_here'")
        print("  python3 create_databases_urllib.py")
        print("\nAlso make sure to:")
        print("- Share your 'Kitchen OS' page with the integration")
        print("- Give it 'Can edit' permissions")
        sys.exit(1)
    return token

def create_database(token, title, properties, description=""):
    """Create a Notion database."""
    url = "https://api.notion.com/v1/databases"
    
    data = {
        "parent": {
            "type": "page_id",
            "page_id": PARENT_PAGE_ID
        },
        "title": [
            {
                "type": "text",
                "text": {
                    "content": title
                }
            }
        ],
        "properties": properties
    }
    
    if description:
        data["description"] = [
            {
                "type": "text",
                "text": {
                    "content": description
                }
            }
        ]
    
    json_data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(
        url,
        data=json_data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        },
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"✗ HTTP Error {e.code}: {error_body}")
        if e.code == 401:
            print("  → Authentication failed. Check your API token.")
        elif e.code == 403:
            print("  → Permission denied. Make sure you've shared the 'Kitchen OS' page with your integration.")
        raise
    except Exception as e:
        print(f"✗ Error: {e}")
        raise

def main():
    print("=" * 60)
    print("Notion Food Storage & Recipe Manager Setup")
    print("=" * 60)
    print()
    
    token = get_token()
    
    # Food Storage properties
    food_storage_properties = {
        "Name": {"title": {}},
        "Quantity": {"number": {"format": "number"}},
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
        "Expiry Date": {"date": {}},
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
    
    print("Creating Food Storage database...")
    try:
        food_storage_db = create_database(
            token,
            "Food Storage",
            food_storage_properties,
            "Track your ingredients and their quantities"
        )
        print(f"✓ Food Storage database created!")
        print(f"  URL: {food_storage_db.get('url', 'N/A')}")
        food_storage_db_id = food_storage_db['id']
    except Exception as e:
        print(f"Failed to create Food Storage database: {e}")
        sys.exit(1)
    
    # Recipes properties
    recipes_properties = {
        "Name": {"title": {}},
        "Ingredients": {
            "relation": {
                "database_id": food_storage_db_id,
                "type": "single_property",
                "single_property": {}
            }
        },
        "Ingredient Quantities": {"rich_text": {}},
        "Instructions": {"rich_text": {}},
        "Can Make": {"checkbox": {}},
        "Missing Ingredients": {"rich_text": {}},
        "Servings": {"number": {"format": "number"}},
        "Prep Time (min)": {"number": {"format": "number"}},
        "Cook Time (min)": {"number": {"format": "number"}}
    }
    
    print("\nCreating Recipes database...")
    try:
        recipes_db = create_database(
            token,
            "Recipes",
            recipes_properties,
            "Store recipes and check ingredient availability"
        )
        print(f"✓ Recipes database created!")
        print(f"  URL: {recipes_db.get('url', 'N/A')}")
    except Exception as e:
        print(f"Failed to create Recipes database: {e}")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✓ Setup Complete!")
    print("=" * 60)
    print("\nYour databases have been created in the 'Kitchen OS' page!")
    print("\nNext steps:")
    print("1. Open your 'Kitchen OS' page in Notion")
    print("2. You'll see two new databases: 'Food Storage' and 'Recipes'")
    print("3. Start adding ingredients to Food Storage")
    print("4. Create recipes and link ingredients using the 'Ingredients' relation")
    print("5. Use 'Can Make' checkbox to flag recipes you can prepare")
    print("6. Use 'Missing Ingredients' to track what you need to buy")
    print("\nHappy cooking! 🍳")

if __name__ == "__main__":
    main()
