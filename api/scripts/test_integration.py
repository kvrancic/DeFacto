#!/usr/bin/env python3
"""
End-to-end integration test for DeFacto backend
"""

import requests
import json
import time
import sys
from datetime import datetime

API_URL = "http://localhost:8000"

def test_health():
    """Test API health"""
    print("Testing API health...")
    try:
        response = requests.get(f"{API_URL}/health")
        status = response.json()
        print(f"✅ API Status: {status}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_submit_claim():
    """Test claim submission flow"""
    print("\nTesting claim submission...")
    
    claim_data = {
        "title": f"Integration Test Claim {datetime.now().isoformat()}",
        "content": "This is an automated integration test claim to verify the entire backend pipeline is working correctly.",
        "category": "technology",
        "evidence_urls": ["https://example.com/evidence"]
    }
    
    try:
        response = requests.post(f"{API_URL}/claims/submit", json=claim_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Claim submitted: ID={result['claim_id']}, IPFS={result['ipfs_hash']}")
            return result['claim_id']
        else:
            print(f"❌ Failed to submit claim: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error submitting claim: {e}")
        return None

def test_get_claim(claim_id):
    """Test retrieving a claim"""
    print(f"\nTesting claim retrieval for ID {claim_id}...")
    
    try:
        response = requests.get(f"{API_URL}/claims/{claim_id}")
        if response.status_code == 200:
            claim = response.json()
            print(f"✅ Retrieved claim: {claim['title']}")
            return True
        else:
            print(f"❌ Failed to retrieve claim: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error retrieving claim: {e}")
        return False

def test_list_claims():
    """Test listing claims"""
    print("\nTesting claims list...")
    
    try:
        response = requests.get(f"{API_URL}/claims?limit=5")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Listed {len(data['claims'])} claims (total: {data['total']})")
            return True
        else:
            print(f"❌ Failed to list claims: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error listing claims: {e}")
        return False

def test_pending_validations():
    """Test pending validations endpoint"""
    print("\nTesting pending validations...")
    
    try:
        response = requests.get(f"{API_URL}/validations/pending")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data['validations'])} pending validations")
            return True
        else:
            print(f"❌ Failed to get pending validations: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting validations: {e}")
        return False

def test_prediction_markets():
    """Test prediction market endpoints"""
    print("\nTesting prediction markets...")
    
    try:
        # List markets
        response = requests.get(f"{API_URL}/predictions/markets")
        if response.status_code == 200:
            markets = response.json()
            print(f"✅ Listed {len(markets)} prediction markets")
            return True
        else:
            print(f"❌ Failed to list markets: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error with prediction markets: {e}")
        return False

def test_submit_vote(claim_id):
    """Test vote submission"""
    print(f"\nTesting vote submission for claim {claim_id}...")
    
    vote_data = {
        "claim_id": claim_id,
        "vote": True,
        "stake_amount": 10
    }
    
    try:
        response = requests.post(f"{API_URL}/validations/vote", json=vote_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Vote submitted: TX={result['tx_id']}")
            return True
        else:
            print(f"⚠️  Vote submission returned {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error submitting vote: {e}")
        return False

def test_create_market(claim_id):
    """Test creating a prediction market"""
    print(f"\nTesting market creation for claim {claim_id}...")
    
    market_data = {
        "claim_id": claim_id,
        "initial_liquidity": 1000,
        "duration_hours": 24
    }
    
    try:
        response = requests.post(f"{API_URL}/predictions/create-market", json=market_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Market created: ID={result['market_id']}, YES price={result['yes_price']}, NO price={result['no_price']}")
            return True
        else:
            print(f"⚠️  Market creation returned {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating market: {e}")
        return False

def main():
    print("=" * 50)
    print("DeFacto Backend Integration Test")
    print("=" * 50)
    
    # Wait for API to be ready
    print("\nWaiting for API to be ready...")
    for i in range(10):
        try:
            response = requests.get(f"{API_URL}/health")
            if response.status_code in [200, 503]:
                print("✅ API is responding")
                break
        except:
            pass
        time.sleep(1)
    else:
        print("❌ API is not responding after 10 seconds")
        sys.exit(1)
    
    tests_passed = 0
    tests_failed = 0
    
    # Run tests
    if test_health():
        tests_passed += 1
    else:
        tests_failed += 1
    
    claim_id = test_submit_claim()
    if claim_id:
        tests_passed += 1
        
        if test_get_claim(claim_id):
            tests_passed += 1
        else:
            tests_failed += 1
        
        if test_submit_vote(claim_id):
            tests_passed += 1
        else:
            tests_failed += 1
        
        if test_create_market(claim_id):
            tests_passed += 1
        else:
            tests_failed += 1
    else:
        tests_failed += 1
    
    if test_list_claims():
        tests_passed += 1
    else:
        tests_failed += 1
    
    if test_pending_validations():
        tests_passed += 1
    else:
        tests_failed += 1
    
    if test_prediction_markets():
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Summary
    print("\n" + "=" * 50)
    print("Test Summary:")
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {tests_failed}")
    print("=" * 50)
    
    if tests_failed == 0:
        print("\n🎉 All tests passed! Backend is ready for frontend integration.")
        sys.exit(0)
    else:
        print(f"\n⚠️  {tests_failed} test(s) failed. Please fix issues before proceeding.")
        sys.exit(1)

if __name__ == "__main__":
    main()