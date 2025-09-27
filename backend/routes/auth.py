from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from models.user import UserCreate, UserLogin, User, UserResponse, Token
from utils.auth import verify_password, get_password_hash, create_access_token, verify_token
from utils.database import users_collection, convert_object_id
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user."""
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check law enforcement verification
    if user_data.is_law_enforcement:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Law enforcement personnel are not permitted to access this platform"
        )
    
    # Set wictionary access based on membership tier
    wictionary_access = user_data.membership_tier == "premium"
    
    # Create user document
    user_dict = user_data.dict()
    user_dict["password"] = get_password_hash(user_data.password)
    user_dict["wictionary_access"] = wictionary_access
    user_dict["order_history"] = []
    
    # Insert user
    result = await users_collection.insert_one(user_dict)
    
    # Get created user
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    user_response_data = convert_object_id(created_user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user_data.email},
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