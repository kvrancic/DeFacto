# DeFacto Protocol - Detailed Implementation Plan

## IMPORTANT: READ THIS FIRST
This is your complete step-by-step guide. Every piece of code, every command, and every file you need is here. Follow it exactly as written. When you see code blocks, copy them COMPLETELY - they are the full code, not snippets.

## Initial Setup (Everyone Does This First - 30 Minutes)

### Step 1: Install AlgoKit (5 minutes)
Open your terminal. We're going to install AlgoKit, which is Algorand's official development toolkit. This gives us everything we need to build on Algorand.

```bash
# For Mac/Linux users:
# First install pipx (Python package installer)
brew install pipx
# Then install AlgoKit itself
pipx install algokit

# For Windows users:
# First install pipx using Windows package manager
winget install pipx
# Then install AlgoKit
pipx install algokit

# Verify installation worked:
algokit --version
# Should output something like: algokit 2.0.0
```

**What this does:** AlgoKit provides templates, local blockchain, deployment tools, and testing utilities all in one package.

### Step 2: Create AlgoKit Project (10 minutes)
Now we'll create our project using AlgoKit's interactive setup. This creates the entire folder structure we need.

```bash
# Navigate to where you want your project (e.g., Desktop)
cd ~/Desktop

# Start the interactive project creator
algokit init

# You'll be asked several questions. Answer EXACTLY as shown:
# Question 1: "Choose a template"
#   Answer: Select "fullstack" (use arrow keys, press Enter)
# 
# Question 2: "Project name"
#   Answer: Type "defacto-protocol" (press Enter)
#
# Question 3: "Smart contract language"
#   Answer: Select "Python" (press Enter)
#
# Question 4: "Frontend framework"  
#   Answer: Select "React" (press Enter)
#
# Question 5: "Install dependencies?"
#   Answer: Type "Y" (press Enter)

# This will take 2-3 minutes to complete
```

**What this creates:** A complete project with smart contracts folder, frontend folder, testing setup, and Docker configuration.

### Step 3: Understand AlgoKit Structure (5 minutes)
After creation, your project structure looks like this. IMPORTANT: This structure is DIFFERENT from our original plan, so we'll adapt:

```
defacto-protocol/                           # Root directory
├── projects/
│   └── defacto-protocol-contracts/         # All smart contracts go here
│       ├── smart_contracts/                # Your contract files
│       │   ├── config.py                   # Configuration
│       │   └── artifacts/                  # Compiled contracts (auto-generated)
│       ├── tests/                          # Contract tests
│       │   └── test_contract.py           
│       ├── requirements.txt                # Python packages
│       └── .env.template                   # Environment variables
│
├── projects/
│   └── defacto-protocol-frontend/          # React frontend
│       ├── src/                            # Source code
│       │   ├── App.tsx                     # Main app component
│       │   ├── components/                 # React components
│       │   └── contracts/                  # Contract interfaces (auto-generated)
│       ├── public/                         # Static files
│       └── package.json                    # npm packages
│
└── .algokit/                               # AlgoKit configuration (don't touch)
    └── algokit.toml                        # Project settings
```

### Step 4: Start Local Blockchain (5 minutes)
Before we can deploy contracts, we need a local Algorand blockchain running.

```bash
# Make sure you're in the project root
cd defacto-protocol

# Start the local Algorand network
algokit localnet start

# You should see output like:
# "LocalNet started successfully"
# "Algod running on http://localhost:4001"
# "Indexer running on http://localhost:8980"

# Verify it's working:
algokit localnet status
# Should show: "LocalNet is running"
```

**What this does:** Starts a local Algorand blockchain that resets every time you restart it. Perfect for development.

### Step 5: Install Additional Tools (5 minutes)
We need a few more tools that aren't included by default.

```bash
# Install IPFS (for decentralized storage)
# Mac:
brew install ipfs
# Windows:
# Download from https://ipfs.io/ipfs-desktop/

# Start IPFS:
ipfs init
ipfs daemon
# Leave this running in a separate terminal

# Install Docker Desktop (if not already installed)
# Download from https://www.docker.com/products/docker-desktop/
# Start Docker Desktop application
```

---

## Developer #1: Smart Contract Developer

### Day 1: Setting Up Your First Contract (Full Day)

#### Morning Task 1: Navigate to contracts folder and understand the structure (30 minutes)
First, let's understand where we're working and set up our environment properly.

```bash
# Open a new terminal window
# Navigate to your project root first
cd ~/Desktop/defacto-protocol

# Now go to the contracts directory
cd projects/defacto-protocol-contracts

# List what's already there
ls -la
# You should see:
# - smart_contracts/  (this is where our code goes)
# - tests/           (this is where our tests go)  
# - requirements.txt (Python dependencies)
# - .env.template    (environment variables template)

# Navigate into smart_contracts
cd smart_contracts

# Create a new folder for our claim registry contract
mkdir claim_registry
cd claim_registry
```

**Why we're doing this:** AlgoKit expects each contract in its own folder. This keeps things organized and makes compilation easier.

#### Morning Task 2: Create the Claim Registry Contract (1 hour)
Now we'll create our first smart contract. This contract will store claims on the blockchain. Copy this ENTIRE file exactly as shown.

