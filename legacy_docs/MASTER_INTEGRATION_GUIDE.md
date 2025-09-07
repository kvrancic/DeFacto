# Master Integration Guide - DeFacto Protocol

## IMPORTANT: This Is Your Coordination Document
This guide ensures all team members' work integrates seamlessly. Read this BEFORE starting your individual work and AFTER completing each milestone.

---

## For Each Developer: How to Use AI for Your Role

### Step 1: Feed Your AI Assistant
Give your AI assistant ALL these files in this exact order:
1. `CLAUDE.md` - Project guidelines and conventions
2. `ANTI_PROPAGANDA_DESIGN_SIMPLE.md` - Simplified system design
3. `PROJECT_STRUCTURE.md` - Folder organization
4. `DETAILED_IMPLEMENTATION_INSTRUCTIONS.md` - Your specific section
5. This file (`MASTER_INTEGRATION_GUIDE.md`) - Integration points

### Step 2: Request Your Detailed Guide
Ask your AI: "Based on these documents, create an EXTREMELY detailed step-by-step implementation guide for [YOUR ROLE] that I can follow command by command. Include every single file I need to create, every command to run, and example test scripts to verify each step works. Expand on any features that seem incomplete."

### Step 3: Create Your Working Folder
```bash
# Smart Contract Developer
mkdir -p ~/Desktop/defacto-protocol/developer-guides/smart-contracts
# Save your AI-generated guide here as: implementation-steps.md

# Backend Developer  
mkdir -p ~/Desktop/defacto-protocol/developer-guides/backend-api
# Save your AI-generated guide here as: implementation-steps.md

# Frontend Developer
mkdir -p ~/Desktop/defacto-protocol/developer-guides/frontend
# Save your AI-generated guide here as: implementation-steps.md

# ML Developer
mkdir -p ~/Desktop/defacto-protocol/developer-guides/ml-service
# Save your AI-generated guide here as: implementation-steps.md
```

### Step 4: Test Everything
After EACH step in your guide, run a test script to verify it works. Your AI should generate these test scripts for you.

---

## Critical Integration Points

### Shared Constants (EVERYONE MUST USE THESE)

```python
# Categories - EXACT strings, case-sensitive
VALID_CATEGORIES = ["news", "science", "politics", "health", "technology"]

# Status values - EXACT strings
CLAIM_STATUS = {
    "UNVERIFIED": "UNVERIFIED",
    "VERIFIED": "VERIFIED", 
    "FALSE": "FALSE",
    "DISPUTED": "DISPUTED"
}

# Validation thresholds
MIN_VALIDATORS = 5
MIN_STAKE = 10
MAX_STAKE = 100
VOTING_PERIOD = 86400  # 24 hours in seconds
INITIAL_REPUTATION = 100

# Data format for claims
CLAIM_DELIMITER = "|"  # Used to separate fields in storage
```

### Data Formats (MUST MATCH EXACTLY)

#### Claim Storage Format (Blockchain)
```
"QmIPFSHash|category|status"
Example: "QmTest123|news|UNVERIFIED"
```

#### IPFS Content Structure
```json
{
    "title": "string (10-200 chars)",
    "content": "string (50-5000 chars)",
    "category": "string (from VALID_CATEGORIES)",
    "evidence_urls": ["array of URL strings"],
    "submitted_at": "ISO 8601 timestamp",
    "submitter": "optional identifier"
}
```

#### API Response Format
```json
{
    "claim_id": 123,
    "ipfs_hash": "QmTest123",
    "title": "Claim Title",
    "content": "Full claim content...",
    "category": "news",
    "status": "UNVERIFIED",
    "yes_votes": 10,
    "no_votes": 5,
    "submitted_at": "2024-01-15T10:30:00Z",
    "evidence_urls": ["https://..."]
}
```

---

## Integration Checkpoints

### Checkpoint 1: Smart Contracts Deployed (Smart Contract Dev)
**What others need from you:**
```json
// File: contracts/deployment_output.json
{
    "network": "localnet",
    "claim_registry_app_id": 1001,
    "reputation_token_app_id": 1002,
    "validation_pool_app_id": 1003,
    "deployed_at": "2024-01-15T10:30:00Z"
}
```

**Test script to verify:**
```python
# File: contracts/verify_deployment.py
import json
from algosdk.v2client import algod

client = algod.AlgodClient("a"*64, "http://localhost:4001")

with open("deployment_output.json") as f:
    apps = json.load(f)

for app_name, app_id in apps.items():
    if "app_id" in app_name:
        try:
            info = client.application_info(app_id)
            print(f"✅ {app_name}: {app_id} is live")
        except:
            print(f"❌ {app_name}: {app_id} not found")
```

