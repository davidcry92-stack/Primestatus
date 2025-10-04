from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Import route modules
from routes import auth, products, daily_deals, wictionary, orders, cart, admin, admin_auth, ratings, payments, transactions, square_payments, admin_health_aid, admin_strains, cash_pickups, daily_reports, prepaid_orders
from utils.database import DatabaseManager

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(
    title="StatusXSmoakland API",
    description="Members-only cannabis marketplace API for NYC",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "StatusXSmoakland API is running", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "StatusXSmoakland API is operational"}

# Include all route modules
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(daily_deals.router)
api_router.include_router(wictionary.router)
api_router.include_router(orders.router)
api_router.include_router(cart.router)
api_router.include_router(admin.router)
api_router.include_router(admin_auth.router)
api_router.include_router(ratings.router)
api_router.include_router(payments.router)
api_router.include_router(transactions.router)
api_router.include_router(square_payments.router, prefix="/square")
api_router.include_router(admin_health_aid.router, prefix="/admin/wictionary")
api_router.include_router(admin_strains.router, prefix="/admin")
api_router.include_router(cash_pickups.router)
api_router.include_router(daily_reports.router)
api_router.include_router(prepaid_orders.router)

# Include the main router in the app
app.include_router(api_router)

# Mount static files for video and image uploads
uploads_dir = "/app/uploads"
os.makedirs(uploads_dir, exist_ok=True)
os.makedirs(f"{uploads_dir}/videos", exist_ok=True)
os.makedirs(f"{uploads_dir}/strains", exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# CORS middleware - Production ready configuration
cors_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
if cors_origins == ['*']:
    # Allow common development and production origins
    cors_origins = [
        "*",  # Keep wildcard for flexibility but add specific origins
        "http://localhost:3000",  # Local development
        "https://localhost:3000",  # Local development HTTPS
    ]
    # Add Emergent production domain pattern if available
    app_domain = os.environ.get('APP_DOMAIN')
    if app_domain:
        cors_origins.extend([
            f"https://{app_domain}",
            f"https://{app_domain}.emergent.host",
            "https://blank-screen-fix-1.preview.emergentagent.com"
        ])

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    logger.info("Initializing StatusXSmoakland database...")
    await DatabaseManager.init_database()
    logger.info("Database initialization complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown."""
    logger.info("Shutting down StatusXSmoakland API...")
    # Database connection will be closed automatically
