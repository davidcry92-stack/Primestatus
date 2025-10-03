from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import json
import uuid
from datetime import datetime
from typing import List

import square

from models.square_payment import (
    SquarePaymentRequest, 
    SquarePaymentResponse, 
    SquareOrderRequest,
    SquarePaymentItem,
    SquareOrder,
    SquareWebhookEvent
)
from utils.database import db
from utils.auth import verify_token

router = APIRouter()
security = HTTPBearer()

# Initialize Square client
def get_square_client():
    access_token = os.environ.get('SQUARE_ACCESS_TOKEN')
    environment = os.environ.get('SQUARE_ENVIRONMENT', 'production')
    
    client = square.Square(
        access_token=access_token,
        environment=environment
    )
    
    return client

@router.post("/create-order", response_model=SquarePaymentResponse)
async def create_square_order(
    order_request: SquareOrderRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a Square order and process payment."""
    
    # Verify user token
    try:
        user_email = await verify_token(credentials.credentials)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        client = get_square_client()
        location_id = os.environ.get('SQUARE_LOCATION_ID')
        
        # Calculate total amount
        total_amount = sum(item.total_price for item in order_request.items)
        
        # Create Square order
        order_line_items = []
        for item in order_request.items:
            line_item = {
                'name': item.product_name,
                'quantity': str(item.quantity),
                'base_price_money': {
                    'amount': item.unit_price,
                    'currency': 'USD'
                }
            }
            order_line_items.append(line_item)
        
        order_data = {
            'location_id': location_id,
            'line_items': order_line_items,
            'reference_id': str(uuid.uuid4())
        }
        
        create_order_body = {'order': order_data}
        orders_api = client.orders
        
        order_result = orders_api.create_order(body=create_order_body)
        
        if order_result.is_error():
            error_message = str(order_result.errors)
            raise HTTPException(status_code=400, detail=f"Square order creation failed: {error_message}")
        
        square_order = order_result.body.get('order')
        square_order_id = square_order.get('id')
        
        # Create payment
        payment_body = {
            'source_id': order_request.payment_source_id,
            'amount_money': {
                'amount': total_amount,
                'currency': 'USD'
            },
            'location_id': location_id,
            'reference_id': f"StatusX-{uuid.uuid4()}",
            'note': f"StatusXSmoakland Order - {order_request.user_name}",
            'order_id': square_order_id
        }
        
        payments_api = client.payments
        payment_result = payments_api.create_payment(body=payment_body)
        
        if payment_result.is_error():
            error_message = str(payment_result.errors)
            raise HTTPException(status_code=400, detail=f"Square payment failed: {error_message}")
        
        payment = payment_result.body.get('payment')
        payment_id = payment.get('id')
        payment_status = payment.get('status')
        receipt_url = payment.get('receipt_url')
        
        # Save order to database
        db_order = SquareOrder(
            square_order_id=square_order_id,
            square_payment_id=payment_id,
            user_email=order_request.user_email,
            user_name=order_request.user_name,
            items=order_request.items,
            total_amount=total_amount,
            status="paid" if payment_status == "COMPLETED" else "pending",
            pickup_notes=order_request.pickup_notes
        )
        
        await db.square_orders.insert_one(db_order.dict())
        
        return SquarePaymentResponse(
            success=True,
            payment_id=payment_id,
            order_id=square_order_id,
            receipt_url=receipt_url,
            amount_money=total_amount,
            status=payment_status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment processing failed: {str(e)}")

@router.get("/orders", response_model=List[SquareOrder])
async def get_user_orders(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user's Square orders."""
    
    try:
        user_email = await verify_token(credentials.credentials)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        orders_cursor = db.square_orders.find({"user_email": user_email}).sort("created_at", -1)
        orders = await orders_cursor.to_list(length=None)
        
        result = []
        for order_data in orders:
            order = SquareOrder(**order_data)
            result.append(order)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")

@router.get("/admin/orders")
async def get_all_orders(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all Square orders for admin."""
    
    # Note: Add admin verification here if needed
    
    try:
        orders_cursor = db.square_orders.find({}).sort("created_at", -1)
        orders = await orders_cursor.to_list(length=None)
        
        return {
            "orders": orders,
            "count": len(orders)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")

@router.post("/webhook")
async def square_webhook(request: Request):
    """Handle Square webhooks for payment notifications."""
    
    try:
        body = await request.body()
        webhook_data = json.loads(body)
        
        event_type = webhook_data.get('type')
        event_data = webhook_data.get('data', {})
        
        if event_type == 'payment.updated':
            payment_data = event_data.get('object', {})
            payment_id = payment_data.get('payment', {}).get('id')
            payment_status = payment_data.get('payment', {}).get('status')
            
            # Update order status in database
            if payment_id:
                await db.square_orders.update_one(
                    {"square_payment_id": payment_id},
                    {"$set": {
                        "status": "paid" if payment_status == "COMPLETED" else "pending",
                        "updated_at": datetime.utcnow()
                    }}
                )
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

@router.get("/payment/{payment_id}")
async def get_payment_details(payment_id: str):
    """Get Square payment details."""
    
    try:
        client = get_square_client()
        payments_api = client.payments
        
        result = payments_api.get_payment(payment_id)
        
        if result.is_error():
            raise HTTPException(status_code=404, detail="Payment not found")
        
        payment = result.body.get('payment')
        return {
            "payment_id": payment.get('id'),
            "status": payment.get('status'),
            "amount_money": payment.get('amount_money'),
            "created_at": payment.get('created_at'),
            "receipt_url": payment.get('receipt_url')
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch payment: {str(e)}")

@router.post("/test-connection")
async def test_square_connection():
    """Test Square API connection."""
    
    try:
        client = get_square_client()
        locations_api = client.locations
        
        result = locations_api.list_locations()
        
        if result.is_error():
            return {
                "success": False,
                "error": str(result.errors)
            }
        
        locations = result.body.get('locations', [])
        
        return {
            "success": True,
            "locations": locations,
            "connection_status": "Connected to Square successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }