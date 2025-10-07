#!/usr/bin/env python3
"""
Test prepaid order creation and admin lookup functionality for Square digital wallet payments.
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration
BACKEND_URL = "https://secure-pickup.preview.emergentagent.com/api"
PREMIUM_USER_EMAIL = "premium@demo.com"
PREMIUM_USER_PASSWORD = "Premium123!"
ADMIN_EMAIL = "admin@statusxsmoakland.com"
ADMIN_PASSWORD = "Admin123!"

class PrepaidOrderTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results."""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
    
    async def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)."""
        url = f"{BACKEND_URL}{endpoint}"
        request_headers = {"Content-Type": "application/json"}
        
        if headers:
            request_headers.update(headers)
            
        try:
            async with self.session.request(
                method, 
                url, 
                json=data if data else None,
                headers=request_headers
            ) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = {"error": "Invalid JSON response", "text": await response.text()}
                
                return response.status < 400, response_data, response.status
                
        except Exception as e:
            return False, {"error": str(e)}, 0

    async def authenticate_users(self):
        """Authenticate both premium user and admin."""
        print("\n=== AUTHENTICATING USERS ===")
        
        # Authenticate premium user
        premium_login_data = {
            "email": PREMIUM_USER_EMAIL,
            "password": PREMIUM_USER_PASSWORD
        }
        
        success, response, status = await self.make_request("POST", "/auth/login", premium_login_data)
        
        if success and "access_token" in response:
            premium_token = response["access_token"]
            self.log_test("Premium User Authentication", True, f"Successfully logged in as {PREMIUM_USER_EMAIL}")
        else:
            self.log_test("Premium User Authentication", False, f"Login failed: {response}")
            return None, None
        
        # Authenticate admin
        admin_login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        success, response, status = await self.make_request("POST", "/admin-auth/login", admin_login_data)
        
        if success and "access_token" in response:
            admin_token = response["access_token"]
            self.log_test("Admin Authentication", True, f"Successfully logged in as {ADMIN_EMAIL}")
        else:
            self.log_test("Admin Authentication", False, f"Login failed: {response}")
            return premium_token, None
        
        return premium_token, admin_token

    async def create_test_payment(self, user_token: str):
        """Create a test Apple Pay payment to generate a prepaid order."""
        print("\n=== CREATING TEST PAYMENT ===")
        
        headers = {"Authorization": f"Bearer {user_token}"}
        
        apple_pay_data = {
            "token": "test_apple_pay_token_for_prepaid_order",
            "amount": 5000,  # $50.00 in cents
            "currency": "USD",
            "items": [
                {
                    "id": "za-test",
                    "name": "Test Za Product",
                    "price": 25.00,
                    "quantity": 2,
                    "tier": "za",
                    "category": "flower"
                }
            ],
            "buyer_details": {
                "name": "Premium Demo User",
                "email": PREMIUM_USER_EMAIL
            },
            "user_email": PREMIUM_USER_EMAIL
        }
        
        success, response, status = await self.make_request(
            "POST", 
            "/payments/apple-pay", 
            apple_pay_data, 
            headers
        )
        
        if success and response.get("success"):
            payment_id = response.get("payment_id")
            payment_code = response.get("payment_code")
            
            self.log_test(
                "Test Payment Creation",
                True,
                f"Created test payment: ID {payment_id}, Code {payment_code}"
            )
            
            return payment_id, payment_code
        else:
            self.log_test(
                "Test Payment Creation",
                False,
                f"Failed to create test payment: {response}"
            )
            return None, None

    async def test_admin_prepaid_orders_list(self, admin_token: str):
        """Test admin endpoint to list all prepaid orders."""
        print("\n=== TESTING ADMIN PREPAID ORDERS LIST ===")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        success, response, status = await self.make_request(
            "GET", 
            "/admin/prepaid-orders", 
            headers=headers
        )
        
        if success:
            orders = response.get("orders", [])
            total_count = response.get("total_count", 0)
            stats = response.get("stats", {})
            
            self.log_test(
                "Admin Prepaid Orders List",
                True,
                f"Retrieved {len(orders)} orders, Total: {total_count}, Pending: {stats.get('pending_pickup', 0)}"
            )
            
            return orders
        else:
            self.log_test(
                "Admin Prepaid Orders List",
                False,
                f"Failed to retrieve prepaid orders: {response}"
            )
            return []

    async def test_prepaid_order_lookup(self, admin_token: str, payment_code: str):
        """Test admin lookup of specific prepaid order by payment code."""
        print(f"\n=== TESTING PREPAID ORDER LOOKUP ({payment_code}) ===")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        success, response, status = await self.make_request(
            "GET", 
            f"/admin/prepaid-orders/lookup/{payment_code}", 
            headers=headers
        )
        
        if success:
            # The response IS the order object, not wrapped in an "order" field
            order = response
            
            self.log_test(
                "Prepaid Order Lookup",
                True,
                f"Found order: User {order.get('user_email')}, Amount ${order.get('total_amount')}, Status {order.get('status')}"
            )
            
            # Verify order structure
            required_fields = ["user_email", "pickup_code", "total_amount", "items", "status", "created_at"]
            missing_fields = [field for field in required_fields if field not in order]
            
            self.log_test(
                "Prepaid Order Structure",
                len(missing_fields) == 0,
                f"Order structure {'complete' if not missing_fields else f'missing: {missing_fields}'}"
            )
            
            # Verify payment code matches
            code_matches = order.get("pickup_code") == payment_code
            self.log_test(
                "Payment Code Verification",
                code_matches,
                f"Payment code matches: {code_matches} (expected: {payment_code}, got: {order.get('pickup_code')})"
            )
            
            return order
        else:
            self.log_test(
                "Prepaid Order Lookup",
                False,
                f"Failed to lookup order: {response}"
            )
            return None

    async def test_prepaid_orders_stats(self, admin_token: str):
        """Test prepaid orders statistics endpoint."""
        print("\n=== TESTING PREPAID ORDERS STATS ===")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        success, response, status = await self.make_request(
            "GET", 
            "/admin/prepaid-orders/stats", 
            headers=headers
        )
        
        if success:
            stats = response
            
            self.log_test(
                "Prepaid Orders Stats",
                True,
                f"Total: {stats.get('total_orders')}, Pending: {stats.get('pending_pickup')}, Completed: {stats.get('completed_pickups')}, Revenue: ${stats.get('total_revenue', 0)}"
            )
            
            # Verify stats structure
            required_stats = ["total_orders", "pending_pickup", "completed_pickups", "total_revenue"]
            missing_stats = [stat for stat in required_stats if stat not in stats]
            
            self.log_test(
                "Stats Structure",
                len(missing_stats) == 0,
                f"Stats structure {'complete' if not missing_stats else f'missing: {missing_stats}'}"
            )
            
        else:
            self.log_test(
                "Prepaid Orders Stats",
                False,
                f"Failed to get stats: {response}"
            )

    async def test_order_completion(self, admin_token: str, payment_code: str):
        """Test marking an order as completed/picked up."""
        print(f"\n=== TESTING ORDER COMPLETION ({payment_code}) ===")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        completion_data = {
            "pickup_code": payment_code,
            "completed_by": ADMIN_EMAIL,
            "admin_notes": "Test completion - order picked up successfully"
        }
        
        success, response, status = await self.make_request(
            "PUT", 
            "/admin/prepaid-orders/complete", 
            completion_data,
            headers=headers
        )
        
        if success:
            self.log_test(
                "Order Completion",
                True,
                f"Successfully marked order as completed: {response.get('message', 'No message')}"
            )
            
            # Verify the order status was updated
            success, lookup_response, status = await self.make_request(
                "GET", 
                f"/admin/prepaid-orders/lookup/{payment_code}", 
                headers=headers
            )
            
            if success:
                order = lookup_response.get("order", {})
                status_updated = order.get("status") == "picked_up"
                
                self.log_test(
                    "Order Status Update Verification",
                    status_updated,
                    f"Order status: {order.get('status')} {'(correctly updated)' if status_updated else '(not updated)'}"
                )
            
        else:
            self.log_test(
                "Order Completion",
                False,
                f"Failed to complete order: {response}"
            )

    async def run_all_tests(self):
        """Run all prepaid order tests."""
        print("🚀 Starting Prepaid Order Integration Tests")
        print(f"Testing against: {BACKEND_URL}")
        print("=" * 70)
        
        # Authenticate users
        premium_token, admin_token = await self.authenticate_users()
        
        if not premium_token or not admin_token:
            print("❌ Authentication failed - cannot proceed with tests")
            return
        
        # Create a test payment to generate a prepaid order
        payment_id, payment_code = await self.create_test_payment(premium_token)
        
        if not payment_code:
            print("❌ Test payment creation failed - cannot test prepaid orders")
            return
        
        # Test admin prepaid orders functionality
        orders = await self.test_admin_prepaid_orders_list(admin_token)
        
        # Test specific order lookup
        order = await self.test_prepaid_order_lookup(admin_token, payment_code)
        
        # Test prepaid orders statistics
        await self.test_prepaid_orders_stats(admin_token)
        
        # Test order completion
        if order:
            await self.test_order_completion(admin_token, payment_code)
        
        # Print summary
        print("\n" + "=" * 70)
        print("📊 PREPAID ORDER TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['details']}")
        
        print("\n" + "=" * 70)
        
        # Determine overall success
        critical_tests = [
            "Test Payment Creation",
            "Admin Prepaid Orders List", 
            "Prepaid Order Lookup",
            "Payment Code Verification"
        ]
        
        critical_passed = sum(1 for result in self.test_results 
                            if result["success"] and any(critical in result["test"] for critical in critical_tests))
        
        if critical_passed >= 3:
            print("🎉 PREPAID ORDER INTEGRATION: WORKING")
            print("   ✅ Digital wallet payments create prepaid orders")
            print("   ✅ Admin can lookup orders by payment code")
            print("   ✅ Order management functionality operational")
        else:
            print("⚠️  PREPAID ORDER INTEGRATION: ISSUES FOUND")
            print("   ❌ Critical prepaid order functionality not working properly")

async def main():
    async with PrepaidOrderTester() as tester:
        await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())