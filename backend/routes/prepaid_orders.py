from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from utils.database import db
from utils.auth import verify_token

router = APIRouter()

class PrepaidOrder(BaseModel):
    user_id: str
    user_email: str
    pickup_code: str
    order_id: str
    payment_id: str
    items: List[dict]
    total_amount: float
    payment_method: str = "square"
    status: str = "ready_for_pickup"
    created_at: str
    pickup_completed_at: Optional[str] = None
    completed_by: Optional[str] = None
    pickup_notes: Optional[str] = None

class CompletePickupRequest(BaseModel):
    pickup_code: str
    completed_by: str

@router.post("/prepaid-orders")
async def create_prepaid_order(order: PrepaidOrder, current_user: dict = Depends(get_current_user)):
    """Create a new pre-paid order (called from Square checkout)"""
    try:
        db = await get_database()
        
        # Add unique ID and ensure user matches
        order_data = order.dict()
        order_data["_id"] = str(uuid.uuid4())
        order_data["user_id"] = current_user.get("user_id", current_user.get("id"))
        
        # Ensure pickup code starts with P
        if not order_data["pickup_code"].startswith('P'):
            order_data["pickup_code"] = 'P' + order_data["pickup_code"]
        
        # Insert order into database
        await db.prepaid_orders.insert_one(order_data)
        
        return {
            "success": True,
            "message": "Pre-paid order created successfully",
            "pickup_code": order_data["pickup_code"],
            "order_id": order.order_id
        }
    except Exception as e:
        print(f"Error creating pre-paid order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create pre-paid order")

@router.get("/admin/prepaid-orders")
async def get_all_prepaid_orders(skip: int = 0, limit: int = 100):
    """Get all pre-paid orders for admin dashboard"""
    try:
        db = await get_database()
        
        # Get orders sorted by creation date (newest first)
        orders_cursor = db.prepaid_orders.find().sort("created_at", -1).skip(skip).limit(limit)
        orders = await orders_cursor.to_list(length=None)
        
        # Remove MongoDB _id for JSON serialization
        for order in orders:
            if "_id" in order:
                del order["_id"]
        
        # Get total count
        total_count = await db.prepaid_orders.count_documents({})
        
        return {
            "orders": orders,
            "total_count": total_count,
            "pending_pickup": await db.prepaid_orders.count_documents({"status": "ready_for_pickup"}),
            "completed_pickups": await db.prepaid_orders.count_documents({"status": "picked_up"})
        }
    except Exception as e:
        print(f"Error fetching pre-paid orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch pre-paid orders")

@router.get("/admin/prepaid-orders/lookup/{pickup_code}")
async def lookup_prepaid_order(pickup_code: str):
    """Look up a specific pre-paid order by code"""
    try:
        db = await get_database()
        
        # Ensure pickup code starts with P
        if not pickup_code.upper().startswith('P'):
            pickup_code = 'P' + pickup_code
        
        order = await db.prepaid_orders.find_one({"pickup_code": pickup_code.upper()})
        
        if not order:
            raise HTTPException(status_code=404, detail="Pre-paid pickup code not found")
        
        # Remove MongoDB _id
        if "_id" in order:
            del order["_id"]
        
        return order
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error looking up pickup code: {e}")
        raise HTTPException(status_code=500, detail="Failed to lookup pickup code")

@router.put("/admin/prepaid-orders/complete")
async def complete_prepaid_pickup(request: CompletePickupRequest):
    """Complete a pre-paid pickup order (admin action)"""
    try:
        db = await get_database()
        
        # Ensure pickup code starts with P
        pickup_code = request.pickup_code.upper()
        if not pickup_code.startswith('P'):
            pickup_code = 'P' + pickup_code
        
        # Find the order
        order = await db.prepaid_orders.find_one({"pickup_code": pickup_code})
        
        if not order:
            raise HTTPException(status_code=404, detail="Pre-paid pickup code not found")
        
        if order["status"] == "picked_up":
            raise HTTPException(status_code=400, detail="Order already picked up")
        
        # Update order status
        update_data = {
            "status": "picked_up",
            "pickup_completed_at": datetime.now().isoformat(),
            "completed_by": request.completed_by
        }
        
        await db.prepaid_orders.update_one(
            {"pickup_code": pickup_code},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Pre-paid pickup completed successfully",
            "order_id": order["order_id"],
            "amount_paid": order["total_amount"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error completing prepaid pickup: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete pre-paid pickup")

@router.get("/admin/prepaid-orders/stats")
async def get_prepaid_orders_stats():
    """Get pre-paid orders statistics for admin dashboard"""
    try:
        db = await get_database()
        
        total_orders = await db.prepaid_orders.count_documents({})
        pending_pickup = await db.prepaid_orders.count_documents({"status": "ready_for_pickup"})
        completed_pickups = await db.prepaid_orders.count_documents({"status": "picked_up"})
        
        # Calculate total pre-paid revenue
        pipeline = [
            {"$match": {"status": "picked_up"}},
            {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}}}
        ]
        revenue_result = await db.prepaid_orders.aggregate(pipeline).to_list(length=None)
        total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
        
        return {
            "total_orders": total_orders,
            "pending_pickup": pending_pickup,
            "completed_pickups": completed_pickups,
            "total_revenue": total_revenue
        }
    except Exception as e:
        print(f"Error getting prepaid orders stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get pre-paid orders statistics")