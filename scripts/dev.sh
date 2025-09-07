#!/bin/bash

# DeFacto Protocol - Development Environment Startup Script

set -e

echo "🚀 Starting DeFacto Development Environment..."
echo "============================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run './scripts/setup.sh' first"
    exit 1
fi

# Export environment variables
export $(cat .env | grep -v '^#' | xargs)

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis ipfs

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if AlgoKit LocalNet is running
if ! algokit localnet status 2>/dev/null | grep -q "running"; then
    echo "⛓️  Starting Algorand LocalNet..."
    algokit localnet start
else
    echo "✅ Algorand LocalNet already running"
fi

# Start API service in background
echo "🌐 Starting API service..."
cd api
uvicorn src.main:app --reload --port 8000 &
API_PID=$!
cd ..

# Start ML service in background
echo "🤖 Starting ML service..."
cd ml-service
uvicorn src.main:app --reload --port 8001 &
ML_PID=$!
cd ..

# Compile smart contracts
echo "📝 Compiling smart contracts..."
cd contracts
algokit compile
cd ..

# Start frontend
echo "💻 Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $API_PID $ML_PID $FRONTEND_PID 2>/dev/null || true
    docker-compose down
    algokit localnet stop
    echo "✅ All services stopped"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Wait and show status
echo ""
echo "✅ All services started!"
echo ""
echo "📍 Service URLs:"
echo "  - Frontend:       http://localhost:3000"
echo "  - API Docs:       http://localhost:8000/docs"
echo "  - ML Service:     http://localhost:8001/docs"
echo "  - IPFS Gateway:   http://localhost:8080"
echo "  - IPFS API:       http://localhost:5001"
echo "  - Algorand Node:  http://localhost:4001"
echo "  - Indexer:        http://localhost:8980"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait