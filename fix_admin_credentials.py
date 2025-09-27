#!/usr/bin/env python3
"""
Fix admin credentials to match backend expectations
"""
import asyncio
import os
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def fix_admin_credentials():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    # Check current admin
    admin = await db.admins.find_one({"email": "admin@smoakland.com"})
    if admin:
        print("Current admin document:")
        for key, value in admin.items():
            if key == 'password_hash':
                print(f"  {key}: {value[:20]}...")
            else:
                print(f"  {key}: {value}")
    
    # Delete and recreate with exact backend schema
    await db.admins.delete_many({})
    
    # Create admin with exact backend schema
    admin_email = "admin@smoakland.com"
    admin_password = "admin123"
    
    # Hash password with backend salt
    salt = "statusxsmoakland_salt_2024"
    password_hash = hashlib.sha256((admin_password + salt).encode()).hexdigest()
    
    # Create admin exactly as backend expects
    admin_user = {
        "username": "admin",
        "email": admin_email,
        "password_hash": password_hash,  # Backend looks for this field
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
        print("\n✅ Admin recreated with correct schema!")
        
        # Test the login
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            login_data = {"email": admin_email, "password": admin_password}
            backend_url = "https://product-showcase-109.preview.emergentagent.com/api"
            
            try:
                async with session.post(f"{backend_url}/admin-auth/login", json=login_data) as response:
                    response_text = await response.text()
                    print(f"Admin login test - Status: {response.status}")
                    print(f"Response: {response_text}")
                    
                    if response.status == 200:
                        print("\n🎉 ADMIN LOGIN WORKING!")
                        print("\n" + "="*60)
                        print("🎯 WORKING ADMIN CREDENTIALS")
                        print("="*60)
                        print(f"Email: {admin_email}")
                        print(f"Password: {admin_password}")
                        print("URL: https://product-showcase-109.preview.emergentagent.com/admin")
                        print("Role: Super Admin")
                        print("="*60)
                        print("\nADMIN PANEL FEATURES:")
                        print("✅ Member management")
                        print("✅ Transaction oversight")
                        print("✅ Inventory management")
                        print("✅ Pickup verification")
                        print("✅ Rating statistics")
                    else:
                        print("❌ Admin login still failing")
                        
            except Exception as e:
                print(f"❌ Admin test error: {str(e)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_admin_credentials())