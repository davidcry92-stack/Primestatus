from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId
from .common import PyObjectId

class AdminBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(default="admin", pattern="^(admin|super_admin)$")
    is_active: bool = Field(default=True)

class AdminCreate(AdminBase):
    password: str = Field(..., min_length=8)

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class Admin(AdminBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}

class AdminResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminResponse