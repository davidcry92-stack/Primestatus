#!/usr/bin/env python3
"""
Check existing admin users and create test credentials
"""
import asyncio
import os
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def check_and_create_admin():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    # Check existing admins
    admins = await db.admins.find({}).to_list(length=10)
    print(f"Found {len(admins)} admin users:")
    
    for admin in admins:
        print(f"  - {admin.get('email', 'no email')} ({admin.get('username', 'no username')})")
        print(f"    Role: {admin.get('role', 'unknown')}")
        print()
    
    # Create a test admin if none exist or if we need a fresh one
    admin_email = "admin@smoakland.com"
    admin_password = "admin123"
    
    # Delete existing test admin
    await db.admins.delete_one({"email": admin_email})
    
    # Hash password with same salt as backend
    salt = "statusxsmoakland_salt_2024"
    password_hash = hashlib.sha256((admin_password + salt).encode()).hexdigest()
    
    # Create admin user
    admin_user = {
        "username": "admin",
        "email": admin_email,
        "password_hash": password_hash,
        "role": "super_admin",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "permissions": {
            "manage_users": True,
            "manage_inventory": True,
            "manage_transactions": True,
            "view_analytics": True,
            "manage_wictionary": True
        }
    }
    
    result = await db.admins.insert_one(admin_user)
    
    if result.inserted_id:
        print("✅ Admin user created!")
        print("\n" + "="*60)
        print("🎯 ADMIN LOGIN CREDENTIALS")
        print("="*60)
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print("Role: Super Admin")
        print("URL: https://blank-screen-fix-1.preview.emergentagent.com/admin")
        print("="*60)
        
        # Test admin login
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            login_data = {"email": admin_email, "password": admin_password}
            backend_url = "https://blank-screen-fix-1.preview.emergentagent.com/api"
            
            try:
                async with session.post(f"{backend_url}/admin/auth/login", json=login_data) as response:
                    if response.status == 200:
                        print("✅ Admin login test successful!")
                    else:
                        response_text = await response.text()
                        print(f"❌ Admin login test failed: {response_text}")
            except Exception as e:
                print(f"❌ Admin login test error: {str(e)}")
    
    # Also create a regular premium user for main app testing
    regular_email = "premium@smoakland.com"
    regular_password = "premium123"
    
    # Delete existing test user
    await db.users.delete_one({"email": regular_email})
    
    # Hash password
    regular_password_hash = hashlib.sha256((regular_password + salt).encode()).hexdigest()
    
    # Create premium user
    premium_user = {
        "username": "premiumuser",
        "email": regular_email,
        "password": regular_password_hash,
        "re_entry_code_hash": hashlib.sha256(("9999" + salt).encode()).hexdigest(),
        "full_name": "Premium Test User",
        "date_of_birth": "1990-01-01",
        "membership_tier": "premium",
        "is_law_enforcement": False,
        "parent_email": None,
        "preferences": {"categories": ["flower", "edibles", "vapes"], "vendors": [], "price_range": [0, 200]},
        "wictionary_access": True,
        "order_history": [],
        "is_verified": True,  # VERIFIED
        "id_verification": {
            "id_front_url": "premium_id_front.jpg",
            "id_back_url": "premium_id_back.jpg",
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
    
    user_result = await db.users.insert_one(premium_user)
    
    if user_result.inserted_id:
        print("\n" + "="*60)
        print("🎯 PREMIUM USER LOGIN CREDENTIALS")
        print("="*60)
        print(f"Email: {regular_email}")
        print(f"Password: {regular_password}")
        print(f"Re-entry Code: 9999")
        print("Membership: Premium (Wictionary Access)")
        print("Status: VERIFIED ✅")
        print("="*60)
        
        # Test regular user login
        async with aiohttp.ClientSession() as session:
            login_data = {"email": regular_email, "password": regular_password}
            
            try:
                async with session.post(f"{backend_url}/auth/login", json=login_data) as response:
                    if response.status == 200:
                        print("✅ Premium user login test successful!")
                    else:
                        response_text = await response.text()
                        print(f"❌ Premium user login test failed: {response_text}")
            except Exception as e:
                print(f"❌ Premium user login test error: {str(e)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_and_create_admin())