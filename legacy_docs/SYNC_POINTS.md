# Critical Synchronization Points

## MUST READ: These Are The Exact Interfaces Between Components

---

## 1. Smart Contracts → Backend API

### What Backend Needs From Smart Contracts

**File that MUST exist:**
```json
// Location: contracts/deployment_output.json
{
    "network": "localnet",
    "claim_registry_app_id": 1001,      // Backend uses this
    "reputation_token_app_id": 1002,    // Backend uses this
    "validation_pool_app_id": 1003,     // Backend uses this
    "deployed_at": "2024-01-15T10:30:00Z"
}
```

**Contract Methods Backend Will Call:**

```python
# ClaimRegistry Contract
- submit_claim(ipfs_hash: str, category: str) -> int
  # Returns: claim_id (sequential integer starting at 1)
  
- get_claim(claim_id: int) -> str
  # Returns: "ipfs_hash|category|status"
  # Example: "QmTest123|news|UNVERIFIED"
  
- get_total_claims() -> int
  # Returns: total number of claims

- update_claim_status(claim_id: int, new_status: str) -> str
  # Returns: "OK"

# ReputationToken Contract  
- opt_in() -> str
  # Returns: "Successfully opted in with 100 reputation tokens"
  
- stake(amount: int, claim_id: int) -> str
  # Returns: "Stake recorded successfully"
  
- get_balance(user: str) -> int
  # Returns: current token balance

# ValidationPool Contract
- create_validation(claim_id: int) -> None
  
- cast_vote(claim_id: int, vote: bool, stake: int) -> None
  
- resolve_validation(claim_id: int) -> str
  # Returns: "VERIFIED" | "FALSE" | "DISPUTED" | "UNVERIFIED"
```

---

## 2. Backend API → Frontend

### API Endpoints Frontend Will Use

**Base URL:** `http://localhost:8000`

**Headers Required:**
```javascript
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Endpoint: Submit Claim
```typescript
POST /claims/submit

Request Body:
{
  "title": string,        // 10-200 characters
  "content": string,      // 50-5000 characters  
  "category": string,     // "news"|"science"|"politics"|"health"|"technology"
  "evidence_urls": string[]  // Optional array of URLs
}

Response (200 OK):
{
  "claim_id": number,
  "ipfs_hash": string,
  "tx_id": string,
  "status": "UNVERIFIED",
  "submitted_at": string  // ISO 8601
}

Error Response (400/500):
{
  "detail": string
}
```

### Endpoint: Get Single Claim
```typescript
GET /claims/{claim_id}

Response (200 OK):
{
  "claim_id": number,
  "title": string,
  "content": string,
  "category": string,
  "status": string,       // "UNVERIFIED"|"VERIFIED"|"FALSE"|"DISPUTED"
  "ipfs_hash": string,
  "evidence_urls": string[],
  "yes_votes": number,
  "no_votes": number,
  "submitted_at": string
}

Error Response (404):
{
  "detail": "Claim not found"
}
```

### Endpoint: List Claims
```typescript
GET /claims?limit=10&offset=0&category=news&status=UNVERIFIED

Query Parameters:
- limit: number (default: 10, max: 100)
- offset: number (default: 0)
- category: string (optional)
- status: string (optional)

Response (200 OK):
[
  {
    "claim_id": number,
    "title": string,
    "category": string,
    "status": string,
    "submitted_at": string
  },
  ...
]
```

### Endpoint: Submit Vote
```typescript
POST /validations/vote

Request Body:
{
  "claim_id": number,
  "vote": boolean,        // true = valid, false = invalid
  "stake_amount": number  // 10-100
}

Response (200 OK):
{
  "status": "vote_submitted",
  "tx_id": string
}

Error Response (400):
{
  "detail": "Voting period closed" | "Already voted" | "Insufficient balance"
}
```

### Endpoint: Get Pending Validations
```typescript
GET /validations/pending

Response (200 OK):
[
  {
    "claim_id": number,
    "title": string,
    "category": string,
    "time_remaining": number,  // seconds
    "current_votes": {
      "yes": number,
      "no": number
    }
  },
  ...
]
```

---

## 3. Backend API → IPFS

### IPFS Content Structure

**What Backend Stores in IPFS:**
```json
{
  "title": "Claim Title Here",
  "content": "Full claim content with at least 50 characters...",
  "category": "news",
  "evidence_urls": [
    "https://example.com/evidence1",
    "https://example.com/evidence2"
  ],
  "submitted_at": "2024-01-15T10:30:00Z",
  "submitter": "anonymous_user_123"  // Optional
}
```

**IPFS Hash Format:**
- Always starts with "Qm" (CIDv0) or "bafy" (CIDv1)
- Example: `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`
- Length: 46 characters for v0, variable for v1

---

## 4. Frontend → Wallet

### Wallet Integration Points

**Pera Wallet Connection:**
```javascript
import { PeraWalletConnect } from '@perawallet/connect';

const peraWallet = new PeraWalletConnect();

// Connect
const accounts = await peraWallet.connect();
const address = accounts[0];

// Sign Transaction
const signedTxn = await peraWallet.signTransaction([txn]);
```

**Account Format:**
- Algorand address: 58 characters
- Example: `YHGVF7YXKMCTNHVQLXVCVNHCF4XXMKCQK2WVWVK7OEWC2C6AD2LMQWCBH4`

---

## 5. ML Service → Backend API (Optional)

### ML Analysis Endpoint

**What Backend Sends to ML:**
```python
POST http://localhost:8001/analyze

