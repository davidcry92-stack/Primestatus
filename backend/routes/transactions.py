from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from models.transaction import Transaction, TransactionCreate, TransactionResponse, AdminTransactionUpdate, PaymentMethod, TransactionStatus
from utils.database import users_collection, products_collection, transactions_collection, convert_object_id
from utils.verification import require_verified_user, get_verified_user_data
from utils.auth import verify_token
from bson import ObjectId
import random
import string

router = APIRouter(prefix="/transactions", tags=["transactions"])

# Ensure transactions collection exists
from utils.database import db
transactions_collection = db.transactions

def generate_payment_code():
    """Generate a unique 6-digit payment code."""
    return ''.join(random.choices(string.digits, k=6))

@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    transaction_data: TransactionCreate,
    user = Depends(get_verified_user_data)
):
    """Create a new transaction with payment code."""
    
    # Validate products and calculate total
    total = 0
    validated_items = []
    
    for item_data in transaction_data.items:
        if not ObjectId.is_valid(item_data["product_id"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid product ID: {item_data['product_id']}"
            )
        
        product = await products_collection.find_one({"_id": ObjectId(item_data["product_id"])})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product not found: {item_data['product_id']}"
            )
        
        if not product["in_stock"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product out of stock: {product['name']}"
            )
        
        item_total = product["price"] * item_data["quantity"]
        total += item_total
        
        validated_items.append({
            "product_id": ObjectId(item_data["product_id"]),
            "product_name": product["name"],
            "quantity": item_data["quantity"],
            "price": product["price"],
            "tier": product["tier"]
        })
    
    # Generate unique payment code
    payment_code = generate_payment_code()
    while await transactions_collection.find_one({"payment_code": payment_code}):
        payment_code = generate_payment_code()
    
    # Determine initial status based on payment method
    initial_status = TransactionStatus.PAID_IN_APP if transaction_data.payment_method == PaymentMethod.IN_APP else TransactionStatus.PENDING
    
    # Create transaction
    transaction_dict = {
        "user_id": user["_id"],
        "items": validated_items,
        "total": round(total, 2),
        "payment_method": transaction_data.payment_method,
        "payment_code": payment_code,
        "status": initial_status,
        "notes": transaction_data.notes,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await transactions_collection.insert_one(transaction_dict)
    
    # Get created transaction
    created_transaction = await transactions_collection.find_one({"_id": result.inserted_id})
    transaction_response_data = convert_object_id(created_transaction)
    
    return TransactionResponse(**transaction_response_data)

@router.get("/my-history", response_model=List[TransactionResponse])
async def get_my_transaction_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user = Depends(get_verified_user_data)
):
    """Get user's transaction history."""
    
    cursor = transactions_collection.find({"user_id": user["_id"]})
    cursor = cursor.sort("created_at", -1)  # Most recent first
    cursor = cursor.skip(skip).limit(limit)
    
    transactions = await cursor.to_list(length=limit)
    
    transaction_responses = []
    for transaction in transactions:
        transaction_data = convert_object_id(transaction)
        transaction_responses.append(TransactionResponse(**transaction_data))
    
    return transaction_responses

@router.get("/by-payment-code/{payment_code}", response_model=TransactionResponse)
async def get_transaction_by_code(
    payment_code: str,
    admin_email: str = Depends(verify_token)
):
    """Get transaction by payment code (admin only)."""
    
    # TODO: Add proper admin role checking
    admin_emails = ["admin@statusxsmoakland.com", "support@statusxsmoakland.com"]
    if admin_email not in admin_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    transaction = await transactions_collection.find_one({"payment_code": payment_code})
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found with this payment code"
        )
    
    transaction_data = convert_object_id(transaction)
    return TransactionResponse(**transaction_data)

@router.put("/admin/process-pickup")
async def process_pickup(
    update_data: AdminTransactionUpdate,
    admin_email: str = Depends(verify_token)
):
    """Process pickup - mark as picked up or cash paid (admin only)."""
    
    # TODO: Add proper admin role checking
    admin_emails = ["admin@statusxsmoakland.com", "support@statusxsmoakland.com"]
    if admin_email not in admin_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Find transaction by payment code
    transaction = await transactions_collection.find_one({"payment_code": update_data.payment_code})
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found with this payment code"
        )
    
    # Update based on action
    update_fields = {
        "updated_at": datetime.utcnow(),
        "picked_up_at": datetime.utcnow(),
        "admin_who_processed": admin_email
    }
    
    if update_data.notes:
        update_fields["notes"] = update_data.notes
    
    if update_data.action == "mark_picked_up":
        # For in-app payments, mark as picked up
        if transaction["payment_method"] != PaymentMethod.IN_APP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This action is only for in-app paid orders"
            )
        update_fields["status"] = TransactionStatus.PICKED_UP
        
    elif update_data.action == "mark_cash_paid":
        # For cash payments, mark as cash paid in store
        update_fields["status"] = TransactionStatus.CASH_PAID_IN_STORE
    
    # Update transaction
    result = await transactions_collection.update_one(
        {"payment_code": update_data.payment_code},
        {"$set": update_fields}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return {
        "message": f"Transaction processed successfully",
        "payment_code": update_data.payment_code,
        "action": update_data.action,
        "processed_by": admin_email,
        "processed_at": datetime.utcnow()
    }