# DeFacto Protocol - Project Structure Guide

## Monorepo Organization

```
defacto-protocol/
│
├── .github/                     # GitHub specific files
│   ├── workflows/              # CI/CD pipelines
│   └── ISSUE_TEMPLATE/         # Issue templates
│
├── contracts/                   # Algorand Smart Contracts (Python)
│   ├── src/
│   │   ├── claim_registry.py  # Claim management contract
│   │   ├── reputation.py      # Reputation token contract
│   │   ├── validation.py      # Validation pool contract
│   │   └── governance.py      # DAO governance contract
│   ├── tests/
│   │   ├── test_claims.py
│   │   ├── test_reputation.py
│   │   └── test_validation.py
│   ├── scripts/
│   │   ├── deploy.py          # Deployment script
│   │   └── interact.py        # Interaction utilities
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
│
├── api/                         # Backend API Service (FastAPI)
│   ├── src/
│   │   ├── main.py            # FastAPI application
│   │   ├── config.py          # Configuration management
│   │   ├── models/            # Pydantic models
│   │   │   ├── claim.py
│   │   │   ├── validation.py
│   │   │   └── reputation.py
│   │   ├── services/          # Business logic
│   │   │   ├── blockchain.py # Algorand integration
│   │   │   ├── ipfs.py       # IPFS storage
│   │   │   ├── validation.py # Validation orchestration
│   │   │   └── auth.py       # Anonymous auth
│   │   ├── routers/           # API endpoints
│   │   │   ├── claims.py
│   │   │   ├── validations.py
│   │   │   └── reputation.py
│   │   └── utils/             # Helper functions
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md
│
├── frontend/                    # Web Application (Next.js)
│   ├── src/
│   │   ├── app/               # Next.js 14 app directory
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── submit/
│   │   │   ├── claims/
│   │   │   └── validate/
│   │   ├── components/        # React components
│   │   │   ├── common/
│   │   │   ├── claims/
│   │   │   └── validation/
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   │   ├── api.ts        # API client
│   │   │   └── algorand.ts   # Wallet integration
│   │   ├── styles/            # CSS/Tailwind
│   │   └── types/             # TypeScript definitions
│   ├── public/                # Static assets
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── README.md
│
├── ml-service/                  # ML Propaganda Detection (Python)
│   ├── src/
│   │   ├── main.py            # FastAPI ML service
│   │   ├── models/            # ML model definitions
│   │   │   ├── propaganda.py
│   │   │   └── fact_check.py
│   │   ├── pipelines/         # Processing pipelines
│   │   │   ├── text.py
│   │   │   └── image.py
│   │   └── utils/
│   ├── models/                # Trained model files
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md
│
├── shared/                      # Shared code between services
│   ├── types/                 # Shared TypeScript types
│   │   └── index.ts
│   ├── constants/             # Shared constants
│   │   ├── chains.ts
│   │   └── contracts.ts
│   └── utils/                 # Shared utilities
│
├── scripts/                     # Development & deployment scripts
│   ├── setup.sh               # Initial setup script
│   ├── dev.sh                 # Start development environment
│   ├── test.sh                # Run all tests
│   ├── deploy.sh              # Deploy to testnet/mainnet
│   └── reset.sh               # Reset local environment
│
├── docs/                        # Documentation
│   ├── architecture/          # Architecture decisions
│   ├── api/                   # API documentation
│   ├── deployment/            # Deployment guides
│   └── decisions/             # ADRs (Architecture Decision Records)
│
├── docker/                      # Docker configurations
│   ├── docker-compose.yml     # Full stack composition
│   ├── docker-compose.dev.yml # Development overrides
│   └── algorand/              # Algorand node config
│
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json                 # Root package.json for monorepo
├── README.md                    # Project overview
├── CLAUDE.md                    # AI assistant guidelines
├── GAME_PLAN.md                # Comprehensive game plan
└── PROJECT_STRUCTURE.md        # This file

```

## File Naming Conventions

### Python Files (contracts/, api/, ml-service/)
- Use `snake_case.py` for all Python files
- Test files: `test_<module_name>.py`
- Config files: `<purpose>_config.py`

### TypeScript/JavaScript Files (frontend/)
- Components: `PascalCase.tsx`
- Hooks: `use<HookName>.ts`
- Utilities: `camelCase.ts`
- Types: `PascalCase.types.ts`

### Documentation Files
- Markdown: `UPPER_CASE.md` for root docs, `lower-case.md` for subdocs
- Decision records: `ADR-001-title.md`

## Key Files Explained

### Root Level

#### `.env.example`
Template for environment variables. Copy to `.env` for local development:
```env
# Algorand Configuration
ALGORAND_NODE_URL=http://localhost:4001
ALGORAND_INDEXER_URL=http://localhost:8980
ALGORAND_NETWORK=localnet
ALGORAND_MNEMONIC=<25-word-mnemonic>

# IPFS Configuration
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY_URL=http://localhost:8080

# API Configuration
API_PORT=8000
API_CORS_ORIGINS=http://localhost:3000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ALGORAND_NETWORK=localnet

# ML Service Configuration
ML_SERVICE_URL=http://localhost:8001
OPENAI_API_KEY=<optional-for-gpt-checks>
```

#### `docker-compose.yml`
Orchestrates all services for local development:
- Algorand LocalNet node
- Algorand Indexer
- IPFS node
- PostgreSQL (for API caching)
- Redis (for queues)

