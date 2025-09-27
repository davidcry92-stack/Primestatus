from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from models.wictionary import Wictionary, WictionaryCreate, WictionarySuggest, WictionaryResponse
from utils.database import wictionary_collection, users_collection, convert_object_id
from utils.auth import verify_token, require_premium_membership
from bson import ObjectId

router = APIRouter(prefix="/wictionary", tags=["wictionary"])

@router.get("/", response_model=List[WictionaryResponse])
async def get_wictionary_terms(
    category: Optional[str] = Query(None, pattern="^(slang|science|culture|legal)$"),
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user_email: str = Depends(verify_token)
):
    """Get wictionary terms (premium members only)."""
    # Check if user is admin or has premium membership
    from utils.database import admins_collection
    admin = await admins_collection.find_one({"email": current_user_email})
    
    if not admin:
        # Check if user has premium membership
        user = await users_collection.find_one({"email": current_user_email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        require_premium_membership(user)
    
    # Build query
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"term": {"$regex": search, "$options": "i"}},
            {"definition": {"$regex": search, "$options": "i"}}
        ]
    
    # Get terms
    cursor = wictionary_collection.find(query)
    cursor = cursor.sort("term", 1)  # Sort alphabetically
    cursor = cursor.skip(skip).limit(limit)
    
    terms = await cursor.to_list(length=limit)
    
    # Convert and return
    term_responses = []
    for term in terms:
        term_data = convert_object_id(term)
        term_responses.append(WictionaryResponse(**term_data))
    
    return term_responses

@router.get("/search", response_model=List[WictionaryResponse])
async def search_wictionary(
    q: str = Query(..., min_length=1),
    current_user_email: str = Depends(verify_token)
):
    """Search wictionary terms (premium members only)."""
    # Check if user is admin or has premium membership
    from utils.database import admins_collection
    admin = await admins_collection.find_one({"email": current_user_email})
    
    if not admin:
        # Check if user has premium membership
        user = await users_collection.find_one({"email": current_user_email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        require_premium_membership(user)
    
    # Search in term, definition, and etymology
    query = {
        "$or": [
            {"term": {"$regex": q, "$options": "i"}},
            {"definition": {"$regex": q, "$options": "i"}},
            {"etymology": {"$regex": q, "$options": "i"}}
        ]
    }
    
    terms = await wictionary_collection.find(query).to_list(length=50)
    
    # Convert and return
    term_responses = []
    for term in terms:
        term_data = convert_object_id(term)
        term_responses.append(WictionaryResponse(**term_data))
    
    return term_responses

@router.post("/suggest")
async def suggest_term(
    suggestion: WictionarySuggest,
    current_user_email: str = Depends(verify_token)
):
    """Suggest a new wictionary term."""
    # Check if term already exists
    existing_term = await wictionary_collection.find_one({
        "term": {"$regex": f"^{suggestion.term}$", "$options": "i"}
    })
    
    if existing_term:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Term already exists in wictionary"
        )
    
    # Store suggestion (for admin review)
    suggestion_data = suggestion.dict()
    suggestion_data["suggested_by"] = current_user_email
    suggestion_data["status"] = "pending"  # pending, approved, rejected
    suggestion_data["suggested_at"] = datetime.utcnow()
    
    # For demo purposes, auto-approve suggestions
    # In production, you'd want an admin review process
    term_data = {
        "term": suggestion.term,
        "definition": suggestion.definition,
        "category": suggestion.category,
        "etymology": suggestion.etymology
    }
    
    result = await wictionary_collection.insert_one(term_data)
    
    return {
        "message": "Term added to wictionary successfully",
        "term_id": str(result.inserted_id)
    }

@router.get("/categories")
async def get_categories(
    current_user_email: str = Depends(verify_token)
):
    """Get available wictionary categories (premium members only)."""
    # Check if user has premium membership
    user = await users_collection.find_one({"email": current_user_email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    require_premium_membership(user)
    
    # Get category counts
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    categories = await wictionary_collection.aggregate(pipeline).to_list(length=None)
    
    return {
        "categories": [
            {"name": cat["_id"], "count": cat["count"]} 
            for cat in categories
        ]
    }

@router.get("/stats")
async def get_wictionary_stats(
    current_user_email: str = Depends(verify_token)
):
    """Get wictionary statistics (premium members only)."""
    # Check if user has premium membership
    user = await users_collection.find_one({"email": current_user_email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    require_premium_membership(user)
    
    total_terms = await wictionary_collection.count_documents({})
    
    # Get category breakdown
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    
    category_stats = await wictionary_collection.aggregate(pipeline).to_list(length=None)
    
    return {
        "total_terms": total_terms,
        "categories": {
            cat["_id"]: cat["count"] for cat in category_stats
        }
    }