from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import math

from src.database import get_db
from src.schemas.prediction import (
    PredictionMarket,
    CreateMarketRequest,
    CreateMarketResponse,
    PlaceBetRequest,
    PlaceBetResponse,
    MarketPosition,
    UserPositionsResponse
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Try to import mock blockchain
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../contracts/src'))

try:
    from mock_blockchain import get_blockchain
    USE_BLOCKCHAIN = True
    logger.info("Using blockchain for prediction markets")
except ImportError:
    USE_BLOCKCHAIN = False
    logger.info("Using in-memory storage for prediction markets")

# In-memory storage for MVP (use database in production)
markets = {}
positions = {}
market_counter = 0

def calculate_price(yes_stake: float, no_stake: float) -> tuple[float, float]:
    """Calculate market prices using constant product AMM"""
    total = yes_stake + no_stake
    if total == 0:
        return 0.5, 0.5
    
    yes_price = yes_stake / total
    no_price = no_stake / total
    
    yes_price = max(0.01, min(0.99, yes_price))
    no_price = max(0.01, min(0.99, no_price))
    
    return yes_price, no_price

@router.post("/create-market", response_model=CreateMarketResponse)
async def create_prediction_market(
    request: CreateMarketRequest,
    db: Session = Depends(get_db)
):
    """Create a new prediction market for a claim"""
    try:
        # Use blockchain if available
        if USE_BLOCKCHAIN:
            try:
                blockchain = get_blockchain()
                result = blockchain.create_market(request.claim_id, request.initial_liquidity)
                return CreateMarketResponse(
                    market_id=result["market_id"],
                    tx_id=result["tx_id"],
                    yes_price=result["yes_price"],
                    no_price=result["no_price"]
                )
            except Exception as e:
                logger.error(f"Blockchain market creation failed: {e}")
                # Fall back to in-memory
        
        # In-memory implementation
        global market_counter
        
        from src.models.claim import Claim
        claim = db.query(Claim).filter(Claim.claim_id == request.claim_id).first()
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        existing = next((m for m in markets.values() if m["claim_id"] == request.claim_id), None)
        if existing:
            raise HTTPException(status_code=400, detail="Market already exists for this claim")
        
        market_counter += 1
        market_id = market_counter
        
        initial_yes = request.initial_liquidity / 2
        initial_no = request.initial_liquidity / 2
        
        yes_price, no_price = calculate_price(initial_yes, initial_no)
        
        market = {
            "market_id": market_id,
            "claim_id": request.claim_id,
            "title": f"Will '{claim.title}' be verified as TRUE?",
            "description": f"Prediction market for claim #{request.claim_id}",
            "total_yes_stake": initial_yes,
            "total_no_stake": initial_no,
            "yes_price": yes_price,
            "no_price": no_price,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=request.duration_hours),
            "resolved": False,
            "outcome": None,
            "total_volume": 0
        }
        
        markets[market_id] = market
        
        return CreateMarketResponse(
            market_id=market_id,
            tx_id=f"market_tx_{market_id}",
            yes_price=yes_price,
            no_price=no_price
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create market: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/markets", response_model=List[PredictionMarket])
async def list_markets(
    status: Optional[str] = Query(None, pattern="^(open|closed|resolved)$"),
    claim_id: Optional[int] = None
):
    """List all prediction markets"""
    try:
        result = []
        now = datetime.utcnow()
        
        for market in markets.values():
            if claim_id and market["claim_id"] != claim_id:
                continue
            
            if status == "open" and (market["resolved"] or now > market["expires_at"]):
                continue
            elif status == "closed" and (market["resolved"] or now <= market["expires_at"]):
                continue
            elif status == "resolved" and not market["resolved"]:
                continue
            
            result.append(PredictionMarket(
                market_id=market["market_id"],
                claim_id=market["claim_id"],
                title=market["title"],
                description=market["description"],
                total_yes_stake=market["total_yes_stake"],
                total_no_stake=market["total_no_stake"],
                yes_price=market["yes_price"],
                no_price=market["no_price"],
                expires_at=market["expires_at"],
                resolved=market["resolved"],
                outcome=market["outcome"]
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to list markets: {e}")
        raise HTTPException(status_code=500, detail=str(e))