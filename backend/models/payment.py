from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class PaymentTransaction(BaseModel):
    """Payment transaction model for MongoDB storage."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(..., description="Stripe checkout session ID")
    user_id: Optional[str] = Field(None, description="User ID if authenticated")
    user_email: Optional[str] = Field(None, description="User email")
    amount: float = Field(..., description="Payment amount in dollars")
    currency: str = Field(default="usd", description="Currency code")
    payment_status: str = Field(default="pending", description="Payment status from Stripe")
    transaction_status: str = Field(default="initiated", description="Internal transaction status")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class CheckoutRequest(BaseModel):
    """Request model for creating checkout session."""
    package_id: str = Field(..., description="Predefined package ID")
    origin_url: str = Field(..., description="Frontend origin URL")
    metadata: Optional[Dict[str, str]] = Field(None, description="Additional metadata")

class CheckoutResponse(BaseModel):
    """Response model for checkout session."""
    url: str = Field(..., description="Stripe checkout URL")
    session_id: str = Field(..., description="Checkout session ID")

class PaymentStatusResponse(BaseModel):
    """Response model for payment status."""
    status: str = Field(..., description="Checkout session status")
    payment_status: str = Field(..., description="Payment status")
    amount_total: float = Field(..., description="Total amount in dollars")
    currency: str = Field(..., description="Currency code")
    metadata: Dict[str, str] = Field(..., description="Session metadata")
    transaction_status: str = Field(..., description="Internal transaction status")