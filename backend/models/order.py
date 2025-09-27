from pydantic import BaseModel, Field
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

class OrderItem(BaseModel):
    product_id: PyObjectId
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)

class OrderItemResponse(BaseModel):
    product_id: str
    quantity: int
    price: float
    product_name: Optional[str] = None

class OrderBase(BaseModel):
    user_id: PyObjectId
    items: List[OrderItem]
    total: float = Field(..., gt=0)
    delivery_address: str
    status: str = Field(default="pending", pattern="^(pending|confirmed|preparing|out_for_delivery|delivered|cancelled)$")

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    delivery_address: str

class Order(OrderBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[OrderItemResponse]
    total: float
    delivery_address: str
    status: str
    created_at: datetime
    updated_at: datetime