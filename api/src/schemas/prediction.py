from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime

class PredictionMarket(BaseModel):
    market_id: int
    claim_id: int
    title: str
    description: str
    total_yes_stake: float
    total_no_stake: float
    yes_price: float  # Price to buy YES position (0-1)
    no_price: float   # Price to buy NO position (0-1)
    expires_at: datetime
    resolved: bool = False
    outcome: Optional[bool] = None

class CreateMarketRequest(BaseModel):
    claim_id: int
    initial_liquidity: float = Field(..., ge=100, le=10000)
    duration_hours: int = Field(24, ge=1, le=168)  # 1 hour to 1 week

class CreateMarketResponse(BaseModel):
    market_id: int
    tx_id: str
    yes_price: float
    no_price: float

class PlaceBetRequest(BaseModel):
    market_id: int
    position: str = Field(..., pattern="^(YES|NO)$")
    amount: float = Field(..., ge=10, le=1000)

class PlaceBetResponse(BaseModel):
    tx_id: str
    shares_bought: float
    avg_price: float
    potential_payout: float

class MarketPosition(BaseModel):
    market_id: int
    position: str  # YES or NO
    shares: float
    avg_buy_price: float
    current_value: float
    potential_payout: float

class UserPositionsResponse(BaseModel):
    positions: List[MarketPosition]
    total_invested: float
    total_current_value: float