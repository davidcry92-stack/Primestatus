from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from datetime import timedelta, datetime
from typing import Optional
from models.user import UserCreate, UserLogin, User, UserResponse, Token
from utils.auth import verify_password, get_password_hash, create_access_token, verify_token
from utils.database import users_collection, convert_object_id
from utils.file_upload import save_uploaded_file
from bson import ObjectId
import json

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=Token)
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(...),
    date_of_birth: str = Form(...),
    re_entry_code: str = Form(..., description="4-8 digit verification code"),
    membership_tier: str = Form("basic"),
    is_law_enforcement: bool = Form(False),
    parent_email: Optional[str] = Form(None),
    id_front: UploadFile = File(..., description="Front of state-issued ID"),
    id_back: UploadFile = File(..., description="Back of state-issued ID"),
    medical_document: Optional[UploadFile] = File(None, description="Medical prescription (required for under 21)")
):
    """Register a new user with ID verification."""
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check law enforcement verification
    if is_law_enforcement:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Law enforcement personnel are not permitted to access this platform"
        )
    
    # Calculate age from date of birth
    try:
        birth_date = datetime.strptime(date_of_birth, "%Y-%m-%d")
        today = datetime.today()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date of birth format. Use YYYY-MM-DD"
        )
    
    # Check age requirements
    if age < 18:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must be at least 18 years old to register"
        )
    
    # Validate re-entry code
    if not re_entry_code.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Re-entry code must contain only numbers"
        )
    
    if len(re_entry_code) < 4 or len(re_entry_code) > 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Re-entry code must be 4-8 digits"
        )
    
    requires_medical = age < 21
    
    # For users under 21, require medical document and parent email
    if requires_medical:
        if not medical_document:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Medical prescription required for users under 21"
            )
        if not parent_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent/guardian email required for users under 21"
            )
    
    # Save uploaded files
    try:
        id_front_path = await save_uploaded_file(id_front, f"ids/{email}")
        id_back_path = await save_uploaded_file(id_back, f"ids/{email}")
        
        medical_doc_path = None
        if medical_document and requires_medical:
            medical_doc_path = await save_uploaded_file(medical_document, f"medical/{email}")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File upload failed: {str(e)}"
        )
    
    # Set wictionary access based on membership tier
    wictionary_access = membership_tier == "premium"
    
    # Create user document
    user_dict = {
        "username": username,
        "email": email,
        "password": get_password_hash(password),
        "full_name": full_name,
        "date_of_birth": date_of_birth,
        "membership_tier": membership_tier,
        "is_law_enforcement": is_law_enforcement,
        "parent_email": parent_email,
        "preferences": {"categories": [], "vendors": [], "price_range": [0, 200]},
        "wictionary_access": wictionary_access,
        "order_history": [],
        "is_verified": False,  # Will be set to True after admin verification
        "id_verification": {
            "id_front_url": id_front_path,
            "id_back_url": id_back_path,
            "medical_document_url": medical_doc_path,
            "verification_status": "needs_medical" if requires_medical else "pending",
            "verified_at": None,
            "rejected_reason": None,
            "age_verified": age,
            "requires_medical": requires_medical
        }
    }
    
    # Insert user
    result = await users_collection.insert_one(user_dict)
    
    # Get created user
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    user_response_data = convert_object_id(created_user)
    
    # Add verification status fields to response
    user_response_data["verification_status"] = user_dict["id_verification"]["verification_status"]
    user_response_data["requires_medical"] = requires_medical
    user_response_data["age_verified"] = age
    
    # Create access token (limited access until verified)
    access_token = create_access_token(
        data={"sub": email},
        expires_delta=timedelta(minutes=60 * 24 * 7)  # 7 days
    )
    
    user_response = UserResponse(**user_response_data)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Authenticate user and return token."""
    # Find user
    user = await users_collection.find_one({"email": user_credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user_credentials.email},
        expires_delta=timedelta(minutes=60 * 24 * 7)  # 7 days
    )
    
    user_response_data = convert_object_id(user)
    user_response = UserResponse(**user_response_data)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user_email: str = Depends(verify_token)):
    """Get current user profile."""
    user = await users_collection.find_one({"email": current_user_email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_data = convert_object_id(user)
    return UserResponse(**user_data)

@router.put("/profile", response_model=UserResponse)
async def update_profile(updates: dict, current_user_email: str = Depends(verify_token)):
    """Update user profile."""
    # Remove sensitive fields that shouldn't be updated via this endpoint
    updates.pop("password", None)
    updates.pop("email", None)
    updates.pop("is_law_enforcement", None)
    
    # Update wictionary access based on membership tier
    if "membership_tier" in updates:
        updates["wictionary_access"] = updates["membership_tier"] == "premium"
    
    # Update user
    result = await users_collection.update_one(
        {"email": current_user_email},
        {"$set": updates}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get updated user
    updated_user = await users_collection.find_one({"email": current_user_email})
    user_data = convert_object_id(updated_user)
    return UserResponse(**user_data)

@router.post("/logout")
async def logout():
    """Logout user (client should remove token)."""
    return {"message": "Successfully logged out"}