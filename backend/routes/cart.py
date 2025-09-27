from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Optional
from pydantic import BaseModel
from utils.database import products_collection, users_collection
from utils.auth import verify_token
from utils.verification import require_verified_user
from bson import ObjectId

router = APIRouter(prefix="/cart", tags=["cart"])

# In-memory cart storage (in production, use Redis or database)
cart_storage: Dict[str, List[dict]] = {}

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemResponse(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    price: float
    quantity: int
    total: float

@router.post("/add")
async def add_to_cart(
    item: CartItem,
    current_user_email: str = Depends(require_verified_user)
):
    """Add item to cart."""
    if not ObjectId.is_valid(item.product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    # Verify product exists and is in stock
    product = await products_collection.find_one({"_id": ObjectId(item.product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if not product["in_stock"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is out of stock"
        )
    
    # Initialize cart if doesn't exist
    if current_user_email not in cart_storage:
        cart_storage[current_user_email] = []
    
    user_cart = cart_storage[current_user_email]
    
    # Check if item already in cart
    existing_item = None
    for cart_item in user_cart:
        if cart_item["product_id"] == item.product_id:
            existing_item = cart_item
            break
    
    if existing_item:
        existing_item["quantity"] += item.quantity
    else:
        user_cart.append({
            "product_id": item.product_id,
            "quantity": item.quantity
        })
    
    return {"message": "Item added to cart successfully"}

@router.get("/", response_model=List[CartItemResponse])
async def get_cart(
    current_user_email: str = Depends(verify_token)
):
    """Get user's cart items."""
    if current_user_email not in cart_storage:
        return []
    
    user_cart = cart_storage[current_user_email]
    cart_items = []
    
    for cart_item in user_cart:
        product = await products_collection.find_one({"_id": ObjectId(cart_item["product_id"])})
        if product:  # Only include items for products that still exist
            cart_items.append(CartItemResponse(
                product_id=cart_item["product_id"],
                product_name=product["name"],
                product_image=product["image"],
                price=product["price"],
                quantity=cart_item["quantity"],
                total=round(product["price"] * cart_item["quantity"], 2)
            ))
    
    return cart_items

@router.put("/{product_id}")
async def update_cart_item(
    product_id: str,
    quantity: int,
    current_user_email: str = Depends(verify_token)
):
    """Update cart item quantity."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    if quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity cannot be negative"
        )
    
    if current_user_email not in cart_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    user_cart = cart_storage[current_user_email]
    
    # Find and update item
    for cart_item in user_cart:
        if cart_item["product_id"] == product_id:
            if quantity == 0:
                user_cart.remove(cart_item)
                return {"message": "Item removed from cart"}
            else:
                cart_item["quantity"] = quantity
                return {"message": "Cart item updated successfully"}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found in cart"
    )

@router.delete("/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user_email: str = Depends(verify_token)
):
    """Remove item from cart."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    if current_user_email not in cart_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    user_cart = cart_storage[current_user_email]
    
    # Find and remove item
    for cart_item in user_cart:
        if cart_item["product_id"] == product_id:
            user_cart.remove(cart_item)
            return {"message": "Item removed from cart successfully"}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found in cart"
    )

@router.delete("/")
async def clear_cart(
    current_user_email: str = Depends(verify_token)
):
    """Clear user's cart."""
    if current_user_email in cart_storage:
        cart_storage[current_user_email] = []
    
    return {"message": "Cart cleared successfully"}

@router.get("/summary")
async def get_cart_summary(
    current_user_email: str = Depends(verify_token)
):
    """Get cart summary (total items, total price)."""
    if current_user_email not in cart_storage:
        return {"total_items": 0, "total_price": 0.0}
    
    user_cart = cart_storage[current_user_email]
    total_items = 0
    total_price = 0.0
    
    for cart_item in user_cart:
        product = await products_collection.find_one({"_id": ObjectId(cart_item["product_id"])})
        if product:
            total_items += cart_item["quantity"]
            total_price += product["price"] * cart_item["quantity"]
    
    return {
        "total_items": total_items,
        "total_price": round(total_price, 2)
    }