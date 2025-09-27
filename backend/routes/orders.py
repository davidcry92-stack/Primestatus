from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from models.order import Order, OrderCreate, OrderResponse, OrderItemResponse
from utils.database import orders_collection, products_collection, users_collection, convert_object_id
from utils.auth import verify_token
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user_email: str = Depends(verify_token)
):
    """Create a new order."""
    # Get user
    user = await users_collection.find_one({"email": current_user_email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate products and calculate total
    total = 0
    validated_items = []
    
    for item in order_data.items:
        if not ObjectId.is_valid(item.product_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid product ID: {item.product_id}"
            )
        
        product = await products_collection.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product not found: {item.product_id}"
            )
        
        if not product["in_stock"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product out of stock: {product['name']}"
            )
        
        # Use current product price (might be different from cart price due to deals)
        current_price = product["price"]
        item_total = current_price * item.quantity
        total += item_total
        
        validated_items.append({
            "product_id": ObjectId(item.product_id),
            "quantity": item.quantity,
            "price": current_price
        })
    
    # Create order
    order_dict = {
        "user_id": user["_id"],
        "items": validated_items,
        "total": round(total, 2),
        "payment_method": order_data.payment_method,
        "status": "pending"
    }
    
    result = await orders_collection.insert_one(order_dict)
    
    # Update user's order history
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$push": {"order_history": result.inserted_id}}
    )
    
    # Get created order with product names
    created_order = await orders_collection.find_one({"_id": result.inserted_id})
    
    # Add product names to items
    items_with_names = []
    for item in created_order["items"]:
        product = await products_collection.find_one({"_id": item["product_id"]})
        items_with_names.append({
            "product_id": str(item["product_id"]),
            "quantity": item["quantity"],
            "price": item["price"],
            "product_name": product["name"] if product else "Unknown Product"
        })
    
    order_response_data = convert_object_id(created_order)
    order_response_data["items"] = items_with_names
    
    return OrderResponse(**order_response_data)

@router.get("/", response_model=List[OrderResponse])
async def get_user_orders(
    status: Optional[str] = Query(None, pattern="^(pending|confirmed|preparing|ready_for_pickup|completed|cancelled)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user_email: str = Depends(verify_token)
):
    """Get user's orders."""
    # Get user
    user = await users_collection.find_one({"email": current_user_email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Build query
    query = {"user_id": user["_id"]}
    if status:
        query["status"] = status
    
    # Get orders
    cursor = orders_collection.find(query)
    cursor = cursor.sort("created_at", -1)  # Most recent first
    cursor = cursor.skip(skip).limit(limit)
    
    orders = await cursor.to_list(length=limit)
    
    # Add product names to orders
    order_responses = []
    for order in orders:
        items_with_names = []
        for item in order["items"]:
            product = await products_collection.find_one({"_id": item["product_id"]})
            items_with_names.append({
                "product_id": str(item["product_id"]),
                "quantity": item["quantity"],
                "price": item["price"],
                "product_name": product["name"] if product else "Unknown Product"
            })
        
        order_data = convert_object_id(order)
        order_data["items"] = items_with_names
        order_responses.append(OrderResponse(**order_data))
    
    return order_responses

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user_email: str = Depends(verify_token)
):
    """Get a specific order."""
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    # Get user
    user = await users_collection.find_one({"email": current_user_email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get order (ensure it belongs to the user)
    order = await orders_collection.find_one({
        "_id": ObjectId(order_id),
        "user_id": user["_id"]
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Add product names to items
    items_with_names = []
    for item in order["items"]:
        product = await products_collection.find_one({"_id": item["product_id"]})
        items_with_names.append({
            "product_id": str(item["product_id"]),
            "quantity": item["quantity"],
            "price": item["price"],
            "product_name": product["name"] if product else "Unknown Product"
        })
    
    order_data = convert_object_id(order)
    order_data["items"] = items_with_names
    
    return OrderResponse(**order_data)

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str,
    new_status: str,
    current_user_email: str = Depends(verify_token)
):
    """Update order status (admin only)."""
    # TODO: Add admin role check
    
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    valid_statuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    result = await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return {"message": f"Order status updated to {new_status}"}