### Contracts Directory

#### `contracts/src/claim_registry.py`
Core smart contract managing claims:
```python
from algopy import ARC4Contract, String, Bytes, UInt64

class ClaimRegistry(ARC4Contract):
    """Manages the lifecycle of claims on the blockchain"""
    
    @arc4.abimethod
    def submit_claim(self, ipfs_hash: String, claim_type: String) -> UInt64:
        """Submit a new claim to the registry"""
        pass
```

### API Directory

#### `api/src/services/blockchain.py`
Handles all Algorand blockchain interactions:
```python
class BlockchainService:
    """Abstracts blockchain operations for the API"""
    
    async def submit_claim(self, ipfs_hash: str) -> str:
        """Submit claim to blockchain, return transaction ID"""
        pass
    
    async def get_claim(self, claim_id: int) -> dict:
        """Retrieve claim from blockchain"""
        pass
```

### Frontend Directory

#### `frontend/src/lib/api.ts`
API client for frontend:
```typescript
export class APIClient {
  async submitClaim(content: string): Promise<Claim> {
    // Submit claim through API
  }
  
  async validateClaim(claimId: string, vote: boolean): Promise<void> {
    // Submit validation vote
  }
}
```

## Development Workflow

### Initial Setup (First Time Only)
```bash
# 1. Clone repository
git clone <repo-url>
cd defacto-protocol

# 2. Run setup script
./scripts/setup.sh

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your values

# 4. Install dependencies
npm install
cd contracts && pip install -r requirements.txt && cd ..
cd api && pip install -r requirements.txt && cd ..
cd ml-service && pip install -r requirements.txt && cd ..
```

### Daily Development
```bash
# 1. Start all services
./scripts/dev.sh
# or manually:
docker-compose up -d
algokit localnet start

# 2. Start specific service
cd frontend && npm run dev     # Frontend on http://localhost:3000
cd api && uvicorn src.main:app --reload  # API on http://localhost:8000
cd contracts && algokit compile # Compile contracts

# 3. Run tests
./scripts/test.sh
# or individually:
cd frontend && npm test
cd api && pytest
cd contracts && pytest
```

### Making Changes

#### Adding a New Smart Contract
1. Create new file in `contracts/src/`
2. Add tests in `contracts/tests/`
3. Update deployment script in `contracts/scripts/deploy.py`
4. Document in `contracts/README.md`

#### Adding a New API Endpoint
1. Create router in `api/src/routers/`
2. Add service logic in `api/src/services/`
3. Define models in `api/src/models/`
4. Add tests in `api/tests/`
5. Update API documentation

#### Adding a New Frontend Page
1. Create directory in `frontend/src/app/`
2. Add page.tsx and layout.tsx
3. Create components in `frontend/src/components/`
4. Add API integration in `frontend/src/lib/`
5. Update navigation

## Testing Strategy

### Unit Tests
- **Contracts**: Test each contract method individually
- **API**: Test services and routers separately
- **Frontend**: Test components and hooks
- **ML Service**: Test model predictions

### Integration Tests
- **API + Contracts**: Test full claim submission flow
- **Frontend + API**: Test user journeys
- **ML + API**: Test propaganda detection pipeline

### End-to-End Tests
- Full user flow from submission to validation
- Multi-user validation scenarios
- Reputation and reward distribution

## Deployment

### Local Development
```bash
./scripts/dev.sh
```

### TestNet Deployment
```bash
export ALGORAND_NETWORK=testnet
./scripts/deploy.sh testnet
```

### MainNet Deployment
```bash
export ALGORAND_NETWORK=mainnet
./scripts/deploy.sh mainnet
```

## Common Commands

```bash
# Algorand
algokit localnet start          # Start local Algorand network
algokit localnet stop           # Stop local network
algokit compile                 # Compile smart contracts
algokit generate client         # Generate TypeScript client

# Development
docker-compose up -d            # Start all services
docker-compose logs -f          # View logs
docker-compose down             # Stop all services

# Testing
npm test                        # Run frontend tests
pytest                         # Run Python tests
./scripts/test.sh              # Run all tests

# Code Quality
npm run lint                    # Lint frontend code
npm run typecheck              # Check TypeScript types
ruff check .                   # Lint Python code
black .                        # Format Python code
```

## Troubleshooting

### Common Issues

1. **"Cannot connect to Algorand node"**
   - Check if LocalNet is running: `algokit localnet status`
   - Verify ALGORAND_NODE_URL in .env

2. **"IPFS timeout"**
   - Check if IPFS is running: `docker ps | grep ipfs`
   - Verify IPFS_API_URL in .env

3. **"Transaction pool overflow"**
   - Reset LocalNet: `algokit localnet reset`
   - Clear transaction pool

4. **"Module not found"**
   - Install dependencies: `npm install` or `pip install -r requirements.txt`
   - Check import paths

## Next Steps

1. **For Smart Contract Developers**: Start with `contracts/README.md`
2. **For Backend Developers**: Start with `api/README.md`
3. **For Frontend Developers**: Start with `frontend/README.md`
4. **For ML Engineers**: Start with `ml-service/README.md`

## Questions?

- Check documentation in `/docs`
- Review CLAUDE.md for AI assistance
- Create GitHub issue for bugs
- Ask in team Slack channel