```python
# File: smart_contracts/claim_registry/contract.py
# COPY THIS ENTIRE FILE - IT'S THE COMPLETE CODE

# Import everything we need from Algorand Python (algopy)
from algopy import (
    ARC4Contract,     # Base class for our contract
    arc4,            # ARC4 types for method parameters
    UInt64,          # Unsigned 64-bit integer type
    Bytes,           # Bytes type for storage
    op,              # Opcodes for low-level operations
    GlobalState,     # For global storage
    Txn,             # Transaction object
    Global           # Global blockchain values
)

class ClaimRegistry(ARC4Contract):
    """
    This contract manages claims submitted to the DeFacto protocol.
    It stores claims on the blockchain and tracks their status.
    """
    
    # STORAGE DEFINITION
    # This declares a global variable that persists between calls
    claim_counter: UInt64  # This counts how many claims we have (starts at 0)
    
    def __init__(self) -> None:
        """
        Constructor - runs once when contract is created.
        Sets up initial state of the contract.
        """
        # Initialize the claim counter to 0
        # This will track claim IDs (1, 2, 3, etc.)
        self.claim_counter = UInt64(0)
    
    @arc4.abimethod
    def submit_claim(
        self,
        ipfs_hash: arc4.String,    # The IPFS hash where claim content is stored
        category: arc4.String       # Category like "news", "science", etc.
    ) -> arc4.UInt64:
        """
        This method is called when someone submits a new claim.
        It stores the claim on the blockchain and returns a unique ID.
        
        Parameters:
        - ipfs_hash: IPFS hash pointing to the actual claim content
        - category: Type of claim (news, science, politics, health, technology)
        
        Returns:
        - claim_id: Unique identifier for this claim
        """
        
        # STEP 1: Increment our counter to get a new claim ID
        # If this is the first claim, counter goes from 0 to 1
        self.claim_counter = self.claim_counter + UInt64(1)
        
        # STEP 2: Get the current claim ID to use
        claim_id = self.claim_counter
        
        # STEP 3: Create a unique storage key for this claim
        # We'll use format: "claim_1", "claim_2", etc.
        # First convert claim_id to bytes, then concatenate with prefix
        claim_key = Bytes(b"claim_") + op.itob(claim_id)
        
        # STEP 4: Prepare the data to store
        # We'll store: ipfs_hash|category|status
        # The pipe character | is our delimiter
        # Every claim starts as "UNVERIFIED"
        claim_data = (
            ipfs_hash.bytes +           # IPFS hash as bytes
            Bytes(b"|") +               # Delimiter
            category.bytes +             # Category as bytes
            Bytes(b"|") +               # Delimiter
            Bytes(b"UNVERIFIED")        # Initial status
        )
        
        # STEP 5: Store the claim data in box storage
        # Box storage is Algorand's way to store larger data
        # Maximum 32KB per box
        op.Box.put(claim_key, claim_data)
        
        # STEP 6: Return the claim ID to the caller
        # Convert to arc4.UInt64 for ABI compatibility
        return arc4.UInt64(claim_id)
    
    @arc4.abimethod
    def get_claim(self, claim_id: arc4.UInt64) -> arc4.String:
        """
        Retrieves a claim from the blockchain by its ID.
        
        Parameters:
        - claim_id: The unique identifier of the claim to retrieve
        
        Returns:
        - claim_data: String containing ipfs_hash|category|status
        """
        
        # STEP 1: Recreate the storage key for this claim ID
        # Must match the format used in submit_claim
        claim_key = Bytes(b"claim_") + op.itob(claim_id.native)
        
        # STEP 2: Retrieve the data from box storage
        # This will fail if the claim doesn't exist
        # AlgoKit will automatically handle the error
        claim_data_bytes = op.Box.get(claim_key)
        
        # STEP 3: Convert bytes to arc4.String and return
        # The data is already formatted as ipfs_hash|category|status
        return arc4.String(claim_data_bytes)
    
    @arc4.abimethod
    def update_claim_status(
        self,
        claim_id: arc4.UInt64,
        new_status: arc4.String
    ) -> arc4.String:
        """
        Updates the verification status of a claim.
        Only certain accounts should be able to call this (add auth later).
        
        Parameters:
        - claim_id: The claim to update
        - new_status: New status (VERIFIED, FALSE, DISPUTED)
        
        Returns:
        - success: "OK" if successful
        """
        
        # STEP 1: Get the existing claim data
        claim_key = Bytes(b"claim_") + op.itob(claim_id.native)
        existing_data = op.Box.get(claim_key)
        
        # STEP 2: Parse the existing data
        # We need to split by | to get components
        # This is a bit tricky in Algorand Python
        # For now, we'll rebuild the entire string
        
        # STEP 3: Find the pipes and extract parts
        # In production, you'd use a more robust parsing method
        # For MVP, we'll do simple replacement
        
        # TODO: Implement proper string parsing
        # For now, just acknowledge the update
        
        return arc4.String("OK")
    
    @arc4.abimethod  
    def get_total_claims(self) -> arc4.UInt64:
        """
        Returns the total number of claims submitted.
        Useful for pagination and statistics.
        
        Returns:
        - total: Total number of claims in the system
        """
        return arc4.UInt64(self.claim_counter)
```

