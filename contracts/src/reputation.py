"""
Reputation Token Smart Contract
Manages non-transferable reputation tokens for validators
"""

from algopy import ARC4Contract, UInt64, GlobalState, LocalState, Txn, arc4, subroutine, op
from algopy.arc4 import abimethod, Address, Bool


class ReputationToken(ARC4Contract):
    """
    Non-transferable reputation token system.
    Validators earn reputation for accurate validations and lose it for false ones.
    """
    
    # Global state
    total_supply: GlobalState[UInt64]
    admin: GlobalState[Address]
    initial_mint_amount: GlobalState[UInt64]
    slash_percentage: GlobalState[UInt64]  # Percentage to slash for wrong validation (e.g., 10 = 10%)
    reward_amount: GlobalState[UInt64]  # Base reward for correct validation
    
    # Local state (per account)
    balance: LocalState[UInt64]
    total_validations: LocalState[UInt64]
    correct_validations: LocalState[UInt64]
    is_validator: LocalState[Bool]
    staked_amount: LocalState[UInt64]
    
    def __init__(self) -> None:
        """Initialize the reputation token contract"""
        self.total_supply = GlobalState(UInt64(0))
        self.admin = GlobalState(Address())
        self.initial_mint_amount = GlobalState(UInt64(100))  # Start with 100 reputation
        self.slash_percentage = GlobalState(UInt64(10))  # 10% slash for wrong validation
        self.reward_amount = GlobalState(UInt64(10))  # 10 reputation for correct validation
        
        # Initialize local state schema
        self.balance = LocalState(UInt64(0))
        self.total_validations = LocalState(UInt64(0))
        self.correct_validations = LocalState(UInt64(0))
        self.is_validator = LocalState(Bool(False))
        self.staked_amount = LocalState(UInt64(0))
    
    @arc4.abimethod(create="require")
    def initialize(
        self,
        admin: Address,
        initial_mint: UInt64,
        slash_percentage: UInt64,
        reward_amount: UInt64
    ) -> None:
        """
        Initialize the contract with configuration.
        Can only be called once during creation.
        """
        self.admin.value = admin
        self.initial_mint_amount.value = initial_mint
        self.slash_percentage.value = slash_percentage
        self.reward_amount.value = reward_amount
        self.total_supply.value = UInt64(0)
    
    @arc4.abimethod(allow_actions=["OptIn"])
    def opt_in(self) -> None:
        """
        Opt-in to become a validator and receive initial reputation.
        """
        # Initialize local state for new validator
        self.balance[Txn.sender] = self.initial_mint_amount.value
        self.total_validations[Txn.sender] = UInt64(0)
        self.correct_validations[Txn.sender] = UInt64(0)
        self.is_validator[Txn.sender] = Bool(True)
        self.staked_amount[Txn.sender] = UInt64(0)
        
        # Update total supply
        self.total_supply.value = self.total_supply.value + self.initial_mint_amount.value
        
        # Log event
        op.log(b"ValidatorOptedIn")
        op.log(Txn.sender.bytes)
    
    @arc4.abimethod
    def stake(
        self,
        amount: UInt64,
        claim_id: UInt64
    ) -> None:
        """
        Stake reputation tokens on a validation.
        Tokens are locked until validation resolves.
        """
        # Check validator status
        assert self.is_validator[Txn.sender], "Not a validator"
        
        # Check available balance
        available = self.balance[Txn.sender] - self.staked_amount[Txn.sender]
        assert amount <= available, "Insufficient available balance"
        
        # Update staked amount
        self.staked_amount[Txn.sender] = self.staked_amount[Txn.sender] + amount
        
        # Store stake information (would integrate with validation contract)
        stake_key = b"stake_" + Txn.sender.bytes + b"_" + op.itob(claim_id)
        op.Box.put(stake_key, op.itob(amount))
        
        # Log staking event
        op.log(b"ReputationStaked")
        op.log(Txn.sender.bytes)
        op.log(op.itob(claim_id))
        op.log(op.itob(amount))
    
    @arc4.abimethod
    def slash(
        self,
        validator: Address,
        amount: UInt64
    ) -> None:
        """
        Slash a validator's reputation for incorrect validation.
        Only callable by validation contract or admin.
        """
        assert Txn.sender == self.admin.value, "Only admin can slash"
        
        # Ensure validator exists
        assert self.is_validator[validator], "Not a validator"
        
        # Calculate slash amount
        slash_amount = op.min(amount, self.balance[validator])
        
        # Update balances
        self.balance[validator] = self.balance[validator] - slash_amount
        self.total_supply.value = self.total_supply.value - slash_amount
        
        # Update staked amount if necessary
        if self.staked_amount[validator] > self.balance[validator]:
            self.staked_amount[validator] = self.balance[validator]
        
        # Log slash event
        op.log(b"ReputationSlashed")
        op.log(validator.bytes)
        op.log(op.itob(slash_amount))
    
    @arc4.abimethod
    def reward(
        self,
        validator: Address,
        amount: UInt64
    ) -> None:
        """
        Reward a validator with reputation for correct validation.
        Only callable by validation contract or admin.
        """
        assert Txn.sender == self.admin.value, "Only admin can reward"
        
        # Ensure validator exists
        assert self.is_validator[validator], "Not a validator"
        
        # Update balances
        self.balance[validator] = self.balance[validator] + amount
        self.total_supply.value = self.total_supply.value + amount
        
        # Update validation statistics
        self.correct_validations[validator] = self.correct_validations[validator] + UInt64(1)
        
        # Log reward event
        op.log(b"ReputationRewarded")
        op.log(validator.bytes)
        op.log(op.itob(amount))
    
    @arc4.abimethod
    def release_stake(
        self,
        validator: Address,
        claim_id: UInt64
    ) -> None:
        """
        Release staked tokens after validation completes.
        Only callable by validation contract or admin.
        """
        assert Txn.sender == self.admin.value, "Only admin can release stake"
        
        # Get stake amount
        stake_key = b"stake_" + validator.bytes + b"_" + op.itob(claim_id)
        stake_amount_bytes = op.Box.get(stake_key)
        stake_amount = op.btoi(stake_amount_bytes)
        
        # Update staked amount
        self.staked_amount[validator] = self.staked_amount[validator] - stake_amount
        
        # Delete stake record
        op.Box.delete(stake_key)
        
        # Update validation count
        self.total_validations[validator] = self.total_validations[validator] + UInt64(1)
        
        # Log release event
        op.log(b"StakeReleased")
        op.log(validator.bytes)
        op.log(op.itob(claim_id))
    
    @arc4.abimethod(readonly=True)
    def get_reputation(self, account: Address) -> UInt64:
        """Get the reputation balance of an account"""
        if self.is_validator[account]:
            return self.balance[account]
        return UInt64(0)
    
    @arc4.abimethod(readonly=True)
    def get_validator_stats(self, account: Address) -> arc4.Tuple[UInt64, UInt64, UInt64]:
        """
        Get validator statistics.
        Returns (balance, total_validations, correct_validations)
        """
        if self.is_validator[account]:
            return arc4.Tuple((
                self.balance[account],
                self.total_validations[account],
                self.correct_validations[account]
            ))
        return arc4.Tuple((UInt64(0), UInt64(0), UInt64(0)))
    
    @arc4.abimethod(readonly=True)
    def get_accuracy_rate(self, account: Address) -> UInt64:
        """
        Get validator's accuracy rate as a percentage.
        Returns 0-100.
        """
        if not self.is_validator[account]:
            return UInt64(0)
        
        total = self.total_validations[account]
        if total == UInt64(0):
            return UInt64(100)  # New validator starts at 100%
        
        correct = self.correct_validations[account]
        # Calculate percentage (correct * 100 / total)
        return (correct * UInt64(100)) / total
    
    @arc4.abimethod
    def emergency_mint(
        self,
        account: Address,
        amount: UInt64
    ) -> None:
        """
        Emergency mint reputation tokens.
        Only callable by admin for special circumstances.
        """
        assert Txn.sender == self.admin.value, "Only admin can emergency mint"
        assert self.is_validator[account], "Not a validator"
        
        self.balance[account] = self.balance[account] + amount
        self.total_supply.value = self.total_supply.value + amount
        
        op.log(b"EmergencyMint")
        op.log(account.bytes)
        op.log(op.itob(amount))