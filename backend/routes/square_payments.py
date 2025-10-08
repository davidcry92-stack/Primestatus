from fastapi import APIRouter, HTTPException, Depends, Request
import os
import json
import uuid
from datetime import datetime
from typing import List

from square import Square

from models.square_payment import (
    SquarePaymentRequest, 
    SquarePaymentResponse, 
    SquareOrderRequest,
    SquarePaymentItem,
    SquareOrder,
    SquareWebhookEvent
)
from models.transaction import Transaction, TransactionItem, PaymentMethod, TransactionStatus
from utils.database import db
from utils.auth import verify_token, get_verified_user_data
from utils.tokens import update_user_purchases_and_tokens
import random
import string

router = APIRouter()

# Initialize Square client
def get_square_client():
    access_token = os.environ.get('SQUARE_ACCESS_TOKEN')
    environment = os.environ.get('SQUARE_ENVIRONMENT', 'production')
    
    # Import Square environment
    from square.environment import SquareEnvironment
    
    # Convert environment string to Square environment 
    if environment == 'sandbox':
        env = SquareEnvironment.SANDBOX
    else:
        env = SquareEnvironment.PRODUCTION
    
    client = Square(
        token=access_token,
        environment=env
    )
    
    return client

def generate_payment_code():
    """Generate a unique 6-digit payment code starting with P for pre-paid orders."""
    return 'P' + ''.join(random.choices(string.digits, k=6))

@router.post("/create-order", response_model=SquarePaymentResponse)
async def create_square_order(
    order_request: SquareOrderRequest,
    user = Depends(get_verified_user_data)
):
    """Create a Square order and process payment."""
    
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
        
        # Create order with proper Square SDK format
        idempotency_key = str(uuid.uuid4())
        
        order_data = {
            'location_id': location_id,
            'line_items': order_line_items,
            'reference_id': f"Order-{str(uuid.uuid4())[:8]}"
        }
        
        orders_api = client.orders
        order_result = orders_api.create(
            order=order_data,
            idempotency_key=idempotency_key
        )
        
        # Square SDK raises exceptions for errors, so if we get here, it succeeded
        if order_result.is_error():
            raise HTTPException(status_code=400, detail=f"Square order creation failed: {order_result.errors}")
        
        square_order = order_result.body['order']
        square_order_id = square_order['id']
        
        # Create payment
        payment_idempotency_key = str(uuid.uuid4())
        
        payments_api = client.payments
        payment_result = payments_api.create(
            source_id=order_request.payment_source_id,
            idempotency_key=payment_idempotency_key,
            amount_money={
                'amount': total_amount,
                'currency': 'USD'
            },
            location_id=location_id,
            reference_id=f"StatusX-{str(uuid.uuid4())[:8]}",
            note=f"StatusXSmoakland Order - {order_request.user_name}",
            order_id=square_order_id
        )
        
        # Square SDK raises exceptions for errors, so if we get here, it succeeded
        if payment_result.is_error():
            raise HTTPException(status_code=400, detail=f"Square payment creation failed: {payment_result.errors}")
        
        payment = payment_result.body['payment']
        payment_id = payment['id']
        payment_status = payment['status']
        receipt_url = payment.get('receipt_url')
        
        # Generate unique pickup code
        payment_code = generate_payment_code()
        while await db.transactions.find_one({"payment_code": payment_code}):
            payment_code = generate_payment_code()
        
        # Create transaction items
        transaction_items = []
        for item in order_request.items:
            transaction_item = TransactionItem(
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                price=item.unit_price / 100,  # Convert from cents to dollars
                tier="premium"  # Default tier - you may want to get this from product data
            )
            transaction_items.append(transaction_item)
        
        # Create Transaction record with pickup code
        transaction_data = {
            "user_id": user["id"],
            "items": [item.dict() for item in transaction_items],
            "total": total_amount / 100,  # Convert from cents to dollars
            "payment_method": PaymentMethod.SQUARE,
            "payment_code": payment_code,
            "status": TransactionStatus.PAID if payment_status == "COMPLETED" else TransactionStatus.PENDING,
            "notes": order_request.pickup_notes,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "square_payment_id": payment_id,
            "square_order_id": square_order_id
        }
        
        # Save transaction to database
        await db.transactions.insert_one(transaction_data)
        
        # Update user purchases and award tokens if payment is successful
        if payment_status == "COMPLETED":
            await update_user_purchases_and_tokens(order_request.user_email, db)
        
        # Save Square order to database (for Square-specific tracking)
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
        
        # Create prepaid order entry for admin lookup (if payment successful)
        if payment_status == "COMPLETED":
            prepaid_order = {
                "_id": str(uuid.uuid4()),
                "user_id": user.get("id"),
                "user_email": order_request.user_email,
                "pickup_code": payment_code,  # P-code
                "order_id": square_order_id,
                "payment_id": payment_id,
                "items": [
                    {
                        "name": item.product_name,
                        "quantity": item.quantity,
                        "price": item.unit_price / 100  # Convert back from cents
                    } for item in order_request.items
                ],
                "total_amount": total_amount,
                "payment_method": "square",
                "status": "ready_for_pickup",
                "created_at": datetime.utcnow().isoformat(),
                "pickup_notes": order_request.pickup_notes
            }
            
            await db.prepaid_orders.insert_one(prepaid_order)
        
        return SquarePaymentResponse(
            success=True,
            payment_id=payment_id,
            order_id=square_order_id,
            receipt_url=receipt_url,
            amount_money=total_amount,
            status=payment_status,
            pickup_code=payment_code  # Return the pickup code
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment processing failed: {str(e)}")

@router.get("/orders", response_model=List[SquareOrder])
async def get_user_orders(
    user_email: str = Depends(verify_token)
):
    """Get user's Square orders."""
    
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
    admin_email: str = Depends(verify_token)
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
        
        result = locations_api.list()
        
        # Check if response has errors
        if result.is_error():
            return {
                "success": False,
                "error": str(result.errors)
            }
        
        # Success case
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