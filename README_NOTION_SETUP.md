# Notion Food Storage & Recipe Manager Setup

This script automatically creates two connected Notion databases for managing your food storage and recipes.

## Features

- **Food Storage Database**: Track ingredients, quantities, units, categories, expiry dates, and storage locations
- **Recipes Database**: Store recipes with ingredient requirements, instructions, and automatic availability checking
- **Ingredient Checking**: See which recipes you can make based on available ingredients
- **Missing Ingredients Tracking**: Know exactly what you need to buy for each recipe

## Prerequisites

1. A Notion account
2. Python 3.7 or higher
3. A Notion integration (API token)

## Setup Instructions

### Step 1: Create a Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Name it "Food Storage Manager" (or any name you prefer)
4. Select your workspace
5. Click "Submit" to create the integration
6. Copy the "Internal Integration Token" (starts with `secret_`)

### Step 2: Get Your Parent Page ID

1. Open the Notion page where you want to create the databases
2. Click the "..." menu in the top right corner
3. Click "Copy link"
4. The page ID is the long string between the last `/` and `?` in the URL
   - Example: `https://notion.so/My-Page-abc123def456?pvs=4`
   - Page ID: `abc123def456`

### Step 3: Share the Page with Your Integration

1. On the page where you want to create the databases, click "Share" in the top right
2. Click "Add people, emails, groups, or integrations"
3. Search for your integration name (e.g., "Food Storage Manager")
4. Click on it to add it to the page
5. Make sure it has "Can edit" permissions

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 5: Set Environment Variables

```bash
export NOTION_API_TOKEN='your_token_here'
export NOTION_PARENT_PAGE_ID='your_page_id_here'
```

Or create a `.env` file (copy from `.env.example`) and use a tool like `python-dotenv`:

```bash
cp .env.example .env
# Edit .env with your values
```

### Step 6: Run the Setup Script

```bash
python setup_notion_food_manager.py
```

The script will create both databases in your Notion workspace.

## Database Structure

### Food Storage Database

- **Name** (Title): Ingredient name
- **Quantity** (Number): Current quantity available
- **Unit** (Select): g, kg, ml, L, pieces, cups, tbsp, tsp
- **Category** (Select): Vegetables, Fruits, Dairy, Meat, Pantry, Spices, Beverages, Frozen, Other
- **Expiry Date** (Date): Optional expiry tracking
- **Location** (Select): Fridge, Freezer, Pantry, Counter

### Recipes Database

- **Name** (Title): Recipe name
- **Ingredients** (Relation): Links to Food Storage database items
- **Ingredient Quantities** (Rich Text): Required quantities per ingredient
- **Instructions** (Rich Text): Cooking instructions
- **Can Make** (Checkbox): Flag recipes you can prepare
- **Missing Ingredients** (Rich Text): List of missing/insufficient ingredients
- **Servings** (Number): Number of servings
- **Prep Time (min)** (Number): Preparation time
- **Cook Time (min)** (Number): Cooking time

## Usage Tips

1. **Adding Ingredients**: Add items to the Food Storage database with their current quantities
2. **Creating Recipes**: Create recipe entries and link ingredients using the "Ingredients" relation property
3. **Tracking Availability**: 
   - Manually check the "Can Make" checkbox when you verify all ingredients are available
   - Use the "Missing Ingredients" field to note what you need to buy
4. **Filtering**: Use Notion's filter feature to show only recipes where "Can Make" is checked

## Advanced: Automatic Ingredient Checking

For automatic checking, you can:
- Use Notion formulas to compare ingredient quantities
- Set up Notion automations to update the "Can Make" status
- Use the Notion API to create a script that periodically checks availability

## Troubleshooting

- **"Unauthorized" error**: Make sure you've shared the page with your integration
- **"Parent page not found"**: Verify the page ID is correct
- **"Database creation failed"**: Ensure your integration has edit permissions on the page

## Support

For issues or questions, check the Notion API documentation: https://developers.notion.com/
