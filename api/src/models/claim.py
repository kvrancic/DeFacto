from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from src.database import Base
from datetime import datetime

class Claim(Base):
    __tablename__ = "claims"
    
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, unique=True, index=True)  # Blockchain ID
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    status = Column(String(20), default="UNVERIFIED", index=True)
    ipfs_hash = Column(String(100), unique=True, nullable=False)
    tx_id = Column(String(100))
    
    # Vote counts (cached from blockchain)
    yes_votes = Column(Integer, default=0)
    no_votes = Column(Integer, default=0)
    total_stake = Column(Integer, default=0)
    
    # Metadata
    submitted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    voting_ends_at = Column(DateTime)
    
    # ML analysis (optional)
    propaganda_score = Column(Float)
    risk_level = Column(String(20))