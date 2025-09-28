#!/usr/bin/env python3
"""
Database Check for StatusXSmoakland
Checks if users exist in the database with correct credentials
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from utils.auth import verify_password

# Database configuration
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "statusxsmoakland"

# Test credentials from review request
ADMIN_EMAIL = "admin@statusxsmoakland.com"
ADMIN_PASSWORD = "Admin123!"
PREMIUM_USER_EMAIL = "premium@demo.com"
PREMIUM_USER_PASSWORD = "Premium123!"
BASIC_USER_EMAIL = "basic@demo.com"
BASIC_USER_PASSWORD = "Basic123!"

async def check_database():
    """Check database for user existence and password verification."""
    print("🔍 CHECKING DATABASE FOR USER CREDENTIALS")
    print("=" * 60)
    
    # Connect to database
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Check collections
    collections = await db.list_collection_names()
    print(f"Available collections: {collections}")
    
    # Check users collection
    users_collection = db.users
    users_count = await users_collection.count_documents({})
    print(f"Total users in database: {users_count}")
    
    # Check admin collection
    admins_collection = db.admins
    admins_count = await admins_collection.count_documents({})
    print(f"Total admins in database: {admins_count}")
    
    print("\n=== CHECKING SPECIFIC USER CREDENTIALS ===")
    
    # Test credentials
    test_cases = [
        ("Admin", ADMIN_EMAIL, ADMIN_PASSWORD, admins_collection),
        ("Premium User", PREMIUM_USER_EMAIL, PREMIUM_USER_PASSWORD, users_collection),
        ("Basic User", BASIC_USER_EMAIL, BASIC_USER_PASSWORD, users_collection)
    ]
    
    for user_type, email, password, collection in test_cases:
        print(f"\n--- {user_type} ({email}) ---")
        
        # Find user
        user = await collection.find_one({"email": email})
        
        if not user:
            print(f"❌ {user_type} NOT FOUND in database")
            continue
        
        print(f"✅ {user_type} found in database")
        
        # Check password field
        password_hash = user.get("password_hash") or user.get("password")
        if not password_hash:
            print(f"❌ No password hash found for {user_type}")
            continue
        
        print(f"✅ Password hash exists: {password_hash[:20]}...")
        
        # Verify password
        try:
            password_valid = verify_password(password, password_hash)
            if password_valid:
                print(f"✅ Password verification SUCCESSFUL for {user_type}")
            else:
                print(f"❌ Password verification FAILED for {user_type}")
        except Exception as e:
            print(f"❌ Password verification ERROR for {user_type}: {e}")
        
        # Show user details
        if user_type == "Admin":
            print(f"   Role: {user.get('role', 'unknown')}")
            print(f"   Active: {user.get('is_active', 'unknown')}")
        else:
            print(f"   Membership Tier: {user.get('membership_tier', 'unknown')}")
            print(f"   Verified: {user.get('is_verified', 'unknown')}")
    
    # List all users for debugging
    print("\n=== ALL USERS IN DATABASE ===")
    async for user in users_collection.find({}, {"email": 1, "membership_tier": 1, "is_verified": 1}):
        print(f"User: {user.get('email')} | Tier: {user.get('membership_tier')} | Verified: {user.get('is_verified')}")
    
    print("\n=== ALL ADMINS IN DATABASE ===")
    async for admin in admins_collection.find({}, {"email": 1, "role": 1, "is_active": 1}):
        print(f"Admin: {admin.get('email')} | Role: {admin.get('role')} | Active: {admin.get('is_active')}")
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(check_database())