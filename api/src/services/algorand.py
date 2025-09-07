import sys
import os
# Add contracts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../contracts/src'))

from algosdk import account, mnemonic
from algosdk.v2client import algod, indexer
from algosdk.transaction import ApplicationCallTxn, StateSchema, Transaction
from algosdk.atomic_transaction_composer import AtomicTransactionComposer, TransactionWithSigner
from algosdk.abi import Method, Contract
from algosdk.logic import get_application_address
import base64
import json
import logging
from typing import Dict, Any, Optional, List
from src.config import settings
import random

logger = logging.getLogger(__name__)

# Try to import mock blockchain
try:
    from mock_blockchain import get_blockchain
    USE_MOCK_BLOCKCHAIN = True
    logger.info("Using mock blockchain implementation")
except ImportError:
    USE_MOCK_BLOCKCHAIN = False
    logger.info("Mock blockchain not available, using fallback mock mode")

class AlgorandService:
    def __init__(self):
        self.algod_client = None
        self.indexer_client = None
        self.service_account = None
        self.mock_mode = True  # Start in mock mode
        
        try:
            # Try to initialize Algorand clients
            self.algod_client = algod.AlgodClient(
                algod_token="",
                algod_address=settings.algorand_node_url
            )
            
            self.indexer_client = indexer.IndexerClient(
                indexer_token="",
                indexer_address=settings.algorand_indexer_url
            )
            
            # Test connection
            self.algod_client.status()
            self.mock_mode = False
            logger.info("Connected to Algorand node")
            
            # Load service account only if connected
            if settings.service_account_mnemonic != "your 25 word mnemonic here":
                self.service_account = self._load_service_account()
            else:
                logger.warning("No service account configured, using mock mode")
                self.mock_mode = True
                
        except Exception as e:
            logger.warning(f"Cannot connect to Algorand, using mock mode: {e}")
            self.mock_mode = True
        
        # Contract app IDs
        self.claim_registry_id = settings.claim_registry_app_id
        self.reputation_token_id = settings.reputation_token_app_id
        self.validation_pool_id = settings.validation_pool_app_id
        self.prediction_market_id = settings.prediction_market_app_id
        
        # Mock data storage
        self.mock_claims = {}
        self.mock_claim_counter = 0
        self.mock_user_balances = {}
    
    def _load_service_account(self) -> Dict[str, str]:
        """Load service account from mnemonic"""
        try:
            private_key = mnemonic.to_private_key(settings.service_account_mnemonic)
            address = account.address_from_private_key(private_key)
            
            return {
                "address": address,
                "private_key": private_key
            }
        except Exception as e:
            logger.error(f"Failed to load service account: {e}")
            return None
    
    async def health_check(self) -> bool:
        """Check if Algorand node is accessible"""
        if self.mock_mode:
            return True
            
        try:
            status = self.algod_client.status()
            return status.get("last-round", 0) > 0
        except:
            return False
    
    async def submit_claim_to_blockchain(
        self, 
        ipfs_hash: str, 
        category: str
    ) -> Dict[str, Any]:
        """
        Submit a claim to the blockchain
        Returns: claim_id and transaction_id
        """
        # Use mock blockchain if available
        if USE_MOCK_BLOCKCHAIN:
            try:
                blockchain = get_blockchain()
                result = blockchain.submit_claim(ipfs_hash, category)
                logger.info(f"[BLOCKCHAIN] Submitted claim: ID={result['claim_id']}, TX={result['tx_id']}")
                return {
                    "claim_id": result["claim_id"],
                    "tx_id": result["tx_id"]
                }
            except Exception as e:
                logger.error(f"Blockchain error: {e}")
                # Fall back to mock mode
        
        if self.mock_mode:
            # Mock implementation
            self.mock_claim_counter += 1
            claim_id = self.mock_claim_counter
            
            self.mock_claims[claim_id] = {
                "ipfs_hash": ipfs_hash,
                "category": category,
                "status": "UNVERIFIED"
            }
            
            logger.info(f"[MOCK] Submitted claim to blockchain: ID={claim_id}")
            
            return {
                "claim_id": claim_id,
                "tx_id": f"mock_tx_{claim_id}_{random.randint(1000, 9999)}"
            }
        
        try:
            # Real implementation
            params = self.algod_client.suggested_params()
            
            txn = ApplicationCallTxn(
                sender=self.service_account["address"],
                sp=params,
                index=self.claim_registry_id,
                app_args=[
                    b"submit_claim",
                    ipfs_hash.encode(),
                    category.encode()
                ],
                on_complete=0  # NoOp
            )
            
            signed_txn = txn.sign(self.service_account["private_key"])
            tx_id = self.algod_client.send_transaction(signed_txn)
            
            result = self._wait_for_confirmation(tx_id)
            claim_id = self._extract_claim_id(result)
            
            logger.info(f"Submitted claim to blockchain: ID={claim_id}, TX={tx_id}")
            
            return {
                "claim_id": claim_id,
                "tx_id": tx_id
            }
            
        except Exception as e:
            logger.error(f"Failed to submit claim to blockchain: {e}")
            # Fallback to mock
            return await self.submit_claim_to_blockchain(ipfs_hash, category)
    
    async def get_claim_from_blockchain(self, claim_id: int) -> Dict[str, Any]:
        """
        Retrieve claim data from blockchain
        """
        # Use mock blockchain if available
        if USE_MOCK_BLOCKCHAIN:
            try:
                blockchain = get_blockchain()
                claim = blockchain.get_claim(claim_id)
                if claim:
                    return {
                        "ipfs_hash": claim["ipfs_hash"],
                        "category": claim["category"],
                        "status": claim["status"]
                    }
                else:
                    raise Exception(f"Claim {claim_id} not found")
            except Exception as e:
                logger.error(f"Blockchain error: {e}")
                # Fall back to mock mode
        
        if self.mock_mode:
            # Mock implementation
            if claim_id in self.mock_claims:
                return self.mock_claims[claim_id]
            else:
                raise Exception(f"Claim {claim_id} not found")
        
        try:
            # Real implementation
            box_name = f"claim_{claim_id}".encode()
            
            result = self.algod_client.application_box_by_name(
                self.claim_registry_id,
                box_name
            )
            
            value = base64.b64decode(result["value"]).decode()
            parts = value.split("|")
            
            return {
                "ipfs_hash": parts[0],
                "category": parts[1],
                "status": parts[2] if len(parts) > 2 else "UNVERIFIED"
            }
            
        except Exception as e:
            logger.error(f"Failed to get claim from blockchain: {e}")
            if self.mock_mode and claim_id in self.mock_claims:
                return self.mock_claims[claim_id]
            raise
    
    async def submit_vote(
        self,
        claim_id: int,
        vote: bool,
        stake_amount: int,
        voter_address: Optional[str] = None
    ) -> str:
        """
        Submit a vote for a claim
        """
        # Use mock blockchain if available
        if USE_MOCK_BLOCKCHAIN:
            try:
                blockchain = get_blockchain()
                voter = voter_address or "default_voter"
                result = blockchain.submit_vote(claim_id, voter, vote, stake_amount)
                logger.info(f"[BLOCKCHAIN] Submitted vote: claim={claim_id}, vote={vote}, stake={stake_amount}")
                return result["tx_id"]
            except Exception as e:
                logger.error(f"Blockchain vote error: {e}")
                # Fall back to mock mode
        
        if self.mock_mode:
            # Mock implementation
            logger.info(f"[MOCK] Submitted vote: claim={claim_id}, vote={vote}, stake={stake_amount}")
            return f"mock_vote_tx_{claim_id}_{random.randint(1000, 9999)}"
        
        try:
            # Real implementation
            sender = voter_address or self.service_account["address"]
            params = self.algod_client.suggested_params()
            
            txn = ApplicationCallTxn(
                sender=sender,
                sp=params,
                index=self.validation_pool_id,
                app_args=[
                    b"cast_vote",
                    claim_id.to_bytes(8, 'big'),
                    (1 if vote else 0).to_bytes(1, 'big'),
                    stake_amount.to_bytes(8, 'big')
                ],
                foreign_apps=[self.reputation_token_id],
                on_complete=0
            )
            
            signed_txn = txn.sign(self.service_account["private_key"])
            tx_id = self.algod_client.send_transaction(signed_txn)
            
            self._wait_for_confirmation(tx_id)
            
            logger.info(f"Submitted vote: claim={claim_id}, vote={vote}, stake={stake_amount}")
            
            return tx_id
            
        except Exception as e:
            logger.error(f"Failed to submit vote: {e}")
            # Fallback to mock
            return f"mock_vote_tx_{claim_id}_{random.randint(1000, 9999)}"
    
    async def get_user_balance(self, user_address: str) -> int:
        """
        Get user's reputation token balance
        """
        if self.mock_mode:
            # Mock implementation
            if user_address not in self.mock_user_balances:
                self.mock_user_balances[user_address] = 0
            return self.mock_user_balances[user_address]
        
        try:
            # Real implementation
            box_name = f"rep_{user_address}".encode()
            
            result = self.algod_client.application_box_by_name(
                self.reputation_token_id,
                box_name
            )
            
            balance = int.from_bytes(base64.b64decode(result["value"]), 'big')
            
            return balance
            
        except Exception as e:
            logger.info(f"User {user_address} not found, returning 0 balance")
            return 0
    
    async def opt_in_user(self, user_address: Optional[str] = None) -> Dict[str, Any]:
        """
        Opt in user to reputation system
        """
        if self.mock_mode:
            # Mock implementation
            address = user_address or "mock_user_address"
            self.mock_user_balances[address] = settings.initial_reputation
            
            logger.info(f"[MOCK] Opted in user: {address}")
            
            return {
                "status": "opted_in",
                "tx_id": f"mock_optin_tx_{random.randint(1000, 9999)}",
                "initial_balance": settings.initial_reputation
            }
        
        try:
            # Real implementation
            sender = user_address or self.service_account["address"]
            params = self.algod_client.suggested_params()
            
            txn = ApplicationCallTxn(
                sender=sender,
                sp=params,
                index=self.reputation_token_id,
                app_args=[b"opt_in"],
                on_complete=0
            )
            
            signed_txn = txn.sign(self.service_account["private_key"])
            tx_id = self.algod_client.send_transaction(signed_txn)
            self._wait_for_confirmation(tx_id)
            
            return {
                "status": "opted_in",
                "tx_id": tx_id,
                "initial_balance": settings.initial_reputation
            }
            
        except Exception as e:
            logger.error(f"Failed to opt in user: {e}")
            # Fallback to mock
            return await self.opt_in_user(user_address)
    
    def _wait_for_confirmation(self, tx_id: str, timeout: int = 10):
        """Wait for transaction confirmation"""
        if self.mock_mode:
            return {"confirmed-round": 1}
            
        last_round = self.algod_client.status()["last-round"]
        
        while timeout > 0:
            try:
                pending_txn = self.algod_client.pending_transaction_info(tx_id)
                if pending_txn.get("confirmed-round", 0) > 0:
                    return pending_txn
                if pending_txn.get("pool-error"):
                    raise Exception(f"Transaction rejected: {pending_txn['pool-error']}")
            except Exception as e:
                if "not found" not in str(e):
                    raise
            
            last_round += 1
            self.algod_client.status_after_block(last_round)
            timeout -= 1
        
        raise Exception(f"Transaction {tx_id} not confirmed after timeout")
    
    def _extract_claim_id(self, txn_result: Dict) -> int:
        """Extract claim ID from transaction logs"""
        if self.mock_mode:
            return self.mock_claim_counter
            
        try:
            if "logs" in txn_result:
                for log in txn_result["logs"]:
                    decoded = base64.b64decode(log).decode('utf-8')
                    if decoded.startswith("claim_id:"):
                        return int(decoded.split(":")[1])
            
            # Fallback: calculate from global state
            app_info = self.algod_client.application_info(self.claim_registry_id)
            global_state = app_info["params"]["global-state"]
            for item in global_state:
                key = base64.b64decode(item["key"]).decode()
                if key == "claim_counter":
                    return item["value"]["uint"]
            
            return 1  # Default to 1 if not found
            
        except Exception as e:
            logger.error(f"Failed to extract claim ID: {e}")
            return 1