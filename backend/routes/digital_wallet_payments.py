from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import uuid
import json
from datetime import datetime, timezone

from utils.auth import get_verified_user_data
from utils.database import db
from utils.tokens import update_user_purchases_and_tokens
import random
import string

router = APIRouter(prefix="/api/payments", tags=["digital-wallet-payments"])

class DigitalWalletPaymentRequest(BaseModel):
    token: str
    amount: int  # Amount in cents
    currency: str = "USD"
    items: List[Dict[str, Any]]
    buyer_details: Optional[Dict[str, Any]] = None
    user_email: str

class DigitalWalletPaymentResponse(BaseModel):
    success: bool
    payment_id: str
    payment_code: str
    amount: float
    currency: str
    status: str
    message: str

def generate_payment_code(prefix: str = "P") -> str:
    """Generate a unique payment code with prefix"""
    random_part = ''.join(random.choices(string.digits + string.ascii_uppercase, k=6))
    return f"{prefix}{random_part}"

async def process_digital_wallet_payment(
    payment_request: DigitalWalletPaymentRequest,
    payment_method: str,
    user: dict
) -> DigitalWalletPaymentResponse:
    """Common function to process Apple Pay and Google Pay payments"""
    
    try:
        # Note: In a real implementation, you would use Square Web Payments SDK
        # to process the actual payment token. For now, we'll simulate success.
        # 
        # Example Square API call would be:
        # client = Client(
        #     access_token=os.environ.get("SQUARE_ACCESS_TOKEN"),
        #     environment='sandbox'  # or 'production'
        # )
        # 
        # result = client.payments.create_payment(
        #     source_id=payment_request.token,
        #     idempotency_key=str(uuid.uuid4()),
        #     amount_money={
        #         "amount": payment_request.amount,
        #         "currency": payment_request.currency
        #     }
        # )
        
        # For now, simulate successful payment processing
        payment_id = str(uuid.uuid4())
        payment_code = generate_payment_code("P")  # P for prepaid
        
        # Create transaction record
        transaction_data = {
            "_id": str(uuid.uuid4()),
            "user_id": user.get("id"),
            "user_email": payment_request.user_email,
            "payment_method": payment_method,
            "payment_id": payment_id,
            "payment_code": payment_code,
            "amount": payment_request.amount / 100,  # Convert back to dollars
            "currency": payment_request.currency,
            "items": payment_request.items,
            "buyer_details": payment_request.buyer_details,
            "status": "completed",  # Simulating successful payment
            "created_at": datetime.now(timezone.utc),
            "pickup_verified": False
        }
        
        # Save transaction to database
        await db.transactions.insert_one(transaction_data)
        
        # Update user purchases and award tokens
        await update_user_purchases_and_tokens(payment_request.user_email, db)
        
        # Create prepaid order entry for admin lookup
        prepaid_order = {
            "_id": str(uuid.uuid4()),
            "user_id": user.get("id"),
            "user_email": payment_request.user_email,
            "payment_code": payment_code,
            "payment_method": payment_method,
            "payment_id": payment_id,
            "total_amount": payment_request.amount / 100,
            "items": payment_request.items,
            "status": "paid",
            "pickup_verified": False,
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.prepaid_orders.insert_one(prepaid_order)
        
        return DigitalWalletPaymentResponse(
            success=True,
            payment_id=payment_id,
            payment_code=payment_code,
            amount=payment_request.amount / 100,
            currency=payment_request.currency,
            status="completed",
            message=f"{payment_method} payment processed successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"{payment_method} payment processing failed: {str(e)}"
        )

@router.post("/apple-pay", response_model=DigitalWalletPaymentResponse)
async def process_apple_pay_payment(
    payment_request: DigitalWalletPaymentRequest,
    user: dict = Depends(get_verified_user_data)
):
    """Process Apple Pay payment"""
    
    if not payment_request.token:
        raise HTTPException(status_code=400, detail="Apple Pay token is required")
    
    if payment_request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    return await process_digital_wallet_payment(
        payment_request=payment_request,
        payment_method="apple-pay",
        user=user
    )

@router.post("/google-pay", response_model=DigitalWalletPaymentResponse)
async def process_google_pay_payment(
    payment_request: DigitalWalletPaymentRequest,
    user: dict = Depends(get_verified_user_data)
):
    """Process Google Pay payment"""
    
    if not payment_request.token:
        raise HTTPException(status_code=400, detail="Google Pay token is required")
    
    if payment_request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    return await process_digital_wallet_payment(
        payment_request=payment_request,
        payment_method="google-pay",
        user=user
    )

@router.get("/digital-wallet/status/{payment_id}")
async def get_payment_status(
    payment_id: str,
    user: dict = Depends(get_verified_user_data)
):
    """Get payment status for digital wallet payment"""
    
    transaction = await db.transactions.find_one({
        "payment_id": payment_id,
        "user_email": user["email"]
    })
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {
        "payment_id": payment_id,
        "status": transaction["status"],
        "amount": transaction["amount"],
        "currency": transaction["currency"],
        "payment_method": transaction["payment_method"],
        "created_at": transaction["created_at"],
        "pickup_verified": transaction.get("pickup_verified", False)
    }

@router.get("/digital-wallet/history")
async def get_digital_wallet_payment_history(
    limit: int = 10,
    user: dict = Depends(get_verified_user_data)
):
    """Get user's digital wallet payment history"""
    
    transactions = await db.transactions.find(
        {
            "user_email": user["email"],
            "payment_method": {"$in": ["apple-pay", "google-pay"]}
        }
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    return [
        {
            "payment_id": t["payment_id"],
            "payment_code": t.get("payment_code", ""),
            "payment_method": t["payment_method"],
            "amount": t["amount"],
            "currency": t["currency"],
            "status": t["status"],
            "created_at": t["created_at"],
            "pickup_verified": t.get("pickup_verified", False),
            "items_count": len(t.get("items", []))
        }
        for t in transactions
    ]