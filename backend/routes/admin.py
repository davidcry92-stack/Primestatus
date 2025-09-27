from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
from models.user import UserResponse
from models.transaction import TransactionResponse, AdminTransactionUpdate
from models.product import Product, ProductCreate, ProductUpdate, ProductResponse
from models.rating import ProductRatingStats, UserRatingHistory
from .admin_auth import verify_admin_token, get_admin_data
from utils.database import users_collection, transactions_collection, products_collection, ratings_collection, convert_object_id
from utils.file_upload import get_file_url
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])

class VerificationUpdate(BaseModel):
    user_id: str
    status: str  # "approved", "rejected"
    rejected_reason: Optional[str] = None

class UserVerificationDetails(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    date_of_birth: str
    age_verified: int
    parent_email: Optional[str]
    requires_medical: bool
    id_front_url: str
    id_back_url: str
    medical_document_url: Optional[str]
    verification_status: str
    submitted_at: datetime

class UserProfileDetails(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    date_of_birth: str
    membership_tier: str
    is_verified: bool
    verification_status: str
    member_since: datetime
    order_count: int = 0
    total_spent: float = 0.0
    last_order: Optional[datetime] = None
    wictionary_access: bool
    parent_email: Optional[str] = None

# ===== MEMBER MANAGEMENT =====

@router.get("/members", response_model=List[UserProfileDetails])
async def get_all_members(
    admin = Depends(get_admin_data),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by email, username, or full name"),
    status: Optional[str] = Query(None, description="Filter by verification status"),
    membership_tier: Optional[str] = Query(None, description="Filter by membership tier")
):
    """Get all member profiles with transaction summary."""
    
    # Build query
    query = {}
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"username": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}}
        ]
    
    if status:
        query["id_verification.verification_status"] = status
    
    if membership_tier:
        query["membership_tier"] = membership_tier
    
    # Get users
    cursor = users_collection.find(query).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    member_profiles = []
    for user in users:
        # Get transaction summary for this user (before converting ObjectId)
        transaction_pipeline = [
            {"$match": {"user_id": user["_id"]}},
            {"$group": {
                "_id": None,
                "total_spent": {"$sum": "$total"},
                "order_count": {"$sum": 1},
                "last_order": {"$max": "$created_at"}
            }}
        ]
        
        transaction_summary = await transactions_collection.aggregate(transaction_pipeline).to_list(length=1)
        summary = transaction_summary[0] if transaction_summary else {}
        
        # Now convert ObjectId for response
        user_data = convert_object_id(user)
        
        profile = UserProfileDetails(
            id=user_data["id"],
            username=user.get("username", ""),
            email=user.get("email", ""),
            full_name=user.get("full_name", ""),
            date_of_birth=user.get("date_of_birth", ""),
            membership_tier=user.get("membership_tier", "basic"),
            is_verified=user.get("is_verified", False),
            verification_status=user.get("id_verification", {}).get("verification_status", "pending"),
            member_since=user.get("created_at", datetime.utcnow()),
            order_count=summary.get("order_count", 0),
            total_spent=round(summary.get("total_spent", 0.0), 2),
            last_order=summary.get("last_order"),
            wictionary_access=user.get("wictionary_access", False),
            parent_email=user.get("parent_email")
        )
        member_profiles.append(profile)
    
    return member_profiles

@router.get("/members/{user_id}/transactions", response_model=List[TransactionResponse])
async def get_member_transactions(
    user_id: str,
    admin = Depends(get_admin_data),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50)
):
    """Get all transactions for a specific member."""
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    # Verify user exists
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    # Get transactions
    cursor = transactions_collection.find({"user_id": ObjectId(user_id)})
    cursor = cursor.sort("created_at", -1).skip(skip).limit(limit)
    transactions = await cursor.to_list(length=limit)
    
    transaction_responses = []
    for transaction in transactions:
        transaction_data = convert_object_id(transaction)
        transaction_responses.append(TransactionResponse(**transaction_data))
    
    return transaction_responses

