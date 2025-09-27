#!/usr/bin/env python3
"""
Create a test user for StatusXSmoakland with premium membership
"""
import asyncio
import os
import hashlib
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

async def create_test_user():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    # Test user credentials
    username = "testuser"
    email = "test@smoakland.com" 
    password = "password123"
    re_entry_code = "1111"
    
    # Hash the password (simple SHA-256 to match the system)
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    re_entry_hash = hashlib.sha256(re_entry_code.encode()).hexdigest()
    
    # Create test user data
    test_user = {
        "id": "test-user-12345",
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "full_name": "Test User",
        "date_of_birth": "1990-01-01",
        "re_entry_code": re_entry_hash,
        "membership_tier": "premium",  # Premium to access Wictionary
        "is_verified": True,
        "is_law_enforcement": False,
        "verification_status": "approved",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "preferences": {
            "categories": ["flower", "edibles", "vapes"],
            "price_range": [20, 150]
        }
    }
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        print(f"Updating existing test user: {email}")
        await db.users.replace_one({"email": email}, test_user)
    else:
        print(f"Creating new test user: {email}")
        await db.users.insert_one(test_user)
    
    print("\n" + "="*50)
    print("🎯 TEST USER CREATED SUCCESSFULLY!")
    print("="*50)
    print(f"Username: {username}")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"Re-entry Code: {re_entry_code}")
    print(f"Membership: Premium (Wictionary Access)")
    print("="*50)
    print("\nYou can now log in with these credentials to access:")
    print("✅ Full product inventory")
    print("✅ Wictionary functionality") 
    print("✅ Premium member features")
    print("✅ Product rating system")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_test_user())