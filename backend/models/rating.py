from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from .common import PyObjectId

class RatingBase(BaseModel):
    product_id: PyObjectId
    user_id: PyObjectId
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    review: Optional[str] = Field(None, max_length=500, description="Optional review text")
    experience: Optional[str] = Field(None, max_length=500, description="User's detailed experience with the product")

class RatingCreate(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = Field(None, max_length=500)

class Rating(RatingBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class RatingResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    rating: int
    review: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ProductRatingStats(BaseModel):
    product_id: str
    product_name: str
    total_ratings: int
    average_rating: float
    rating_distribution: dict  # {1: count, 2: count, 3: count, 4: count, 5: count}
    recent_reviews: list  # List of recent reviews with user info

class UserRatingHistory(BaseModel):
    user_id: str
    username: str
    total_ratings_given: int
    average_rating_given: float
    recent_ratings: list