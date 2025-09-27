from fastapi import HTTPException, status, Depends
from utils.auth import verify_token
from utils.database import users_collection

async def require_verified_user(current_user_email: str = Depends(verify_token)):
    """Middleware to ensure user is verified before allowing transactions."""
    user = await users_collection.find_one({"email": current_user_email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is verified
    if not user.get("is_verified", False):
        verification_status = user.get("id_verification", {}).get("verification_status", "pending")
        
        if verification_status == "rejected":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account verification was rejected. Please contact support to resubmit documents."
            )
        elif verification_status in ["pending", "needs_medical"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account verification pending. Complete ID verification before making any transactions."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account verification required before making any transactions."
            )
    
    return current_user_email

async def get_verified_user_data(current_user_email: str = Depends(require_verified_user)):
    """Get verified user data for transactions."""
    user = await users_collection.find_one({"email": current_user_email})
    return user