from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class StructuredDeal(BaseModel):
    product_name: str = Field(..., description="Product name")
    discount_percentage: int = Field(..., description="Discount percentage")
    original_price: float = Field(default=0.0, description="Original price")
    deal_description: Optional[str] = Field(None, description="Deal description")

class DailyDealCreate(BaseModel):
    category: str = Field(..., description="Product category (lows, deps, za, etc.)")
    title: str = Field(..., description="Deal title")
    message: str = Field(..., description="Deal message")
    structured_deals: Optional[List[StructuredDeal]] = Field(default=[], description="Structured deals")
    expires_at: Optional[datetime] = Field(None, description="Expiration time")

class DailyDeal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    title: str
    message: str
    structured_deals: Optional[List[StructuredDeal]] = Field(default=[])
    video_url: Optional[str] = Field(None, description="Uploaded video URL")
    video_filename: Optional[str] = Field(None, description="Video filename")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(..., description="Expiration time")
    created_by: str = Field(..., description="Admin user ID")
    is_active: bool = Field(default=True)

class DeliverySignup(BaseModel):
    email: str = Field(..., description="Email address for delivery notifications")
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)

class DailyDealResponse(BaseModel):
    deals: List[DailyDeal]
    count: int

class DeliverySignupResponse(BaseModel):
    message: str
    email: str