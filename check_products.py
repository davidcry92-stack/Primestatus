#!/usr/bin/env python3
"""
Check what fields are in the products collection
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import json

# Load environment variables
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

async def check_products():
    """Check what fields exist in products."""
    
    # Database connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'statusxsmoakland')]
    products_collection = db.products
    
    # Get all products
    products = await products_collection.find({}).to_list(length=None)
    
    print(f"Found {len(products)} products")
    
    for i, product in enumerate(products):
        print(f"\nProduct {i+1}:")
        print(f"  Name: {product.get('name', 'N/A')}")
        print(f"  Fields: {list(product.keys())}")
        
        # Check for missing required fields
        required_fields = ['tier', 'created_at', 'updated_at']
        missing_fields = [field for field in required_fields if field not in product]
        if missing_fields:
            print(f"  Missing fields: {missing_fields}")
        else:
            print(f"  All required fields present")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_products())