#!/usr/bin/env python3
"""
Check all users in database and verify one
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def check_and_verify_users():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    # Get all users
    users = await db.users.find({}).to_list(length=10)
    
    print(f"Found {len(users)} users in database:")
    for user in users:
        print(f"  - {user['email']} ({user.get('username', 'no username')})")
        print(f"    Verified: {user.get('is_verified', False)}")
        print(f"    Membership: {user.get('membership_tier', 'unknown')}")
        print()
    
    if users:
        # Pick the first user and verify them
        first_user = users[0]
        email = first_user['email']
        
        print(f"🔧 Verifying user: {email}")
        
        result = await db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "is_verified": True,
                    "id_verification.verification_status": "approved",
                    "id_verification.verified_at": datetime.utcnow(),
                    "wictionary_access": True,
                    "membership_tier": "premium"
                }
            }
        )
        
        if result.modified_count > 0:
            print("✅ User verified successfully!")
            
            # Get updated user
            updated_user = await db.users.find_one({"email": email})
            
            print("\n" + "="*60)
            print("🎯 VERIFIED USER CREDENTIALS")
            print("="*60)
            print(f"Email: {email}")
            print(f"Username: {updated_user.get('username', 'unknown')}")
            print("Password: [Use whatever password you registered with]")
            print(f"Membership: {updated_user.get('membership_tier', 'unknown')}")
            print(f"Verified: {updated_user.get('is_verified', False)}")
            print(f"Wictionary Access: {updated_user.get('wictionary_access', False)}")
            print("="*60)
            
            # If this is the fresh user, show password
            if email == "fresh@smoakland.com":
                print("Password: fresh123")
                print("Re-entry Code: 4444")
            
    client.close()

if __name__ == "__main__":
    asyncio.run(check_and_verify_users())