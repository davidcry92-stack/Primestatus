#!/usr/bin/env python3
"""
Fix the test user to match the exact backend schema
"""
import asyncio
import os
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def fix_test_user_final():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    # Test user credentials
    password = "password123"
    re_entry_code = "1111"
    
    # Hash with the correct salt (matching backend exactly)
    salt = "statusxsmoakland_salt_2024"
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    re_entry_hash = hashlib.sha256((re_entry_code + salt).encode()).hexdigest()
    
    # Delete existing test user and recreate with correct schema
    await db.users.delete_one({"email": "test@smoakland.com"})
    
    # Create user with exact same schema as registration
    test_user = {
        "username": "testuser",
        "email": "test@smoakland.com",
        "password": password_hash,  # This is the key field for login
        "re_entry_code_hash": re_entry_hash,
        "full_name": "Test User",
        "date_of_birth": "1990-01-01",
        "membership_tier": "premium",
        "is_law_enforcement": False,
        "parent_email": None,
        "preferences": {"categories": [], "vendors": [], "price_range": [0, 200]},
        "wictionary_access": True,  # Premium membership
        "order_history": [],
        "is_verified": True,  # Set to True so user can login immediately
        "id_verification": {
            "id_front_url": "test_id_front.jpg",
            "id_back_url": "test_id_back.jpg",
            "medical_document_url": None,
            "verification_status": "approved",  # Approved for immediate access
            "verified_at": datetime.utcnow(),
            "rejected_reason": None,
            "age_verified": 33,  # Over 21
            "requires_medical": False
        },
        "created_at": datetime.utcnow(),
        "member_since": datetime.utcnow()
    }
    
    # Insert the corrected user
    result = await db.users.insert_one(test_user)
    
    if result.inserted_id:
        print("✅ Test user recreated with correct schema!")
        print("\n" + "="*50)
        print("🎯 FINAL TEST USER CREDENTIALS")
        print("="*50)
        print("Email: test@smoakland.com")
        print("Password: password123")
        print("Re-entry Code: 1111")
        print("Membership: Premium (Wictionary Access)")
        print("Status: Verified and ready to use")
        print("="*50)
        print("\nYou should now be able to login successfully!")
    else:
        print("❌ Failed to create user")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_test_user_final())