Request:
{
  "text": "Full claim content...",
  "category": "news"
}

Response:
{
  "propaganda_score": 0.75,  # 0.0 to 1.0
  "techniques_detected": [
    "emotional_manipulation",
    "false_urgency",
    "cherry_picking"
  ],
  "risk_level": "HIGH"  # "LOW" | "MEDIUM" | "HIGH"
}
```

---

## Critical Data Validation Rules

### Validation Rules Each Component MUST Enforce

**Claim Title:**
- Min length: 10 characters
- Max length: 200 characters
- Cannot be only whitespace

**Claim Content:**
- Min length: 50 characters
- Max length: 5000 characters
- Cannot be only whitespace

**Category:**
- MUST be one of: `["news", "science", "politics", "health", "technology"]`
- Case-sensitive, lowercase only

**Evidence URLs:**
- Must be valid URLs (start with http:// or https://)
- Maximum 10 URLs
- Each URL max 500 characters

**Stake Amount:**
- Minimum: 10 tokens
- Maximum: 100 tokens
- Must be integer

**Status Values:**
- MUST be one of: `["UNVERIFIED", "VERIFIED", "FALSE", "DISPUTED"]`
- Case-sensitive, uppercase only

---

## Testing Integration Points

### Test Script: Verify All Interfaces
```python
# File: test_integration_points.py
import json
import requests
import sys

def test_contracts_deployed():
    """Check if deployment_output.json exists with required fields"""
    try:
        with open("contracts/deployment_output.json") as f:
            data = json.load(f)
            required = ["claim_registry_app_id", "reputation_token_app_id", "validation_pool_app_id"]
            for field in required:
                assert field in data, f"Missing {field}"
                assert data[field] > 0, f"{field} must be positive"
        print("✅ Contracts deployed correctly")
        return True
    except Exception as e:
        print(f"❌ Contract deployment issue: {e}")
        return False

def test_api_running():
    """Check if API is responding"""
    try:
        r = requests.get("http://localhost:8000/health")
        assert r.status_code == 200
        print("✅ API is running")
        return True
    except:
        print("❌ API not responding")
        return False

def test_frontend_running():
    """Check if frontend is accessible"""
    try:
        r = requests.get("http://localhost:3000")
        assert r.status_code == 200
        print("✅ Frontend is running")
        return True
    except:
        print("❌ Frontend not responding")
        return False

def test_ipfs_running():
    """Check if IPFS is accessible"""
    try:
        r = requests.post("http://localhost:5001/api/v0/version")
        assert r.status_code == 200
        print("✅ IPFS is running")
        return True
    except:
        print("❌ IPFS not responding")
        return False

def test_claim_submission():
    """Test complete claim submission flow"""
    try:
        # Submit claim
        claim_data = {
            "title": "Test Integration Claim",
            "content": "This is a test claim to verify all components are properly integrated.",
            "category": "technology",
            "evidence_urls": []
        }
        r = requests.post("http://localhost:8000/claims/submit", json=claim_data)
        assert r.status_code == 200
        claim_id = r.json()["claim_id"]
        
        # Retrieve claim
        r = requests.get(f"http://localhost:8000/claims/{claim_id}")
        assert r.status_code == 200
        assert r.json()["title"] == claim_data["title"]
        
        print(f"✅ Claim submission flow working (ID: {claim_id})")
        return True
    except Exception as e:
        print(f"❌ Claim submission failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Integration Points...")
    print("-" * 50)
    
    all_passed = True
    all_passed &= test_contracts_deployed()
    all_passed &= test_api_running()
    all_passed &= test_frontend_running()
    all_passed &= test_ipfs_running()
    
    if all_passed:
        all_passed &= test_claim_submission()
    
    print("-" * 50)
    if all_passed:
        print("✅ ALL INTEGRATION POINTS WORKING!")
        sys.exit(0)
    else:
        print("❌ Some integration points failing. Fix before proceeding.")
        sys.exit(1)
```

---

## When Things Don't Match

### If Smart Contract Returns Different Format
**Problem:** Contract returns different data format than expected
**Solution:** 
1. Smart Contract Dev updates contract OR
2. Backend Dev updates parsing logic
3. Both update this document
4. Run integration tests

### If API Changes Endpoint Path
**Problem:** Frontend can't find endpoint
**Solution:**
1. Backend Dev announces change
2. Frontend Dev updates API client
3. Update this document
4. Run integration tests

### If Frontend Needs Additional Data
**Problem:** Frontend needs data not provided by API
**Solution:**
1. Frontend Dev specifies exact needs
2. Backend Dev adds to response
3. Update this document
4. Run integration tests

---

## The Golden Rules

1. **NEVER** change an interface without telling the team
2. **ALWAYS** update this document when interfaces change
3. **TEST** integration points after any change
4. **COMMUNICATE** immediately if something doesn't match
5. **DOCUMENT** any deviations from this spec

---

## Emergency Contacts

If an integration point is broken and blocking you:

1. Check this document first
2. Run the test script above
3. Post in Slack with:
   - Which integration point is broken
   - Exact error message
   - What you expected vs what you got
4. Tag the relevant developer
5. Don't proceed until resolved

Remember: **Better to ask than to assume!**