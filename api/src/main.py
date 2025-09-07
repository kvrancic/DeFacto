from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager

from src.config import settings
from src.database import init_db
from src.routers import claims, validations, predictions, users, websocket
from src.services.algorand import AlgorandService
from src.services.ipfs import IPFSService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize services
algorand_service = None
ipfs_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting DeFacto API...")
    
    # Initialize database
    init_db()
    logger.info("✅ Database initialized")
    
    # Initialize services
    global algorand_service, ipfs_service
    algorand_service = AlgorandService()
    ipfs_service = IPFSService()
    
    # Test connections
    try:
        await algorand_service.health_check()
        logger.info("✅ Algorand connection successful")
    except Exception as e:
        logger.warning(f"⚠️ Algorand connection failed (using mock mode): {e}")
    
    try:
        await ipfs_service.health_check()
        logger.info("✅ IPFS connection successful")
    except Exception as e:
        logger.warning(f"⚠️ IPFS connection failed (using mock mode): {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down DeFacto API...")

# Create FastAPI app
app = FastAPI(
    title="DeFacto Protocol API",
    description="Decentralized fact-checking platform on Algorand",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Check API health and service status"""
    status = {
        "api": "healthy",
        "algorand": "unknown",
        "ipfs": "unknown",
        "database": "unknown"
    }
    
    try:
        if algorand_service:
            await algorand_service.health_check()
            status["algorand"] = "healthy"
    except:
        status["algorand"] = "unhealthy"
    
    try:
        if ipfs_service:
            await ipfs_service.health_check()
            status["ipfs"] = "healthy"
    except:
        status["ipfs"] = "unhealthy"
    
    # Check database
    try:
        from src.database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        status["database"] = "healthy"
    except:
        status["database"] = "unhealthy"
    
    overall_health = all(v == "healthy" for v in status.values())
    return JSONResponse(
        status_code=200 if overall_health else 503,
        content=status
    )

# Include routers
app.include_router(claims.router, prefix="/claims", tags=["claims"])
app.include_router(validations.router, prefix="/validations", tags=["validations"])
app.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(websocket.router, prefix="/ws", tags=["websocket"])

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "DeFacto Protocol API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )