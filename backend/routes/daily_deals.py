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

@router.get("/daily", response_model=List[dict])
async def get_daily_deals():
    """Get current daily deals with product information."""
    # Get active deals
    current_deals = await daily_deals_collection.find({
        "valid_until": {"$gt": datetime.utcnow()},
        "is_active": True
    }).to_list(length=None)
    
    if not current_deals:
        return []
    
    # Get products for these deals
    product_ids = [deal["product_id"] for deal in current_deals]
    products = await products_collection.find({
        "_id": {"$in": product_ids}
    }).to_list(length=None)
    
    # Create product lookup
    product_lookup = {str(product["_id"]): product for product in products}
    
    # Combine deals with product info
    deals_with_products = []
    for deal in current_deals:
        product_id_str = str(deal["product_id"])
        if product_id_str in product_lookup:
            product = product_lookup[product_id_str]
            product_data = convert_object_id(product)
            deal_data = convert_object_id(deal)
            
            # Calculate discounted price
            original_price = product_data["price"]
            discounted_price = original_price * (1 - deal_data["discount"] / 100)
            
            deals_with_products.append({
                "deal": deal_data,
                "product": {
                    **product_data,
                    "discounted_price": round(discounted_price, 2),
                    "savings": round(original_price - discounted_price, 2)
                }
            })
    
    return deals_with_products

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