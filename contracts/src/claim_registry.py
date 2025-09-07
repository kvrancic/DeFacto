"""
Claim Registry Smart Contract
Manages the lifecycle of claims on the Algorand blockchain
"""

from algopy import ARC4Contract, String, Bytes, UInt64, GlobalState, LocalState, Txn, arc4, subroutine, op
from algopy.arc4 import abimethod, Address, DynamicArray


class ClaimStatus:
    PENDING = UInt64(0)
    VALIDATING = UInt64(1)
    VERIFIED = UInt64(2)
    DISPUTED = UInt64(3)
    DEBUNKED = UInt64(4)


class ClaimRegistry(ARC4Contract):
    """
    Main contract for managing claims in the DeFacto protocol.
    Each claim is stored with its IPFS hash and metadata.
    """
    
    # Global state
    total_claims: GlobalState[UInt64]
    admin: GlobalState[Address]
    validation_duration: GlobalState[UInt64]  # In seconds
    min_validators: GlobalState[UInt64]
    
    # Claim storage using box storage for scalability
    # Box name format: "claim_<id>"
    
    def __init__(self) -> None:
        """Initialize the contract with default values"""
        self.total_claims = GlobalState(UInt64(0))
        self.admin = GlobalState(Address())
        self.validation_duration = GlobalState(UInt64(86400))  # 24 hours default
        self.min_validators = GlobalState(UInt64(3))  # Minimum 3 validators
    
    @arc4.abimethod(create="require")
    def initialize(
        self,
        admin: Address,
        validation_duration: UInt64,
        min_validators: UInt64
    ) -> None:
        """
        Initialize the contract with configuration parameters.
        Can only be called once during contract creation.
        """
        self.admin.value = admin
        self.validation_duration.value = validation_duration
        self.min_validators.value = min_validators
        self.total_claims.value = UInt64(0)
    
    @arc4.abimethod
    def submit_claim(
        self,
        ipfs_hash: String,
        claim_type: String,
        category: String
    ) -> UInt64:
        """
        Submit a new claim to the registry.
        Returns the claim ID.
        """
        # Increment claim counter
        claim_id = self.total_claims.value + UInt64(1)
        self.total_claims.value = claim_id
        
        # Create claim data structure
        claim_data = arc4.Struct(
            id=claim_id,
            submitter=Txn.sender,
            ipfs_hash=ipfs_hash,
            claim_type=claim_type,
            category=category,
            status=ClaimStatus.PENDING,
            submission_time=op.Global.latest_timestamp,
            validation_end_time=op.Global.latest_timestamp + self.validation_duration.value,
            yes_votes=UInt64(0),
            no_votes=UInt64(0),
            total_stake=UInt64(0)
        )
        
        # Store claim in box storage
        box_name = b"claim_" + op.itob(claim_id)
        op.Box.put(box_name, claim_data.bytes)
        
        # Log event
        op.log(b"ClaimSubmitted")
        op.log(op.itob(claim_id))
        
        return claim_id
    
    @arc4.abimethod
    def update_claim_status(
        self,
        claim_id: UInt64,
        new_status: UInt64
    ) -> None:
        """
        Update the status of a claim.
        Only callable by admin or validation contract.
        """
        assert Txn.sender == self.admin.value, "Only admin can update status"
        
        # Verify claim exists
        assert claim_id <= self.total_claims.value, "Invalid claim ID"
        
        # Update claim status in box storage
        box_name = b"claim_" + op.itob(claim_id)
        assert op.Box.length(box_name).value > UInt64(0), "Claim not found"
        
        # Update status field in stored data
        # (In production, would properly deserialize, update, and reserialize)
        
        # Log event
        op.log(b"ClaimStatusUpdated")
        op.log(op.itob(claim_id))
        op.log(op.itob(new_status))
    
    @arc4.abimethod(readonly=True)
    def get_claim(self, claim_id: UInt64) -> arc4.DynamicBytes:
        """
        Retrieve claim data by ID.
        Returns the serialized claim data.
        """
        assert claim_id <= self.total_claims.value, "Invalid claim ID"
        
        box_name = b"claim_" + op.itob(claim_id)
        claim_data = op.Box.get(box_name)
        
        return arc4.DynamicBytes(claim_data)
    
    @arc4.abimethod(readonly=True)
    def get_total_claims(self) -> UInt64:
        """Get the total number of claims submitted"""
        return self.total_claims.value
    
    @arc4.abimethod
    def emergency_flag(
        self,
        claim_id: UInt64,
        reason: String
    ) -> None:
        """
        Emergency flag a claim for immediate review.
        Requires minimum stake to prevent spam.
        """
        # Verify payment (anti-spam measure)
        assert Txn.amount >= UInt64(1000000), "Insufficient stake for emergency flag"
        
        # Verify claim exists
        assert claim_id <= self.total_claims.value, "Invalid claim ID"
        
        # Update claim to disputed status
        # (Implementation would update the claim status in box storage)
        
        # Log emergency flag event
        op.log(b"EmergencyFlag")
        op.log(op.itob(claim_id))
        op.log(reason.bytes)
    
    @arc4.abimethod
    def update_config(
        self,
        validation_duration: UInt64,
        min_validators: UInt64
    ) -> None:
        """
        Update contract configuration.
        Only callable by admin.
        """
        assert Txn.sender == self.admin.value, "Only admin can update config"
        
        self.validation_duration.value = validation_duration
        self.min_validators.value = min_validators
        
        op.log(b"ConfigUpdated")