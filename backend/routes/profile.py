from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..models.user import UserResponse, ProfileUpdateRequest, TokenInfo
from ..models.transaction import TransactionResponse
from ..models.product import ProductResponse
from ..utils.auth import get_current_user
from ..utils.database import get_database

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("/", response_model=UserResponse)
async def get_user_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current user's complete profile"""
    user = await db.users.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Ensure profile field exists for backward compatibility
    if "profile" not in user:
        user["profile"] = {
            "address": None,
            "phone": None,
            "profile_photo_url": None,
            "purchases_count": 0,
            "tokens_balance": 0
        }
    
    return UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        full_name=user["full_name"],
        date_of_birth=user["date_of_birth"],
        membership_tier=user["membership_tier"],
        member_since=user["member_since"],
        preferences=user.get("preferences", {"categories": [], "vendors": [], "price_range": [0, 200]}),
        wictionary_access=user.get("wictionary_access", False),
        order_history=[str(oid) for oid in user.get("order_history", [])],
        is_verified=user.get("is_verified", False),
        verification_status=user.get("id_verification", {}).get("verification_status", "pending"),
        requires_medical=user.get("id_verification", {}).get("requires_medical", False),
        age_verified=user.get("id_verification", {}).get("age_verified"),
        profile=user["profile"]
    )

@router.put("/", response_model=UserResponse)
async def update_user_profile(
    profile_update: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update user's profile information"""
    update_data = {}
    
    if profile_update.address is not None:
        update_data["profile.address"] = profile_update.address
    if profile_update.phone is not None:
        update_data["profile.phone"] = profile_update.phone
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return updated profile
    return await get_user_profile(current_user, db)

@router.post("/photo")
async def upload_profile_photo(
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Upload user's ID photo"""
    if not photo.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create uploads directory if it doesn't exist
    uploads_dir = "/app/backend/uploads/profile_photos"
    os.makedirs(uploads_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(photo.filename)[1]
    filename = f"{current_user['email']}_{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(uploads_dir, filename)
    
    # Save the file
    content = await photo.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Update user's profile with photo URL
    photo_url = f"/api/profile/photo/{filename}"
    await db.users.update_one(
        {"email": current_user["email"]},
        {
            "$set": {
                "profile.profile_photo_url": photo_url,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "Profile photo uploaded successfully", "photo_url": photo_url}

@router.get("/photo/{filename}")
async def get_profile_photo(filename: str):
    """Get user's profile photo"""
    file_path = f"/app/backend/uploads/profile_photos/{filename}"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Photo not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(file_path)

@router.get("/tokens", response_model=TokenInfo)
async def get_token_info(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's token balance and purchase information"""
    user = await db.users.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = user.get("profile", {})
    purchases_count = profile.get("purchases_count", 0)
    tokens_balance = profile.get("tokens_balance", 0)
    
    # Calculate purchases needed for next token reward
    purchases_to_next_token = 12 - (purchases_count % 12)
    if purchases_to_next_token == 12 and purchases_count > 0:
        purchases_to_next_token = 0
    
    return TokenInfo(
        tokens_balance=tokens_balance,
        purchases_count=purchases_count,
        purchases_to_next_token=purchases_to_next_token,
        token_value_dollars=10
    )

@router.post("/tokens/redeem")
async def redeem_tokens(
    tokens_to_redeem: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Redeem tokens for discount (internal use by payment system)"""
    if tokens_to_redeem <= 0 or tokens_to_redeem % 10 != 0:
        raise HTTPException(status_code=400, detail="Can only redeem tokens in multiples of 10")
    
    user = await db.users.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_balance = user.get("profile", {}).get("tokens_balance", 0)
    if current_balance < tokens_to_redeem:
        raise HTTPException(status_code=400, detail="Insufficient tokens")
    
    # Deduct tokens
    new_balance = current_balance - tokens_to_redeem
    await db.users.update_one(
        {"email": current_user["email"]},
        {
            "$set": {
                "profile.tokens_balance": new_balance,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    discount_amount = tokens_to_redeem  # 1 token = $1
    return {"message": f"Redeemed {tokens_to_redeem} tokens for ${discount_amount} discount", "new_balance": new_balance}

@router.get("/orders", response_model=List[TransactionResponse])
async def get_order_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's order history"""
    transactions = await db.transactions.find(
        {"user_email": current_user["email"]}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    result = []
    for transaction in transactions:
        result.append(TransactionResponse(
            id=str(transaction["_id"]),
            user_email=transaction["user_email"],
            items=transaction.get("items", []),
            total_amount=transaction.get("total_amount", 0),
            payment_method=transaction.get("payment_method", "unknown"),
            payment_code=transaction.get("payment_code", ""),
            status=transaction.get("status", "pending"),
            created_at=transaction.get("created_at", datetime.now(timezone.utc)),
            pickup_verified=transaction.get("pickup_verified", False),
            pickup_verified_at=transaction.get("pickup_verified_at")
        ))
    
    return result

@router.get("/suggestions", response_model=List[ProductResponse])
async def get_purchase_suggestions(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get product suggestions based on purchase history"""
    # Get user's transaction history
    transactions = await db.transactions.find(
        {"user_email": current_user["email"], "status": "completed"}
    ).to_list(length=50)
    
    # Extract purchased categories and tiers
    purchased_categories = set()
    purchased_tiers = set()
    purchased_brands = set()
    
    for transaction in transactions:
        for item in transaction.get("items", []):
            if "category" in item:
                purchased_categories.add(item["category"])
            if "tier" in item:
                purchased_tiers.add(item["tier"])
            if "brand" in item:
                purchased_brands.add(item["brand"])
    
    # Build suggestion query
    suggestion_query = {}
    if purchased_categories or purchased_tiers:
        or_conditions = []
        if purchased_categories:
            or_conditions.append({"category": {"$in": list(purchased_categories)}})
        if purchased_tiers:
            or_conditions.append({"tier": {"$in": list(purchased_tiers)}})
        if purchased_brands:
            or_conditions.append({"brand": {"$in": list(purchased_brands)}})
        
        suggestion_query["$or"] = or_conditions
    
    # Get suggestions
    suggested_products = await db.products.find(suggestion_query).limit(limit).to_list(length=limit)
    
    result = []
    for product in suggested_products:
        result.append(ProductResponse(
            id=str(product["_id"]),
            name=product["name"],
            brand=product.get("brand", ""),
            category=product["category"],
            tier=product.get("tier", "basic"),
            price=product["price"],
            image_url=product.get("image_url", ""),
            description=product.get("description", ""),
            in_stock=product.get("in_stock", True),
            rating=product.get("rating", 0),
            reviews=product.get("reviews", 0),
            created_at=product.get("created_at", datetime.now(timezone.utc)),
            updated_at=product.get("updated_at", datetime.now(timezone.utc))
        ))
    
    return result

async def update_user_purchases_and_tokens(user_email: str, db: AsyncIOMotorDatabase):
    """Internal function to update user purchases count and award tokens"""
    user = await db.users.find_one({"email": user_email})
    if not user:
        return
    
    profile = user.get("profile", {})
    current_purchases = profile.get("purchases_count", 0)
    current_tokens = profile.get("tokens_balance", 0)
    
    # Increment purchases
    new_purchases = current_purchases + 1
    
    # Award tokens every 12 purchases
    new_tokens = current_tokens
    if new_purchases % 12 == 0:
        new_tokens += 10
    
    # Update user
    await db.users.update_one(
        {"email": user_email},
        {
            "$set": {
                "profile.purchases_count": new_purchases,
                "profile.tokens_balance": new_tokens,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return new_purchases, new_tokens