@router.get("/verification/pending", response_model=List[UserVerificationDetails])
async def get_pending_verifications(
    admin = Depends(get_admin_data),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all users pending ID verification."""
    query = {
        "$or": [
            {"id_verification.verification_status": "pending"},
            {"id_verification.verification_status": "needs_medical"}
        ]
    }
    
    cursor = users_collection.find(query).skip(skip).limit(limit)
    pending_users = await cursor.to_list(length=limit)
    
    verification_details = []
    for user in pending_users:
        user_data = convert_object_id(user)
        id_verification = user.get("id_verification", {})
        
        details = UserVerificationDetails(
            id=user_data["id"],
            username=user.get("username", ""),
            email=user.get("email", ""),
            full_name=user.get("full_name", ""),
            date_of_birth=user.get("date_of_birth", ""),
            age_verified=id_verification.get("age_verified", 0),
            parent_email=user.get("parent_email"),
            requires_medical=id_verification.get("requires_medical", False),
            id_front_url=get_file_url(id_verification.get("id_front_url", "")),
            id_back_url=get_file_url(id_verification.get("id_back_url", "")),
            medical_document_url=get_file_url(id_verification.get("medical_document_url", "")) if id_verification.get("medical_document_url") else None,
            verification_status=id_verification.get("verification_status", "pending"),
            submitted_at=user.get("created_at", datetime.utcnow())
        )
        verification_details.append(details)
    
    return verification_details

@router.post("/verification/update")
async def update_verification_status(
    verification_update: VerificationUpdate,
    admin = Depends(get_admin_data)
):
    """Update user verification status."""
    if not ObjectId.is_valid(verification_update.user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    # Validate status
    valid_statuses = ["approved", "rejected"]
    if verification_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    # If rejecting, require reason
    if verification_update.status == "rejected" and not verification_update.rejected_reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection reason is required when rejecting verification"
        )
    
    # Update user verification status
    update_data = {
        "id_verification.verification_status": verification_update.status,
        "id_verification.verified_at": datetime.utcnow(),
        "is_verified": verification_update.status == "approved"
    }
    
    if verification_update.rejected_reason:
        update_data["id_verification.rejected_reason"] = verification_update.rejected_reason
    
    result = await users_collection.update_one(
        {"_id": ObjectId(verification_update.user_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "message": f"User verification {verification_update.status}",
        "user_id": verification_update.user_id,
        "status": verification_update.status
    }

@router.get("/verification/stats")
async def get_verification_stats(admin = Depends(get_admin_data)):
    """Get verification statistics."""
    
    # Count users by verification status
    pipeline = [
        {
            "$group": {
                "_id": "$id_verification.verification_status",
                "count": {"$sum": 1}
            }
        }
    ]
    
    stats = await users_collection.aggregate(pipeline).to_list(length=None)
    
    # Count users requiring medical documentation
    medical_required = await users_collection.count_documents({
        "id_verification.requires_medical": True
    })
    
    return {
        "verification_stats": {stat["_id"]: stat["count"] for stat in stats},
        "medical_required_count": medical_required,
        "total_users": await users_collection.count_documents({})
    }

# ===== PICKUP VERIFICATION =====

@router.get("/pickup/{payment_code}", response_model=TransactionResponse)
async def get_pickup_details(
    payment_code: str,
    admin = Depends(get_admin_data)
):
    """Get transaction details by payment code for pickup verification."""
    
    transaction = await transactions_collection.find_one({"payment_code": payment_code})
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid pickup code"
        )
    
    # Get user details for pickup verification
    user = await users_collection.find_one({"_id": transaction["user_id"]})
    
    transaction_data = convert_object_id(transaction)
    
    # Add user info for verification
    if user:
        transaction_data["customer_name"] = user.get("full_name", "Unknown")
        transaction_data["customer_email"] = user.get("email", "Unknown")
    
    return TransactionResponse(**transaction_data)

@router.put("/pickup/process")
async def process_pickup(
    update_data: AdminTransactionUpdate,
    admin = Depends(get_admin_data)
):
    """Process pickup - mark as picked up or cash paid."""
    
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
        "admin_who_processed": update_data.admin_email
    }
    
    if update_data.notes:
        update_fields["notes"] = update_data.notes
    
    if update_data.action == "mark_picked_up":
        # For in-app payments, mark as picked up
        update_fields["status"] = "picked_up"
        
    elif update_data.action == "mark_cash_paid":
        # For cash payments, mark as cash paid in store
        update_fields["status"] = "cash_paid_in_store"
    
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
        "message": f"Pickup processed successfully",
        "payment_code": update_data.payment_code,
        "action": update_data.action,
        "processed_by": update_data.admin_email,
        "processed_at": datetime.utcnow()
    }

# ===== INVENTORY MANAGEMENT =====

@router.get("/inventory", response_model=List[ProductResponse])
async def get_inventory(
    admin = Depends(get_admin_data),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = Query(None, description="Filter by category"),
    in_stock: Optional[bool] = Query(None, description="Filter by stock status"),
    search: Optional[str] = Query(None, description="Search by name or vendor")
):
    """Get all products in inventory."""
    
    # Build query
    query = {}
    if category:
        query["category"] = category
    if in_stock is not None:
        query["in_stock"] = in_stock
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"vendor": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = products_collection.find(query).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    
    product_responses = []
    for product in products:
        product_data = convert_object_id(product)
        product_responses.append(ProductResponse(**product_data))
    
    return product_responses

@router.post("/inventory", response_model=ProductResponse)
async def add_product(
    product_data: ProductCreate,
    admin = Depends(get_admin_data)
):
    """Add new product to inventory."""
    
    # Create product document
    product_dict = product_data.dict()
    product_dict["created_at"] = datetime.utcnow()
    product_dict["updated_at"] = datetime.utcnow()
    
    result = await products_collection.insert_one(product_dict)
    
    # Get created product
    created_product = await products_collection.find_one({"_id": result.inserted_id})
    product_response_data = convert_object_id(created_product)
    
    return ProductResponse(**product_response_data)

@router.put("/inventory/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_updates: ProductUpdate,
    admin = Depends(get_admin_data)
):
    """Update product in inventory."""
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    # Only update provided fields
    update_data = {k: v for k, v in product_updates.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get updated product
    updated_product = await products_collection.find_one({"_id": ObjectId(product_id)})
    product_response_data = convert_object_id(updated_product)
    
    return ProductResponse(**product_response_data)

@router.delete("/inventory/{product_id}")
async def delete_product(
    product_id: str,
    admin = Depends(get_admin_data)
):
    """Delete product from inventory."""
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    result = await products_collection.delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return {"message": "Product deleted successfully", "product_id": product_id}

# ===== DASHBOARD STATS =====

@router.get("/dashboard/stats")
async def get_dashboard_stats(admin = Depends(get_admin_data)):
    """Get admin dashboard statistics."""
    
    # User statistics
    total_users = await users_collection.count_documents({})
    verified_users = await users_collection.count_documents({"is_verified": True})
    pending_verifications = await users_collection.count_documents({
        "id_verification.verification_status": {"$in": ["pending", "needs_medical"]}
    })
    
    # Transaction statistics
    total_transactions = await transactions_collection.count_documents({})
    pending_pickups = await transactions_collection.count_documents({
        "status": {"$in": ["pending", "paid_in_app", "awaiting_pickup"]}
    })
    
    # Revenue statistics (last 30 days)
    thirty_days_ago = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    thirty_days_ago = thirty_days_ago - timedelta(days=30)
    
    revenue_pipeline = [
        {"$match": {
            "status": {"$in": ["picked_up", "cash_paid_in_store"]},
            "created_at": {"$gte": thirty_days_ago}
        }},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total"}}}
    ]
    
    revenue_result = await transactions_collection.aggregate(revenue_pipeline).to_list(length=1)
    monthly_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0.0
    
    # Product statistics
    total_products = await products_collection.count_documents({})
    out_of_stock = await products_collection.count_documents({"in_stock": False})
    
    return {
        "users": {
            "total": total_users,
            "verified": verified_users,
            "pending_verification": pending_verifications
        },
        "transactions": {
            "total": total_transactions,
            "pending_pickups": pending_pickups
        },
        "revenue": {
            "monthly": round(monthly_revenue, 2)
        },
        "inventory": {
            "total_products": total_products,
            "out_of_stock": out_of_stock
        },
        "ratings": {
            "total_ratings": await ratings_collection.count_documents({}),
            "avg_rating_all_products": await get_overall_average_rating()
        }
    }

@router.get("/ratings/stats", response_model=List[ProductRatingStats])
async def get_product_rating_stats(
    admin = Depends(get_admin_data),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get detailed rating statistics for all products."""
    
    # Get products with their rating stats
    pipeline = [
        {"$lookup": {
            "from": "ratings",
            "localField": "_id",
            "foreignField": "product_id",
            "as": "product_ratings"
        }},
        {"$addFields": {
            "total_ratings": {"$size": "$product_ratings"},
            "average_rating": {
                "$cond": {
                    "if": {"$gt": [{"$size": "$product_ratings"}, 0]},
                    "then": {"$avg": "$product_ratings.rating"},
                    "else": 0
                }
            }
        }},
        {"$sort": {"total_ratings": -1}},
        {"$skip": skip},
        {"$limit": limit}
    ]
    
    products = await products_collection.aggregate(pipeline).to_list(length=limit)
    
    rating_stats = []
    for product in products:
        # Get rating distribution
        rating_distribution = await get_rating_distribution(product["_id"])
        
        # Get recent reviews
        recent_reviews = await get_recent_reviews(product["_id"], limit=5)
        
        stats = ProductRatingStats(
            product_id=str(product["_id"]),
            product_name=product.get("name", "Unknown"),
            total_ratings=product.get("total_ratings", 0),
            average_rating=round(product.get("average_rating", 0), 2),
            rating_distribution=rating_distribution,
            recent_reviews=recent_reviews
        )
        rating_stats.append(stats)
    
    return rating_stats

@router.get("/ratings/users", response_model=List[UserRatingHistory])
async def get_user_rating_history(
    admin = Depends(get_admin_data),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50)
):
    """Get user rating history for admin analysis."""
    
    # Get users with their rating activity
    pipeline = [
        {"$lookup": {
            "from": "ratings",
            "localField": "_id",
            "foreignField": "user_id",
            "as": "user_ratings"
        }},
        {"$addFields": {
            "total_ratings_given": {"$size": "$user_ratings"},
            "average_rating_given": {
                "$cond": {
                    "if": {"$gt": [{"$size": "$user_ratings"}, 0]},
                    "then": {"$avg": "$user_ratings.rating"},
                    "else": 0
                }
            }
        }},
        {"$match": {"total_ratings_given": {"$gt": 0}}},
        {"$sort": {"total_ratings_given": -1}},
        {"$skip": skip},
        {"$limit": limit}
    ]
    
    users = await users_collection.aggregate(pipeline).to_list(length=limit)
    
    user_histories = []
    for user in users:
        # Get recent ratings
        recent_ratings = await ratings_collection.find(
            {"user_id": user["_id"]}
        ).sort("created_at", -1).limit(5).to_list(length=5)
        
        # Convert recent ratings for response
        recent_ratings_data = []
        for rating in recent_ratings:
            product = await products_collection.find_one({"_id": rating["product_id"]})
            recent_ratings_data.append({
                "product_name": product.get("name", "Unknown") if product else "Unknown",
                "rating": rating["rating"],
                "review": rating.get("review"),
                "experience": rating.get("experience"),
                "created_at": rating["created_at"]
            })
        
        history = UserRatingHistory(
            user_id=str(user["_id"]),
            username=user.get("username", "Unknown"),
            total_ratings_given=user.get("total_ratings_given", 0),
            average_rating_given=round(user.get("average_rating_given", 0), 2),
            recent_ratings=recent_ratings_data
        )
        user_histories.append(history)
    
    return user_histories

async def get_overall_average_rating():
    """Get overall average rating across all products."""
    pipeline = [
        {"$group": {
            "_id": None,
            "overall_average": {"$avg": "$rating"}
        }}
    ]
    
    result = await ratings_collection.aggregate(pipeline).to_list(length=1)
    return round(result[0]["overall_average"], 2) if result else 0.0

async def get_rating_distribution(product_id):
    """Get rating distribution (1-5 stars) for a product."""
    pipeline = [
        {"$match": {"product_id": product_id}},
        {"$group": {
            "_id": "$rating",
            "count": {"$sum": 1}
        }}
    ]
    
    result = await ratings_collection.aggregate(pipeline).to_list(length=None)
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    
    for item in result:
        distribution[item["_id"]] = item["count"]
    
    return distribution

async def get_recent_reviews(product_id, limit=5):
    """Get recent reviews for a product."""
    cursor = ratings_collection.find(
        {"product_id": product_id, "$or": [{"review": {"$ne": None}}, {"experience": {"$ne": None}}]}
    ).sort("created_at", -1).limit(limit)
    
    reviews = await cursor.to_list(length=limit)
    recent_reviews = []
    
    for review in reviews:
        user = await users_collection.find_one({"_id": review["user_id"]})
        recent_reviews.append({
            "username": user.get("username", "Anonymous") if user else "Anonymous",
            "rating": review["rating"],
            "review": review["review"],
            "experience": review.get("experience"),
            "created_at": review["created_at"]
        })
    
    return recent_reviews