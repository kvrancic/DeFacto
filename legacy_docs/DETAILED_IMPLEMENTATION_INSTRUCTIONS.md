# DeFacto Protocol - Detailed Implementation Instructions

## CRITICAL: Read This First
This guide tells you WHAT to build and WHY, not just HOW. Each section explains the concepts, the flow, potential problems, and gives you enough code snippets to understand the pattern. You'll write the actual code yourself, but you'll know exactly what it needs to do.

## FOR AI ASSISTANTS: Important Implementation Notes
If you're an AI helping a developer implement their part:
1. **Expand features** - The code snippets here are minimal. Add proper error handling, logging, validation, and edge cases.
2. **Generate test scripts** - After EVERY feature, create a test script to verify it works.
3. **Check integration** - Always verify your outputs will work with other developers' code.
4. **Add improvements** - Include rate limiting, caching, retry logic, and other production features.
5. **Document everything** - Add comments, docstrings, and update README files.
6. **Before saying "done"** - Run full integration tests with all other services.

## Understanding the Big Picture

### What We're Building
We're creating a decentralized fact-checking system where:
1. **Anyone can submit claims** (news, statements, etc.)
2. **Validators stake tokens to vote** on whether claims are true or false
3. **Content is stored on IPFS** (decentralized storage), only hashes go on blockchain
4. **Smart contracts handle the logic** (claim storage, voting, rewards)
5. **API bridges blockchain to web** (users don't need to understand crypto)
6. **Frontend makes it user-friendly** (looks like a normal website)

### The Data Flow
Understanding this flow is CRITICAL:
```
User submits claim → Frontend → API → IPFS (stores content) → Blockchain (stores hash) 
                                   ↓
                          Returns claim ID to user
                                   ↓
Validators see claim → Vote with stake → Smart contract counts votes
                                   ↓
                     After 24 hours → Resolution → Winners get rewards
```

### Why This Architecture?
- **Blockchain**: Immutable record, can't be censored
- **IPFS**: Too expensive to store large data on blockchain
- **API Layer**: Abstracts complexity, handles gas fees
- **Token Stakes**: Creates economic incentive for truth

---

## Initial Setup Instructions

### Setting Up AlgoKit (Everyone starts here)

#### Understanding AlgoKit
AlgoKit is Algorand's Swiss Army knife. It gives you:
- **Local blockchain** for testing (resets on restart - perfect for development)
- **Contract templates** (boilerplate code ready to modify)
- **Testing framework** (automated testing for contracts)
- **Deployment tools** (push to TestNet/MainNet when ready)

#### Installation Steps
1. **Install the prerequisites**
   - You need Python 3.10+ (check with `python3 --version`)
   - You need Node.js 16+ (check with `node --version`)
   - You need Docker Desktop running (for local blockchain)

2. **Install AlgoKit**
   ```bash
   # The command differs by OS - pick yours:
   # Mac: brew install algorandfoundation/tap/algokit
   # Windows: winget install algorandfoundation.algokit
   # Linux: See AlgoKit docs for your distro
   ```

3. **Create the project**
   When you run `algokit init`, you'll make these choices:
   - Template: Choose "fullstack" (gives you contracts + frontend)
   - Name: "defacto-protocol" (important: use hyphens, not underscores)
   - Smart contract language: Python (easier than TEAL)
   - Frontend: React (we'll heavily modify this)

#### Project Structure You'll Get
```
defacto-protocol/
├── projects/
│   ├── defacto-protocol-contracts/    # All blockchain code
│   └── defacto-protocol-frontend/     # All web code
```

**Important**: This structure is different from typical web projects. AlgoKit wants contracts and frontend in separate "projects" folders. Don't fight it - work with it.

#### Starting Your Local Blockchain
```bash
algokit localnet start
```

What this actually does:
- Starts an Algorand node on port 4001
- Starts an indexer on port 8980 (for querying)
- Creates test accounts with fake ALGO
- Resets everything when you restart (no persistent state)

**Common Problem**: "Port already in use" - Another process is using port 4001. Find and kill it, or restart your computer.

---

## Developer #1: Smart Contract Developer

### Step 1: Understanding Algorand Smart Contracts

#### Key Concepts You MUST Understand

**1. Smart Contracts Are Programs**
- They run ON the blockchain, not on your server
- Once deployed, they can't be stopped (unless you build in a kill switch)
- They cost "gas" (ALGO) to run - more complex = more expensive
- They have strict size limits (programs must be small)

**2. Storage in Algorand**
Algorand has THREE types of storage. This is confusing but important:

- **Global State**: 64 key-value pairs max, visible to everyone
  - Use for: counters, flags, small shared data
  - Example: `claim_counter = 5`

- **Local State**: 16 key-value pairs per user
  - Use for: user-specific data tied to the contract
  - Example: `user_balance[address] = 100`

- **Box Storage**: Unlimited* storage in named boxes (*costs ALGO)
  - Use for: large data, dynamic data, claims, votes
  - Example: `box["claim_123"] = "ipfs_hash|category|status"`

**We'll use Box Storage** for claims because we don't know how many we'll have.

**3. ARC4 Standard**
This is Algorand's standard for how contracts talk to the world:
- Methods must be marked with `@arc4.abimethod`
- Parameters must use arc4 types (`arc4.String`, not `str`)
- Return values must be arc4 types too

#### Your First Contract: Claim Registry

**What This Contract Must Do:**
1. Accept new claims and store them
2. Assign unique IDs to each claim
3. Store the IPFS hash (not the actual content)
4. Track claim status (UNVERIFIED → VERIFIED/FALSE/DISPUTED)
5. Let anyone read claims
6. Only let authorized accounts update status

**The Storage Design:**
```
Global State:
- claim_counter: UInt64 (tracks next ID)

Box Storage:
- box["claim_1"]: "QmIPFSHash123|news|UNVERIFIED"
- box["claim_2"]: "QmIPFSHash456|science|VERIFIED"
```

**Method 1: submit_claim**
```python
# Pseudocode - you'll implement this
def submit_claim(ipfs_hash, category):
    1. Increment claim_counter (0 → 1 for first claim)
    2. Create key: "claim_" + counter
    3. Create value: ipfs_hash + "|" + category + "|UNVERIFIED"
    4. Store in box storage
    5. Return the claim ID
```

**Critical Details:**
- IPFS hashes are always 46 characters starting with "Qm"
- Categories are: news, science, politics, health, technology
- Status starts as "UNVERIFIED" always
- Use pipe "|" as delimiter (easy to split later)

**Common Pitfalls:**
- Forgetting to increment counter FIRST (ID 0 is confusing)
- Not converting integers to bytes for storage (`op.itob()`)
- Trying to store too much data (boxes have limits)
- Not handling the case when claim doesn't exist

**Method 2: get_claim**
```python
# What it needs to do:
def get_claim(claim_id):
    1. Build key: "claim_" + claim_id
    2. Get from box storage (will fail if doesn't exist)
    3. Return the raw data (let API parse it)
```

**Method 3: update_status**
This is tricky because you need to:
1. Get existing data
2. Parse it (split by "|")
3. Replace the status part
4. Store it back

**Security Note**: Later, add a check that only the validation contract can call this.

#### Testing Your Contract

**Test-Driven Development is MANDATORY**
Write tests BEFORE you write the contract. This ensures you understand what you're building.

**Test 1: Can I deploy the contract?**
```python
def test_deploy():
    # Deploy contract
    # Assert it has an app_id > 0
```

**Test 2: Can I submit a claim?**
```python
def test_submit_claim():
    # Submit claim with test IPFS hash
    # Assert return value is 1 (first claim)
    # Get the claim back
    # Assert data matches what we sent
```

**Test 3: Do IDs increment correctly?**
```python
def test_multiple_claims():
    # Submit 3 claims
    # Assert IDs are 1, 2, 3
    # Assert total_claims() returns 3
```

**Running Tests:**
```bash
# Always in this order:
algokit localnet start          # Start blockchain
algokit compile                 # Compile contracts
pytest tests/ -v                # Run tests verbosely
```

**When Tests Fail:**
1. Read the EXACT error message
2. Check LocalNet is running
3. Check contract compiles
4. Add print statements in tests
5. Reset LocalNet if transactions are stuck

### Step 2: Reputation System

#### Understanding the Token Economy

**The Problem We're Solving:**
Anyone can vote true/false on the internet. We need to make lying expensive and truth profitable.

**How Reputation Tokens Work:**
1. **Non-transferable**: You can't buy reputation, you earn it
2. **Stake to vote**: Risk tokens to participate
3. **Winners profit**: Correct voters get rewards
4. **Losers lose**: Wrong voters lose stake
5. **Compound growth**: Good validators get rich, bad ones go broke

**Token Flow:**
```
New user → Gets 100 free tokens
    ↓
Sees claim → Stakes 10-100 tokens on vote
    ↓
Claim resolves → Correct: Gets stake + reward
                 Wrong: Loses part of stake
```

#### Reputation Contract Design

**Storage Pattern:**
```
Box Storage:
- box["rep_ADDRESS"]: balance (as bytes)
- box["stake_ADDRESS_CLAIMID"]: amount staked
- box["vote_ADDRESS_CLAIMID"]: "true" or "false"
```

**Method: opt_in**
Give new users 100 tokens to start. But check they haven't already opted in!

**Key Decision**: How many initial tokens?
- Too few: Users can't participate much
- Too many: Devalues the token
- 100 is a good start (10 votes of 10 tokens each)

**Method: stake**
Lock tokens for a vote. Critical checks:
1. Minimum stake (10 tokens - prevents spam)
2. Maximum stake (their balance)
3. Haven't already voted on this claim
4. Claim exists and is open for voting

**Edge Cases to Handle:**
- User tries to stake more than they have
- User tries to stake on non-existent claim
- User tries to vote twice on same claim
- User has exactly 10 tokens and stakes all

**Method: resolve_stake**
After voting ends, distribute rewards/penalties:
```python
# Pseudocode for resolution logic:
if user_voted_correctly:
    new_balance = old_balance + stake + reward
else:
    new_balance = old_balance + (stake * 0.7)  # Lose 30%
```

**Important Design Choice**: 
Don't take ALL tokens from losers. Leave them 70% so they can recover. Total loss would drive users away.

### Step 3: Validation System

#### The Validation Flow

**Understanding the Timeline:**
```
Hour 0: Claim submitted → Status: UNVERIFIED
Hour 1-24: Voting period → Validators stake and vote
Hour 24: Voting closes → Count votes
Hour 24+: Resolution → Status: VERIFIED/FALSE/DISPUTED
         Rewards distributed
```

**Key Design Decisions:**

**1. Minimum Validators**
Need at least 5 voters or claim stays UNVERIFIED. Why?
- 1-2 voters could collude
- 3-4 voters isn't enough consensus  
- 5+ voters provides reasonable confidence

**2. Resolution Thresholds**
- >70% vote TRUE → Status: VERIFIED
- <30% vote TRUE → Status: FALSE
- 30-70% → Status: DISPUTED

Why not simple majority (51%)?
- 51/49 split shows no clear consensus
- 70/30 shows strong agreement
- Disputed claims need human review

**3. Stake Weighting**
Votes are weighted by stake amount:
- 10 tokens = 10 voting power
- 100 tokens = 100 voting power

This lets confident validators have more influence.

#### Validation Contract Methods

**Method: create_validation_pool**
When a claim is submitted, create a voting pool:
```
Storage:
- pool_CLAIMID_end_time: timestamp when voting ends
- pool_CLAIMID_yes_stake: total tokens staked on TRUE
- pool_CLAIMID_no_stake: total tokens staked on FALSE
- pool_CLAIMID_voters: list of addresses that voted
```

**Method: cast_vote**
Record a validator's vote:
1. Check voting period is open
2. Check user hasn't voted yet
3. Call reputation.stake() to lock tokens
4. Add stake to yes_stake or no_stake
5. Add voter to voters list

**Critical Issue**: Algorand doesn't have native arrays!
Store voters as: "addr1,addr2,addr3" and split by comma.

**Method: resolve_validation**
After 24 hours, anyone can trigger resolution:
1. Check voting period ended
2. Calculate total stakes
3. Determine winning side
4. Call reputation.reward() or reputation.slash()
5. Update claim status

**Gas Optimization Warning**: 
Rewarding 100 voters in one transaction might exceed gas limits. May need to batch or let users claim rewards.

### Step 4: Deployment & Integration

#### Deployment Script

Create a master deployment script that:
1. Deploys all contracts in order
2. Saves app IDs to JSON file
3. Sets up permissions between contracts
4. Funds contracts with minimum balance

**Contract Dependencies:**
```
ClaimRegistry (standalone)
     ↓
ReputationToken (standalone)
     ↓
ValidationPool (needs both above)
```

**Important**: Save app IDs immediately! If you lose them, you lose access to contracts.

```python
# deployment_output.json
{
    "network": "localnet",
    "claim_registry_app_id": 1001,
    "reputation_token_app_id": 1002,
    "validation_pool_app_id": 1003,
    "deployed_at": "2024-01-15T10:30:00Z"
}
```

---

## Developer #2: Backend API Developer

### Step 1: Understanding the API's Role

#### Why We Need an API Layer

**The Problem:**
Blockchain is complex. Users don't want to:
- Install wallet software
- Buy cryptocurrency for gas
- Understand transaction signing
- Wait for block confirmations
- Deal with cryptographic addresses

**The Solution:**
Your API is a translator between the blockchain and normal web users.

```
User: "Submit this claim"
  ↓
API: • Receives normal HTTP request
     • Uploads content to IPFS
     • Pays gas fees
     • Submits to blockchain
     • Returns simple JSON response
  ↓
User: "Thanks, here's my claim ID: 123"
```

#### API Architecture

**Key Components:**

1. **FastAPI Framework**
   - Why: Auto-generates documentation
   - Async support for blockchain calls
   - Type validation with Pydantic
   - Fast enough for production

2. **Service Layer Pattern**
   ```
   Router (handles HTTP) → Service (business logic) → Blockchain/IPFS
   ```
   Don't put blockchain code in routers! Services are reusable and testable.

3. **Singleton Services**
   Create once, reuse everywhere:
   ```python
   blockchain_service = BlockchainService()  # Create once
   ipfs_service = IPFSService()             # Create once
   ```

#### Setting Up Your API

**Project Structure You Need:**
```
api/
├── src/
│   ├── main.py           # FastAPI app setup
│   ├── config.py          # Environment variables
│   ├── routers/           # HTTP endpoints
│   │   ├── claims.py
│   │   └── validations.py
│   ├── services/          # Business logic
│   │   ├── blockchain.py
│   │   └── ipfs.py
│   └── models/            # Data structures
│       └── claim.py
```

**Environment Variables (.env):**
```
ALGORAND_NODE_URL=http://localhost:4001
ALGORAND_INDEXER_URL=http://localhost:8980
IPFS_API_URL=http://localhost:5001
SERVICE_ACCOUNT_MNEMONIC=<25 words>
```

**Critical**: NEVER commit .env to git! Add to .gitignore immediately.

### Step 2: Blockchain Service

#### Understanding Algorand SDK

**Key Classes You'll Use:**
- `AlgodClient`: Talks to Algorand node
- `Account`: Manages keys and signing
- `ApplicationClient`: Interacts with smart contracts
- `AtomicTransactionComposer`: Bundles transactions

#### Service Account Management

**The Service Account Problem:**
Users don't have ALGO for gas. Your API needs a funded account to pay fees.

**Setup Process:**
1. Generate account: `algokit account generate`
2. Fund it on LocalNet: `algokit account fund`
3. Store mnemonic in .env (NEVER share this!)
4. Load in service: `account.from_mnemonic()`

**Security Critical**: 
- LocalNet: Use generated account (free ALGO)
- TestNet: Use faucet funds (free test ALGO)
- MainNet: REAL MONEY - secure properly!

#### Blockchain Service Methods

**Method: submit_claim_to_blockchain**
```python
What it needs to do:
1. Load contract app ID from saved JSON
2. Create ApplicationClient for ClaimRegistry
3. Build transaction to call submit_claim
4. Sign with service account
5. Send and wait for confirmation
6. Extract claim ID from response
7. Return transaction ID and claim ID
```

**Error Handling Checklist:**
- Contract doesn't exist (wrong app ID)
- Node not reachable (LocalNet not running)
- Transaction rejected (invalid parameters)
- Timeout waiting for confirmation

**Method: get_claim_from_blockchain**
```python
What it needs to do:
1. Call get_claim method (read-only, no fee!)
2. Parse returned string (split by "|")
3. Return structured data
```

**Important**: Read calls are FREE and INSTANT. No need for transactions.

#### Common Algorand Pitfalls

1. **"Transaction pool overflow"**
   - Too many pending transactions
   - Solution: Wait or reset LocalNet

2. **"Logic eval error"**
   - Smart contract rejected transaction
   - Check parameters match contract expectations

3. **"Overspend error"**
   - Account doesn't have enough ALGO
   - Fund the service account

### Step 3: IPFS Integration

#### Understanding IPFS

**What IPFS Is:**
- Distributed file storage (like BitTorrent)
- Content-addressed (hash identifies content)
- Permanent* (*if someone pins it)
- Free to use, costs to guarantee storage

**IPFS Hash Example:**
`QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`
- Always starts with "Qm" (v0) or "bafy" (v1)
- Hash of the content (change content = different hash)
- Anyone with hash can retrieve content

#### IPFS Service Implementation

**Setup IPFS Node:**
```bash
# Install IPFS
# Initialize: ipfs init
# Start daemon: ipfs daemon
# API runs on: http://localhost:5001
```

**Method: upload_content**
```python
What it does:
1. Convert claim data to JSON
2. Upload to IPFS node
3. Get back IPFS hash
4. Pin content (prevent garbage collection)
5. Return hash
```

**Data Structure for IPFS:**
```json
{
  "title": "Claim title",
  "content": "Full claim text...",
  "evidence_urls": ["https://..."],
  "submitted_at": "2024-01-15T10:30:00Z",
  "submitter": "anonymous_id_123"
}
```

**Method: get_content**
```python
What it does:
1. Fetch content by hash
2. Parse JSON
3. Return structured data
```

**IPFS Gotchas:**
- Large files upload slowly
- Gateway might be slow/down
- Content might be garbage collected if not pinned
- IPFS hash is case-sensitive

**Production Considerations:**
- Use Pinata or Infura for reliable pinning
- Cache frequently accessed content
- Set maximum file size limits
- Scan for malicious content

### Step 4: API Endpoints

#### RESTful Design Principles

**Your API Should Be Predictable:**
```
GET    /claims        → List claims
POST   /claims        → Create claim
GET    /claims/{id}   → Get specific claim
PUT    /claims/{id}   → Update claim
DELETE /claims/{id}   → Delete claim (we won't allow this)
```

#### Claims Router

**Endpoint: POST /claims/submit**

Input validation is CRITICAL:
```python
class ClaimSubmission(BaseModel):
    title: str          # Length: 10-200 chars
    content: str        # Length: 50-5000 chars
    category: str       # Must be: news|science|politics|health|technology
    evidence_urls: List[str]  # Optional, validate URLs
```

**Processing Flow:**
1. Validate input with Pydantic
2. Upload to IPFS (get hash)
3. Submit to blockchain (get ID)
4. Store in local database (for fast queries)
5. Return response with claim ID

**Error Responses:**
- 400: Invalid input (validation failed)
- 500: Blockchain error
- 503: IPFS unavailable

**Endpoint: GET /claims/{claim_id}**

Optimization opportunity:
1. Try local database first (fast)
2. Fall back to blockchain (slow)
3. Cache result for future

**Endpoint: GET /claims**

Pagination is MANDATORY:
```python
Query parameters:
- limit: int = 10  (max 100)
- offset: int = 0
- category: str = None
- status: str = None
- sort: str = "newest"
```

#### Validation Router

**Endpoint: POST /validations/vote**

This is complex because it involves:
1. Check claim exists
2. Check voting still open
3. Verify user hasn't voted
4. Submit to blockchain
5. Update local records

**Endpoint: GET /validations/pending**

Return claims that need validation:
```python
Criteria:
- Status is UNVERIFIED
- Voting period still open
- User hasn't voted yet
```

### Step 5: Testing & Error Handling

#### Comprehensive Error Handling

**Every External Call Can Fail:**
```python
try:
    result = blockchain_service.submit_claim()
except AlgodHTTPError as e:
    # Blockchain rejected
    logger.error(f"Blockchain error: {e}")
    raise HTTPException(500, "Blockchain unavailable")
except IPFSError as e:
    # IPFS failed
    logger.error(f"IPFS error: {e}")
    raise HTTPException(503, "Storage unavailable")
except Exception as e:
    # Unknown error
    logger.error(f"Unexpected: {e}")
    raise HTTPException(500, "Internal error")
```

**Retry Logic for Transient Failures:**
```python
@retry(max_attempts=3, delay=1)
def submit_to_blockchain():
    # Will retry 3 times with 1 second delay
```

#### Testing Strategy

**Unit Tests (services/):**
- Mock blockchain responses
- Mock IPFS responses
- Test business logic only

**Integration Tests (routers/):**
- Use TestClient
- Mock service layer
- Test HTTP layer only

**End-to-End Tests:**
- Real LocalNet
- Real IPFS
- Full flow testing

---

## Developer #3: Frontend Developer

### Step 1: Understanding Next.js + Web3

#### The Frontend Challenge

**What Makes Blockchain Frontend Different:**
1. **Wallet Integration**: Users need to connect wallets
2. **Transaction Signing**: Every action needs approval
3. **Async Everything**: Blockchain is slow
4. **Gas Fees**: Users pay for transactions
5. **Error States**: Many more failure modes

**Our Approach**: Hide the complexity! Most users just use our API.

#### Setting Up Next.js

**Key Decisions:**
- App Router (new) vs Pages Router (old): Use App Router
- TypeScript: Yes, absolutely (catches Web3 bugs)
- Styling: Tailwind CSS (fast development)
- State Management: React Query (handles async)

**Project Structure:**
```
frontend/
├── src/
│   ├── app/              # Routes (Next.js 14)
│   │   ├── page.tsx      # Home page
│   │   ├── claims/
│   │   │   ├── page.tsx  # Claims list
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Claim detail
│   │   └── submit/
│   │       └── page.tsx  # Submit form
│   ├── components/       # Reusable UI
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities
│       ├── api.ts       # API client
│       └── wallet.ts    # Wallet integration
```

### Step 2: Component Architecture

#### Building a Component Library

**Design System First:**
Define your atoms before building molecules:
- Colors (primary, danger, success)
- Typography (headings, body, captions)
- Spacing (4px grid system)
- Breakpoints (mobile, tablet, desktop)

**Core Components Needed:**

**Button Component:**
Variants: primary, secondary, danger, ghost
States: default, hover, active, disabled, loading

**Card Component:**
Container with shadow and padding
Used for claims, validator profiles, stats

**Form Components:**
Input, Textarea, Select, RadioGroup
All with error states and validation

**Modal Component:**
For confirmations, wallet connection, voting

**Status Badge:**
Visual indicators for claim status
Colors: green (verified), red (false), yellow (disputed), gray (unverified)

#### State Management

**React Query for API Calls:**
```javascript
Why React Query?
- Automatic caching
- Background refetching  
- Optimistic updates
- Error/loading states
```

**Pattern for Every API Call:**
```javascript
const { data, error, isLoading } = useQuery({
  queryKey: ['claims', claimId],
  queryFn: () => fetchClaim(claimId),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### Step 3: Multi-Step Claim Form

#### Form Design Philosophy

**Why Multi-Step?**
- Less overwhelming than one huge form
- Natural breakpoints for validation
- Users can't submit incomplete data
- Progress indicator reduces abandonment

**The Steps:**
1. Basic Info (title, content)
2. Category Selection
3. Evidence (optional)
4. Review & Submit

#### Form State Management

**Use React Hook Form:**
```javascript
Why?
- Built-in validation
- Performant (uncontrolled components)
- Easy multi-step forms
```

**Validation Rules:**
- Title: 10-200 characters
- Content: 50-5000 characters
- Category: Must select one
- URLs: Valid format if provided

**Progressive Enhancement:**
Save form data to localStorage on each step. If user refreshes, restore their progress.

#### Handling Submission

**The Submit Flow:**
1. Show "Submitting..." state
2. Call API with form data
3. On success: Show claim ID, redirect
4. On error: Show error, keep form data

**Error States to Handle:**
- Network error (can't reach API)
- Validation error (API rejected data)
- Blockchain error (transaction failed)
- IPFS error (upload failed)

### Step 4: Claims Display

#### List View Considerations

**Performance with Many Claims:**
- Virtualization for 1000+ items
- Pagination for smaller sets
- Infinite scroll as alternative

**Filtering & Sorting:**
- By category (chips/tabs)
- By status (dropdown)
- By date (newest/oldest)
- Search by title/content

**Real-time Updates:**
- Poll for new claims every 30 seconds
- WebSocket for instant updates (optional)
- Show "New claims available" banner

#### Detail View

**Information Architecture:**
```
Claim Title (large)
├── Status Badge
├── Category Chip  
├── Submission Time
├── Content (full text)
├── Evidence Links
├── Validation Status
│   ├── Progress Bar (votes)
│   ├── Time Remaining
│   └── Vote Buttons
└── History Timeline
```

**Voting Interface:**
Only show if:
- User is connected (wallet)
- Voting period is open
- User hasn't voted yet
- User has enough tokens

### Step 5: Wallet Integration

#### Wallet Options

**Pera Wallet** (Algorand's official):
- Mobile-first
- QR code connection
- Best Algorand support

**Defly Wallet**:
- Alternative option
- Similar features

**WalletConnect**:
- Universal protocol
- Supports many wallets

#### Integration Pattern

**Connection Flow:**
1. User clicks "Connect Wallet"
2. Show wallet options modal
3. User selects wallet type
4. QR code or deep link
5. User approves in wallet
6. Store connection state

**Persistent Connection:**
Save wallet preference in localStorage. On page load, try to reconnect automatically.

**Disconnection:**
Clear state, emit event, refresh UI.

---

## Developer #4: ML Service (Optional)

### Understanding the ML Component

#### Why ML for Anti-Propaganda?

**What ML Can Detect:**
- Emotional manipulation patterns
- Misleading statistics
- Logical fallacies
- Known hoax signatures
- Suspicious source patterns

**What ML Cannot Do:**
- Determine absolute truth
- Replace human judgment
- Understand context fully
- Detect novel propaganda

**Our Approach**: ML flags suspicious content for priority human review.

#### Simple MVP Implementation

**Start with Rule-Based Detection:**
```python
High propaganda indicators:
- ALL CAPS SENTENCES
- Multiple exclamation marks!!!
- "URGENT", "BREAKING", "SHOCKING"
- No sources cited
- Anonymous author
```

**Propaganda Score Calculation:**
- 0-30: Low risk (probably OK)
- 30-60: Medium risk (needs review)
- 60-100: High risk (priority review)

---

## Integration & Testing

### Step 1: Connect Everything

#### Service Start Order

**Critical**: Services must start in correct order:
1. Docker Desktop (for containers)
2. LocalNet (blockchain)
3. IPFS daemon
4. Deploy smart contracts
5. Start API
6. Start Frontend
7. Start ML service (optional)

**Health Check Script:**
Write a script that verifies each service is running and accessible.

### Step 2: End-to-End Testing

#### Test Scenarios

**Scenario 1: Submit Claim**
1. User fills form
2. Submits claim
3. Gets claim ID
4. Can view claim

**Scenario 2: Validate Claim**
1. Validator sees pending claim
2. Stakes tokens
3. Votes true/false
4. Sees updated vote count

**Scenario 3: Resolution**
1. 24 hours pass
2. Anyone triggers resolution
3. Status updates
4. Rewards distributed

### Common Integration Issues

**"Cannot connect to blockchain"**
- LocalNet not running
- Wrong port in config
- Network mismatch

**"IPFS timeout"**
- IPFS daemon not running
- Firewall blocking port
- Large file upload

**"CORS errors"**
- API not allowing frontend origin
- Add frontend URL to CORS config

**"Transaction failed"**
- Insufficient funds
- Wrong parameters
- Contract not deployed

---

## Deployment Preparation

### Environment Configuration

**LocalNet (Development):**
- Free ALGO
- Resets on restart
- Fast block times
- No real money

**TestNet (Staging):**
- Test ALGO from faucet
- Persistent
- Slower blocks
- Public network

**MainNet (Production):**
- REAL MONEY
- Permanent
- Costs real ALGO
- Security critical

### Security Checklist

**Before MainNet:**
- [ ] Remove all console.logs
- [ ] Secure service account
- [ ] Rate limiting on API
- [ ] Input validation everywhere
- [ ] Error messages don't leak info
- [ ] HTTPS only
- [ ] Environment variables secured
- [ ] Contracts audited
- [ ] Backup procedures tested
- [ ] Monitoring in place

---

## Success Criteria

### Each Developer Should Achieve

**Smart Contract Developer:**
- Contracts compile without errors
- All tests pass
- Can submit/retrieve claims
- Reputation system works
- Validation logic correct

**Backend Developer:**
- API responds to all endpoints
- Blockchain integration works
- IPFS upload/retrieval works
- Error handling comprehensive
- Tests cover main flows

**Frontend Developer:**
- All pages render correctly
- Forms validate and submit
- Claims display properly
- Responsive on mobile
- Wallet connection works

**ML Developer:**
- Detection endpoint works
- Returns risk scores
- Handles various input types
- Integrates with main API

### Team Success Metrics

**Technical:**
- Full flow works end-to-end
- 10+ claims submitted
- 5+ validations completed
- No critical bugs

**User Experience:**
- Non-crypto users can use it
- < 3 second response times
- Mobile responsive
- Clear error messages

**Demo Ready:**
- Can show full claim lifecycle
- Multiple validators participating
- Status updates working
- Rewards distributing

---

## Remember

**This is a hackathon/MVP:** 
- Perfect is the enemy of done
- Core functionality first
- Polish later
- Document shortcuts taken
- Focus on the demo

**Communication is key:**
- Daily standups
- Share blockers immediately
- Help teammates when stuck
- Celebrate small wins

**You're building something important:**
This isn't just an app - it's infrastructure for truth in the digital age. Every line of code matters.