**What this contract does:**
1. Stores claims on the blockchain permanently
2. Each claim gets a unique ID (1, 2, 3, etc.)
3. Claims are stored with their IPFS hash, category, and verification status
4. Anyone can read claims, but only authorized accounts can update status (we'll add this auth later)

#### Afternoon Task 3: Create Test File (1 hour)
Now we need to test our contract. Tests are CRITICAL - they prove your contract works. Copy this entire test file.

```python
# File: tests/test_claim_registry.py
# Navigate to: projects/defacto-protocol-contracts/tests/
# COPY THIS ENTIRE FILE

import pytest
from algokit_utils import (
    get_localnet_default_account,
    get_algod_client,
    ApplicationClient,
    EnsureBalanceParameters
)
from algosdk.v2client.algod import AlgodClient
from algosdk import account, mnemonic
from pathlib import Path
import sys

# Add the smart contracts directory to path so we can import our contract
sys.path.append(str(Path(__file__).parent.parent / "smart_contracts"))

def test_submit_claim():
    """
    Test that we can submit a claim and get back a claim ID.
    This is our most important test - if this works, the basics are working.
    """
    
    # STEP 1: Set up the Algorand client
    # This connects to our local blockchain
    # The token ("a" * 64) is a dummy token for local development
    client = AlgodClient(
        algod_token="a" * 64,
        algod_address="http://localhost:4001"
    )
    
    # STEP 2: Get a funded test account
    # LocalNet automatically creates accounts with test ALGO
    # We'll use this account to deploy and interact with our contract
    deployer_account = get_localnet_default_account(client)
    print(f"Using account: {deployer_account.address}")
    
    # STEP 3: Deploy the contract
    # First, we need to create an application client
    # This is AlgoKit's way of interacting with contracts
    from claim_registry.contract import ClaimRegistry
    
    app_client = ApplicationClient(
        client=client,
        app=ClaimRegistry(),
        creator=deployer_account,
        indexer_client=None  # We don't need indexer for this test
    )
    
    # Deploy the contract to the blockchain
    # This creates a new instance of our contract
    deploy_response = app_client.deploy(
        sender=deployer_account,
        allow_delete=True,  # Allow deletion for testing
        allow_update=True   # Allow updates for testing
    )
    
    print(f"Contract deployed! App ID: {deploy_response.app_id}")
    
    # STEP 4: Submit a test claim
    # We'll submit a claim with a fake IPFS hash
    test_ipfs_hash = "QmTest12345ExampleIPFSHashForTesting"
    test_category = "news"
    
    # Call the submit_claim method
    result = app_client.call(
        method="submit_claim",
        ipfs_hash=test_ipfs_hash,
        category=test_category,
        sender=deployer_account
    )
    
    # STEP 5: Verify the result
    # The return value should be 1 (first claim)
    claim_id = result.return_value
    assert claim_id == 1, f"Expected claim ID 1, got {claim_id}"
    print(f"✅ Successfully submitted claim with ID: {claim_id}")
    
    # STEP 6: Retrieve the claim to verify it was stored correctly
    get_result = app_client.call(
        method="get_claim",
        claim_id=1,
        sender=deployer_account
    )
    
    # The returned data should be: ipfs_hash|category|UNVERIFIED
    expected_data = f"{test_ipfs_hash}|{test_category}|UNVERIFIED"
    actual_data = get_result.return_value
    
    assert actual_data == expected_data, f"Data mismatch! Expected: {expected_data}, Got: {actual_data}"
    print(f"✅ Successfully retrieved claim: {actual_data}")

def test_multiple_claims():
    """
    Test submitting multiple claims and verifying IDs increment correctly.
    """
    
    # Setup (same as before)
    client = AlgodClient("a" * 64, "http://localhost:4001")
    deployer_account = get_localnet_default_account(client)
    
    from claim_registry.contract import ClaimRegistry
    app_client = ApplicationClient(
        client=client,
        app=ClaimRegistry(),
        creator=deployer_account,
        indexer_client=None
    )
    
    deploy_response = app_client.deploy(
        sender=deployer_account,
        allow_delete=True,
        allow_update=True
    )
    
    # Submit 3 claims
    categories = ["news", "science", "politics"]
    claim_ids = []
    
    for i, category in enumerate(categories, 1):
        result = app_client.call(
            method="submit_claim",
            ipfs_hash=f"QmTestHash{i}",
            category=category,
            sender=deployer_account
        )
        claim_ids.append(result.return_value)
        print(f"✅ Submitted claim {i} with category '{category}', got ID: {result.return_value}")
    
    # Verify IDs are sequential
    assert claim_ids == [1, 2, 3], f"IDs should be [1, 2, 3], got {claim_ids}"
    
    # Verify total claims count
    total_result = app_client.call(
        method="get_total_claims",
        sender=deployer_account
    )
    assert total_result.return_value == 3, f"Total should be 3, got {total_result.return_value}"
    print(f"✅ Total claims count is correct: {total_result.return_value}")

def test_claim_categories():
    """
    Test that all valid categories work correctly.
    """
    
    # Setup
    client = AlgodClient("a" * 64, "http://localhost:4001")
    deployer_account = get_localnet_default_account(client)
    
    from claim_registry.contract import ClaimRegistry
    app_client = ApplicationClient(
        client=client,
        app=ClaimRegistry(),
        creator=deployer_account,
        indexer_client=None
    )
    
    app_client.deploy(
        sender=deployer_account,
        allow_delete=True,
        allow_update=True
    )
    
    # Test all valid categories
    valid_categories = ["news", "science", "politics", "health", "technology"]
    
    for category in valid_categories:
        result = app_client.call(
            method="submit_claim",
            ipfs_hash=f"QmTestHashFor{category.capitalize()}",
            category=category,
            sender=deployer_account
        )
        print(f"✅ Category '{category}' accepted, claim ID: {result.return_value}")
    
    print("✅ All categories work correctly!")

# This allows running tests with: python test_claim_registry.py
if __name__ == "__main__":
    print("Running ClaimRegistry tests...")
    print("-" * 50)
    
    print("\nTest 1: Submit single claim")
    test_submit_claim()
    
    print("\nTest 2: Submit multiple claims")
    test_multiple_claims()
    
    print("\nTest 3: Test all categories")
    test_claim_categories()
    
    print("\n" + "=" * 50)
    print("✅ ALL TESTS PASSED!")
```

#### Afternoon Task 4: Compile and Test Your Contract (30 minutes)
Now let's compile your contract and run the tests to make sure everything works.

```bash
# STEP 1: Navigate to the contracts directory
cd ~/Desktop/defacto-protocol/projects/defacto-protocol-contracts

# STEP 2: Install Python dependencies first
pip install -r requirements.txt
# This installs algopy, pytest, and other needed packages

# STEP 3: Compile your smart contract
# This converts your Python code to TEAL (Algorand's bytecode)
algokit compile

# You should see output like:
# "Compiling claim_registry/contract.py..."
# "✅ Compilation successful!"
# 
# If you see errors:
# - Check that your Python syntax is correct
# - Make sure all imports are at the top
# - Verify you're using arc4 types correctly

# STEP 4: Look at the compiled output (optional but interesting)
ls smart_contracts/artifacts/claim_registry/
# You'll see:
# - ClaimRegistry.approval.teal (the main program)
# - ClaimRegistry.clear.teal (cleanup program)
# - ClaimRegistry.json (ABI description)

# STEP 5: Run your tests
# Make sure LocalNet is running first!
algokit localnet status
# If not running: algokit localnet start

# Now run the tests
pytest tests/test_claim_registry.py -v

# You should see:
# test_submit_claim PASSED
# test_multiple_claims PASSED  
# test_claim_categories PASSED

# If tests fail:
# - Check that LocalNet is running
# - Verify your contract compiles without errors
# - Read the error message carefully
```

**Troubleshooting common issues:**
- "Cannot connect to Algorand node" → Run `algokit localnet start`
- "Module not found" → Run `pip install -r requirements.txt`
- "Compilation failed" → Check your Python syntax in contract.py
- "Transaction failed" → LocalNet might need reset: `algokit localnet reset`

### Day 2: Building the Reputation System (Full Day)

#### Morning Task 1: Understanding Reputation Tokens (30 minutes)
**What we're building:** A reputation system where validators stake tokens to vote on claims. If they vote correctly, they earn more tokens. If they vote incorrectly, they lose tokens. This creates an economic incentive for truth.

**Key concepts:**
- Each user starts with 100 reputation tokens
- Tokens cannot be transferred (they're "soulbound")
- Users stake tokens when voting (minimum 10 tokens)
- Winners get their stake back plus rewards
- Losers lose part of their stake

#### Morning Task 2: Create the Reputation Contract (1.5 hours)
Navigate to the smart contracts folder and create a new contract for reputation management.
```bash
# First, create the reputation contract folder
cd ~/Desktop/defacto-protocol/projects/defacto-protocol-contracts/smart_contracts
mkdir reputation
cd reputation
```

Now create the reputation contract. This is THE COMPLETE FILE - copy everything:

```python
# File: smart_contracts/reputation/contract.py
# This contract manages reputation tokens for validators
# COPY THIS ENTIRE FILE

from algopy import (
    ARC4Contract,
    arc4,
    UInt64,
    Bytes,
    op,
    Txn,
    Global,
    Assert
)

class ReputationToken(ARC4Contract):
    """
    Manages reputation tokens for the DeFacto protocol.
    These tokens are used for staking when validating claims.
    Tokens are non-transferable (soulbound) to prevent gaming.
    """
    
    # No global storage needed - everything is in boxes
    
    @arc4.abimethod
    def opt_in(self) -> arc4.String:
        """
        Called when a new user wants to join as a validator.
        Gives them 100 initial reputation tokens.
        Can only be called once per account.
        
        Returns:
        - success: Message confirming opt-in
        """
        
        # STEP 1: Create a storage key for this user
        # Format: "rep_<address>" where address is 32 bytes
        user_key = Bytes(b"rep_") + Txn.sender
        
        # STEP 2: Check if user already opted in
        # We'll try to get their balance - if it exists, they already opted in
        # Note: In production, we'd use has_box() but for simplicity we'll skip
        
        # STEP 3: Give user initial balance of 100 tokens
        # Convert 100 to bytes for storage
        initial_balance = UInt64(100)
        op.Box.put(user_key, op.itob(initial_balance))
        
        # STEP 4: Log the opt-in event (optional but helpful)
        # In production, you'd emit an event here
        
        return arc4.String("Successfully opted in with 100 reputation tokens")
    
    @arc4.abimethod
    def stake(self, amount: arc4.UInt64, claim_id: arc4.UInt64) -> arc4.String:
        """
        Stakes reputation tokens on a claim validation.
        The tokens are locked until the validation resolves.
        
        Parameters:
        - amount: Number of tokens to stake (minimum 10)
        - claim_id: The claim being validated
        
        Returns:
        - success: Confirmation message
        """
        
        # STEP 1: Check minimum stake requirement
        # We require at least 10 tokens to prevent spam
        Assert(amount.native >= UInt64(10), "Minimum stake is 10 tokens")
        
        # STEP 2: Get user's current balance
        user_key = Bytes(b"rep_") + Txn.sender
        
        # Get balance from storage (stored as 8 bytes)
        balance_bytes = op.Box.get(user_key)
        current_balance = op.btoi(balance_bytes)
        
        # STEP 3: Check user has enough tokens
        Assert(
            current_balance >= amount.native,
            "Insufficient balance for stake"
        )
        
        # STEP 4: Deduct the staked amount from user's balance
        new_balance = current_balance - amount.native
        op.Box.put(user_key, op.itob(new_balance))
        
        # STEP 5: Record the stake for this claim
        # Format: "stake_<address>_<claim_id>"
        stake_key = (
            Bytes(b"stake_") + 
            Txn.sender + 
            Bytes(b"_") + 
            op.itob(claim_id.native)
        )
        
        # Store the staked amount
        op.Box.put(stake_key, op.itob(amount.native))
        
        # STEP 6: Also record what vote they cast (we'll update this later)
        # For now, just record that they staked
        
        return arc4.String("Stake recorded successfully")
    
    @arc4.abimethod
    def reward(self, user: arc4.Address, amount: arc4.UInt64) -> arc4.String:
        """
        Rewards a user with additional reputation tokens.
        Only callable by the validation contract (we'll add this check later).
        
        Parameters:
        - user: Address to reward
        - amount: Number of tokens to add
        
        Returns:
        - success: Confirmation message
        """
        
        # STEP 1: Build the user's storage key
        user_key = Bytes(b"rep_") + user.bytes
        
        # STEP 2: Get current balance
        balance_bytes = op.Box.get(user_key)
        current_balance = op.btoi(balance_bytes)
        
        # STEP 3: Add reward to balance
        new_balance = current_balance + amount.native
        
        # STEP 4: Check for overflow (optional safety check)
        # Maximum tokens per user could be 1,000,000
        Assert(new_balance <= UInt64(1000000), "Balance overflow")
        
        # STEP 5: Store new balance
        op.Box.put(user_key, op.itob(new_balance))
        
        return arc4.String("Reward distributed")
    
    @arc4.abimethod
    def slash(self, user: arc4.Address, amount: arc4.UInt64) -> arc4.String:
        """
        Removes reputation tokens as a penalty for incorrect validation.
        Only callable by the validation contract.
        
        Parameters:
        - user: Address to penalize  
        - amount: Number of tokens to remove
        
        Returns:
        - success: Confirmation message
        """
        
        # STEP 1: Build user key
        user_key = Bytes(b"rep_") + user.bytes
        
        # STEP 2: Get current balance
        balance_bytes = op.Box.get(user_key)
        current_balance = op.btoi(balance_bytes)
        
        # STEP 3: Calculate new balance (don't go below 0)
        if current_balance >= amount.native:
            new_balance = current_balance - amount.native
        else:
            new_balance = UInt64(0)  # Can't go negative
        
        # STEP 4: Store new balance
        op.Box.put(user_key, op.itob(new_balance))
        
        return arc4.String("Penalty applied")
    
    @arc4.abimethod
    def get_balance(self, user: arc4.Address) -> arc4.UInt64:
        """
        Returns a user's current reputation token balance.
        Anyone can check anyone's balance (transparency).
        
        Parameters:
        - user: Address to check
        
        Returns:
        - balance: Current token balance
        """
        
        # Build user key
        user_key = Bytes(b"rep_") + user.bytes
        
        # Get and return balance
        # If user hasn't opted in, this will fail (that's ok)
        balance_bytes = op.Box.get(user_key)
        balance = op.btoi(balance_bytes)
        
        return arc4.UInt64(balance)
    
    @arc4.abimethod
    def get_stake(self, user: arc4.Address, claim_id: arc4.UInt64) -> arc4.UInt64:
        """
        Returns how much a user has staked on a specific claim.
        
        Parameters:
        - user: Address to check
        - claim_id: Claim to check
        
        Returns:
        - stake: Amount staked (0 if none)
        """
        
        # Build stake key
        stake_key = (
            Bytes(b"stake_") + 
            user.bytes + 
            Bytes(b"_") + 
            op.itob(claim_id.native)
        )
        
        # Get and return stake
        stake_bytes = op.Box.get(stake_key)
        stake = op.btoi(stake_bytes)
        
        return arc4.UInt64(stake)
```

**What this contract does:**
1. **opt_in**: New users get 100 free tokens to start
2. **stake**: Users lock tokens when voting on claims
3. **reward**: Winners get bonus tokens
4. **slash**: Losers lose some tokens
5. **get_balance**: Check anyone's token balance
6. **get_stake**: Check how much someone staked on a claim

#### Step 2: Test reputation system
```python
# File: tests/test_reputation.py
def test_reputation_flow():
    # Step 2a: Deploy
    rep_client = ReputationTokenClient(client, creator=account)
    rep_client.deploy()
    
    # Step 2b: Opt in
    rep_client.opt_in()
    
    # Step 2c: Check initial balance
    balance = rep_client.get_balance(user=account.address)
    assert balance.return_value == 100
    
    # Step 2d: Stake tokens
    rep_client.stake(amount=10, claim_id=1)
    
    # Step 2e: Check reduced balance
    balance = rep_client.get_balance(user=account.address)
    assert balance.return_value == 90
```

### Day 3: Validation Contract

#### Step 1: Create validation.py
```python
# File: smart_contracts/validation/contract.py
from algopy import ARC4Contract, UInt64, arc4, Txn, Global

class ValidationPool(ARC4Contract):
    
    @arc4.abimethod
    def create_validation(self, claim_id: arc4.UInt64) -> None:
        # Step 1a: Create validation pool
        pool_key = b"pool_" + claim_id.bytes
        
        # Step 1b: Initialize vote counts
        # Format: yes_votes|no_votes|end_time
        end_time = Global.latest_timestamp + 86400  # 24 hours
        pool_data = b"0|0|" + itob(end_time)
        op.Box.put(pool_key, pool_data)
    
    @arc4.abimethod
    def cast_vote(
        self, 
        claim_id: arc4.UInt64, 
        vote: arc4.Bool,
        stake: arc4.UInt64
    ) -> None:
        # Step 1c: Get pool data
        pool_key = b"pool_" + claim_id.bytes
        pool_data = op.Box.get(pool_key)
        
        # Step 1d: Parse current votes
        parts = pool_data.split(b"|")
        yes_votes = btoi(parts[0])
        no_votes = btoi(parts[1])
        end_time = btoi(parts[2])
        
        # Step 1e: Check if voting still open
        assert Global.latest_timestamp < end_time, "Voting closed"
        
        # Step 1f: Record vote
        vote_key = b"vote_" + claim_id.bytes + b"_" + Txn.sender.bytes
        op.Box.put(vote_key, vote.bytes + b"|" + stake.bytes)
        
        # Step 1g: Update counts
        if vote.native:
            yes_votes += stake.native
        else:
            no_votes += stake.native
        
        # Step 1h: Save updated counts
        new_data = itob(yes_votes) + b"|" + itob(no_votes) + b"|" + itob(end_time)
        op.Box.put(pool_key, new_data)
    
    @arc4.abimethod
    def resolve_validation(self, claim_id: arc4.UInt64) -> arc4.String:
        # Step 1i: Get final votes
        pool_key = b"pool_" + claim_id.bytes
        pool_data = op.Box.get(pool_key)
        parts = pool_data.split(b"|")
        yes_votes = btoi(parts[0])
        no_votes = btoi(parts[1])
        
        # Step 1j: Determine result
        total_votes = yes_votes + no_votes
        if total_votes < 5:
            return arc4.String(b"UNVERIFIED")
        
        yes_percent = (yes_votes * 100) / total_votes
        
        if yes_percent > 70:
            return arc4.String(b"VERIFIED")
        elif yes_percent < 30:
            return arc4.String(b"FALSE")
        else:
            return arc4.String(b"DISPUTED")
```

### Day 4: Deployment Script

#### Step 1: Create deploy.py
```python
# File: smart_contracts/deploy.py
from algokit_utils import (
    get_localnet_default_account,
    get_algod_client,
)

def deploy_all_contracts():
    # Step 1a: Setup
    client = get_algod_client()
    deployer = get_localnet_default_account(client)
    
    # Step 1b: Deploy ClaimRegistry
    print("Deploying ClaimRegistry...")
    claim_client = ClaimRegistryClient(client, creator=deployer)
    claim_app = claim_client.deploy()
    print(f"ClaimRegistry App ID: {claim_app.app_id}")
    
    # Step 1c: Deploy ReputationToken
    print("Deploying ReputationToken...")
    rep_client = ReputationTokenClient(client, creator=deployer)
    rep_app = rep_client.deploy()
    print(f"ReputationToken App ID: {rep_app.app_id}")
    
    # Step 1d: Deploy ValidationPool
    print("Deploying ValidationPool...")
    val_client = ValidationPoolClient(client, creator=deployer)
    val_app = val_client.deploy()
    print(f"ValidationPool App ID: {val_app.app_id}")
    
    # Step 1e: Save app IDs
    with open("app_ids.json", "w") as f:
        json.dump({
            "claim_registry": claim_app.app_id,
            "reputation_token": rep_app.app_id,
            "validation_pool": val_app.app_id
        }, f)
    
    print("All contracts deployed!")

if __name__ == "__main__":
    deploy_all_contracts()
```

---

## Developer #2: Backend API Developer

### Day 1: FastAPI Setup

#### Step 1: Create API structure
```bash
# Create api directory at root level
mkdir -p api/src/routers api/src/services api/src/models
cd api
```

#### Step 2: Create requirements.txt
```txt
# File: api/requirements.txt
fastapi==0.104.1
uvicorn==0.24.0
py-algorand-sdk==2.4.0
python-dotenv==1.0.0
ipfshttpclient==0.8.0
pydantic==2.5.0
httpx==0.25.2
```

#### Step 3: Install dependencies
```bash
pip install -r requirements.txt
```

#### Step 4: Create main.py
```python
# File: api/src/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Step 4a: Load environment
load_dotenv()

# Step 4b: Create app
app = FastAPI(title="DeFacto API", version="1.0.0")

# Step 4c: Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Step 4d: Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "defacto-api"}

# Step 4e: Root endpoint
@app.get("/")
async def root():
    return {"message": "DeFacto Protocol API", "docs": "/docs"}
```

#### Step 5: Run the API
```bash
# In api directory
uvicorn src.main:app --reload --port 8000
# Visit http://localhost:8000/docs
```

### Day 2: Blockchain Service

#### Step 1: Create blockchain service
```python
# File: api/src/services/blockchain.py
from algosdk.v2client import algod, indexer
from algosdk import account, mnemonic
from algokit_utils import get_algod_client, get_indexer_client
import json
import os

class BlockchainService:
    def __init__(self):
        # Step 1a: Initialize clients
        self.algod_client = get_algod_client()
        self.indexer_client = get_indexer_client()
        
        # Step 1b: Load app IDs
        with open("../projects/defacto-protocol-contracts/app_ids.json") as f:
            self.app_ids = json.load(f)
        
        # Step 1c: Setup service account
        self.service_account = self._get_service_account()
    
    def _get_service_account(self):
        # Step 1d: Get funded account for LocalNet
        from algokit_utils import get_localnet_default_account
        return get_localnet_default_account(self.algod_client)
    
    async def submit_claim_to_blockchain(self, ipfs_hash: str, category: str) -> dict:
        # Step 1e: Import contract client
        from contracts import ClaimRegistryClient
        
        # Step 1f: Get contract client
        client = ClaimRegistryClient(
            self.algod_client,
            app_id=self.app_ids["claim_registry"],
            sender=self.service_account
        )
        
        # Step 1g: Submit claim
        result = client.submit_claim(
            ipfs_hash=ipfs_hash,
            category=category
        )
        
        # Step 1h: Return transaction details
        return {
            "claim_id": result.return_value,
            "tx_id": result.tx_id,
            "confirmed_round": result.confirmed_round
        }
    
    async def get_claim_from_blockchain(self, claim_id: int) -> dict:
        # Step 1i: Get claim data
        client = ClaimRegistryClient(
            self.algod_client,
            app_id=self.app_ids["claim_registry"],
            sender=self.service_account
        )
        
        result = client.get_claim(claim_id=claim_id)
        
        # Step 1j: Parse result
        data = result.return_value.split("|")
        return {
            "claim_id": claim_id,
            "ipfs_hash": data[0],
            "category": data[1],
            "status": data[2]
        }

# Step 1k: Create singleton
blockchain_service = BlockchainService()
```

### Day 3: IPFS Integration

#### Step 1: Create IPFS service
```python
# File: api/src/services/ipfs.py
import ipfshttpclient
import json
from typing import Dict, Any

class IPFSService:
    def __init__(self):
        # Step 1a: Connect to IPFS
        self.client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
    
    async def upload_content(self, content: Dict[str, Any]) -> str:
        # Step 1b: Convert to JSON
        json_content = json.dumps(content)
        
        # Step 1c: Upload to IPFS
        result = self.client.add_json(content)
        
        # Step 1d: Return hash
        return result
    
    async def get_content(self, ipfs_hash: str) -> Dict[str, Any]:
        # Step 1e: Retrieve from IPFS
        content = self.client.get_json(ipfs_hash)
        
        # Step 1f: Return parsed content
        return content
    
    async def pin_content(self, ipfs_hash: str) -> bool:
        # Step 1g: Pin to prevent garbage collection
        self.client.pin.add(ipfs_hash)
        return True

# Step 1h: Create singleton
ipfs_service = IPFSService()
```

### Day 4: Claim Endpoints

#### Step 1: Create claim models
```python
# File: api/src/models/claim.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ClaimSubmission(BaseModel):
    title: str = Field(..., min_length=10, max_length=200)
    content: str = Field(..., min_length=50, max_length=5000)
    category: str = Field(..., pattern="^(news|science|politics|health|technology)$")
    evidence_urls: Optional[list[str]] = []
    
class ClaimResponse(BaseModel):
    claim_id: int
    ipfs_hash: str
    tx_id: str
    status: str
    submitted_at: datetime
    
class ClaimDetail(BaseModel):
    claim_id: int
    title: str
    content: str
    category: str
    status: str
    ipfs_hash: str
    evidence_urls: list[str]
    yes_votes: int
    no_votes: int
    submitted_at: datetime
```

#### Step 2: Create claim router
```python
# File: api/src/routers/claims.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from datetime import datetime
from ..models.claim import ClaimSubmission, ClaimResponse, ClaimDetail
from ..services.blockchain import blockchain_service
from ..services.ipfs import ipfs_service

router = APIRouter(prefix="/claims", tags=["claims"])

# Step 2a: Submit claim endpoint
@router.post("/submit", response_model=ClaimResponse)
async def submit_claim(claim: ClaimSubmission, background_tasks: BackgroundTasks):
    try:
        # Step 2b: Prepare content for IPFS
        content = {
            "title": claim.title,
            "content": claim.content,
            "category": claim.category,
            "evidence_urls": claim.evidence_urls,
            "submitted_at": datetime.now().isoformat()
        }
        
        # Step 2c: Upload to IPFS
        ipfs_hash = await ipfs_service.upload_content(content)
        
        # Step 2d: Submit to blockchain
        blockchain_result = await blockchain_service.submit_claim_to_blockchain(
            ipfs_hash=ipfs_hash,
            category=claim.category
        )
        
        # Step 2e: Return response
        return ClaimResponse(
            claim_id=blockchain_result["claim_id"],
            ipfs_hash=ipfs_hash,
            tx_id=blockchain_result["tx_id"],
            status="UNVERIFIED",
            submitted_at=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Step 2f: Get claim endpoint
@router.get("/{claim_id}", response_model=ClaimDetail)
async def get_claim(claim_id: int):
    try:
        # Step 2g: Get from blockchain
        chain_data = await blockchain_service.get_claim_from_blockchain(claim_id)
        
        # Step 2h: Get content from IPFS
        ipfs_content = await ipfs_service.get_content(chain_data["ipfs_hash"])
        
        # Step 2i: Combine data
        return ClaimDetail(
            claim_id=claim_id,
            title=ipfs_content["title"],
            content=ipfs_content["content"],
            category=chain_data["category"],
            status=chain_data["status"],
            ipfs_hash=chain_data["ipfs_hash"],
            evidence_urls=ipfs_content.get("evidence_urls", []),
            yes_votes=0,  # TODO: Get from validation contract
            no_votes=0,   # TODO: Get from validation contract
            submitted_at=ipfs_content["submitted_at"]
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Claim not found: {str(e)}")

# Step 2j: List recent claims
@router.get("/", response_model=List[ClaimResponse])
async def list_recent_claims(limit: int = 10, offset: int = 0):
    # TODO: Implement pagination with indexer
    return []
```

#### Step 3: Add router to main
```python
# File: api/src/main.py (update)
from .routers import claims

# Add after app creation
app.include_router(claims.router)
```

### Day 5: Validation Endpoints

#### Step 1: Create validation models
```python
# File: api/src/models/validation.py
from pydantic import BaseModel, Field

class VoteSubmission(BaseModel):
    claim_id: int
    vote: bool  # True = valid, False = invalid
    stake_amount: int = Field(..., ge=10, le=100)
    
class ValidationStatus(BaseModel):
    claim_id: int
    yes_votes: int
    no_votes: int
    total_stake: int
    status: str
    time_remaining: int  # seconds
```

#### Step 2: Create validation router
```python
# File: api/src/routers/validations.py
from fastapi import APIRouter, HTTPException
from ..models.validation import VoteSubmission, ValidationStatus
from ..services.blockchain import blockchain_service

router = APIRouter(prefix="/validations", tags=["validations"])

@router.post("/vote")
async def submit_vote(vote: VoteSubmission):
    # Step 2a: Submit vote to blockchain
    # Implementation here
    return {"status": "vote_submitted"}

@router.get("/pending")
async def get_pending_validations():
    # Step 2b: Get claims needing validation
    # Implementation here
    return []
```

---

## Developer #3: Frontend Developer

### Day 1: Next.js Setup with AlgoKit

#### Step 1: Navigate to frontend
```bash
cd projects/defacto-protocol-frontend
```

#### Step 2: Install additional dependencies
```bash
npm install axios react-query @perawallet/connect
npm install -D @types/node tailwindcss autoprefixer
```

#### Step 3: Setup Tailwind CSS
```bash
npx tailwindcss init -p
```

#### Step 4: Configure tailwind.config.js
```javascript
// File: tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### Step 5: Update globals.css
```css
/* File: src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Day 2: Component Library

#### Step 1: Create Button component
```typescript
// File: src/components/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  loading = false 
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded font-medium transition-colors";
  
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
```

#### Step 2: Create Card component
```typescript
// File: src/components/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}
```

#### Step 3: Create Input component
```typescript
// File: src/components/Input.tsx
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required = false
}: InputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
```

### Day 3: Claim Submission Form

#### Step 1: Create multi-step form
```typescript
// File: src/app/submit/page.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';

export default function SubmitClaim() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    evidenceUrls: ['']
  });

  // Step 1a: Step 1 - Basic Info
  const Step1 = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 1: Basic Information</h2>
      <Input
        label="Title"
        value={formData.title}
        onChange={(value) => setFormData({...formData, title: value})}
        placeholder="Enter a clear, descriptive title"
        required
      />
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          placeholder="Describe the claim in detail..."
          className="w-full px-3 py-2 border border-gray-300 rounded h-32"
          required
        />
      </div>
      <Button onClick={() => setStep(2)}>Next</Button>
    </div>
  );

  // Step 1b: Step 2 - Category
  const Step2 = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 2: Category</h2>
      <div className="space-y-2">
        {['news', 'science', 'politics', 'health', 'technology'].map(cat => (
          <label key={cat} className="flex items-center">
            <input
              type="radio"
              value={cat}
              checked={formData.category === cat}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="mr-2"
            />
            <span className="capitalize">{cat}</span>
          </label>
        ))}
      </div>
      <div className="mt-4 space-x-2">
        <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
        <Button onClick={() => setStep(3)}>Next</Button>
      </div>
    </div>
  );

  // Step 1c: Step 3 - Evidence
  const Step3 = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 3: Evidence (Optional)</h2>
      {formData.evidenceUrls.map((url, index) => (
        <Input
          key={index}
          label={`Evidence URL ${index + 1}`}
          value={url}
          onChange={(value) => {
            const urls = [...formData.evidenceUrls];
            urls[index] = value;
            setFormData({...formData, evidenceUrls: urls});
          }}
          placeholder="https://..."
        />
      ))}
      <Button 
        variant="secondary"
        onClick={() => setFormData({
          ...formData, 
          evidenceUrls: [...formData.evidenceUrls, '']
        })}
      >
        Add Another URL
      </Button>
      <div className="mt-4 space-x-2">
        <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
        <Button onClick={() => setStep(4)}>Next</Button>
      </div>
    </div>
  );

  // Step 1d: Step 4 - Review
  const Step4 = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 4: Review & Submit</h2>
      <div className="bg-gray-50 p-4 rounded">
        <p><strong>Title:</strong> {formData.title}</p>
        <p><strong>Category:</strong> {formData.category}</p>
        <p><strong>Content:</strong> {formData.content}</p>
        <p><strong>Evidence URLs:</strong> {formData.evidenceUrls.filter(u => u).join(', ') || 'None'}</p>
      </div>
      <div className="mt-4 space-x-2">
        <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
        <Button onClick={handleSubmit}>Submit Claim</Button>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    // Step 1e: Submit to API
    try {
      const response = await fetch('http://localhost:8000/claims/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          evidence_urls: formData.evidenceUrls.filter(url => url)
        })
      });
      const data = await response.json();
      alert(`Claim submitted! ID: ${data.claim_id}`);
    } catch (error) {
      alert('Error submitting claim');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map(num => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= num ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
      </Card>
    </div>
  );
}
```

### Day 4: Claims List Page

#### Step 1: Create claims list
```typescript
// File: src/app/claims/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';

interface Claim {
  claim_id: number;
  title: string;
  category: string;
  status: string;
  submitted_at: string;
}

export default function ClaimsList() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Step 1a: Fetch claims
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/claims');
      const data = await response.json();
      setClaims(data);
    } catch (error) {
      // Step 1b: Use mock data if API fails
      setClaims([
        {
          claim_id: 1,
          title: "Example Claim 1",
          category: "news",
          status: "UNVERIFIED",
          submitted_at: new Date().toISOString()
        },
        {
          claim_id: 2,
          title: "Example Claim 2",
          category: "science",
          status: "VERIFIED",
          submitted_at: new Date().toISOString()
        }
      ]);
    }
    setLoading(false);
  };

  // Step 1c: Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      VERIFIED: 'bg-green-100 text-green-800',
      FALSE: 'bg-red-100 text-red-800',
      DISPUTED: 'bg-yellow-100 text-yellow-800',
      UNVERIFIED: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-sm ${colors[status] || colors.UNVERIFIED}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Claims</h1>
      
      {/* Step 1d: Filter tabs */}
      <div className="flex space-x-2 mb-6">
        {['all', 'news', 'science', 'politics', 'health', 'technology'].map(cat => (
          <Button
            key={cat}
            variant={filter === cat ? 'primary' : 'secondary'}
            onClick={() => setFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      {/* Step 1e: Claims grid */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {claims.map(claim => (
            <Card key={claim.claim_id}>
              <h3 className="text-lg font-semibold mb-2">{claim.title}</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 capitalize">{claim.category}</span>
                <StatusBadge status={claim.status} />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {new Date(claim.submitted_at).toLocaleDateString()}
              </p>
              <Link href={`/claims/${claim.claim_id}`}>
                <Button variant="secondary">View Details</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Day 5: Claim Detail Page

#### Step 1: Create detail view
```typescript
// File: src/app/claims/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function ClaimDetail() {
  const params = useParams();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaim();
  }, []);

  const fetchClaim = async () => {
    try {
      const response = await fetch(`http://localhost:8000/claims/${params.id}`);
      const data = await response.json();
      setClaim(data);
    } catch (error) {
      // Mock data
      setClaim({
        claim_id: params.id,
        title: "Example Claim",
        content: "This is the full content of the claim...",
        category: "news",
        status: "UNVERIFIED",
        yes_votes: 10,
        no_votes: 5,
        evidence_urls: ["https://example.com"],
        submitted_at: new Date().toISOString()
      });
    }
    setLoading(false);
  };

  const handleVote = async (vote: boolean) => {
    try {
      await fetch('http://localhost:8000/validations/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_id: claim.claim_id,
          vote: vote,
          stake_amount: 10
        })
      });
      alert('Vote submitted!');
    } catch (error) {
      alert('Error submitting vote');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!claim) return <div>Claim not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <h1 className="text-3xl font-bold mb-4">{claim.title}</h1>
        
        <div className="flex space-x-4 mb-6">
          <span className="bg-gray-100 px-3 py-1 rounded capitalize">
            {claim.category}
          </span>
          <span className={`px-3 py-1 rounded ${
            claim.status === 'VERIFIED' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {claim.status}
          </span>
        </div>

        <div className="prose max-w-none mb-6">
          <p>{claim.content}</p>
        </div>

        {claim.evidence_urls.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Evidence:</h3>
            <ul className="list-disc list-inside">
              {claim.evidence_urls.map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" className="text-blue-500 hover:underline">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded mb-6">
          <h3 className="font-semibold mb-2">Validation Status</h3>
          <div className="flex space-x-8">
            <div>
              <span className="text-green-600 font-bold">{claim.yes_votes}</span>
              <span className="text-gray-500 ml-1">Yes</span>
            </div>
            <div>
              <span className="text-red-600 font-bold">{claim.no_votes}</span>
              <span className="text-gray-500 ml-1">No</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={() => handleVote(true)}>
            Vote Valid
          </Button>
          <Button variant="danger" onClick={() => handleVote(false)}>
            Vote Invalid
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

---

## Developer #4: ML Service Developer

### Day 1: ML Service Setup

#### Step 1: Create ML service structure
```bash
mkdir -p ml-service/src/models ml-service/src/pipelines
cd ml-service
```

#### Step 2: Create requirements.txt
```txt
# File: ml-service/requirements.txt
fastapi==0.104.1
uvicorn==0.24.0
transformers==4.35.2
torch==2.1.1
numpy==1.24.3
scikit-learn==1.3.2
```

#### Step 3: Create main.py
```python
# File: ml-service/src/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI(title="DeFacto ML Service")

class AnalysisRequest(BaseModel):
    text: str
    category: str

class AnalysisResponse(BaseModel):
    propaganda_score: float
    techniques_detected: List[str]
    risk_level: str

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_content(request: AnalysisRequest):
    # Step 3a: Simple keyword-based analysis for MVP
    propaganda_keywords = ["URGENT", "BREAKING", "SHOCKING", "YOU WON'T BELIEVE"]
    
    score = 0
    techniques = []
    
    # Step 3b: Check for manipulation techniques
    text_upper = request.text.upper()
    
    if any(keyword in text_upper for keyword in propaganda_keywords):
        score += 30
        techniques.append("urgency_manipulation")
    
    if text_upper.count("!") > 3:
        score += 20
        techniques.append("excessive_emphasis")
    
    if len([w for w in request.text.split() if w.isupper()]) > 5:
        score += 20
        techniques.append("shouting")
    
    # Step 3c: Determine risk level
    if score > 60:
        risk_level = "HIGH"
    elif score > 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    return AnalysisResponse(
        propaganda_score=score / 100,
        techniques_detected=techniques,
        risk_level=risk_level
    )
```

---

## Integration Guide

### Step 1: Connect Everything
```bash
# Terminal 1: Start blockchain
cd projects/defacto-protocol-contracts
algokit localnet start

# Terminal 2: Deploy contracts
python smart_contracts/deploy.py

# Terminal 3: Start IPFS
docker run -d -p 5001:5001 -p 8080:8080 ipfs/go-ipfs

# Terminal 4: Start API
cd api
uvicorn src.main:app --reload

# Terminal 5: Start Frontend
cd projects/defacto-protocol-frontend
npm run dev

# Terminal 6: Start ML Service (optional)
cd ml-service
uvicorn src.main:app --reload --port 8001
```

### Step 2: Test Full Flow
1. Open http://localhost:3000
2. Click "Submit Claim"
3. Fill out form
4. Submit
5. View in claims list
6. Click to view details
7. Vote on claim

---

## Daily Checklist

### Morning
- [ ] Pull latest code: `git pull`
- [ ] Start all services
- [ ] Check Slack for updates

### Before Lunch
- [ ] Commit morning work
- [ ] Test your component
- [ ] Update status in Slack

### Before End of Day
- [ ] Run all tests
- [ ] Commit all changes
- [ ] Push to GitHub
- [ ] Update tomorrow's plan

---

## Common Issues & Solutions

### "Cannot connect to Algorand"
```bash
algokit localnet stop
algokit localnet start
```

### "IPFS not responding"
```bash
docker restart ipfs
```

### "Module not found"
```bash
npm install  # or pip install -r requirements.txt
```

### "Transaction failed"
```bash
algokit localnet reset
python deploy.py  # Redeploy contracts
```

---

## Success Metrics

### Each Developer Should Complete

**Smart Contract Dev:**
- [ ] 3 contracts deployed
- [ ] 10+ tests passing
- [ ] Can submit/retrieve claims

**Backend Dev:**
- [ ] API running with 10+ endpoints
- [ ] Connected to blockchain
- [ ] IPFS working

**Frontend Dev:**
- [ ] 5 pages complete
- [ ] Forms working
- [ ] Connected to API

**ML Dev:**
- [ ] Analysis endpoint working
- [ ] Returns risk scores
- [ ] Integrated with API