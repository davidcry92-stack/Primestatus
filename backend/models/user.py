from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserPreferences(BaseModel):
    categories: List[str] = []
    vendors: List[str] = []
    price_range: List[float] = [0, 200]
    delivery_area: str = "Manhattan"

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    membership_tier: str = Field(default="basic", pattern="^(basic|premium)$")
    is_law_enforcement: bool = Field(default=False)
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    wictionary_access: bool = Field(default=False)

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
    membership_tier: str
    member_since: datetime
    preferences: UserPreferences
    wictionary_access: bool
    order_history: List[str] = []

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse