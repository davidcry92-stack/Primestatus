from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
from models.rating import RatingCreate, Rating, RatingResponse, ProductRatingStats, UserRatingHistory
from models.product import ProductResponse
from utils.auth import verify_token
from utils.database import ratings_collection, products_collection, users_collection, convert_object_id
from bson import ObjectId

router = APIRouter(prefix="/ratings", tags=["ratings"])

@router.post("/", response_model=RatingResponse)
async def create_rating(
    rating_data: RatingCreate,
    current_user_email: str = Depends(verify_token)
):
    """Create or update a product rating by the current user."""
    
    # Get user ID from email
    user = await users_collection.find_one({"email": current_user_email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify product exists
    if not ObjectId.is_valid(rating_data.product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    product = await products_collection.find_one({"_id": ObjectId(rating_data.product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user already rated this product
    existing_rating = await ratings_collection.find_one({
        "product_id": ObjectId(rating_data.product_id),
        "user_id": user["_id"]
    })
    
    if existing_rating:
        # Update existing rating
        update_data = {
            "rating": rating_data.rating,
            "review": rating_data.review,
            "experience": rating_data.experience,
            "updated_at": datetime.utcnow()
        }
        
        await ratings_collection.update_one(
            {"_id": existing_rating["_id"]},
            {"$set": update_data}
        )
        
        updated_rating = await ratings_collection.find_one({"_id": existing_rating["_id"]})
        rating_response_data = convert_object_id(updated_rating)
        
    else:
        # Create new rating
        rating_dict = {
            "product_id": ObjectId(rating_data.product_id),
            "user_id": user["_id"],
            "rating": rating_data.rating,
            "review": rating_data.review,
            "experience": rating_data.experience,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await ratings_collection.insert_one(rating_dict)
        created_rating = await ratings_collection.find_one({"_id": result.inserted_id})
        rating_response_data = convert_object_id(created_rating)
    
    # Update product's average rating and review count
    await update_product_rating_stats(rating_data.product_id)
    
    return RatingResponse(**rating_response_data)

@router.get("/product/{product_id}", response_model=List[RatingResponse])
async def get_product_ratings(
    product_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all ratings for a specific product."""
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    cursor = ratings_collection.find({"product_id": ObjectId(product_id)})
    cursor = cursor.sort("created_at", -1).skip(skip).limit(limit)
    ratings = await cursor.to_list(length=limit)
    
    rating_responses = []
    for rating in ratings:
        rating_data = convert_object_id(rating)
        rating_responses.append(RatingResponse(**rating_data))
    
    return rating_responses

@router.get("/user/my-ratings", response_model=List[RatingResponse])
async def get_my_ratings(
    current_user_email: str = Depends(verify_token),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all ratings by the current user."""
    
    # Get user ID from email
    user = await users_collection.find_one({"email": current_user_email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    cursor = ratings_collection.find({"user_id": user["_id"]})
    cursor = cursor.sort("created_at", -1).skip(skip).limit(limit)
    ratings = await cursor.to_list(length=limit)
    
    rating_responses = []
    for rating in ratings:
        rating_data = convert_object_id(rating)
        rating_responses.append(RatingResponse(**rating_data))
    
    return rating_responses

@router.delete("/{rating_id}")
async def delete_rating(
    rating_id: str,
    current_user_email: str = Depends(verify_token)
):
    """Delete a rating (only by the user who created it)."""
    
    if not ObjectId.is_valid(rating_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid rating ID"
        )
    
    # Get user ID from email
    user = await users_collection.find_one({"email": current_user_email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Find rating and verify ownership
    rating = await ratings_collection.find_one({"_id": ObjectId(rating_id)})
    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rating not found"
        )
    
    if rating["user_id"] != user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own ratings"
        )
    
    # Delete rating
    product_id = str(rating["product_id"])
    await ratings_collection.delete_one({"_id": ObjectId(rating_id)})
    
    # Update product's rating stats
    await update_product_rating_stats(product_id)
    
    return {"message": "Rating deleted successfully"}

async def update_product_rating_stats(product_id: str):
    """Helper function to update product's average rating and review count."""
    
    # Calculate new average rating and count
    pipeline = [
        {"$match": {"product_id": ObjectId(product_id)}},
        {"$group": {
            "_id": None,
            "average_rating": {"$avg": "$rating"},
            "review_count": {"$sum": 1}
        }}
    ]
    
    result = await ratings_collection.aggregate(pipeline).to_list(length=1)
    
    if result:
        avg_rating = round(result[0]["average_rating"], 1)
        review_count = result[0]["review_count"]
    else:
        avg_rating = 0.0
        review_count = 0
    
    # Update product
    await products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {
            "rating": avg_rating,
            "reviews": review_count,
            "updated_at": datetime.utcnow()
        }}
    )