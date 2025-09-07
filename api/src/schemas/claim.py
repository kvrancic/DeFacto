from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from src.config import settings

class ClaimSubmissionRequest(BaseModel):
    title: str = Field(..., min_length=10, max_length=200)
    content: str = Field(..., min_length=50, max_length=5000)
    category: str
    evidence_urls: Optional[List[str]] = Field(default_factory=list, max_items=10)
    
    @validator('category')
    def validate_category(cls, v):
        if v not in settings.valid_categories:
            raise ValueError(f'Category must be one of {settings.valid_categories}')
        return v
    
    @validator('evidence_urls')
    def validate_urls(cls, v):
        if v:
            for url in v:
                if not url.startswith(('http://', 'https://')):
                    raise ValueError(f'Invalid URL: {url}')
        return v

class ClaimSubmissionResponse(BaseModel):
    claim_id: int
    ipfs_hash: str
    tx_id: str
    status: str = "UNVERIFIED"
    submitted_at: datetime

class ClaimDetailResponse(BaseModel):
    claim_id: int
    title: str
    content: str
    category: str
    status: str
    ipfs_hash: str
    evidence_urls: List[str]
    yes_votes: int
    no_votes: int
    submitted_at: datetime
    voting_ends_at: Optional[datetime]
    propaganda_score: Optional[float]

class ClaimListItem(BaseModel):
    claim_id: int
    title: str
    category: str
    status: str
    submitted_at: datetime
    preview: Optional[str]
    vote_count: Optional[int]

class ClaimsListResponse(BaseModel):
    claims: List[ClaimListItem]
    total: int
    has_more: bool