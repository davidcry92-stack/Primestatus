from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from .common import PyObjectId

class UserPreferences(BaseModel):
    categories: List[str] = []
    vendors: List[str] = []
    price_range: List[float] = [0, 200]

class IDVerification(BaseModel):
    id_front_url: Optional[str] = None
    id_back_url: Optional[str] = None
    medical_document_url: Optional[str] = None  # For under 21 users
    verification_status: str = Field(default="pending", pattern="^(pending|approved|rejected|needs_medical)$")
    verified_at: Optional[datetime] = None
    rejected_reason: Optional[str] = None
    age_verified: Optional[int] = None  # Age from ID verification
    requires_medical: bool = Field(default=False)  # True if under 21

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    date_of_birth: str = Field(..., description="YYYY-MM-DD format")
    membership_tier: str = Field(default="basic", pattern="^(basic|premium)$")
    is_law_enforcement: bool = Field(default=False)
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    wictionary_access: bool = Field(default=False)
    id_verification: IDVerification = Field(default_factory=IDVerification)
    is_verified: bool = Field(default=False)
    parent_email: Optional[str] = None  # For under 21 users

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    member_since: datetime = Field(default_factory=datetime.utcnow)
    order_history: List[PyObjectId] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    membership_tier: str
    member_since: datetime
    preferences: UserPreferences
    wictionary_access: bool
    order_history: List[str] = []
    is_verified: bool
    verification_status: str
    requires_medical: bool
    age_verified: Optional[int] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse