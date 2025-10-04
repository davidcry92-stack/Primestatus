#!/usr/bin/env python3
"""
Create a fully verified premium user for immediate access
"""
import asyncio
import os
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def create_verified_user():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    # Delete any existing demo users
    await db.users.delete_many({"email": {"$in": ["demo@smoakland.com", "verified@smoakland.com"]}})
    
    # User credentials
    email = "verified@smoakland.com"
    password = "verified123"
    re_entry_code = "3333"
    
    # Hash with the correct salt (matching backend)
    salt = "statusxsmoakland_salt_2024"
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    re_entry_hash = hashlib.sha256((re_entry_code + salt).encode()).hexdigest()
    
    # Create fully verified premium user
    verified_user = {
        "username": "verifieduser",
        "email": email,
        "password": password_hash,
        "re_entry_code_hash": re_entry_hash,
        "full_name": "Verified Premium User",
        "date_of_birth": "1990-01-01",
        "membership_tier": "premium",
        "is_law_enforcement": False,
        "parent_email": None,
        "preferences": {"categories": ["flower", "edibles", "vapes"], "vendors": [], "price_range": [0, 200]},
        "wictionary_access": True,  # Premium access
        "order_history": [],
        "is_verified": True,  # VERIFIED - key field
        "id_verification": {
            "id_front_url": "verified_id_front.jpg",
            "id_back_url": "verified_id_back.jpg", 
            "medical_document_url": None,
            "verification_status": "approved",  # APPROVED
            "verified_at": datetime.utcnow(),
            "rejected_reason": None,
            "age_verified": 35,
            "requires_medical": False
        },
        "created_at": datetime.utcnow(),
        "member_since": datetime.utcnow()
    }
    
    # Insert the verified user
    result = await db.users.insert_one(verified_user)
    
    if result.inserted_id:
        print("✅ Verified premium user created successfully!")
        print("\n" + "="*60)
        print("🎯 VERIFIED PREMIUM USER CREDENTIALS")
        print("="*60)
        print(f"Email: {email}")
        print(f"Password: {password}")
        print(f"Re-entry Code: {re_entry_code}")
        print("Membership: Premium (Full Access)")
        print("Status: VERIFIED ✅")
        print("="*60)
        print("\nFEATURES AVAILABLE:")
        print("✅ Full product inventory access")
        print("✅ Wictionary premium feature")
        print("✅ Product rating system")
        print("✅ Daily deals")
        print("✅ No verification pending!")
        print("="*60)
        
        # Test login immediately
        print("\n🔍 Testing login...")
        import aiohttp
        import json
        
        async with aiohttp.ClientSession() as session:
            login_data = {"email": email, "password": password}
            backend_url = "https://blank-screen-fix-1.preview.emergentagent.com/api"
            
            try:
                async with session.post(f"{backend_url}/auth/login", json=login_data) as response:
                    if response.status == 200:
                        data = await response.json()
                        user_data = data.get("user", {})
                        print(f"✅ Login successful!")
                        print(f"   Username: {user_data.get('username')}")
                        print(f"   Verified: {user_data.get('is_verified')}")
                        print(f"   Membership: {user_data.get('membership_tier')}")
                        print(f"   Wictionary Access: {user_data.get('wictionary_access')}")
                    else:
                        response_text = await response.text()
                        print(f"❌ Login test failed: {response_text}")
            except Exception as e:
                print(f"❌ Login test error: {str(e)}")
        
    else:
        print("❌ Failed to create verified user")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_verified_user())