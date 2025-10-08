#!/usr/bin/env python3
"""
Debug prepaid order structure
"""

import asyncio
import aiohttp
import json

BACKEND_URL = "https://statusx-cannabis-1.preview.emergentagent.com/api"
PREMIUM_USER_EMAIL = "premium@demo.com"
PREMIUM_USER_PASSWORD = "Premium123!"
ADMIN_EMAIL = "admin@statusxsmoakland.com"
ADMIN_PASSWORD = "Admin123!"

async def debug_prepaid_order():
    async with aiohttp.ClientSession() as session:
        # Authenticate admin
        admin_login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        async with session.post(f"{BACKEND_URL}/admin-auth/login", json=admin_login_data) as response:
            admin_response = await response.json()
            admin_token = admin_response["access_token"]
        
        # Get all prepaid orders to see structure
        headers = {"Authorization": f"Bearer {admin_token}"}
        async with session.get(f"{BACKEND_URL}/admin/prepaid-orders", headers=headers) as response:
            orders_response = await response.json()
            orders = orders_response.get("orders", [])
            
            print("=== PREPAID ORDERS STRUCTURE ===")
            print(f"Found {len(orders)} orders")
            
            if orders:
                print("\nFirst order structure:")
                print(json.dumps(orders[0], indent=2, default=str))
                
                # Try to lookup the first order
                if "pickup_code" in orders[0]:
                    pickup_code = orders[0]["pickup_code"]
                    print(f"\nLooking up order with pickup_code: {pickup_code}")
                    
                    async with session.get(f"{BACKEND_URL}/admin/prepaid-orders/lookup/{pickup_code}", headers=headers) as response:
                        lookup_response = await response.json()
                        print("Lookup response:")
                        print(json.dumps(lookup_response, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(debug_prepaid_order())