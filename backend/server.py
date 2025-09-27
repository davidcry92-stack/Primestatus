from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Import route modules
from routes import auth, products, daily_deals, wictionary, orders, cart
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

# Include the main router in the app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
