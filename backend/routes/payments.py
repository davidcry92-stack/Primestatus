from fastapi import APIRouter, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from models.payment import CheckoutRequest, CheckoutResponse, PaymentStatusResponse, PaymentTransaction
from utils.database import db
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
from typing import Optional

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api/payments", tags=["payments"])
logger = logging.getLogger(__name__)

# Cannabis-friendly payment packages (fixed amounts to prevent manipulation)
CANNABIS_PACKAGES = {
    "small": {"amount": 25.00, "name": "Small Package", "description": "Starter package for new members"},
    "medium": {"amount": 50.00, "name": "Medium Package", "description": "Popular choice for regular members"},
    "large": {"amount": 100.00, "name": "Large Package", "description": "Premium package for loyal customers"},
    "premium": {"amount": 200.00, "name": "Premium Package", "description": "VIP package with exclusive benefits"}
}

@router.post("/checkout/session", response_model=CheckoutResponse)
async def create_checkout_session(
    request: CheckoutRequest,
    http_request: Request,
    user_email: Optional[str] = Header(None, alias="X-User-Email")
):
    """Create a Stripe checkout session for cannabis products."""
    try:
        # Validate package ID
        if request.package_id not in CANNABIS_PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid package ID")
        
        package = CANNABIS_PACKAGES[request.package_id]
        amount = package["amount"]
        
        # Get Stripe API key
        stripe_api_key = os.getenv("STRIPE_API_KEY")
        if not stripe_api_key:
            raise HTTPException(status_code=500, detail="Payment system not configured")
        
        # Initialize Stripe checkout
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/payments/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        # Build success and cancel URLs
        success_url = f"{request.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{request.origin_url}/checkout/cancel"
        
        # Prepare metadata
        metadata = {
            "package_id": request.package_id,
            "package_name": package["name"],
            "user_email": user_email or "guest",
            **(request.metadata or {})
        }
        
        # Create checkout session request
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency="usd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        # Create session with Stripe
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Store transaction in database
        transaction = PaymentTransaction(
            session_id=session.session_id,
            user_email=user_email,
            amount=amount,
            currency="usd",
            payment_status="pending",
            transaction_status="initiated",
            metadata=metadata
        )
        
        await db.payment_transactions.insert_one(transaction.dict())
        
        logger.info(f"Created checkout session {session.session_id} for package {request.package_id}")
        
        return CheckoutResponse(
            url=session.url,
            session_id=session.session_id
        )
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@router.get("/checkout/status/{session_id}", response_model=PaymentStatusResponse)
async def get_checkout_status(session_id: str):
    """Get the status of a checkout session."""
    try:
        # Get Stripe API key
        stripe_api_key = os.getenv("STRIPE_API_KEY")
        if not stripe_api_key:
            raise HTTPException(status_code=500, detail="Payment system not configured")
        
        # Initialize Stripe checkout
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        
        # Get status from Stripe
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update database record
        db = await get_database()
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        
        if transaction:
            # Convert amount from cents to dollars
            amount_dollars = checkout_status.amount_total / 100.0
            
            # Update transaction status if it has changed
            if transaction["payment_status"] != checkout_status.payment_status:
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "payment_status": checkout_status.payment_status,
                            "transaction_status": "completed" if checkout_status.payment_status == "paid" else "pending",
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
            
            return PaymentStatusResponse(
                status=checkout_status.status,
                payment_status=checkout_status.payment_status,
                amount_total=amount_dollars,
                currency=checkout_status.currency,
                metadata=checkout_status.metadata,
                transaction_status=transaction.get("transaction_status", "pending")
            )
        else:
            raise HTTPException(status_code=404, detail="Transaction not found")
            
    except Exception as e:
        logger.error(f"Error getting checkout status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get checkout status")

@router.post("/webhook/stripe")
async def handle_stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """Handle Stripe webhooks."""
    try:
        # Get request body
        body = await request.body()
        
        # Get Stripe API key
        stripe_api_key = os.getenv("STRIPE_API_KEY")
        if not stripe_api_key:
            raise HTTPException(status_code=500, detail="Payment system not configured")
        
        # Initialize Stripe checkout
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        # Update database based on webhook event
        if webhook_response.session_id:
            db = await get_database()
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {
                    "$set": {
                        "payment_status": webhook_response.payment_status,
                        "transaction_status": "completed" if webhook_response.payment_status == "paid" else "pending",
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            logger.info(f"Processed webhook for session {webhook_response.session_id}: {webhook_response.payment_status}")
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error handling webhook: {str(e)}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")

@router.get("/packages")
async def get_payment_packages():
    """Get available payment packages."""
    return {
        "packages": [
            {
                "id": package_id,
                "amount": package_data["amount"],
                "name": package_data["name"],
                "description": package_data["description"]
            }
            for package_id, package_data in CANNABIS_PACKAGES.items()
        ]
    }