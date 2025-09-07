# DeFacto Protocol - Team Implementation Guide

## 🚀 Quick Start for Each Developer

### What We're Building
A decentralized fact-checking platform on Algorand where claims are verified through stake-based voting, creating economic incentives for truth.

---

## 📚 Documentation Structure

### Core Documents (Everyone reads these)
1. **CLAUDE.md** - Coding standards and project conventions
2. **ANTI_PROPAGANDA_DESIGN_SIMPLE.md** - Simplified 3-layer verification system
3. **PROJECT_STRUCTURE.md** - Folder organization and file locations

### Implementation Guides
4. **DETAILED_IMPLEMENTATION_INSTRUCTIONS.md** - Detailed explanations for each role
5. **MASTER_INTEGRATION_GUIDE.md** - How everything connects together
6. **This file** - Your starting point

---

## 👥 Team Roles & Responsibilities

### Developer #1: Smart Contract Developer
**Your deliverables:**
- ClaimRegistry contract (stores claims)
- ReputationToken contract (manages tokens)
- ValidationPool contract (handles voting)
- Deployment script with saved app IDs

**Start here:**
1. Read all core documents
2. Focus on "Developer #1" section in DETAILED_IMPLEMENTATION_INSTRUCTIONS.md
3. Use AI to generate your detailed step-by-step guide
4. Save it in `developer-guides/smart-contracts/implementation-steps.md`

### Developer #2: Backend API Developer  
**Your deliverables:**
- FastAPI service on port 8000
- Blockchain integration service
- IPFS storage integration
- RESTful endpoints for claims and validations

**Start here:**
1. Read all core documents
2. Focus on "Developer #2" section in DETAILED_IMPLEMENTATION_INSTRUCTIONS.md
3. Use AI to generate your detailed step-by-step guide
4. Save it in `developer-guides/backend-api/implementation-steps.md`

### Developer #3: Frontend Developer
**Your deliverables:**
- Next.js app on port 3000
- Claim submission form
- Claims list and detail pages
- Validation interface
- Wallet integration

**Start here:**
1. Read all core documents
2. Focus on "Developer #3" section in DETAILED_IMPLEMENTATION_INSTRUCTIONS.md
3. Use AI to generate your detailed step-by-step guide
4. Save it in `developer-guides/frontend/implementation-steps.md`

### Developer #4: ML Service Developer (Optional)
**Your deliverables:**
- FastAPI ML service on port 8001
- Propaganda detection endpoint
- Risk scoring system

**Start here:**
1. Read all core documents
2. Focus on "Developer #4" section in DETAILED_IMPLEMENTATION_INSTRUCTIONS.md
3. Use AI to generate your detailed step-by-step guide
4. Save it in `developer-guides/ml-service/implementation-steps.md`

---

## 🤖 How to Use AI for Your Implementation

### Step 1: Prepare Your AI Assistant
Feed your AI (ChatGPT, Claude, etc.) these documents in order:
```
1. Copy-paste CLAUDE.md
2. Copy-paste ANTI_PROPAGANDA_DESIGN_SIMPLE.md  
3. Copy-paste PROJECT_STRUCTURE.md
4. Copy-paste your section from DETAILED_IMPLEMENTATION_INSTRUCTIONS.md
5. Copy-paste MASTER_INTEGRATION_GUIDE.md
```

### Step 2: Request Your Custom Guide
Ask your AI:
```
"Based on these documents, create an EXTREMELY detailed step-by-step 
implementation guide for [YOUR ROLE] that I can follow command by command. 

Include:
- Every single file I need to create (with code definitions, snippets and explanations) 
- Every command to run (with expected output)
- Guide to perform test scripts after each feature (do not include the test scripts in the guide, but note them frequently)
- Error handling and edge cases (do not include the test scripts in the guide)
- Integration tests with other services (do not include the test scripts in the guide)

Expand any features that seem incomplete and add production-ready 
improvements like logging, caching, and retry logic."
```

