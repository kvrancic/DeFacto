from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.claim import Claim
from src.schemas.validation import (
    VoteSubmissionRequest,
    VoteSubmissionResponse,
    PendingValidation,
    PendingValidationsResponse
)
from src.services.algorand import AlgorandService
from src.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
algorand_service = AlgorandService()

@router.post("/vote", response_model=VoteSubmissionResponse)
async def submit_vote(
    vote_request: VoteSubmissionRequest,
    db: Session = Depends(get_db)
):
    """Submit a vote for a claim"""
    try:
        # Check if claim exists and voting is open
        claim = db.query(Claim).filter(Claim.claim_id == vote_request.claim_id).first()
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        if claim.voting_ends_at and datetime.utcnow() > claim.voting_ends_at:
            raise HTTPException(status_code=400, detail="Voting period closed")
        
        # Submit vote to blockchain
        tx_id = await algorand_service.submit_vote(
            claim_id=vote_request.claim_id,
            vote=vote_request.vote,
            stake_amount=vote_request.stake_amount
        )
        
        # Update vote counts in database (cache)
        if vote_request.vote:
            claim.yes_votes += 1
            claim.total_stake += vote_request.stake_amount
        else:
            claim.no_votes += 1
            claim.total_stake += vote_request.stake_amount
        
        db.commit()
        
        return VoteSubmissionResponse(
            status="vote_submitted",
            tx_id=tx_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to submit vote: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pending", response_model=PendingValidationsResponse)
async def get_pending_validations(
    db: Session = Depends(get_db)
):
    """Get claims pending validation"""
    try:
        # Get claims where voting is still open
        now = datetime.utcnow()
        pending_claims = db.query(Claim).filter(
            Claim.status == "UNVERIFIED",
            Claim.voting_ends_at > now
        ).all()
        
        validations = []
        for claim in pending_claims:
            time_remaining = int((claim.voting_ends_at - now).total_seconds())
            
            validations.append(PendingValidation(
                claim_id=claim.claim_id,
                title=claim.title,
                category=claim.category,
                time_remaining=time_remaining,
                current_votes={
                    "yes": claim.yes_votes,
                    "no": claim.no_votes,
                    "total_stake": claim.total_stake
                },
                user_can_vote=True  # In production, check if user already voted
            ))
        
        return PendingValidationsResponse(
            validations=validations,
            user_balance=settings.initial_reputation  # In production, get actual balance
        )
        
    except Exception as e:
        logger.error(f"Failed to get pending validations: {e}")
        raise HTTPException(status_code=500, detail=str(e))