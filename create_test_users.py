#!/usr/bin/env python3
"""
Create test users and transactions for testing
"""

import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from bson import ObjectId
import random
import string

# Load environment variables
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

def generate_payment_code():
    """Generate a unique 6-digit payment code."""
    return ''.join(random.choices(string.digits, k=6))

async def create_test_data():
    """Create test users and transactions."""
    
    # Database connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'statusxsmoakland')]
    users_collection = db.users
    transactions_collection = db.transactions
    products_collection = db.products
    
    # Create test users
    test_users = [
        {
            "username": "testuser1",
            "email": "testuser1@example.com",
            "full_name": "Test User One",
            "date_of_birth": "1990-01-01",
            "membership_tier": "basic",
            "is_verified": True,
            "verification_status": "approved",
            "wictionary_access": False,
            "id_verification": {
                "verification_status": "approved",
                "age_verified": 1,
                "requires_medical": False
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "username": "testuser2",
            "email": "testuser2@example.com",
            "full_name": "Test User Two",
            "date_of_birth": "1985-05-15",
            "membership_tier": "premium",
            "is_verified": True,
            "verification_status": "approved",
            "wictionary_access": True,
            "id_verification": {
                "verification_status": "approved",
                "age_verified": 1,
                "requires_medical": False
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Insert users
    user_results = await users_collection.insert_many(test_users)
    user_ids = user_results.inserted_ids
    print(f"Created {len(user_ids)} test users")
    
    # Get products for transactions
    products = await products_collection.find({}).to_list(length=None)
    if not products:
        print("No products found - cannot create transactions")
        client.close()
        return
    
    # Create test transactions
    test_transactions = []
    for i, user_id in enumerate(user_ids):
        # Create 2-3 transactions per user
        for j in range(random.randint(2, 3)):
            # Select random products
            selected_products = random.sample(products, random.randint(1, 2))
            
            items = []
            total = 0
            for product in selected_products:
                quantity = random.randint(1, 3)
                items.append({
                    "product_id": product["_id"],
                    "product_name": product["name"],
                    "quantity": quantity,
                    "price": product["price"],
                    "tier": product.get("tier", "za")
                })
                total += product["price"] * quantity
            
            transaction = {
                "user_id": user_id,
                "items": items,
                "total": round(total, 2),
                "payment_method": random.choice(["in_app", "cash_in_store"]),
                "payment_code": generate_payment_code(),
                "status": random.choice(["pending", "paid_in_app", "picked_up", "cash_paid_in_store"]),
                "notes": f"Test transaction {j+1} for user {i+1}",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            test_transactions.append(transaction)
    
    # Insert transactions
    if test_transactions:
        transaction_results = await transactions_collection.insert_many(test_transactions)
        print(f"Created {len(transaction_results.inserted_ids)} test transactions")
    
    # Print summary
    total_users = await users_collection.count_documents({})
    total_transactions = await transactions_collection.count_documents({})
    total_products = await products_collection.count_documents({})
    
    print(f"\nDatabase summary:")
    print(f"  Users: {total_users}")
    print(f"  Transactions: {total_transactions}")
    print(f"  Products: {total_products}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_test_data())