### Step 3: Implement Step by Step
- Follow your AI-generated guide command by command
- Run test scripts after EACH step
- If something fails, ask AI to debug
- Save all test scripts for later use

---

## 🔗 Critical Integration Points

### Everyone MUST Use These Exact Values

```python
# Categories (case-sensitive!)
VALID_CATEGORIES = ["news", "science", "politics", "health", "technology"]

# Status values (exact strings!)
CLAIM_STATUS = ["UNVERIFIED", "VERIFIED", "FALSE", "DISPUTED"]

# Shared parameters
MIN_VALIDATORS = 5
MIN_STAKE = 10
MAX_STAKE = 100
INITIAL_REPUTATION = 100
VOTING_PERIOD = 86400  # 24 hours
```

### API Contract (Backend ↔ Frontend)
```
POST /claims/submit       - Submit new claim
GET  /claims/{id}        - Get specific claim
GET  /claims             - List claims (paginated)
POST /validations/vote   - Submit vote
GET  /validations/pending - Get claims to validate
```

### Blockchain Data Format
```
Storage: "QmIPFSHash|category|status"
Example: "QmTest123|news|UNVERIFIED"
```

---

## 📋 Daily Workflow

### part 1 
1. Pull latest code: `git pull`
2. Run your verify script
3. Join standup meeting
4. Share any integration changes

### part 2 
- Implement features from your guide
- Test after each feature
- Commit working code frequently
- Alert team of any interface changes

### part 3
1. Run integration tests
2. Push your code: `git push`
3. Update progress in Slack
4. Note any blockers

---

## 🚨 Common Issues & Solutions

### "Cannot connect to Algorand"
```bash
algokit localnet stop
algokit localnet start
```

### "IPFS not responding"
```bash
ipfs shutdown
ipfs daemon
```

### "Port already in use"
```bash
# Find process using port
lsof -i :8000  # (or 3000, 8001)
# Kill it
kill -9 [PID]
```

### "Module not found"
```bash
# Python
pip install -r requirements.txt

# Node.js
npm install
```

---

## 🆘 Getting Help

### If You're Stuck
1. Check error message carefully
2. Search in documentation
3. Ask your AI for debugging help
4. Post in team WhatsApp with:
   - What you're trying to do
   - Exact error message
   - What you've tried

---

## 🎯 Definition of Done

Your part is complete when:
1. ✅ All features implemented
2. ✅ Tests passing
3. ✅ Documentation updated
4. ✅ Code reviewed by teammate
5. ✅ No critical bugs
6. ✅ Can demo your part

---

## 🚀 Starting Services

### Correct Order (Important!)
```bash
#!/bin/bash
# 1. Docker Desktop (manual - ensure running)
# 2. Algorand LocalNet
algokit localnet start

# 3. IPFS
ipfs daemon &

# 4. Deploy contracts (first time only)
cd contracts && python deploy.py && cd ..

# 5. API
cd api && uvicorn src.main:app --reload &

# 6. Frontend  
cd frontend && npm run dev &

# 7. ML Service (optional)
cd ml-service && uvicorn src.main:app --port 8001 &
```

---

## 📝 Final Notes

### Remember
- **Test early, test often** - Don't wait until the end
- **Communicate changes** - Tell team immediately if interfaces change
- **Ask for help** - Better to ask than be stuck
- **Document as you go** - Don't leave it for the end
- **Have fun** - We're building something important!

### Success Criteria
- Core flow works: Submit → Store → Retrieve → Validate
- All services integrate properly
- Can demo full lifecycle of a claim
- No critical bugs blocking demo

---

## Ready? Let's Build! 🚀

1. Read the documents
2. Set up your environment
3. Generate your detailed guide with AI
4. Start implementing
5. Test everything
6. Integrate with team
7. Demo and celebrate!

**You've got this!** 💪