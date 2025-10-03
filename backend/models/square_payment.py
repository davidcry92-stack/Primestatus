from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class SquarePaymentRequest(BaseModel):
    source_id: str = Field(..., description="Square payment source ID from frontend")
    amount_money: int = Field(..., description="Amount in cents")
    currency: str = Field(default="USD", description="Currency code")
    reference_id: Optional[str] = Field(None, description="Reference ID for the payment")
    note: Optional[str] = Field(None, description="Payment note")
    order_id: Optional[str] = Field(None, description="Associated order ID")

class SquarePaymentItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: int  # in cents
    total_price: int  # in cents

class SquareOrderRequest(BaseModel):
    items: List[SquarePaymentItem]
    user_email: str
    user_name: str
    pickup_notes: Optional[str] = Field(None)
    payment_source_id: str = Field(..., description="Square payment source ID")

class SquarePaymentResponse(BaseModel):
    success: bool
    payment_id: Optional[str] = None
    order_id: Optional[str] = None
    receipt_url: Optional[str] = None
    amount_money: Optional[int] = None
    status: Optional[str] = None
    error_message: Optional[str] = None

class SquareOrder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    square_order_id: Optional[str] = None
    square_payment_id: Optional[str] = None
    user_email: str
    user_name: str
    items: List[SquarePaymentItem]
    total_amount: int  # in cents
    status: str = Field(default="pending")  # pending, paid, completed, cancelled
    pickup_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SquareWebhookEvent(BaseModel):
    event_id: str
    event_type: str
    merchant_id: str
    location_id: str
    created_at: str
    data: Dict[str, Any]