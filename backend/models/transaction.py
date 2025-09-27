from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .common import PyObjectId
from enum import Enum

class PaymentMethod(str, Enum):
    IN_APP = "in_app"
    CASH_IN_STORE = "cash_in_store"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    PAID_IN_APP = "paid_in_app"
    AWAITING_PICKUP = "awaiting_pickup"
    PICKED_UP = "picked_up"
    CASH_PAID_IN_STORE = "cash_paid_in_store"
    CANCELLED = "cancelled"

class TransactionItem(BaseModel):
    product_id: PyObjectId
    product_name: str
    quantity: int
    price: float
    tier: str  # za, deps, lows

class TransactionBase(BaseModel):
    user_id: PyObjectId
    items: List[TransactionItem]
    total: float = Field(..., gt=0)
    payment_method: PaymentMethod
    payment_code: str = Field(..., description="6-digit pickup code")
    status: TransactionStatus = Field(default=TransactionStatus.PENDING)
    notes: Optional[str] = None

class TransactionCreate(BaseModel):
    items: List[dict]  # Will be converted to TransactionItem
    payment_method: PaymentMethod
    notes: Optional[str] = None

class Transaction(TransactionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    picked_up_at: Optional[datetime] = None
    admin_who_processed: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}

class TransactionResponse(BaseModel):
    id: str
    user_id: str
    items: List[TransactionItem]
    total: float
    payment_method: PaymentMethod
    payment_code: str
    status: TransactionStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    picked_up_at: Optional[datetime] = None
    admin_who_processed: Optional[str] = None

class AdminTransactionUpdate(BaseModel):
    payment_code: str
    action: str = Field(..., pattern="^(mark_picked_up|mark_cash_paid)$")
    admin_email: str
    notes: Optional[str] = None