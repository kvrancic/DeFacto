#!/bin/bash

# DeFacto Protocol - Initial Setup Script
# This script sets up the complete development environment

set -e  # Exit on error

echo "🚀 DeFacto Protocol - Development Environment Setup"
echo "=================================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.12+"
    exit 1
fi
echo "✅ Python found: $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker"
    exit 1
fi
echo "✅ Docker found: $(docker --version)"

# Check AlgoKit
if ! command -v algokit &> /dev/null; then
    echo "⚠️  AlgoKit not found. Installing..."
    pip install algokit
fi
echo "✅ AlgoKit found: $(algokit --version)"

# Create environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup contracts
echo "🔗 Setting up smart contracts..."
cd contracts
if [ ! -f requirements.txt ]; then
    cat > requirements.txt << EOF
algorand-python>=2.0.0
algokit-utils>=2.0.0
pytest>=7.0.0
pytest-asyncio>=0.21.0
python-dotenv>=1.0.0
EOF
fi
pip install -r requirements.txt
cd ..

# Setup API
echo "🌐 Setting up API service..."
cd api
if [ ! -f requirements.txt ]; then
    cat > requirements.txt << EOF
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
algorand-python-sdk>=2.0.0
ipfshttpclient>=0.8.0
sqlalchemy>=2.0.0
asyncpg>=0.29.0
redis>=5.0.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
httpx>=0.25.0
pytest>=7.0.0
pytest-asyncio>=0.21.0
python-dotenv>=1.0.0
ruff>=0.1.0
black>=23.0.0
EOF
fi
pip install -r requirements.txt
cd ..

# Setup Frontend
echo "💻 Setting up frontend..."
cd frontend
if [ ! -f package.json ]; then
    cat > package.json << EOF
{
  "name": "defacto-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write ."
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "@txnlab/use-wallet": "^2.0.0",
    "algosdk": "^2.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0",
    "prettier": "^3.0.0"
  }
}
EOF
fi
npm install
cd ..

# Setup ML Service
echo "🤖 Setting up ML service..."
cd ml-service
if [ ! -f requirements.txt ]; then
    cat > requirements.txt << EOF
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
transformers>=4.35.0
torch>=2.0.0
numpy>=1.24.0
pandas>=2.0.0
scikit-learn>=1.3.0
nltk>=3.8.0
spacy>=3.6.0
pillow>=10.0.0
opencv-python>=4.8.0
httpx>=0.25.0
pytest>=7.0.0
pytest-asyncio>=0.21.0
python-dotenv>=1.0.0
ruff>=0.1.0
black>=23.0.0
EOF
fi
pip install -r requirements.txt
# Download spaCy model
python -m spacy download en_core_web_sm
cd ..

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis ipfs

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Initialize AlgoKit LocalNet
echo "⛓️  Starting Algorand LocalNet..."
algokit localnet start

# Create initial database schema
echo "💾 Setting up database..."
cd api
python -c "
from src.database import init_db
import asyncio
asyncio.run(init_db())
" 2>/dev/null || echo "Database initialization will run on first API start"
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run './scripts/dev.sh' to start development environment"
echo "3. Frontend: http://localhost:3000"
echo "4. API: http://localhost:8000/docs"
echo "5. IPFS: http://localhost:8080"
echo ""
echo "📖 Documentation:"
echo "- Game Plan: GAME_PLAN.md"
echo "- Project Structure: PROJECT_STRUCTURE.md"
echo "- AI Guidelines: CLAUDE.md"
echo ""
echo "Happy coding! 🚀"