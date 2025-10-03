from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
import uuid

from models.wictionary import WictionaryCreate, WictionaryBase
from utils.database import db
from utils.auth import verify_token
from routes.admin_auth import verify_admin_token

router = APIRouter()

class HealthAidTermCreate(WictionaryCreate):
    """Extended model for admin health-aid term creation"""
    usage_examples: Optional[str] = None

class HealthAidTerm(WictionaryBase):
    """Extended model for health-aid terms with admin fields"""
    id: str
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@router.get("/terms", response_model=dict)
async def get_all_health_aid_terms(admin_user: dict = Depends(verify_admin_token)):
    """Get all Health-Aid dictionary terms for admin management."""
    
    try:
        # Get all terms from wictionary collection
        terms_cursor = db.wictionary.find({}).sort("term", 1)
        terms_data = await terms_cursor.to_list(length=None)
        
        terms = []
        for term_data in terms_data:
            # Convert ObjectId to string if needed
            if '_id' in term_data:
                del term_data['_id']
            terms.append(term_data)
        
        return {
            "terms": terms,
            "count": len(terms)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch terms: {str(e)}")

@router.post("/terms", response_model=dict)
async def create_health_aid_term(
    term_data: HealthAidTermCreate,
    admin_email: str = Depends(verify_admin_token)
):
    """Create a new Health-Aid dictionary term."""
    
    try:
        # Check if term already exists
        existing_term = await db.wictionary.find_one({"term": term_data.term.lower()})
        if existing_term:
            raise HTTPException(status_code=400, detail="Term already exists")
        
        # Create new term
        new_term_dict = {
            "id": str(uuid.uuid4()),
            "term": term_data.term,
            "definition": term_data.definition,
            "category": term_data.category,
            "related_terms": term_data.related_terms or [],
            "etymology": term_data.etymology or "",
            "examples": [term_data.usage_examples] if term_data.usage_examples else [],
            "created_by": admin_email,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Save to database
        await db.wictionary.insert_one(new_term_dict)
        
        return {
            "success": True,
            "message": "Health-Aid term created successfully",
            "term_id": new_term_dict["id"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create term: {str(e)}")

@router.put("/terms/{term_id}", response_model=dict)
async def update_health_aid_term(
    term_id: str,
    term_data: HealthAidTermCreate,
    admin_user: dict = Depends(verify_admin_token)
):
    """Update an existing Health-Aid dictionary term."""
    
    try:
        # Check if term exists
        existing_term = await db.wictionary.find_one({"id": term_id})
        if not existing_term:
            raise HTTPException(status_code=404, detail="Term not found")
        
        # Update term data
        update_data = term_data.dict()
        update_data["updated_at"] = datetime.utcnow()
        
        # Update in database
        result = await db.wictionary.update_one(
            {"id": term_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Term not found")
        
        return {
            "success": True,
            "message": "Health-Aid term updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update term: {str(e)}")

@router.delete("/terms/{term_id}")
async def delete_health_aid_term(
    term_id: str,
    admin_user: dict = Depends(verify_admin_token)
):
    """Delete a Health-Aid dictionary term."""
    
    try:
        # Delete from database
        result = await db.wictionary.delete_one({"id": term_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Term not found")
        
        return {
            "success": True,
            "message": "Health-Aid term deleted successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete term: {str(e)}")

@router.get("/terms/search/{query}")
async def search_health_aid_terms(
    query: str,
    category: Optional[str] = None,
    admin_user: dict = Depends(verify_admin_token)
):
    """Search Health-Aid dictionary terms."""
    
    try:
        # Build search query
        search_filter = {
            "$or": [
                {"term": {"$regex": query, "$options": "i"}},
                {"definition": {"$regex": query, "$options": "i"}},
                {"related_terms": {"$in": [{"$regex": query, "$options": "i"}]}}
            ]
        }
        
        if category:
            search_filter["category"] = category
        
        # Search terms
        terms_cursor = db.wictionary.find(search_filter).sort("term", 1)
        terms_data = await terms_cursor.to_list(length=None)
        
        terms = []
        for term_data in terms_data:
            if '_id' in term_data:
                del term_data['_id']
            terms.append(term_data)
        
        return {
            "terms": terms,
            "count": len(terms),
            "query": query
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/stats")
async def get_health_aid_stats(admin_user: dict = Depends(verify_admin_token)):
    """Get Health-Aid dictionary statistics."""
    
    try:
        # Count terms by category
        pipeline = [
            {
                "$group": {
                    "_id": "$category",
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"count": -1}
            }
        ]
        
        category_stats = []
        async for result in db.wictionary.aggregate(pipeline):
            category_stats.append({
                "category": result["_id"],
                "count": result["count"]
            })
        
        # Total count
        total_terms = await db.wictionary.count_documents({})
        
        return {
            "total_terms": total_terms,
            "categories": category_stats,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")