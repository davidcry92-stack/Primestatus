from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from models.product import Product, ProductCreate, ProductUpdate, ProductResponse
from models.daily_deal import DailyDeal
from utils.database import products_collection, daily_deals_collection, convert_object_id
from utils.auth import verify_token
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = Query(None, pattern="^(flower|edibles|concentrates|vapes)$"),
    tier: Optional[str] = Query(None, pattern="^(za|deps|lows)$"),
    vendor: Optional[str] = None,
    in_stock: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """Get products with optional filtering."""
    # Build filter query
    query = {}
    if category:
        query["category"] = category
    if tier:
        query["tier"] = tier
    if vendor:
        query["vendor"] = {"$regex": vendor, "$options": "i"}
    if in_stock is not None:
        query["in_stock"] = in_stock
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" in query:
            query["price"]["$lte"] = max_price
        else:
            query["price"] = {"$lte": max_price}
    
    # Get products
    cursor = products_collection.find(query).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    
    # Get current daily deals
    current_deals = await daily_deals_collection.find({
        "valid_until": {"$gt": datetime.utcnow()},
        "is_active": True
    }).to_list(length=None)
    
    deal_product_ids = {str(deal["product_id"]) for deal in current_deals}
    
    # Convert and add daily deal flag
    product_responses = []
    for product in products:
        product_data = convert_object_id(product)
        product_data["daily_deal"] = product_data["id"] in deal_product_ids
        product_responses.append(ProductResponse(**product_data))
    
    return product_responses

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get a single product by ID."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if product has active daily deal
    deal = await daily_deals_collection.find_one({
        "product_id": ObjectId(product_id),
        "valid_until": {"$gt": datetime.utcnow()},
        "is_active": True
    })
    
    product_data = convert_object_id(product)
    product_data["daily_deal"] = deal is not None
    
    return ProductResponse(**product_data)

# Admin routes
@router.post("/admin/products", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    current_user_email: str = Depends(verify_token)
):
    """Create a new product (admin only)."""
    # TODO: Add admin role check
    
    product_dict = product_data.dict()
    if not product_dict.get("original_price"):
        product_dict["original_price"] = product_dict["price"]
    
    result = await products_collection.insert_one(product_dict)
    
    created_product = await products_collection.find_one({"_id": result.inserted_id})
    product_response_data = convert_object_id(created_product)
    product_response_data["daily_deal"] = False
    
    return ProductResponse(**product_response_data)

@router.put("/admin/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    updates: ProductUpdate,
    current_user_email: str = Depends(verify_token)
):
    """Update a product (admin only)."""
    # TODO: Add admin role check
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    # Remove None values
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid updates provided"
        )
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    updated_product = await products_collection.find_one({"_id": ObjectId(product_id)})
    product_data = convert_object_id(updated_product)
    product_data["daily_deal"] = False  # You might want to check for actual deals
    
    return ProductResponse(**product_data)

@router.delete("/admin/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user_email: str = Depends(verify_token)
):
    """Delete a product (admin only)."""
    # TODO: Add admin role check
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    result = await products_collection.delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return {"message": "Product deleted successfully"}