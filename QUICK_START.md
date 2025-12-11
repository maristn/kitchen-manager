# Quick Start - Create Notion Databases

I've prepared everything to create your Food Storage and Recipes databases in Notion!

## Found Your Workspace

✅ Found your "Kitchen OS" page - this will be used as the parent page for the databases.

## Two Options to Create the Databases

### Option 1: Automatic Setup (Recommended)

1. **Get your Notion API token:**
   - Go to https://www.notion.so/my-integrations
   - Click "+ New integration"
   - Name it "Food Storage Manager"
   - Copy the token (starts with `secret_`)

2. **Share the "Kitchen OS" page with your integration:**
   - Open the "Kitchen OS" page in Notion
   - Click "Share" → "Add people, emails, groups, or integrations"
   - Search for "Food Storage Manager" and add it
   - Make sure it has "Can edit" permissions

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set your API token and run:**
   ```bash
   export NOTION_API_TOKEN='your_token_here'
   python setup_notion_food_manager.py
   ```

The script will automatically:
- Create the Food Storage database with all properties
- Create the Recipes database with ingredient relations
- Link them together

### Option 2: Manual Creation

If you prefer to create them manually in Notion, see `README_NOTION_SETUP.md` for detailed instructions.

## What Gets Created

### Food Storage Database
- Name (Title)
- Quantity (Number)
- Unit (Select: g, kg, ml, L, pieces, cups, tbsp, tsp)
- Category (Select: Vegetables, Fruits, Dairy, Meat, Pantry, Spices, Beverages, Frozen, Other)
- Expiry Date (Date)
- Location (Select: Fridge, Freezer, Pantry, Counter)

### Recipes Database
- Name (Title)
- Ingredients (Relation → Food Storage)
- Ingredient Quantities (Rich Text)
- Instructions (Rich Text)
- Can Make (Checkbox)
- Missing Ingredients (Rich Text)
- Servings (Number)
- Prep Time (min) (Number)
- Cook Time (min) (Number)

## Need Help?

Check `README_NOTION_SETUP.md` for detailed troubleshooting and usage tips.
