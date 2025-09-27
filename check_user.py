#!/usr/bin/env python3
"""
Check what's actually in the database
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def check_user():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.statusxsmoakland
    
    user = await db.users.find_one({"email": "test@smoakland.com"})
    
    if user:
        print("User found:")
        for key, value in user.items():
            if key == 'password':
                print(f"  {key}: {value[:20]}..." if value else f"  {key}: None")
            else:
                print(f"  {key}: {value}")
    else:
        print("No user found")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_user())