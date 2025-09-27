from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .common import PyObjectId

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., pattern="^(flower|edibles|concentrates)$")
    price: float = Field(..., gt=0)
    original_price: Optional[float] = None
    image: str
    description: str = Field(..., max_length=500)
    thc: str
    vendor: str
    tier: str = Field(default="za", pattern="^(za|deps|lows)$")  # Added tier field
    in_stock: bool = True
    rating: float = Field(default=0, ge=0, le=5)
    reviews: int = Field(default=0, ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image: Optional[str] = None
    description: Optional[str] = None
    thc: Optional[str] = None
    vendor: Optional[str] = None
    tier: Optional[str] = None
    in_stock: Optional[bool] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None

class Product(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ProductResponse(BaseModel):
    id: str
    name: str
    category: str
    price: float
    original_price: Optional[float] = None
    image: str
    description: str
    thc: str
    vendor: str
    tier: str
    in_stock: bool
    rating: float
    reviews: int
    daily_deal: Optional[bool] = False
    created_at: datetime
    updated_at: datetime