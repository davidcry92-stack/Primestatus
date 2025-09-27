from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .common import PyObjectId

class DailyDealBase(BaseModel):
    product_id: PyObjectId
    discount: float = Field(..., gt=0, le=100)  # Percentage discount
    valid_until: datetime
    reason: str = Field(default="Limited time offer")
    is_active: bool = True

class DailyDealCreate(BaseModel):
    product_id: str
    discount: float = Field(..., gt=0, le=100)
    valid_until: datetime
    reason: str = Field(default="Limited time offer")

class DailyDeal(DailyDealBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class DailyDealResponse(BaseModel):
    id: str
    product_id: str
    discount: float
    valid_until: datetime
    reason: str
    is_active: bool
    created_at: datetime