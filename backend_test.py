#!/usr/bin/env python3
"""
Comprehensive Backend Testing for StatusXSmoakland Complete System
Tests actual inventory integration, product APIs, Wictionary system, and admin functionality.
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://primestatus.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@statusxsmoakland.com"
ADMIN_PASSWORD = "Admin123!"

# Test user for Wictionary (premium member)
TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "TestPass123!"

class AdminSystemTester:
    def __init__(self):
        self.session = None
        self.admin_token = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results."""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
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
    
    async def test_admin_authentication(self):
        """Test admin authentication system."""
        print("\n=== TESTING ADMIN AUTHENTICATION ===")
        
        # Test admin login
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        success, response, status = await self.make_request("POST", "/admin-auth/login", login_data)
        
        if success and "access_token" in response:
            self.admin_token = response["access_token"]
            admin_info = response.get("admin", {})
            self.log_test(
                "Admin Login", 
                True, 
                f"Successfully logged in as {admin_info.get('email', 'unknown')} with role {admin_info.get('role', 'unknown')}"
            )
            
            # Test token validation by getting profile
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            success, profile_response, status = await self.make_request("GET", "/admin-auth/profile", headers=headers)
            
            if success:
                self.log_test(
                    "Admin Token Validation", 
                    True, 
                    f"Token valid, profile retrieved for {profile_response.get('email', 'unknown')}"
                )
            else:
                self.log_test(
                    "Admin Token Validation", 
                    False, 
                    f"Token validation failed: {profile_response}",
                    profile_response
                )
        else:
            self.log_test(
                "Admin Login", 
                False, 
                f"Login failed with status {status}: {response}",
                response
            )
            return False
        
        return True
    
    async def test_member_management(self):
        """Test member management endpoints."""
        print("\n=== TESTING MEMBER MANAGEMENT ===")
        
        if not self.admin_token:
            self.log_test("Member Management", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test get all members
        success, response, status = await self.make_request("GET", "/admin/members", headers=headers)
        
        if success:
            members = response if isinstance(response, list) else []
            self.log_test(
                "Get All Members", 
                True, 
                f"Retrieved {len(members)} members"
            )
            
            # Test member search
            success, search_response, status = await self.make_request(
                "GET", 
                "/admin/members?search=test&limit=10", 
                headers=headers
            )
            
            if success:
                search_results = search_response if isinstance(search_response, list) else []
                self.log_test(
                    "Member Search", 
                    True, 
                    f"Search returned {len(search_results)} results"
                )
            else:
                self.log_test(
                    "Member Search", 
                    False, 
                    f"Search failed: {search_response}",
                    search_response
                )
            
            # Test member filtering by status
            success, filter_response, status = await self.make_request(
                "GET", 
                "/admin/members?status=pending&limit=10", 
                headers=headers
            )
            
            if success:
                filtered_results = filter_response if isinstance(filter_response, list) else []
                self.log_test(
                    "Member Status Filter", 
                    True, 
                    f"Status filter returned {len(filtered_results)} results"
                )
            else:
                self.log_test(
                    "Member Status Filter", 
                    False, 
                    f"Status filter failed: {filter_response}",
                    filter_response
                )
                
        else:
            self.log_test(
                "Get All Members", 
                False, 
                f"Failed to retrieve members: {response}",
                response
            )
    
    async def test_member_transactions(self):
        """Test member transaction history endpoints."""
        print("\n=== TESTING MEMBER TRANSACTIONS ===")
        
        if not self.admin_token:
            self.log_test("Member Transactions", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # First get a member to test with
        success, members_response, status = await self.make_request("GET", "/admin/members?limit=1", headers=headers)
        
        if success and isinstance(members_response, list) and len(members_response) > 0:
            test_user_id = members_response[0].get("id")
            
            if test_user_id:
                # Test get member transactions
                success, transactions_response, status = await self.make_request(
                    "GET", 
                    f"/admin/members/{test_user_id}/transactions", 
                    headers=headers
                )
                
                if success:
                    transactions = transactions_response if isinstance(transactions_response, list) else []
                    self.log_test(
                        "Get Member Transactions", 
                        True, 
                        f"Retrieved {len(transactions)} transactions for user {test_user_id}"
                    )
                else:
                    self.log_test(
                        "Get Member Transactions", 
                        False, 
                        f"Failed to get transactions: {transactions_response}",
                        transactions_response
                    )
            else:
                self.log_test("Member Transactions", False, "No valid user ID found in members list")
        else:
            self.log_test("Member Transactions", False, "No members found to test transactions with")
    
    async def test_pickup_verification(self):
        """Test pickup verification system."""
        print("\n=== TESTING PICKUP VERIFICATION ===")
        
        if not self.admin_token:
            self.log_test("Pickup Verification", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test with a dummy payment code (should fail gracefully)
        test_payment_code = "123456"
        
        success, response, status = await self.make_request(
            "GET", 
            f"/admin/pickup/{test_payment_code}", 
            headers=headers
        )
        
        if not success and status == 404:
            self.log_test(
                "Pickup Code Lookup", 
                True, 
                f"Correctly returned 404 for non-existent payment code {test_payment_code}"
            )
        elif success:
            self.log_test(
                "Pickup Code Lookup", 
                True, 
                f"Found transaction for payment code {test_payment_code}"
            )
        else:
            self.log_test(
                "Pickup Code Lookup", 
                False, 
                f"Unexpected response for pickup lookup: {response}",
                response
            )
        
        # Test pickup processing endpoint (should fail without valid payment code)
        process_data = {
            "payment_code": test_payment_code,
            "action": "mark_picked_up",
            "admin_email": ADMIN_EMAIL,
            "notes": "Test pickup processing"
        }
        
        success, process_response, status = await self.make_request(
            "PUT", 
            "/admin/pickup/process", 
            process_data, 
            headers=headers
        )
        
        if not success and status == 404:
            self.log_test(
                "Pickup Processing", 
                True, 
                f"Correctly returned 404 for non-existent payment code in processing"
            )
        elif success:
            self.log_test(
                "Pickup Processing", 
                True, 
                f"Successfully processed pickup for payment code {test_payment_code}"
            )
        else:
            self.log_test(
                "Pickup Processing", 
                False, 
                f"Unexpected response for pickup processing: {process_response}",
                process_response
            )
    
    async def test_inventory_management(self):
        """Test inventory management endpoints."""
        print("\n=== TESTING INVENTORY MANAGEMENT ===")
        
        if not self.admin_token:
            self.log_test("Inventory Management", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test get inventory
        success, response, status = await self.make_request("GET", "/admin/inventory", headers=headers)
        
        if success:
            products = response if isinstance(response, list) else []
            self.log_test(
                "Get Inventory", 
                True, 
                f"Retrieved {len(products)} products from inventory"
            )
            
            # Test inventory filtering
            success, filter_response, status = await self.make_request(
                "GET", 
                "/admin/inventory?category=flower&limit=10", 
                headers=headers
            )
            
            if success:
                filtered_products = filter_response if isinstance(filter_response, list) else []
                self.log_test(
                    "Inventory Category Filter", 
                    True, 
                    f"Category filter returned {len(filtered_products)} products"
                )
            else:
                self.log_test(
                    "Inventory Category Filter", 
                    False, 
                    f"Category filter failed: {filter_response}",
                    filter_response
                )
            
            # Test inventory search
            success, search_response, status = await self.make_request(
                "GET", 
                "/admin/inventory?search=haze&limit=10", 
                headers=headers
            )
            
            if success:
                search_results = search_response if isinstance(search_response, list) else []
                self.log_test(
                    "Inventory Search", 
                    True, 
                    f"Search returned {len(search_results)} products"
                )
            else:
                self.log_test(
                    "Inventory Search", 
                    False, 
                    f"Search failed: {search_response}",
                    search_response
                )
            
            # Test add new product
            new_product = {
                "name": "Test Product Admin",
                "category": "flower",
                "price": 50.0,
                "original_price": 60.0,
                "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
                "description": "Test product for admin system testing",
                "thc": "20%",
                "vendor": "Test Vendor",
                "in_stock": True,
                "tier": "za"
            }
            
            success, add_response, status = await self.make_request(
                "POST", 
                "/admin/inventory", 
                new_product, 
                headers=headers
            )
            
            if success:
                created_product = add_response
                product_id = created_product.get("id")
                self.log_test(
                    "Add Product", 
                    True, 
                    f"Successfully created product with ID {product_id}"
                )
                
                # Test update product
                if product_id:
                    update_data = {
                        "price": 45.0,
                        "description": "Updated test product description"
                    }
                    
                    success, update_response, status = await self.make_request(
                        "PUT", 
                        f"/admin/inventory/{product_id}", 
                        update_data, 
                        headers=headers
                    )
                    
                    if success:
                        self.log_test(
                            "Update Product", 
                            True, 
                            f"Successfully updated product {product_id}"
                        )
                    else:
                        self.log_test(
                            "Update Product", 
                            False, 
                            f"Failed to update product: {update_response}",
                            update_response
                        )
                    
                    # Test delete product
                    success, delete_response, status = await self.make_request(
                        "DELETE", 
                        f"/admin/inventory/{product_id}", 
                        headers=headers
                    )
                    
                    if success:
                        self.log_test(
                            "Delete Product", 
                            True, 
                            f"Successfully deleted product {product_id}"
                        )
                    else:
                        self.log_test(
                            "Delete Product", 
                            False, 
                            f"Failed to delete product: {delete_response}",
                            delete_response
                        )
            else:
                self.log_test(
                    "Add Product", 
                    False, 
                    f"Failed to create product: {add_response}",
                    add_response
                )
                
        else:
            self.log_test(
                "Get Inventory", 
                False, 
                f"Failed to retrieve inventory: {response}",
                response
            )
    
    async def test_dashboard_stats(self):
        """Test dashboard statistics endpoint."""
        print("\n=== TESTING DASHBOARD STATS ===")
        
        if not self.admin_token:
            self.log_test("Dashboard Stats", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        success, response, status = await self.make_request("GET", "/admin/dashboard/stats", headers=headers)
        
        if success:
            stats = response
            required_sections = ["users", "transactions", "revenue", "inventory"]
            
            missing_sections = [section for section in required_sections if section not in stats]
            
            if not missing_sections:
                self.log_test(
                    "Dashboard Stats", 
                    True, 
                    f"Retrieved complete dashboard stats: {len(stats)} sections"
                )
                
                # Log some key stats
                users_stats = stats.get("users", {})
                transactions_stats = stats.get("transactions", {})
                revenue_stats = stats.get("revenue", {})
                inventory_stats = stats.get("inventory", {})
                
                print(f"   Users: {users_stats.get('total', 0)} total, {users_stats.get('verified', 0)} verified")
                print(f"   Transactions: {transactions_stats.get('total', 0)} total, {transactions_stats.get('pending_pickups', 0)} pending")
                print(f"   Revenue: ${revenue_stats.get('monthly', 0)} monthly")
                print(f"   Inventory: {inventory_stats.get('total_products', 0)} products, {inventory_stats.get('out_of_stock', 0)} out of stock")
                
            else:
                self.log_test(
                    "Dashboard Stats", 
                    False, 
                    f"Missing required sections: {missing_sections}",
                    stats
                )
        else:
            self.log_test(
                "Dashboard Stats", 
                False, 
                f"Failed to retrieve dashboard stats: {response}",
                response
            )
    
    async def test_transaction_system(self):
        """Test transaction creation and pickup code generation."""
        print("\n=== TESTING TRANSACTION SYSTEM ===")
        
        # Note: This would require user authentication, so we'll test the admin-accessible parts
        if not self.admin_token:
            self.log_test("Transaction System", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test getting all transactions through member management
        success, members_response, status = await self.make_request("GET", "/admin/members?limit=5", headers=headers)
        
        if success and isinstance(members_response, list):
            total_transactions = 0
            for member in members_response:
                member_id = member.get("id")
                if member_id:
                    success, transactions, status = await self.make_request(
                        "GET", 
                        f"/admin/members/{member_id}/transactions?limit=5", 
                        headers=headers
                    )
                    if success and isinstance(transactions, list):
                        total_transactions += len(transactions)
                        
                        # Check if any transactions have payment codes
                        for transaction in transactions:
                            payment_code = transaction.get("payment_code")
                            if payment_code and len(payment_code) == 6 and payment_code.isdigit():
                                self.log_test(
                                    "Payment Code Format", 
                                    True, 
                                    f"Found valid 6-digit payment code: {payment_code}"
                                )
                                break
            
            self.log_test(
                "Transaction System Overview", 
                True, 
                f"Found {total_transactions} total transactions across {len(members_response)} members"
            )
        else:
            self.log_test(
                "Transaction System Overview", 
                False, 
                f"Failed to retrieve member data for transaction testing: {members_response}",
                members_response
            )
    
    async def test_database_collections(self):
        """Test database collections accessibility."""
        print("\n=== TESTING DATABASE COLLECTIONS ===")
        
        if not self.admin_token:
            self.log_test("Database Collections", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test collections through admin endpoints
        collections_tested = []
        
        # Test users collection
        success, response, status = await self.make_request("GET", "/admin/members?limit=1", headers=headers)
        if success:
            collections_tested.append("users")
        
        # Test products collection
        success, response, status = await self.make_request("GET", "/admin/inventory?limit=1", headers=headers)
        if success:
            collections_tested.append("products")
        
        # Test transactions collection (through members)
        success, members, status = await self.make_request("GET", "/admin/members?limit=1", headers=headers)
        if success and isinstance(members, list) and len(members) > 0:
            member_id = members[0].get("id")
            if member_id:
                success, response, status = await self.make_request(
                    "GET", 
                    f"/admin/members/{member_id}/transactions?limit=1", 
                    headers=headers
                )
                if success:
                    collections_tested.append("transactions")
        
        # Test admin collection (through profile)
        success, response, status = await self.make_request("GET", "/admin-auth/profile", headers=headers)
        if success:
            collections_tested.append("admins")
        
        self.log_test(
            "Database Collections Access", 
            len(collections_tested) >= 3, 
            f"Successfully accessed {len(collections_tested)} collections: {', '.join(collections_tested)}"
        )
    
    async def run_all_tests(self):
        """Run all admin system tests."""
        print("🚀 Starting StatusXSmoakland Admin System Backend Tests")
        print(f"Testing against: {BACKEND_URL}")
        print("=" * 60)
        
        # Test authentication first
        auth_success = await self.test_admin_authentication()
        
        if auth_success:
            # Run all other tests
            await self.test_member_management()
            await self.test_member_transactions()
            await self.test_pickup_verification()
            await self.test_inventory_management()
            await self.test_dashboard_stats()
            await self.test_transaction_system()
            await self.test_database_collections()
        else:
            print("❌ Authentication failed - skipping other tests")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
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
                    print(f"  • {result['test']}: {result['details']}")
        
        return passed_tests, failed_tests, self.test_results

async def main():
    """Main test runner."""
    async with AdminSystemTester() as tester:
        passed, failed, results = await tester.run_all_tests()
        
        # Save detailed results
        with open("/app/admin_test_results.json", "w") as f:
            json.dump({
                "summary": {
                    "total": len(results),
                    "passed": passed,
                    "failed": failed,
                    "success_rate": f"{(passed/(passed+failed)*100):.1f}%" if (passed+failed) > 0 else "0%"
                },
                "results": results,
                "timestamp": datetime.now().isoformat()
            }, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: /app/admin_test_results.json")
        
        return failed == 0

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)