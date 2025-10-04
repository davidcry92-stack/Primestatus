from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from utils.database import db
from routes.admin_auth import verify_admin_token

router = APIRouter()

class CashPickupOrder(BaseModel):
    user_id: str
    user_email: str
    pickup_code: str
    order_id: str
    items: List[dict]
    total_amount: float
    payment_method: str = "cash_pickup"
    status: str = "pending_pickup"
    created_at: str
    processed_at: Optional[str] = None
    processed_by: Optional[str] = None

class ProcessPickupRequest(BaseModel):
    pickup_code: str
    cash_received: float
    processed_by: str

@router.post("/cash-pickups")
async def create_cash_pickup_order(order: CashPickupOrder, admin_email: str = Depends(verify_admin_token)):
    """Create a new cash pickup order"""
    try:
        # db is already imported
        
        # Add unique ID and ensure user matches
        order_data = order.dict()
        order_data["_id"] = str(uuid.uuid4())
        order_data["user_id"] = current_user.get("user_id", current_user.get("id"))
        
        # Insert order into database
        await db.cash_pickup_orders.insert_one(order_data)
        
        return {
            "success": True,
            "message": "Cash pickup order created successfully",
            "pickup_code": order.pickup_code,
            "order_id": order.order_id
        }
    except Exception as e:
        print(f"Error creating cash pickup order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create cash pickup order")

@router.get("/admin/cash-pickups")
async def get_all_cash_pickups(skip: int = 0, limit: int = 100):
    """Get all cash pickup orders for admin dashboard"""
    try:
        # db is already imported
        
        # Get orders sorted by creation date (newest first)
        orders_cursor = db.cash_pickup_orders.find().sort("created_at", -1).skip(skip).limit(limit)
        orders = await orders_cursor.to_list(length=None)
        
        # Remove MongoDB _id for JSON serialization
        for order in orders:
            if "_id" in order:
                del order["_id"]
        
        # Get total count
        total_count = await db.cash_pickup_orders.count_documents({})
        
        return {
            "orders": orders,
            "total_count": total_count,
            "pending_count": await db.cash_pickup_orders.count_documents({"status": "pending_pickup"}),
            "completed_count": await db.cash_pickup_orders.count_documents({"status": "completed"})
        }
    except Exception as e:
        print(f"Error fetching cash pickup orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cash pickup orders")

@router.get("/admin/cash-pickups/lookup/{pickup_code}")
async def lookup_cash_pickup(pickup_code: str):
    """Look up a specific cash pickup order by code"""
    try:
        # db is already imported
        
        order = await db.cash_pickup_orders.find_one({"pickup_code": pickup_code})
        
        if not order:
            raise HTTPException(status_code=404, detail="Pickup code not found")
        
        # Remove MongoDB _id
        if "_id" in order:
            del order["_id"]
        
        return order
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error looking up pickup code: {e}")
        raise HTTPException(status_code=500, detail="Failed to lookup pickup code")

@router.put("/admin/cash-pickups/process")
async def process_cash_pickup(request: ProcessPickupRequest):
    """Process a cash pickup order (admin action)"""
    try:
        # db is already imported
        
        # Find the order
        order = await db.cash_pickup_orders.find_one({"pickup_code": request.pickup_code})
        
        if not order:
            raise HTTPException(status_code=404, detail="Pickup code not found")
        
        if order["status"] == "completed":
            raise HTTPException(status_code=400, detail="Order already completed")
        
        # Update order status
        update_data = {
            "status": "completed",
            "processed_at": datetime.now().isoformat(),
            "processed_by": request.processed_by,
            "cash_received": request.cash_received
        }
        
        await db.cash_pickup_orders.update_one(
            {"pickup_code": request.pickup_code},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Cash pickup processed successfully",
            "order_id": order["order_id"],
            "amount_paid": request.cash_received
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing cash pickup: {e}")
        raise HTTPException(status_code=500, detail="Failed to process cash pickup")

@router.get("/admin/cash-pickups/stats")
async def get_cash_pickup_stats():
    """Get cash pickup statistics for admin dashboard"""
    try:
        # db is already imported
        
        total_orders = await db.cash_pickup_orders.count_documents({})
        pending_orders = await db.cash_pickup_orders.count_documents({"status": "pending_pickup"})
        completed_orders = await db.cash_pickup_orders.count_documents({"status": "completed"})
        
        # Calculate total cash revenue
        pipeline = [
            {"$match": {"status": "completed"}},
            {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}}}
        ]
        revenue_result = await db.cash_pickup_orders.aggregate(pipeline).to_list(length=None)
        total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
        
        return {
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "completed_orders": completed_orders,
            "total_cash_revenue": total_revenue
        }
    except Exception as e:
        print(f"Error getting cash pickup stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get cash pickup statistics")