# DeFacto Backend API

## Quick Start

### 1. Install Dependencies
```bash
cd api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings if needed
```

### 3. Run the API Server
```bash
PYTHONPATH=. python src/main.py
```

Or with auto-reload for development:
```bash
PYTHONPATH=. uvicorn src.main:app --reload
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## Available Endpoints

### Claims
- `POST /claims/submit` - Submit a new claim
- `GET /claims/{id}` - Get specific claim
- `GET /claims` - List claims with pagination

### Validations
- `POST /validations/vote` - Submit vote on a claim
- `GET /validations/pending` - Get claims pending validation

### Prediction Markets
- `POST /predictions/create-market` - Create prediction market
- `GET /predictions/markets` - List all markets
- `POST /predictions/bet` - Place bet on market

### Users
- `POST /users/opt-in` - Opt in to reputation system
- `GET /users/balance/{address}` - Get user's reputation balance

## Testing

Run integration tests:
```bash
python scripts/test_integration.py
```

## Features

✅ Full mock mode - works without Algorand or IPFS
✅ All endpoints implemented according to frontend spec
✅ Prediction market system
✅ WebSocket support for real-time updates
✅ Comprehensive error handling
✅ SQLite database for caching
✅ Auto-generated API documentation

## Status

🟢 **READY FOR FRONTEND INTEGRATION**

All endpoints are working and tested. The API runs in mock mode by default, so no blockchain or IPFS setup is required for development.