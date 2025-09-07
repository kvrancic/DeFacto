# DeFacto Protocol - The NYSE of Information

> **Making truth profitable for the first time in history**

[![Algorand](https://img.shields.io/badge/Built%20on-Algorand-black)](https://algorand.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Live%20on%20TestNet-green)]()

## 🎬 Detailed Video Demo

https://github.com/user-attachments/assets/8bec11e2-476e-4dbd-b7dc-dc1555348129

## 🎯 The Problem We're Solving

Misinformation costs the global economy **$78 billion annually**. With only 32% of people trusting traditional media and AI making fake content trivial to create, we're facing an unprecedented truth crisis. Current fact-checkers are too slow, centralized, and have no sustainable economic model.

## 💡 Our Solution

DeFacto Protocol is the world's first economically sustainable truth verification network. We've created a liquid market where truth is traded, verified, and monetized at global scale. Users stake cryptocurrency on whether news is true or false - if they're right, they earn; if they're wrong, they lose their stake.


## 🚀 Key Innovations

### 1. Prediction Markets for Truth
Automated market makers create real-time truth probability based on crowd wisdom. As more users bet "TRUE", the price rises - creating a living, breathing truth consensus.

### 2. Quadratic Voting System
Prevents wealthy actors from buying truth. Voting power increases with the square root of stake, ensuring democratic consensus while maintaining skin in the game.

### 3. Hybrid Storage Architecture
Content lives on IPFS (unlimited, cheap), while immutable hashes are stored on Algorand. This enables infinite scale at minimal cost - impossible on other blockchains.

### 4. Reputation-Based Validation
Validators build non-transferable reputation over time. Consistent accuracy increases earning potential; mistakes destroy reputation permanently.

## 🏗️ Technical Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  Backend API │────▶│   Algorand   │
│   (Next.js)  │     │  (FastAPI)   │     │  Blockchain  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                      │
                            ▼                      ▼
                     ┌──────────────┐     ┌──────────────┐
                     │     IPFS     │     │Smart Contracts│
                     │   Storage    │     │   (Python)   │
                     └──────────────┘     └──────────────┘
```

## 📋 Prerequisites

- **Python 3.11+** - For backend and smart contracts
- **Node.js 18+** - For frontend development
- **Docker** - For running services (IPFS, Algorand LocalNet)
- **AlgoKit** - For Algorand development
- **Git** - Version control

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/defacto-protocol.git
cd defacto-protocol
```

### 2. Install AlgoKit (Official Algorand Development Kit)

Follow the official guide: https://dev.algorand.co/getting-started/algokit-quick-start/

#### macOS
```bash
brew install algorandfoundation/tap/algokit
```

#### Linux/WSL
```bash
curl -fsSL https://get.algokit.io | bash
```

#### Windows
```powershell
winget install AlgorandFoundation.algokit
```

### 3. Start Algorand LocalNet

```bash
# Start the local Algorand network
algokit localnet start

# Check status
algokit localnet status
```

### 4. Set Up Backend API

```bash
cd api

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### 6. Start IPFS Node (Optional - uses mock if not available)

```bash
# Using Docker
docker run -d --name ipfs \
  -p 5001:5001 \
  -p 8080:8080 \
  ipfs/go-ipfs:latest

# Or install IPFS Desktop
# https://docs.ipfs.tech/install/ipfs-desktop/
```

## 🚀 Quick Start

### Running the Complete Stack

```bash
# Terminal 1: Start Algorand LocalNet
algokit localnet start

# Terminal 2: Start Backend API
cd api
source venv/bin/activate
python src/main.py

# Terminal 3: Start Frontend
cd frontend
npm run dev

# Terminal 4: Start IPFS (optional)
docker-compose up ipfs
```

Access the application at: http://localhost:3000

## 📁 Project Structure

```
defacto-protocol/
├── api/                    # Backend API Service
│   ├── src/
│   │   ├── main.py        # FastAPI application
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   └── schemas/       # Pydantic models
│   ├── tests/             # API tests
│   └── requirements.txt   # Python dependencies
│
├── contracts/             # Algorand Smart Contracts
│   ├── src/
│   │   ├── claim_registry.py     # Claim management
│   │   ├── reputation_token.py   # Reputation system
│   │   ├── validation_pool.py    # Voting mechanism
│   │   └── prediction_market.py  # Prediction markets
│   └── tests/             # Contract tests
│
├── frontend/              # Next.js Web Application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── types/        # TypeScript types
│   └── package.json      # Node dependencies
│
├── scripts/              # Deployment & utility scripts
├── docs/                 # Documentation
└── docker-compose.yml    # Docker services
```

## 🔧 Configuration

### Environment Variables

#### Backend API (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/defacto

# Algorand
ALGORAND_NODE_URL=http://localhost:4001
ALGORAND_INDEXER_URL=http://localhost:8980
SERVICE_ACCOUNT_MNEMONIC="your 25 word mnemonic here"

# IPFS
IPFS_API_URL=http://localhost:5001

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:3000"]
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ALGORAND_NETWORK=LocalNet
NEXT_PUBLIC_IPFS_GATEWAY=http://localhost:8080
```

## 🧪 Testing

### Run All Tests
```bash
# Backend tests
cd api
pytest

# Contract tests
cd contracts
algokit test

# Frontend tests
cd frontend
npm test
```

### Linting & Type Checking
```bash
# Python (Backend & Contracts)
ruff check .
mypy .

# TypeScript (Frontend)
npm run lint
npm run typecheck
```

## 💰 Business Model & Impact

### Revenue Streams
1. **Transaction Fees** - 2.5% on all validation stakes
2. **Data Licensing** - Sentiment data for hedge funds
3. **Sponsored Pools** - Brands sponsor fact-checking
4. **NFT Badges** - Verification credentials

### Market Opportunity
- **Total Addressable Market**: $800B (news + social media)
- **Beachhead Market**: $10B crypto/financial news
- **Growth Rate**: 40% YoY in creator economy

### Why Algorand?
- **3.7-second finality** - Real-time truth consensus
- **Box Storage** - Unlimited claims without state bloat
- **$0.001 fees** - Economically viable micro-transactions
- **Carbon negative** - Sustainable infrastructure
- **State Proofs** - Cross-chain verification ready


### Core Smart Contracts

#### ClaimRegistry (PyTeal/Beaker)
- Manages claim lifecycle with infinite scalability
- Box storage for unlimited claims
- Immutable IPFS hash storage

#### ReputationToken (ASA)
- Non-transferable reputation tokens
- Quadratic staking prevents wealth concentration
- Earned through accurate validation

#### ValidationPool
- Commit-reveal voting prevents bandwagon effects
- Stake-weighted consensus
- Automatic reward distribution

#### PredictionMarket (AMM)
- Constant product formula for price discovery
- Self-balancing liquidity pools
- Real-time truth probability

## 🔐 Smart Contracts

### Contract Addresses (LocalNet)
```
ClaimRegistry: <deployed_address>
ReputationToken: <deployed_address>
ValidationPool: <deployed_address>
PredictionMarket: <deployed_address>
```

### Deploying Contracts
```bash
cd contracts

# Compile contracts
algokit compile

# Deploy to LocalNet
algokit deploy localnet

# Deploy to TestNet
algokit deploy testnet
```

## 🐛 Troubleshooting

### Common Issues

#### 1. AlgoKit Permission Denied
```bash
# Fix permissions
sudo chown -R $(whoami) ~/.config/algokit
chmod -R 755 ~/.config/algokit
```

#### 2. IPFS Connection Refused
```bash
# Check if IPFS is running
docker ps | grep ipfs

# Restart IPFS
docker restart ipfs
```

#### 3. Transaction Pool Overflow
```bash
# Restart LocalNet
algokit localnet stop
algokit localnet start
```

#### 4. Database Connection Error
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Run migrations
alembic upgrade head
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow
1. Always work on feature branches
2. Test locally with AlgoKit LocalNet
3. Ensure all tests pass
4. Run linting and type checking
5. Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

## 🚀 Roadmap & Traction

### Completed ✅
- MVP with full-stack implementation
- Custom Algorand smart contracts (PyTeal/Beaker)
- Hybrid IPFS + blockchain storage
- Prediction market AMM implementation

### Next Steps 🎯
- MainNet deployment ($3M raise)
- Mobile applications (iOS/Android)
- ML-powered pre-screening
- Enterprise API marketplace
- Global expansion (100M users by Year 5)

## 🏆 Competitive Advantages

### Network Effects
```
More Users → More Content → Better Verification → Higher Trust → More Users
```

### Defensible Moats
1. **First-Mover** - No blockchain truth market exists
2. **Reputation System** - Takes years to build, impossible to copy
3. **Data Network** - Historical truth data becomes invaluable
4. **Community Ownership** - Can't be acquired by big tech
5. **Switching Costs** - Reputation non-portable

### Technical Innovation
- **Hybrid Storage** - IPFS + Algorand (unique architecture)
- **Quadratic Voting** - Democratic consensus at scale
- **Commit-Reveal** - Prevents vote manipulation
- **Box Storage** - Overcomes blockchain limitations
- **AMM for Truth** - Novel DeFi application

## 🎯 Investment Opportunity

**Raising**: $3M Seed Round
**Valuation**: $15M
**Use of Funds**:
- 40% Engineering (scale to 1M users)
- 25% Token incentives (bootstrap network)
- 20% Marketing (user acquisition)
- 15% Operations (legal, compliance)

**Why Now?**
- AI explosion makes fake content trivial
- Trust in media at all-time low (32%)
- Algorand finally fast/cheap enough
- First-mover advantage still available

---

> **"In a world of infinite content, truth becomes the scarcest commodity. We're making it liquid."**

---

Built with ❤️ for truth and transparency on Algorand
