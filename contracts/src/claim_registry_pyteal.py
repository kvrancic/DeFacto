"""
Claim Registry Smart Contract using PyTeal
Manages the lifecycle of claims on the Algorand blockchain
"""

from pyteal import *
from beaker import *
from beaker.lib.storage import BoxMapping
from typing import Final

class ClaimState:
    """State for an individual claim"""
    claim_id = GlobalStateValue(stack_type=TealType.uint64, default=Int(0))
    ipfs_hash = GlobalStateValue(stack_type=TealType.bytes, default=Bytes(""))
    category = GlobalStateValue(stack_type=TealType.bytes, default=Bytes(""))
    status = GlobalStateValue(stack_type=TealType.uint64, default=Int(0))  # 0=PENDING, 1=VALIDATING, 2=VERIFIED, 3=DISPUTED, 4=DEBUNKED
    submitter = GlobalStateValue(stack_type=TealType.bytes, default=Bytes(""))
    submission_time = GlobalStateValue(stack_type=TealType.uint64, default=Int(0))
    yes_votes = GlobalStateValue(stack_type=TealType.uint64, default=Int(0))
    no_votes = GlobalStateValue(stack_type=TealType.uint64, default=Int(0))
    total_stake = GlobalStateValue(stack_type=TealType.uint64, default=Int(0))

class ClaimRegistry(Application):
    """
    Main contract for managing claims in the DeFacto protocol.
    Each claim is stored with its IPFS hash and metadata.
    """
    
    # Global state
    total_claims = GlobalStateValue(stack_type=TealType.uint64, default=Int(0))
    admin = GlobalStateValue(stack_type=TealType.bytes, default=Bytes(""))
    validation_duration = GlobalStateValue(stack_type=TealType.uint64, default=Int(86400))  # 24 hours
    min_validators = GlobalStateValue(stack_type=TealType.uint64, default=Int(3))
    
    # Box storage for claims
    claims = BoxMapping(Bytes, ClaimState)
    
    @create
    def create(self):
        return self.initialize_application_state()
    
    @external
    def initialize(
        self,
        admin: abi.Address,
        validation_duration: abi.Uint64,
        min_validators: abi.Uint64
    ):
        """Initialize the contract with configuration parameters"""
        return Seq(
            self.admin.set(admin.get()),
            self.validation_duration.set(validation_duration.get()),
            self.min_validators.set(min_validators.get()),
            self.total_claims.set(Int(0))
        )
    
    @external
    def submit_claim(
        self,
        ipfs_hash: abi.String,
        claim_type: abi.String,
        category: abi.String,
        *,
        output: abi.Uint64
    ):
        """Submit a new claim to the registry"""
        claim_id = ScratchVar(TealType.uint64)
        
        return Seq(
            # Increment claim counter
            claim_id.store(self.total_claims.get() + Int(1)),
            self.total_claims.set(claim_id.load()),
            
            # Create box for claim
            Assert(
                self.claims[Itob(claim_id.load())].create(
                    size=Int(512)  # Fixed size for claim data
                )
            ),
            
            # Store claim data
            self.claims[Itob(claim_id.load())].claim_id.set(claim_id.load()),
            self.claims[Itob(claim_id.load())].ipfs_hash.set(ipfs_hash.get()),
            self.claims[Itob(claim_id.load())].category.set(category.get()),
            self.claims[Itob(claim_id.load())].status.set(Int(0)),  # PENDING
            self.claims[Itob(claim_id.load())].submitter.set(Txn.sender()),
            self.claims[Itob(claim_id.load())].submission_time.set(Global.latest_timestamp()),
            self.claims[Itob(claim_id.load())].yes_votes.set(Int(0)),
            self.claims[Itob(claim_id.load())].no_votes.set(Int(0)),
            self.claims[Itob(claim_id.load())].total_stake.set(Int(0)),
            
            # Log event
            Log(Concat(Bytes("ClaimSubmitted:"), Itob(claim_id.load()))),
            
            # Return claim ID
            output.set(claim_id.load())
        )
    
    @external
    def update_claim_status(
        self,
        claim_id: abi.Uint64,
        new_status: abi.Uint64
    ):
        """Update the status of a claim"""
        return Seq(
            # Only admin can update status
            Assert(Txn.sender() == self.admin.get()),
            
            # Verify claim exists
            Assert(claim_id.get() <= self.total_claims.get()),
            Assert(self.claims[Itob(claim_id.get())].exists()),
            
            # Update status
            self.claims[Itob(claim_id.get())].status.set(new_status.get()),
            
            # Log event
            Log(Concat(
                Bytes("ClaimStatusUpdated:"),
                Itob(claim_id.get()),
                Bytes(":"),
                Itob(new_status.get())
            ))
        )
    
    @external(read_only=True)
    def get_claim(
        self,
        claim_id: abi.Uint64,
        *,
        output: abi.String
    ):
        """Retrieve claim data by ID"""
        return Seq(
            # Verify claim exists
            Assert(claim_id.get() <= self.total_claims.get()),
            Assert(self.claims[Itob(claim_id.get())].exists()),
            
            # Return claim IPFS hash (simplified for now)
            output.set(self.claims[Itob(claim_id.get())].ipfs_hash.get())
        )
    
    @external(read_only=True)
    def get_total_claims(self, *, output: abi.Uint64):
        """Get the total number of claims submitted"""
        return output.set(self.total_claims.get())
    
    @external
    def emergency_flag(
        self,
        claim_id: abi.Uint64,
        reason: abi.String,
        payment: abi.PaymentTransaction
    ):
        """Emergency flag a claim for immediate review"""
        return Seq(
            # Verify payment (anti-spam measure)
            Assert(payment.get().amount() >= Int(1000000)),  # 1 ALGO
            
            # Verify claim exists
            Assert(claim_id.get() <= self.total_claims.get()),
            Assert(self.claims[Itob(claim_id.get())].exists()),
            
            # Update claim to disputed status
            self.claims[Itob(claim_id.get())].status.set(Int(3)),  # DISPUTED
            
            # Log emergency flag event
            Log(Concat(
                Bytes("EmergencyFlag:"),
                Itob(claim_id.get()),
                Bytes(":"),
                reason.get()
            ))
        )
    
    @external
    def update_config(
        self,
        validation_duration: abi.Uint64,
        min_validators: abi.Uint64
    ):
        """Update contract configuration"""
        return Seq(
            # Only admin can update config
            Assert(Txn.sender() == self.admin.get()),
            
            self.validation_duration.set(validation_duration.get()),
            self.min_validators.set(min_validators.get()),
            
            Log(Bytes("ConfigUpdated"))
        )

# Compile the contract
if __name__ == "__main__":
    import json
    
    app = ClaimRegistry()
    app_spec = app.build()
    
    # Write out the contract artifacts
    with open("../artifacts/claim_registry_approval.teal", "w") as f:
        f.write(app_spec.approval_program)
    
    with open("../artifacts/claim_registry_clear.teal", "w") as f:
        f.write(app_spec.clear_program)
    
    with open("../artifacts/claim_registry.json", "w") as f:
        f.write(json.dumps(app_spec.export(), indent=2))
    
    print("ClaimRegistry contract compiled successfully!")
    print(f"Global state: {app_spec.global_state_schema}")
    print(f"Local state: {app_spec.local_state_schema}")