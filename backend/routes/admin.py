from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from models.user import UserResponse
from utils.auth import verify_token
from utils.database import users_collection, convert_object_id
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

# TODO: Add admin role checking middleware
def check_admin_role(current_user_email: str = Depends(verify_token)):
    """Check if user has admin privileges."""
    # For now, this is a placeholder. In production, implement proper admin role checking
    # You might want to have an admin_emails list or admin role field in user document
    admin_emails = ["admin@statusxsmoakland.com", "support@statusxsmoakland.com"]
    if current_user_email not in admin_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user_email

@router.get("/verification/pending", response_model=List[UserVerificationDetails])
async def get_pending_verifications(
    admin_email: str = Depends(check_admin_role),
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
    admin_email: str = Depends(check_admin_role)
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
async def get_verification_stats(admin_email: str = Depends(check_admin_role)):
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