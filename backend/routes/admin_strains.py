from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from typing import List, Optional
from datetime import datetime
import uuid
import os
import shutil

from utils.database import db
from routes.admin_auth import verify_admin_token

router = APIRouter()

# Upload directory for strain images
UPLOAD_DIR = "/app/uploads/strains"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class StrainCreate:
    def __init__(self, 
                 name: str,
                 category: str,
                 type: str,
                 thc_content: str = None,
                 cbd_content: str = None,
                 effects: str = None,
                 flavors: str = None,
                 ailments: str = None,
                 description: str = None,
                 price_range: str = None,
                 availability: bool = True):
        self.name = name
        self.category = category
        self.type = type
        self.thc_content = thc_content
        self.cbd_content = cbd_content
        self.effects = effects
        self.flavors = flavors
        self.ailments = ailments
        self.description = description
        self.price_range = price_range
        self.availability = availability

@router.get("/strains", response_model=dict)
async def get_all_strains(admin_user: dict = Depends(verify_admin_token)):
    """Get all strains for admin management."""
    
    try:
        strains_cursor = db.strains.find({}).sort("name", 1)
        strains_data = await strains_cursor.to_list(length=None)
        
        return {
            "strains": strains_data,
            "count": len(strains_data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch strains: {str(e)}")

@router.post("/strains", response_model=dict)
async def create_strain(
    name: str = Form(...),
    category: str = Form(...),
    type: str = Form(...),
    thc_content: str = Form(None),
    cbd_content: str = Form(None),
    effects: str = Form(None),
    flavors: str = Form(None),
    ailments: str = Form(None),
    description: str = Form(...),
    price_range: str = Form(None),
    availability: bool = Form(True),
    image: Optional[UploadFile] = File(None),
    admin_user: dict = Depends(verify_admin_token)
):
    """Create a new strain with optional image upload."""
    
    try:
        # Handle image upload
        image_url = None
        image_filename = None
        
        if image and image.filename:
            # Validate file type
            if not image.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="Only image files are allowed")
            
            # Generate unique filename
            file_extension = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            image_filename = unique_filename
            image_url = f"/api/uploads/strains/{unique_filename}"
        
        # Create strain document
        strain_data = {
            "id": str(uuid.uuid4()),
            "name": name,
            "category": category,
            "type": type,
            "thc_content": thc_content,
            "cbd_content": cbd_content,
            "effects": effects,
            "flavors": flavors,
            "ailments": ailments,
            "description": description,
            "price_range": price_range,
            "availability": availability,
            "image_url": image_url,
            "image_filename": image_filename,
            "created_by": admin_user.get('email', 'admin'),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Save to database
        await db.strains.insert_one(strain_data)
        
        return {
            "success": True,
            "message": "Strain created successfully",
            "strain_id": strain_data["id"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create strain: {str(e)}")

@router.put("/strains/{strain_id}", response_model=dict)
async def update_strain(
    strain_id: str,
    name: str = Form(...),
    category: str = Form(...),
    type: str = Form(...),
    thc_content: str = Form(None),
    cbd_content: str = Form(None),
    effects: str = Form(None),
    flavors: str = Form(None),
    ailments: str = Form(None),
    description: str = Form(...),
    price_range: str = Form(None),
    availability: bool = Form(True),
    image: Optional[UploadFile] = File(None),
    admin_user: dict = Depends(verify_admin_token)
):
    """Update an existing strain."""
    
    try:
        # Check if strain exists
        existing_strain = await db.strains.find_one({"id": strain_id})
        if not existing_strain:
            raise HTTPException(status_code=404, detail="Strain not found")
        
        # Handle image upload
        image_url = existing_strain.get("image_url")
        image_filename = existing_strain.get("image_filename")
        
        if image and image.filename:
            # Delete old image if exists
            if image_filename:
                old_file_path = os.path.join(UPLOAD_DIR, image_filename)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            
            # Validate and save new image
            if not image.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="Only image files are allowed")
            
            file_extension = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            image_filename = unique_filename
            image_url = f"/api/uploads/strains/{unique_filename}"
        
        # Update strain data
        update_data = {
            "name": name,
            "category": category,
            "type": type,
            "thc_content": thc_content,
            "cbd_content": cbd_content,
            "effects": effects,
            "flavors": flavors,
            "ailments": ailments,
            "description": description,
            "price_range": price_range,
            "availability": availability,
            "image_url": image_url,
            "image_filename": image_filename,
            "updated_at": datetime.utcnow()
        }
        
        # Update in database
        result = await db.strains.update_one(
            {"id": strain_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Strain not found")
        
        return {
            "success": True,
            "message": "Strain updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update strain: {str(e)}")

@router.delete("/strains/{strain_id}")
async def delete_strain(
    strain_id: str,
    admin_user: dict = Depends(verify_admin_token)
):
    """Delete a strain."""
    
    try:
        # Get strain to check for image file
        strain = await db.strains.find_one({"id": strain_id})
        if not strain:
            raise HTTPException(status_code=404, detail="Strain not found")
        
        # Delete image file if exists
        if strain.get('image_filename'):
            image_path = os.path.join(UPLOAD_DIR, strain['image_filename'])
            if os.path.exists(image_path):
                os.remove(image_path)
        
        # Delete from database
        result = await db.strains.delete_one({"id": strain_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Strain not found")
        
        return {
            "success": True,
            "message": "Strain deleted successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete strain: {str(e)}")

@router.get("/strains/category/{category}")
async def get_strains_by_category(
    category: str,
    admin_user: dict = Depends(verify_admin_token)
):
    """Get strains by category (lows, deps, za)."""
    
    try:
        strains_cursor = db.strains.find({"category": category}).sort("name", 1)
        strains_data = await strains_cursor.to_list(length=None)
        
        return {
            "strains": strains_data,
            "category": category,
            "count": len(strains_data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch strains: {str(e)}")

@router.get("/strains/stats")
async def get_strains_stats(admin_user: dict = Depends(verify_admin_token)):
    """Get strains statistics."""
    
    try:
        # Count by category
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
        async for result in db.strains.aggregate(pipeline):
            category_stats.append({
                "category": result["_id"],
                "count": result["count"]
            })
        
        # Count by type
        type_pipeline = [
            {
                "$group": {
                    "_id": "$type",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        type_stats = []
        async for result in db.strains.aggregate(type_pipeline):
            type_stats.append({
                "type": result["_id"],
                "count": result["count"]
            })
        
        # Total counts
        total_strains = await db.strains.count_documents({})
        available_strains = await db.strains.count_documents({"availability": True})
        
        return {
            "total_strains": total_strains,
            "available_strains": available_strains,
            "categories": category_stats,
            "types": type_stats,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@router.get("/strains/search/{query}")
async def search_strains(
    query: str,
    category: Optional[str] = None,
    strain_type: Optional[str] = None,
    admin_user: dict = Depends(verify_admin_token)
):
    """Search strains by name, effects, flavors, etc."""
    
    try:
        # Build search query
        search_filter = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"effects": {"$regex": query, "$options": "i"}},
                {"flavors": {"$regex": query, "$options": "i"}},
                {"ailments": {"$regex": query, "$options": "i"}}
            ]
        }
        
        if category:
            search_filter["category"] = category
        
        if strain_type:
            search_filter["type"] = strain_type
        
        # Search strains
        strains_cursor = db.strains.find(search_filter).sort("name", 1)
        strains_data = await strains_cursor.to_list(length=None)
        
        return {
            "strains": strains_data,
            "count": len(strains_data),
            "query": query,
            "filters": {
                "category": category,
                "type": strain_type
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")