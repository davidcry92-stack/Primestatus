from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta, datetime
from models.admin import AdminCreate, AdminLogin, Admin, AdminResponse, AdminToken
from utils.auth import verify_password, get_password_hash, create_access_token, verify_token
from utils.database import admins_collection, convert_object_id
from bson import ObjectId

router = APIRouter(prefix="/admin-auth", tags=["admin-authentication"])

async def verify_admin_token(token: str = Depends(verify_token)):
    """Verify admin token and return admin email."""
    # First verify the token format is valid
    admin_email = token  # verify_token returns the email
    
    # Check if this email belongs to an admin
    admin = await admins_collection.find_one({"email": admin_email})
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if not admin.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive"
        )
    
    return admin_email

async def get_admin_data(admin_email: str = Depends(verify_admin_token)):
    """Get admin data from token."""
    admin = await admins_collection.find_one({"email": admin_email})
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    return admin

@router.post("/register", response_model=AdminToken)
async def register_admin(admin_data: AdminCreate):
    """Register a new admin (super admin only - for initial setup)."""
    # Check if admin already exists
    existing_admin = await admins_collection.find_one({"email": admin_data.email})
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin email already registered"
        )
    
    # Create admin document
    admin_dict = {
        "username": admin_data.username,
        "email": admin_data.email,
        "password_hash": get_password_hash(admin_data.password),
        "full_name": admin_data.full_name,
        "role": admin_data.role,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert admin
    result = await admins_collection.insert_one(admin_dict)
    
    # Get created admin
    created_admin = await admins_collection.find_one({"_id": result.inserted_id})
    admin_response_data = convert_object_id(created_admin)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": admin_data.email, "type": "admin"},
        expires_delta=timedelta(minutes=60 * 8)  # 8 hours
    )
    
    admin_response = AdminResponse(**admin_response_data)
    
    return AdminToken(
        access_token=access_token,
        token_type="bearer",
        admin=admin_response
    )

@router.post("/login", response_model=AdminToken)
async def login_admin(admin_credentials: AdminLogin):
    """Authenticate admin and return token."""
    print(f"🔍 ADMIN LOGIN ATTEMPT: {admin_credentials.email}")
    
    # Find admin
    admin = await admins_collection.find_one({"email": admin_credentials.email})
    if not admin:
        print(f"❌ Admin not found: {admin_credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    print(f"✅ Admin found: {admin['username']}")
    print(f"🔑 Admin password hash: {admin['password_hash'][:20]}...")
    
    # Check if admin is active
    if not admin.get("is_active", True):
        print(f"❌ Admin account inactive: {admin_credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive"
        )
    
    # Verify password
    password_valid = verify_password(admin_credentials.password, admin["password_hash"])
    print(f"🔐 Admin password verification: {password_valid}")
    
    if not password_valid:
        print(f"❌ Admin password verification failed: {admin_credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    print(f"✅ Admin login successful: {admin_credentials.email}")
    
    # Update last login
    await admins_collection.update_one(
        {"_id": admin["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": admin_credentials.email, "type": "admin"},
        expires_delta=timedelta(minutes=60 * 8)  # 8 hours
    )
    
    admin_response_data = convert_object_id(admin)
    admin_response = AdminResponse(**admin_response_data)
    
    return AdminToken(
        access_token=access_token,
        token_type="bearer",
        admin=admin_response
    )

@router.get("/profile", response_model=AdminResponse)
async def get_admin_profile(admin = Depends(get_admin_data)):
    """Get current admin profile."""
    admin_data = convert_object_id(admin)
    return AdminResponse(**admin_data)

@router.post("/logout")
async def logout_admin():
    """Logout admin (client should remove token)."""
    return {"message": "Admin successfully logged out"}