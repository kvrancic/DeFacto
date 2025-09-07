from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime

class VoteSubmissionRequest(BaseModel):
    claim_id: int
    vote: bool  # true = valid, false = invalid
    stake_amount: int = Field(..., ge=10, le=100)

class VoteSubmissionResponse(BaseModel):
    status: str = "vote_submitted"
    tx_id: str
    new_balance: Optional[int] = None

class PendingValidation(BaseModel):
    claim_id: int
    title: str
    category: str
    time_remaining: int  # seconds
    current_votes: Dict[str, int]
    user_can_vote: bool = True

class PendingValidationsResponse(BaseModel):
    validations: List[PendingValidation]
    user_balance: Optional[int] = None