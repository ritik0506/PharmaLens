"""
Quick test to verify Ollama integration via API
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_clinical_agent():
    """Test Clinical Agent with Ollama"""
    print("\n" + "="*60)
    print("Testing Clinical Agent with Ollama (llama3:8b)")
    print("="*60)
    
    payload = {
        "molecule": "Aspirin",
        "mode": "auto",  # Will use Ollama since no OpenAI key
        "request_id": "test-ollama-001"
    }
    
    print(f"\nSending request to: {BASE_URL}/analyze/clinical")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/analyze/clinical",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n✓ SUCCESS! Response received:")
            print(f"  - Provider: {result.get('data', {}).get('provider_used', 'N/A')}")
            print(f"  - Model: {result.get('data', {}).get('model_used', 'N/A')}")
            print(f"  - LLM Enhanced: {result.get('data', {}).get('llm_enhanced', False)}")
            print(f"  - Trials Found: {result.get('data', {}).get('total_trials_found', 'N/A')}")
            print(f"  - Safety Score: {result.get('data', {}).get('safety_score', 'N/A')}/10")
            
            if result.get('data', {}).get('llm_enhanced'):
                print("\n✓ LLM Interpretation:")
                interpretation = result.get('data', {}).get('llm_interpretation', '')
                print(f"  {interpretation[:300]}...")
            else:
                print(f"\n⚠ No LLM Enhancement: {result.get('data', {}).get('llm_interpretation', 'N/A')}")
            
            # Full response
            print("\n📄 Full Response:")
            print(json.dumps(result, indent=2))
            
            return True
        else:
            print(f"\n✗ FAILED: HTTP {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        return False


def test_orchestrator():
    """Test Orchestrator with multiple agents"""
    print("\n" + "="*60)
    print("Testing Orchestrator (Multi-Agent)")
    print("="*60)
    
    payload = {
        "query": "What are the repurposing opportunities for Aspirin in cancer treatment?",
        "molecule": "Aspirin",
        "mode": "auto",
        "request_id": "test-orchestrator-001"
    }
    
    print(f"\nSending request to: {BASE_URL}/analyze")
    print(f"Query: {payload['query']}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/analyze",
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n✓ SUCCESS! Multi-agent analysis completed")
            
            agents_completed = result.get('data', {}).get('agents_completed', [])
            print(f"  - Agents Engaged: {len(agents_completed)}")
            print(f"  - Agents: {', '.join(agents_completed)}")
            
            return True
        else:
            print(f"\n✗ FAILED: HTTP {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        return False


def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("Testing Health Endpoint")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✓ Health Check Passed:")
            print(f"  - Status: {result.get('status')}")
            print(f"  - Version: {result.get('version')}")
            print(f"  - Cloud Enabled: {result.get('cloud_enabled')}")
            print(f"  - Local Enabled: {result.get('local_enabled')}")
            return True
        else:
            print(f"\n✗ FAILED: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        return False


if __name__ == "__main__":
    print("\n" + "="*70)
    print("PharmaLens AI Engine - Ollama Integration Test")
    print("="*70)
    
    tests = [
        ("Health Check", test_health),
        ("Clinical Agent (Ollama)", test_clinical_agent),
        # ("Orchestrator (Multi-Agent)", test_orchestrator),  # Uncomment for full test
    ]
    
    results = []
    for test_name, test_func in tests:
        result = test_func()
        results.append((test_name, result))
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status:8} - {test_name}")
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Ollama integration is working!")
    else:
        print("\n⚠ Some tests failed. Check logs above.")
