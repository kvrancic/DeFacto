# DeFacto Protocol - 4-Minute Demo Video Script

## 🎬 Video Structure
- **0:00-0:30** - Platform Overview (face + slides)
- **0:30-4:00** - Code Walkthrough (screenshare GitHub)
- **4:00-4:45** - Live Demo (screenshare app)

---

## Part 1: Platform Overview [0:00-0:30]
*[SHOW: Your face with slide showing DeFacto logo]*

**"Hi, I'm [Your Name], and I've built DeFacto Protocol - making truth profitable on Algorand.**

**The problem is simple: Misinformation costs our economy $78 billion annually, but there's no economic incentive to verify truth. We've solved this.**

**DeFacto is the first platform where you stake crypto on whether news is true or false. If you're right, you earn. If you're wrong, you lose your stake. It's like Polymarket meets Community Notes, but with real economic consequences.**

**Let me show you exactly how we built this on Algorand."**

*[START SCREENSHARE: Open GitHub repository]*

---

## Part 2: Code Walkthrough [0:30-4:00]

### Section 1: High-Level Architecture [0:30-1:00]

*[NAVIGATE TO: Repository root - show folder structure]*

**"Our architecture is a monorepo with four main components:"**

*[HOVER over each folder as you speak]*
- **contracts/** - "Our Algorand smart contracts in PyTeal"
- **api/** - "FastAPI backend that interfaces with the blockchain"  
- **frontend/** - "Next.js app for users"
- **scripts/** - "Deployment and utilities"

*[CLICK: Open README.md]*
*[SCROLL: To architecture diagram around line 15-30]*

**"Here's how it all connects - users interact with Next.js, which calls our API, which then interacts with Algorand blockchain and IPFS for storage."**

### Section 2: Smart Contracts - The Core Innovation [1:00-2:15]

*[NAVIGATE TO: contracts/src/claim_registry_pyteal.py]*
*[OPEN FILE]*

**"Let's look at our custom smart contracts. This is where the magic happens."**

*[SCROLL TO: Line 24-30 - class ClaimRegistry]*

**"Our ClaimRegistry contract manages all claims on-chain. Notice we're using Beaker framework on top of PyTeal for cleaner code."**

*[HIGHLIGHT: Lines 33-34 - Box storage definition]*

```python
# Box storage for claims
claims = BoxMapping(Bytes, ClaimState)
```

**"This is crucial - we use Algorand's Box Storage to store unlimited claims. Traditional smart contracts hit state limits, but boxes scale infinitely."**

*[SCROLL TO: Lines 45-75 - submit_claim method]*
*[HIGHLIGHT: Line 56-57]*

```python
claim_id.store(self.total_claims.get() + Int(1)),
self.total_claims.set(claim_id.load()),
```

**"When someone submits a claim, we increment a global counter - this gives each claim a unique ID."**

*[HIGHLIGHT: Lines 65-73 - Storing claim data]*

```python
self.claims[Itob(claim_id.load())].ipfs_hash.set(ipfs_hash.get()),
self.claims[Itob(claim_id.load())].category.set(category.get()),
self.claims[Itob(claim_id.load())].status.set(Int(0)),  # PENDING
```

**"We store the IPFS hash on-chain - the actual content lives on IPFS to save costs, but the hash ensures it can't be tampered with."**

*[NAVIGATE TO: contracts/src/mock_blockchain.py]*
*[SCROLL TO: Lines 195-236 - create_market method]*

**"Here's our prediction market implementation. This is what makes DeFacto unique."**

*[HIGHLIGHT: Lines 214-217]*

```python
market = {
    "market_id": market_id,
    "claim_id": claim_id,
    "total_yes_stake": initial_liquidity / 2,
    "total_no_stake": initial_liquidity / 2,
```

**"We use an Automated Market Maker - liquidity pools that automatically price truth probability based on betting volume."**

### Section 3: Backend API - The Bridge [2:15-3:00]

*[NAVIGATE TO: api/src/services/algorand.py]*
*[OPEN FILE]*
*[SCROLL TO: Lines 101-124 - submit_claim_to_blockchain method]*

**"Our backend bridges the frontend to Algorand. Look at this submit_claim method:"**

*[HIGHLIGHT: Lines 111-119]*

```python
if USE_MOCK_BLOCKCHAIN:
    blockchain = get_blockchain()
    result = blockchain.submit_claim(ipfs_hash, category)
    return {
        "claim_id": result["claim_id"],
        "tx_id": result["tx_id"]
    }
```

**"We built a mock blockchain for development - this lets us test without spending real ALGO, but the logic is identical to mainnet."**

*[NAVIGATE TO: api/src/routers/claims.py]*
*[SCROLL TO: Lines 28-60 - submit_claim endpoint]*
*[HIGHLIGHT: Lines 44-48]*

```python
# Upload to IPFS first
ipfs_hash = await ipfs_service.upload_claim(claim_data)

# Then submit hash to blockchain
blockchain_result = await algorand_service.submit_claim_to_blockchain(
    ipfs_hash=ipfs_hash,
```

**"This is the key pattern - large content goes to IPFS, only the hash goes on-chain. This keeps costs under a penny per claim."**

### Section 4: The Secret Sauce - Prediction Markets [3:00-3:30]

*[NAVIGATE TO: api/src/routers/predictions.py]*
*[SCROLL TO: Lines 41-53 - calculate_price function]*

**"Here's where economics meets code. Our pricing algorithm:"**

*[HIGHLIGHT: Lines 47-50]*

```python
yes_price = yes_stake / total
no_price = no_stake / total

yes_price = max(0.01, min(0.99, yes_price))
```

**"As more people bet 'yes', the price goes up. This creates a real-time truth probability that's more accurate than any individual expert."**

### Section 5: Frontend Integration [3:30-4:00]

*[NAVIGATE TO: frontend/src/app/claims/submit/page.tsx]*
*[SCROLL TO: Lines showing API call]*

**"The frontend is clean Next.js with TypeScript for type safety."**

*[HIGHLIGHT: API call code if visible]*

**"When users submit claims, we handle everything - IPFS upload, blockchain transaction, all abstracted away. Users don't even need to know they're using blockchain."**

*[NAVIGATE TO: frontend/src/app/page.tsx]*

**"Our landing page shows live claims, real-time voting, and prediction market prices - all pulled from our API which gets data from Algorand."**

---

## Part 3: Live Demo [4:00-4:45]

*[OPEN: Browser with http://localhost:3000]*

**"Let me show you the live platform."**

*[CLICK: "Submit Claim" button]*

**"Users can submit any claim - news articles, statements, predictions."**

*[FILL: Sample claim about tech news]*
*[CLICK: Submit]*

**"Watch this - the claim is uploaded to IPFS, hashed, and that hash is permanently stored on Algorand. Transaction confirmed in under 4 seconds."**

*[NAVIGATE: To Claims List]*

**"Here are all active claims. See the voting buttons? Users stake reputation tokens to vote."**

*[CLICK: On a claim to show details]*

**"And here's the killer feature - prediction markets. Current price shows 73% probability this is true. Users can bet either way."**

*[SHOW: Place a bet]*

**"When the claim is verified, winners get paid out automatically via smart contract."**

*[NAVIGATE: To leaderboard if available]*

**"Top validators earn reputation and tokens. It literally pays to be right."**

---

## Closing [4:45-5:00]

*[RETURN TO: Your face on camera]*

**"DeFacto Protocol - we're making truth profitable. Built on Algorand for instant finality, unlimited scale, and carbon-negative infrastructure.**

**With AI making fake content trivial, we need economic incentives for truth. That's what we've built.**

**Thank you."**

---

## 📝 Technical Speaking Points to Emphasize

1. **Custom smart contracts** - Not using templates, built from scratch
2. **Box storage** - Solves Algorand's state limitations
3. **Hybrid architecture** - IPFS + Algorand for cost efficiency
4. **Mock blockchain** - Professional development practices
5. **Prediction markets** - Novel use of AMM for truth
6. **Fast finality** - 3.7 second confirmation (show this live)

## 🎯 Key Files to Show (in order)

1. `/README.md` - Architecture diagram
2. `/contracts/src/claim_registry_pyteal.py` - Core smart contract
3. `/contracts/src/mock_blockchain.py` - Development blockchain
4. `/api/src/services/algorand.py` - Blockchain service
5. `/api/src/routers/claims.py` - API endpoints
6. `/api/src/routers/predictions.py` - Market mechanics
7. `/frontend/src/app/claims/submit/page.tsx` - User interface
8. Live demo at `http://localhost:3000`

## ⚡ Quick Navigation Commands

```bash
# Have these ready to copy-paste if needed
cd /Users/karlovrancic/Desktop/ModChains
code .  # If using VS Code
# OR
open https://github.com/[your-username]/defacto-protocol
```

## 🎬 Recording Tips

1. **Practice the navigation** - Know exactly where each file is
2. **Zoom in on code** - Make sure code is readable in video
3. **Highlight as you speak** - Select the exact lines you're discussing
4. **Keep energy high** - This is revolutionary tech, show excitement
5. **Test everything first** - Make sure app is running before recording

---

*Remember: The judges want to see YOU built this, not just used templates. Emphasize custom code, clever solutions, and deep Algorand integration.*