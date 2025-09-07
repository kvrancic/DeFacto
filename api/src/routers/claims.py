from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.claim import Claim
from src.schemas.claim import (
    ClaimSubmissionRequest,
    ClaimSubmissionResponse,
    ClaimDetailResponse,
    ClaimsListResponse,
    ClaimListItem
)
from src.services.algorand import AlgorandService
from src.services.ipfs import IPFSService
from src.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
algorand_service = AlgorandService()
ipfs_service = IPFSService()

@router.post("/submit", response_model=ClaimSubmissionResponse)
async def submit_claim(
    claim: ClaimSubmissionRequest,
    db: Session = Depends(get_db)
):
    """Submit a new claim"""
    try:
        # Prepare claim data for IPFS
        claim_data = {
            "title": claim.title,
            "content": claim.content,
            "category": claim.category,
            "evidence_urls": claim.evidence_urls or [],
            "submitted_at": datetime.utcnow().isoformat(),
            "submitter": "anonymous"  # In production, use actual user ID
        }
        
        # Upload to IPFS
        ipfs_hash = await ipfs_service.upload_claim(claim_data)
        
        # Submit to blockchain
        blockchain_result = await algorand_service.submit_claim_to_blockchain(
            ipfs_hash=ipfs_hash,
            category=claim.category
        )
        
        # Save to database for fast queries
        db_claim = Claim(
            claim_id=blockchain_result["claim_id"],
            title=claim.title,
            content=claim.content,
            category=claim.category,
            status="UNVERIFIED",
            ipfs_hash=ipfs_hash,
            tx_id=blockchain_result["tx_id"],
            voting_ends_at=datetime.utcnow() + timedelta(seconds=settings.voting_period_seconds)
        )
        
        db.add(db_claim)
        db.commit()
        db.refresh(db_claim)
        
        return ClaimSubmissionResponse(
            claim_id=db_claim.claim_id,
            ipfs_hash=ipfs_hash,
            tx_id=blockchain_result["tx_id"],
            status="UNVERIFIED",
            submitted_at=db_claim.submitted_at
        )
        
    except Exception as e:
        logger.error(f"Failed to submit claim: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{claim_id}", response_model=ClaimDetailResponse)
async def get_claim(
    claim_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific claim by ID"""
    try:
        # Try database first (faster)
        db_claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()
        
        if not db_claim:
            # Try blockchain if not in database
            blockchain_data = await algorand_service.get_claim_from_blockchain(claim_id)
            ipfs_data = await ipfs_service.get_claim(blockchain_data["ipfs_hash"])
            
            return ClaimDetailResponse(
                claim_id=claim_id,
                title=ipfs_data["title"],
                content=ipfs_data["content"],
                category=blockchain_data["category"],
                status=blockchain_data["status"],
                ipfs_hash=blockchain_data["ipfs_hash"],
                evidence_urls=ipfs_data.get("evidence_urls", []),
                yes_votes=0,
                no_votes=0,
                submitted_at=datetime.fromisoformat(ipfs_data["submitted_at"])
            )
        
        return ClaimDetailResponse(
            claim_id=db_claim.claim_id,
            title=db_claim.title,
            content=db_claim.content,
            category=db_claim.category,
            status=db_claim.status,
            ipfs_hash=db_claim.ipfs_hash,
            evidence_urls=[],  # Load from IPFS if needed
            yes_votes=db_claim.yes_votes,
            no_votes=db_claim.no_votes,
            submitted_at=db_claim.submitted_at,
            voting_ends_at=db_claim.voting_ends_at,
            propaganda_score=db_claim.propaganda_score
        )
        
    except Exception as e:
        logger.error(f"Failed to get claim {claim_id}: {e}")
        raise HTTPException(status_code=404, detail="Claim not found")

@router.get("/", response_model=ClaimsListResponse)
async def list_claims(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    status: Optional[str] = None,
    sort: str = Query("newest", pattern="^(newest|oldest|most_votes)$"),
    db: Session = Depends(get_db)
):
    """List claims with pagination and filters"""
    try:
        query = db.query(Claim)
        
        # Apply filters
        if category:
            query = query.filter(Claim.category == category)
        if status:
            query = query.filter(Claim.status == status)
        
        # Apply sorting
        if sort == "newest":
            query = query.order_by(Claim.submitted_at.desc())
        elif sort == "oldest":
            query = query.order_by(Claim.submitted_at.asc())
        elif sort == "most_votes":
            query = query.order_by((Claim.yes_votes + Claim.no_votes).desc())
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        claims = query.offset(offset).limit(limit).all()
        
        # Format response
        claim_items = [
            ClaimListItem(
                claim_id=c.claim_id,
                title=c.title,
                category=c.category,
                status=c.status,
                submitted_at=c.submitted_at,
                preview=c.content[:200] + "..." if len(c.content) > 200 else c.content,
                vote_count=c.yes_votes + c.no_votes
            )
            for c in claims
        ]
        
        return ClaimsListResponse(
            claims=claim_items,
            total=total,
            has_more=(offset + limit) < total
        )
        
    except Exception as e:
        logger.error(f"Failed to list claims: {e}")
        raise HTTPException(status_code=500, detail=str(e))