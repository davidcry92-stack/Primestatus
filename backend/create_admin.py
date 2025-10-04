#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.database import users_collection
from utils.auth import get_password_hash
from datetime import datetime

async def create_admin_user():
    """Create admin user if it doesn't exist."""
    
    # Check if admin already exists
    existing_admin = await users_collection.find_one({"email": "admin@statusxsmoakland.com"})
    
    if existing_admin:
        print("Admin user already exists!")
        return
    
    # Create admin user
    admin_data = {
        "username": "admin",
        "email": "admin@statusxsmoakland.com",
        "password_hash": get_password_hash("Admin123!"),
        "full_name": "Administrator",
        "membership_tier": "admin",
        "role": "super_admin",
        "is_verified": True,
        "verification_status": "approved",
        "created_at": datetime.utcnow(),
        "member_since": datetime.utcnow(),
        "id_verification": {
            "verification_status": "approved",
            "age_verified": True,
            "requires_medical": False
        }
    }
    
    result = await users_collection.insert_one(admin_data)
    print(f"Admin user created successfully! ID: {result.inserted_id}")

if __name__ == "__main__":
    asyncio.run(create_admin_user())