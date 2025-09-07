"""
Mock Blockchain Implementation
Simulates Algorand blockchain behavior for local development
"""

import json
import time
import hashlib
from typing import Dict, Any, Optional, List
from pathlib import Path
import threading
import random

class MockBlockchain:
    """Mock blockchain that simulates Algorand behavior"""
    
    def __init__(self, data_dir: str = "./blockchain_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize storage files
        self.claims_file = self.data_dir / "claims.json"
        self.votes_file = self.data_dir / "votes.json"
        self.markets_file = self.data_dir / "markets.json"
        self.users_file = self.data_dir / "users.json"
        self.state_file = self.data_dir / "state.json"
        
        # Load or initialize data
        self.claims = self._load_json(self.claims_file, {})
        self.votes = self._load_json(self.votes_file, {})
        self.markets = self._load_json(self.markets_file, {})
        self.users = self._load_json(self.users_file, {})
        self.state = self._load_json(self.state_file, {
            "claim_counter": 0,
            "market_counter": 0,
            "block_height": 1,
            "timestamp": int(time.time())
        })
        
        # Lock for thread safety
        self.lock = threading.Lock()
    
    def _load_json(self, file_path: Path, default: Any) -> Any:
        """Load JSON file or return default"""
        if file_path.exists():
            with open(file_path, 'r') as f:
                return json.load(f)
        return default
    
    def _save_json(self, file_path: Path, data: Any):
        """Save data to JSON file"""
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _generate_tx_id(self) -> str:
        """Generate a transaction ID"""
        data = f"{time.time()}{random.random()}"
        return hashlib.sha256(data.encode()).hexdigest()[:52]
    
    def _increment_block(self):
        """Increment block height and timestamp"""
        self.state["block_height"] += 1
        self.state["timestamp"] = int(time.time())
        self._save_json(self.state_file, self.state)
    
    # Claim Registry Methods
    
    def submit_claim(self, ipfs_hash: str, category: str) -> Dict[str, Any]:
        """Submit a new claim"""
        with self.lock:
            # Increment counter
            self.state["claim_counter"] += 1
            claim_id = self.state["claim_counter"]
            
            # Create claim
            claim = {
                "claim_id": claim_id,
                "ipfs_hash": ipfs_hash,
                "category": category,
                "status": "UNVERIFIED",
                "submitted_at": int(time.time()),
                "block_height": self.state["block_height"],
                "yes_votes": 0,
                "no_votes": 0,
                "total_stake": 0,
                "voting_ends_at": int(time.time()) + 86400  # 24 hours
            }
            
            # Store claim
            self.claims[str(claim_id)] = claim
            self._save_json(self.claims_file, self.claims)
            
            # Increment block
            self._increment_block()
            
            return {
                "claim_id": claim_id,
                "tx_id": self._generate_tx_id(),
                "confirmed_round": self.state["block_height"]
            }
    
    def get_claim(self, claim_id: int) -> Optional[Dict[str, Any]]:
        """Get a claim by ID"""
        return self.claims.get(str(claim_id))
    
    def update_claim_status(self, claim_id: int, new_status: str) -> bool:
        """Update claim status"""
        with self.lock:
            if str(claim_id) in self.claims:
                self.claims[str(claim_id)]["status"] = new_status
                self._save_json(self.claims_file, self.claims)
                self._increment_block()
                return True
            return False
    
    # Reputation System Methods
    
    def opt_in_user(self, address: str) -> Dict[str, Any]:
        """Opt in user to reputation system"""
        with self.lock:
            if address not in self.users:
                self.users[address] = {
                    "address": address,
                    "reputation": 100,  # Initial reputation
                    "created_at": int(time.time()),
                    "votes": []
                }
                self._save_json(self.users_file, self.users)
            
            return {
                "status": "opted_in",
                "tx_id": self._generate_tx_id(),
                "initial_balance": self.users[address]["reputation"]
            }
    
    def get_user_balance(self, address: str) -> int:
        """Get user's reputation balance"""
        user = self.users.get(address, {})
        return user.get("reputation", 0)
    
    def submit_vote(self, claim_id: int, voter: str, vote: bool, stake: int) -> Dict[str, Any]:
        """Submit a vote on a claim"""
        with self.lock:
            # Check if claim exists
            if str(claim_id) not in self.claims:
                raise Exception(f"Claim {claim_id} not found")
            
            # Check if user has enough reputation
            if voter not in self.users:
                self.opt_in_user(voter)
            
            user_balance = self.users[voter]["reputation"]
            if user_balance < stake:
                raise Exception(f"Insufficient reputation: {user_balance} < {stake}")
            
            # Check if already voted
            vote_key = f"{voter}_{claim_id}"
            if vote_key in self.votes:
                raise Exception(f"Already voted on claim {claim_id}")
            
            # Deduct stake from user
            self.users[voter]["reputation"] -= stake
            
            # Record vote
            self.votes[vote_key] = {
                "claim_id": claim_id,
                "voter": voter,
                "vote": vote,
                "stake": stake,
                "timestamp": int(time.time())
            }
            
            # Update claim vote counts
            claim = self.claims[str(claim_id)]
            if vote:
                claim["yes_votes"] += 1
            else:
                claim["no_votes"] += 1
            claim["total_stake"] += stake
            
            # Save data
            self._save_json(self.users_file, self.users)
            self._save_json(self.votes_file, self.votes)
            self._save_json(self.claims_file, self.claims)
            
            self._increment_block()
            
            return {
                "tx_id": self._generate_tx_id(),
                "status": "vote_submitted"
            }
    
    # Prediction Market Methods
    
    def create_market(self, claim_id: int, initial_liquidity: float) -> Dict[str, Any]:
        """Create a prediction market for a claim"""
        with self.lock:
            # Check if claim exists
            if str(claim_id) not in self.claims:
                raise Exception(f"Claim {claim_id} not found")
            
            # Check if market already exists
            for market in self.markets.values():
                if market["claim_id"] == claim_id:
                    raise Exception(f"Market already exists for claim {claim_id}")
            
            # Create market
            self.state["market_counter"] += 1
            market_id = self.state["market_counter"]
            
            market = {
                "market_id": market_id,
                "claim_id": claim_id,
                "total_yes_stake": initial_liquidity / 2,
                "total_no_stake": initial_liquidity / 2,
                "yes_price": 0.5,
                "no_price": 0.5,
                "created_at": int(time.time()),
                "expires_at": int(time.time()) + 86400,  # 24 hours
                "resolved": False,
                "outcome": None,
                "positions": {}
            }
            
            self.markets[str(market_id)] = market
            self._save_json(self.markets_file, self.markets)
            self._save_json(self.state_file, self.state)
            
            self._increment_block()
            
            return {
                "market_id": market_id,
                "tx_id": self._generate_tx_id(),
                "yes_price": 0.5,
                "no_price": 0.5
            }
    
    def place_bet(self, market_id: int, user: str, position: str, amount: float) -> Dict[str, Any]:
        """Place a bet on a prediction market"""
        with self.lock:
            if str(market_id) not in self.markets:
                raise Exception(f"Market {market_id} not found")
            
            market = self.markets[str(market_id)]
            
            # Check if market is still open
            if market["resolved"] or time.time() > market["expires_at"]:
                raise Exception("Market is closed")
            
            # Calculate shares using constant product formula
            if position == "YES":
                current_stake = market["total_yes_stake"]
                opposite_stake = market["total_no_stake"]
                
                k = current_stake * opposite_stake
                new_stake = current_stake + amount
                new_opposite = k / new_stake
                shares_bought = opposite_stake - new_opposite
                
                market["total_yes_stake"] = new_stake
                market["total_no_stake"] = new_opposite
            else:
                current_stake = market["total_no_stake"]
                opposite_stake = market["total_yes_stake"]
                
                k = current_stake * opposite_stake
                new_stake = current_stake + amount
                new_opposite = k / new_stake
                shares_bought = opposite_stake - new_opposite
                
                market["total_no_stake"] = new_stake
                market["total_yes_stake"] = new_opposite
            
            # Recalculate prices
            total = market["total_yes_stake"] + market["total_no_stake"]
            market["yes_price"] = market["total_yes_stake"] / total
            market["no_price"] = market["total_no_stake"] / total
            
            # Store position
            position_key = f"{user}_{position}"
            if position_key not in market["positions"]:
                market["positions"][position_key] = {
                    "user": user,
                    "position": position,
                    "shares": 0,
                    "amount": 0
                }
            
            market["positions"][position_key]["shares"] += shares_bought
            market["positions"][position_key]["amount"] += amount
            
            self._save_json(self.markets_file, self.markets)
            self._increment_block()
            
            return {
                "tx_id": self._generate_tx_id(),
                "shares_bought": shares_bought,
                "avg_price": amount / shares_bought if shares_bought > 0 else 0,
                "potential_payout": shares_bought
            }
    
    def get_markets(self) -> List[Dict[str, Any]]:
        """Get all markets"""
        return list(self.markets.values())
    
    def resolve_market(self, market_id: int, outcome: bool) -> bool:
        """Resolve a prediction market"""
        with self.lock:
            if str(market_id) not in self.markets:
                return False
            
            market = self.markets[str(market_id)]
            market["resolved"] = True
            market["outcome"] = outcome
            
            # Distribute winnings (simplified)
            # In production, this would update user balances
            
            self._save_json(self.markets_file, self.markets)
            self._increment_block()
            
            return True
    
    def get_status(self) -> Dict[str, Any]:
        """Get blockchain status"""
        return {
            "block_height": self.state["block_height"],
            "total_claims": self.state["claim_counter"],
            "total_markets": self.state["market_counter"],
            "total_users": len(self.users),
            "timestamp": self.state["timestamp"]
        }

# Global instance
blockchain = MockBlockchain()

def get_blockchain():
    """Get blockchain instance"""
    return blockchain