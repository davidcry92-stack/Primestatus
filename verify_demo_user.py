#!/usr/bin/env python3
"""
Verify the demo user and give full premium access
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def verify_demo_user():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    # Update the demo user to be fully verified
    result = await db.users.update_one(
        {"email": "demo@smoakland.com"},
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
        print("✅ Demo user verification status updated!")
        
        # Check the user to confirm
        user = await db.users.find_one({"email": "demo@smoakland.com"})
        if user:
            print("\n" + "="*50)
            print("🎯 DEMO USER STATUS VERIFIED")
            print("="*50)
            print(f"Email: {user['email']}")
            print(f"Username: {user['username']}")
            print(f"Verified: {user['is_verified']}")
            print(f"Membership: {user['membership_tier']}")
            print(f"Wictionary Access: {user['wictionary_access']}")
            print(f"Verification Status: {user['id_verification']['verification_status']}")
            print("="*50)
            print("\nYou should now have full premium access!")
            print("✅ Access to inventory")
            print("✅ Access to Wictionary")
            print("✅ Premium member features")
        
    else:
        print("❌ Failed to update user - user may not exist")
        
        # Check if user exists
        user = await db.users.find_one({"email": "demo@smoakland.com"})
        if not user:
            print("User not found. Please run the registration script first.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(verify_demo_user())