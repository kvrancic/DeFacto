# DeFacto Protocol - Decentralized Truth Verification Platform

## 🚀 Overview

DeFacto Protocol is a decentralized fact-checking and truth verification platform built on the Algorand blockchain. It combines blockchain technology, IPFS storage, AI-powered content analysis, and community-driven validation to combat misinformation and establish verifiable truth.

## 🏗️ Architecture

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

## 📚 API Documentation

### Interactive API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

#### Claims
- `POST /api/claims/submit` - Submit a new claim
- `GET /api/claims` - List all claims
- `GET /api/claims/{id}` - Get claim details
- `POST /api/claims/{id}/validate` - Start validation

#### Voting
- `POST /api/votes/cast` - Cast a vote
- `GET /api/votes/claim/{id}` - Get voting results
- `GET /api/votes/user/{address}` - Get user's votes

#### Prediction Markets
- `POST /api/predictions/create-market` - Create market
- `GET /api/predictions/markets` - List markets
- `POST /api/predictions/place-bet` - Place a bet

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

- Algorand Foundation for blockchain infrastructure
- IPFS for decentralized storage
- FastAPI for backend framework
- Next.js for frontend framework

## 📞 Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-org/defacto-protocol/issues)
- Discord: [Join our Discord](https://discord.gg/defacto)

## 🚀 Roadmap

- [x] MVP Backend API
- [x] Basic Smart Contracts
- [x] Frontend UI
- [ ] Real Algorand Integration
- [ ] ML Propaganda Detection
- [ ] Mobile App
- [ ] MainNet Deployment

## 💡 Key Features

### For Users
- Submit claims for verification
- Vote on claim validity
- Stake reputation tokens
- Participate in prediction markets
- Track verification history

### For Validators
- Earn rewards for accurate validation
- Build reputation score
- Access priority claims
- Participate in dispute resolution

### For Developers
- RESTful API
- WebSocket real-time updates
- Comprehensive documentation
- Docker development environment
- Extensive test coverage

---

Built with ❤️ for truth and transparency