from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
import json
import os
import uuid
from datetime import datetime, timedelta
import shutil

from models.daily_deals import DailyDeal, DailyDealCreate, DailyDealResponse, DeliverySignup, DeliverySignupResponse, StructuredDeal
from utils.database import get_database
from utils.auth import verify_admin_token

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
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a new daily deal with optional video upload."""
    
    # Verify admin token
    admin_user = await verify_admin_token(credentials.credentials)
    if not admin_user:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    
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
            created_by=admin_user.get('id', 'admin')
        )
        
        # Save to database
        db = await get_database()
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
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all daily deals for admin management."""
    
    # Verify admin token
    admin_user = await verify_admin_token(credentials.credentials)
    if not admin_user:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    
    try:
        db = await get_database()
        
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
        db = await get_database()
        
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
        db = await get_database()
        
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

@router.post("/admin/generate", response_model=List[DailyDealResponse])
async def generate_daily_deals(current_user_email: str = Depends(verify_token)):
    """Generate daily deals based on inventory levels (admin only)."""
    # TODO: Add admin role check
    
    # Deactivate old deals
    await daily_deals_collection.update_many(
        {"is_active": True},
        {"$set": {"is_active": False}}
    )
    
    # Get products with high inventory or specific criteria
    products = await products_collection.find({
        "in_stock": True
    }).to_list(length=None)
    
    if not products:
        return []
    
    # Simple logic: randomly select 2-3 products for deals
    selected_products = random.sample(products, min(3, len(products)))
    
    new_deals = []
    for product in selected_products:
        # Random discount between 15-50%
        discount = random.randint(15, 50)
        
        # Deal valid for 24 hours
        valid_until = datetime.utcnow() + timedelta(hours=24)
        
        # Determine reason based on inventory or random
        reasons = [
            "High inventory clearance",
            "Limited time offer",
            "Bulk stock sale",
            "Weekend special",
            "NYC exclusive deal"
        ]
        reason = random.choice(reasons)
        
        deal_data = {
            "product_id": product["_id"],
            "discount": discount,
            "valid_until": valid_until,
            "reason": reason,
            "is_active": True
        }
        
        result = await daily_deals_collection.insert_one(deal_data)
        
        # Get created deal
        created_deal = await daily_deals_collection.find_one({"_id": result.inserted_id})
        deal_response_data = convert_object_id(created_deal)
        new_deals.append(DailyDealResponse(**deal_response_data))
    
    return new_deals

@router.get("/stats")
async def get_deal_stats():
    """Get statistics about daily deals."""
    # Count active deals
    active_deals = await daily_deals_collection.count_documents({
        "valid_until": {"$gt": datetime.utcnow()},
        "is_active": True
    })
    
    # Get max discount
    max_discount_deal = await daily_deals_collection.find_one(
        {
            "valid_until": {"$gt": datetime.utcnow()},
            "is_active": True
        },
        sort=[("discount", -1)]
    )
    
    max_discount = max_discount_deal["discount"] if max_discount_deal else 0
    
    return {
        "active_deals_count": active_deals,
        "max_discount": max_discount,
        "deal_duration_hours": 24
    }