### Checkpoint 2: API Endpoints Working (Backend Dev)
**What others need from you:**
- API running on `http://localhost:8000`
- Swagger docs at `http://localhost:8000/docs`
- These endpoints working:
  - `POST /claims/submit`
  - `GET /claims/{id}`
  - `GET /claims`
  - `POST /validations/vote`

**Test script to verify:**
```python
# File: api/verify_endpoints.py
import requests

BASE_URL = "http://localhost:8000"

# Test health
r = requests.get(f"{BASE_URL}/health")
assert r.status_code == 200
print("✅ API is running")

# Test submit claim
test_claim = {
    "title": "Test Claim Title",
    "content": "This is test content that is long enough to pass validation requirements.",
    "category": "news",
    "evidence_urls": []
}

r = requests.post(f"{BASE_URL}/claims/submit", json=test_claim)
if r.status_code == 200:
    claim_id = r.json()["claim_id"]
    print(f"✅ Claim submitted with ID: {claim_id}")
    
    # Test get claim
    r = requests.get(f"{BASE_URL}/claims/{claim_id}")
    assert r.status_code == 200
    print(f"✅ Claim retrieved successfully")
else:
    print(f"❌ Failed to submit claim: {r.text}")
```

### Checkpoint 3: Frontend Pages Rendering (Frontend Dev)
**What others need from you:**
- Frontend running on `http://localhost:3000`
- These pages working:
  - `/` - Home page
  - `/claims` - Claims list
  - `/claims/[id]` - Claim detail
  - `/submit` - Submit form

**Test script to verify:**
```javascript
// File: frontend/verify_pages.js
const pages = [
    'http://localhost:3000/',
    'http://localhost:3000/claims',
    'http://localhost:3000/submit',
    'http://localhost:3000/claims/1'
];

async function testPages() {
    for (const url of pages) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                console.log(`✅ ${url} is accessible`);
            } else {
                console.log(`❌ ${url} returned ${response.status}`);
            }
        } catch (e) {
            console.log(`❌ ${url} failed: ${e.message}`);
        }
    }
}

testPages();
```

### Checkpoint 4: ML Service (ML Dev - Optional)
**What others need from you:**
- ML API running on `http://localhost:8001`
- Endpoint: `POST /analyze`

**Test script to verify:**
```python
# File: ml-service/verify_ml.py
import requests

r = requests.post("http://localhost:8001/analyze", json={
    "text": "URGENT!!! This is SHOCKING news that will BLOW YOUR MIND!!!",
    "category": "news"
})

if r.status_code == 200:
    result = r.json()
    print(f"✅ ML Service working")
    print(f"   Propaganda score: {result['propaganda_score']}")
    print(f"   Risk level: {result['risk_level']}")
else:
    print(f"❌ ML Service failed: {r.text}")
```

---

## Daily Integration Meeting Agenda

### Morning Sync (15 minutes)
1. **Each developer runs their verify script**
2. **Report status:**
   - Green: Everything working
   - Yellow: Working but issues
   - Red: Blocked
3. **Share any interface changes**
4. **Confirm integration points still match**

### Integration Issues Protocol

**If your change affects others:**
1. Post in Slack IMMEDIATELY
2. Update this document
3. Wait for acknowledgment before proceeding

**Common integration breaks:**
- Changing API endpoint paths
- Modifying data formats
- Changing contract method names
- Altering IPFS content structure
- Modifying status values

---

## Service Dependencies & Start Order

### Correct Startup Sequence
```bash
#!/bin/bash
# File: start_all_services.sh

echo "Starting DeFacto Protocol Services..."

# 1. Start Docker Desktop (manual - ensure it's running)
echo "Ensure Docker Desktop is running..."
read -p "Press enter when Docker is ready..."

# 2. Start LocalNet
echo "Starting Algorand LocalNet..."
algokit localnet start
sleep 5

# 3. Start IPFS
echo "Starting IPFS..."
ipfs daemon &
IPFS_PID=$!
sleep 5

# 4. Deploy contracts (only if not deployed)
if [ ! -f "contracts/deployment_output.json" ]; then
    echo "Deploying smart contracts..."
    cd contracts && python deploy.py && cd ..
fi

# 5. Start API
echo "Starting API..."
cd api && uvicorn src.main:app --reload --port 8000 &
API_PID=$!
cd ..
sleep 3

# 6. Start Frontend
echo "Starting Frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

# 7. Start ML Service (optional)
echo "Starting ML Service..."
cd ml-service && uvicorn src.main:app --reload --port 8001 &
ML_PID=$!
cd ..

echo "All services started!"
echo "API: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "ML: http://localhost:8001"
```

