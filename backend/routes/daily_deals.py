from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
import json
import os
import uuid
from datetime import datetime, timedelta
import shutil

from models.daily_deals import DailyDeal, DailyDealCreate, DailyDealResponse, DeliverySignup, DeliverySignupResponse, StructuredDeal
from utils.database import db
from routes.admin_auth import verify_admin_token

router = APIRouter()
security = HTTPBearer()

# Upload directory for videos
UPLOAD_DIR = "/app/uploads/videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/admin/daily-deals", response_model=dict)
async def create_daily_deal(
    category: str = Form(...),
    title: str = Form(...),
    message: str = Form(...),
    expires_at: str = Form(...),
    deals: str = Form(default="[]"),
    video: Optional[UploadFile] = File(None),
    admin_email: str = Depends(verify_admin_token)
):
    """Create a new daily deal with optional video upload."""
    
    try:
        # Parse structured deals
        structured_deals_data = json.loads(deals)
        structured_deals = []
        
        for deal_data in structured_deals_data:
            structured_deal = StructuredDeal(
                product_name=deal_data.get('product_name', ''),
                discount_percentage=deal_data.get('discount_percentage', 0),
                original_price=deal_data.get('original_price', 0.0),
                deal_description=deal_data.get('deal_description', '')
            )
            structured_deals.append(structured_deal)
        
        # Parse expiration date
        expires_at_dt = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        
        # Handle video upload
        video_url = None
        video_filename = None
        
        if video and video.filename:
            # Validate file type
            if not video.filename.lower().endswith('.mp4'):
                raise HTTPException(status_code=400, detail="Only MP4 files are allowed")
            
            # Generate unique filename
            file_extension = video.filename.split('.')[-1]
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(video.file, buffer)
            
            video_filename = unique_filename
            video_url = f"/api/uploads/videos/{unique_filename}"
        
        # Create daily deal
        daily_deal = DailyDeal(
            category=category,
            title=title,
            message=message,
            structured_deals=structured_deals,
            video_url=video_url,
            video_filename=video_filename,
            expires_at=expires_at_dt,
            created_by=admin_email
        )
        
        # Save to database
        await db.daily_deals.insert_one(daily_deal.dict())
        
        return {
            "success": True,
            "message": "Daily deal created successfully",
            "deal_id": daily_deal.id
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid deals JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create daily deal: {str(e)}")

@router.get("/admin/daily-deals", response_model=DailyDealResponse)
async def get_admin_daily_deals(
    admin_email: str = Depends(verify_admin_token)
):
    """Get all daily deals for admin management."""
    
    try:
        # Get all deals sorted by creation date
        deals_cursor = db.daily_deals.find({}).sort("created_at", -1)
        deals_data = await deals_cursor.to_list(length=None)
        
        deals = []
        for deal_data in deals_data:
            # Convert MongoDB document to DailyDeal model
            deal = DailyDeal(**deal_data)
            deals.append(deal)
        
        return DailyDealResponse(deals=deals, count=len(deals))
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch daily deals: {str(e)}")

@router.delete("/admin/daily-deals/{deal_id}")
async def delete_daily_deal(
    deal_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete a daily deal."""
    
    # Verify admin token
    admin_user = await verify_admin_token(credentials.credentials)
    if not admin_user:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    
    try:
        # Get deal to check for video file
        deal = await db.daily_deals.find_one({"id": deal_id})
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        # Delete video file if exists
        if deal.get('video_filename'):
            video_path = os.path.join(UPLOAD_DIR, deal['video_filename'])
            if os.path.exists(video_path):
                os.remove(video_path)
        
        # Delete from database
        result = await db.daily_deals.delete_one({"id": deal_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        return {"success": True, "message": "Deal deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete deal: {str(e)}")

@router.get("/daily-deals", response_model=DailyDealResponse)
async def get_active_daily_deals():
    """Get active daily deals for members (no authentication required)."""
    
    try:
        # Get only active deals that haven't expired
        current_time = datetime.utcnow()
        deals_cursor = db.daily_deals.find({
            "is_active": True,
            "expires_at": {"$gt": current_time}
        }).sort("created_at", -1)
        
        deals_data = await deals_cursor.to_list(length=None)
        
        deals = []
        for deal_data in deals_data:
            deal = DailyDeal(**deal_data)
            deals.append(deal)
        
        return DailyDealResponse(deals=deals, count=len(deals))
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch daily deals: {str(e)}")

@router.post("/delivery-signup", response_model=DeliverySignupResponse)
async def delivery_signup(signup_data: DeliverySignup):
    """Sign up for delivery launch notifications."""
    
    try:
        # Check if email already exists
        existing_signup = await db.delivery_signups.find_one({"email": signup_data.email})
        if existing_signup:
            return DeliverySignupResponse(
                message="You're already signed up for delivery notifications!",
                email=signup_data.email
            )
        
        # Add new signup
        await db.delivery_signups.insert_one(signup_data.dict())
        
        return DeliverySignupResponse(
            message="Successfully signed up for delivery notifications!",
            email=signup_data.email
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sign up for delivery notifications: {str(e)}")

@router.get("/admin/delivery-signups")
async def get_delivery_signups(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all delivery signups for admin."""
    
    # Verify admin token
    admin_user = await verify_admin_token(credentials.credentials)
    if not admin_user:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    
    try:
        signups_cursor = db.delivery_signups.find({"is_active": True}).sort("subscribed_at", -1)
        signups = await signups_cursor.to_list(length=None)
        
        return {
            "signups": signups,
            "count": len(signups)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch delivery signups: {str(e)}")

# Cleanup expired deals (background task)
@router.post("/admin/cleanup-expired-deals")
async def cleanup_expired_deals(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Cleanup expired daily deals (admin only)."""
    
    # Verify admin token
    admin_user = await verify_admin_token(credentials.credentials)
    if not admin_user:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    
    try:
        current_time = datetime.utcnow()
        
        # Find expired deals with videos
        expired_deals_cursor = db.daily_deals.find({
            "expires_at": {"$lt": current_time}
        })
        expired_deals = await expired_deals_cursor.to_list(length=None)
        
        # Delete video files
        deleted_videos = 0
        for deal in expired_deals:
            if deal.get('video_filename'):
                video_path = os.path.join(UPLOAD_DIR, deal['video_filename'])
                if os.path.exists(video_path):
                    os.remove(video_path)
                    deleted_videos += 1
        
        # Delete expired deals from database
        result = await db.daily_deals.delete_many({
            "expires_at": {"$lt": current_time}
        })
        
        return {
            "success": True,
            "deleted_deals": result.deleted_count,
            "deleted_videos": deleted_videos
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cleanup expired deals: {str(e)}")