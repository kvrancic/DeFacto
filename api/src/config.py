from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    # Algorand
    algorand_node_url: str = "http://localhost:4001"
    algorand_indexer_url: str = "http://localhost:8980"
    algorand_network: str = "localnet"
    service_account_mnemonic: str = "your 25 word mnemonic here"
    
    # IPFS
    ipfs_api_url: str = "http://localhost:5001"
    ipfs_gateway_url: str = "http://localhost:8080"
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_reload: bool = True
    api_workers: int = 1
    
    # Database
    database_url: str = "sqlite:///./defacto.db"
    
    # Security
    secret_key: str = "your-secret-key-here-change-in-production"
    access_token_expire_minutes: int = 30
    
    # Frontend
    frontend_url: str = "http://localhost:3000"
    
    # ML Service
    ml_service_url: str = "http://localhost:8001"
    ml_service_enabled: bool = False
    
    # Contracts
    claim_registry_app_id: int = 0
    reputation_token_app_id: int = 0
    validation_pool_app_id: int = 0
    prediction_market_app_id: int = 0
    
    # Validation Rules
    min_claim_title_length: int = 10
    max_claim_title_length: int = 200
    min_claim_content_length: int = 50
    max_claim_content_length: int = 5000
    min_stake_amount: int = 10
    max_stake_amount: int = 100
    voting_period_seconds: int = 86400  # 24 hours
    min_validators: int = 5
    initial_reputation: int = 100
    
    # Categories
    valid_categories: list = ["news", "science", "politics", "health", "technology"]
    valid_statuses: list = ["UNVERIFIED", "VERIFIED", "FALSE", "DISPUTED"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

# Load contract IDs from deployment file if exists
def load_contract_ids():
    deployment_file = Path("../contracts/deployment_output.json")
    if deployment_file.exists():
        import json
        with open(deployment_file) as f:
            data = json.load(f)
            settings.claim_registry_app_id = data.get("claim_registry_app_id", 0)
            settings.reputation_token_app_id = data.get("reputation_token_app_id", 0)
            settings.validation_pool_app_id = data.get("validation_pool_app_id", 0)
            settings.prediction_market_app_id = data.get("prediction_market_app_id", 0)

load_contract_ids()