from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from src.services.algorand import AlgorandService
from src.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
algorand_service = AlgorandService()

@router.post("/opt-in")
async def opt_in_user(
    address: Optional[str] = None
):
    """Opt in user to reputation system"""
    try:
        result = await algorand_service.opt_in_user(address)
        return result
    except Exception as e:
        logger.error(f"Failed to opt in user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/balance/{address}")
async def get_user_balance(address: str):
    """Get user's reputation token balance"""
    try:
        balance = await algorand_service.get_user_balance(address)
        return {"address": address, "balance": balance}
    except Exception as e:
        logger.error(f"Failed to get balance: {e}")
        raise HTTPException(status_code=500, detail=str(e))