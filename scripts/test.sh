#!/bin/bash

# DeFacto Protocol - Test Runner Script

set -e

echo "🧪 Running DeFacto Protocol Tests"
echo "================================="

# Initialize test results
FAILED_TESTS=""
ALL_PASSED=true

# Function to run tests for a component
run_tests() {
    local component=$1
    local command=$2
    
    echo ""
    echo "Testing $component..."
    echo "------------------------"
    
    if eval $command; then
        echo "✅ $component tests passed"
    else
        echo "❌ $component tests failed"
        FAILED_TESTS="$FAILED_TESTS\n  - $component"
        ALL_PASSED=false
    fi
}

# Run contract tests
if [ -d "contracts/tests" ]; then
    run_tests "Smart Contracts" "cd contracts && pytest tests/ -v"
else
    echo "⚠️  No contract tests found"
fi

# Run API tests
if [ -d "api/tests" ]; then
    run_tests "API Service" "cd api && pytest tests/ -v"
else
    echo "⚠️  No API tests found"
fi

# Run ML service tests
if [ -d "ml-service/tests" ]; then
    run_tests "ML Service" "cd ml-service && pytest tests/ -v"
else
    echo "⚠️  No ML service tests found"
fi

# Run frontend tests
if [ -f "frontend/package.json" ]; then
    run_tests "Frontend" "cd frontend && npm test -- --watchAll=false"
else
    echo "⚠️  No frontend tests found"
fi

# Linting checks
echo ""
echo "🔍 Running linting checks..."
echo "------------------------"

# Python linting
echo "Checking Python code..."
if ruff check . 2>/dev/null; then
    echo "✅ Python linting passed"
else
    echo "⚠️  Python linting issues found (non-blocking)"
fi

# TypeScript linting
echo "Checking TypeScript code..."
if cd frontend && npm run lint 2>/dev/null; then
    echo "✅ TypeScript linting passed"
else
    echo "⚠️  TypeScript linting issues found (non-blocking)"
fi

# Type checking
echo "Checking TypeScript types..."
if cd frontend && npm run typecheck 2>/dev/null; then
    echo "✅ TypeScript type checking passed"
else
    echo "⚠️  TypeScript type issues found (non-blocking)"
fi

# Summary
echo ""
echo "================================="
if [ "$ALL_PASSED" = true ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed:"
    echo -e "$FAILED_TESTS"
    exit 1
fi