from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

async def update_user_purchases_and_tokens(user_email: str, db: AsyncIOMotorDatabase):
    """Internal function to update user purchases count and award tokens"""
    user = await db.users.find_one({"email": user_email})
    if not user:
        return
    
    profile = user.get("profile", {})
    current_purchases = profile.get("purchases_count", 0)
    current_tokens = profile.get("tokens_balance", 0)
    
    # Increment purchases
    new_purchases = current_purchases + 1
    
    # Award tokens every 12 purchases
    new_tokens = current_tokens
    if new_purchases % 12 == 0:
        new_tokens += 10
    
    # Update user
    await db.users.update_one(
        {"email": user_email},
        {
            "$set": {
                "profile.purchases_count": new_purchases,
                "profile.tokens_balance": new_tokens,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return new_purchases, new_tokens