---

## Testing the Complete Flow

### End-to-End Test Script
```python
# File: test_complete_flow.py
import requests
import time
import json

print("Testing Complete DeFacto Protocol Flow...")

# Step 1: Submit a claim
print("\n1. Submitting claim...")
claim_data = {
    "title": "Integration Test Claim",
    "content": "This is a test claim to verify the entire system is working correctly end-to-end.",
    "category": "technology",
    "evidence_urls": ["https://example.com/evidence"]
}

r = requests.post("http://localhost:8000/claims/submit", json=claim_data)
assert r.status_code == 200
claim_id = r.json()["claim_id"]
print(f"   ✅ Claim submitted with ID: {claim_id}")

# Step 2: Retrieve the claim
print("\n2. Retrieving claim...")
r = requests.get(f"http://localhost:8000/claims/{claim_id}")
assert r.status_code == 200
claim = r.json()
assert claim["title"] == claim_data["title"]
assert claim["status"] == "UNVERIFIED"
print(f"   ✅ Claim retrieved successfully")

# Step 3: Submit a vote (if validation system is ready)
print("\n3. Submitting validation vote...")
vote_data = {
    "claim_id": claim_id,
    "vote": True,
    "stake_amount": 10
}

try:
    r = requests.post("http://localhost:8000/validations/vote", json=vote_data)
    if r.status_code == 200:
        print(f"   ✅ Vote submitted successfully")
    else:
        print(f"   ⚠️  Validation not yet implemented")
except:
    print(f"   ⚠️  Validation endpoint not ready")

# Step 4: Check frontend
print("\n4. Checking frontend...")
r = requests.get(f"http://localhost:3000/claims/{claim_id}")
if r.status_code == 200:
    print(f"   ✅ Frontend can display claim")
else:
    print(f"   ⚠️  Frontend not ready")

print("\n✅ INTEGRATION TEST COMPLETE!")
```

---

## AI Assistant Instructions (For AI Reading This)

### IMPORTANT: When helping developers implement their parts:

1. **This is an MVP/Hackathon project** - Features should be expanded where it makes sense, but keep core functionality working first.

2. **Always generate test scripts** - After implementing each feature, provide a test script to verify it works.

3. **Expand these features if time permits:**
   - Add more validation on inputs
   - Improve error messages
   - Add logging for debugging
   - Cache frequently accessed data
   - Add rate limiting
   - Implement retry logic

4. **Before marking anything as "complete":**
   - Run integration tests with other services
   - Verify data formats match exactly
   - Check all endpoints/methods are accessible
   - Ensure error handling is comprehensive

5. **Common improvements to suggest:**
   - Add health check endpoints
   - Implement graceful shutdown
   - Add metrics/monitoring
   - Create docker-compose for easier startup
   - Add database indexes for performance
   - Implement connection pooling

6. **Testing checklist for each component:**
   ```
   [ ] Unit tests pass
   [ ] Integration with dependencies works
   [ ] Error cases handled
   [ ] Performance acceptable (<3 second response)
   [ ] Logs are helpful for debugging
   [ ] Documentation updated
   ```

7. **If something seems missing or unclear:**
   - Check the integration points in this document
   - Verify against the shared constants
   - Test with other services running
   - Add sensible defaults
   - Log warnings for potential issues

---

## Final Integration Checklist

Before demo, ensure:

### All Services
- [ ] Start without errors
- [ ] Have health check endpoints
- [ ] Handle service dependencies gracefully
- [ ] Log useful debugging information

### Data Flow
- [ ] Claim submission works end-to-end
- [ ] IPFS storage and retrieval works
- [ ] Blockchain transactions confirm
- [ ] Frontend displays current data

### Error Handling
- [ ] Network failures show user-friendly errors
- [ ] Invalid input is rejected with clear messages
- [ ] Service failures don't crash other services
- [ ] Retry logic for transient failures

### Performance
- [ ] Page load < 3 seconds
- [ ] API responses < 1 second
- [ ] No memory leaks after extended running
- [ ] Can handle 10 concurrent users

### Demo Readiness
- [ ] 10+ test claims in system
- [ ] Different status examples (verified, false, disputed)
- [ ] Multiple validators with different reputation levels
- [ ] Mobile responsive frontend
- [ ] Clear documentation for judges

---

## Remember

**Communication is everything.** If you change ANYTHING that affects others:
1. Stop immediately
2. Document the change
3. Notify the team
4. Wait for acknowledgment
5. Update test scripts
6. Proceed only after confirmation

**This is a team effort.** Your code doesn't work unless it integrates with others. Test early, test often, test together.