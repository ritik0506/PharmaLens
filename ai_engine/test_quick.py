"""Quick test of AI engine and LLM integration"""
import asyncio
import json
from app.agents.iqvia_agent import IQVIAInsightsAgent
from app.core.privacy_toggle import PrivacyManager

async def test():
    print("Testing IQVIA Agent...")
    pm = PrivacyManager()
    agent = IQVIAInsightsAgent()
    
    # Test with cloud config (won't call LLM if no API key, will use deterministic)
    llm_config = pm.get_llm_config('cloud')
    print(f"LLM Config Provider: {llm_config.get('provider')}")
    print(f"Has API Key: {bool(llm_config.get('api_key'))}")
    
    result = await agent.analyze('Aspirin', llm_config)
    print(f"\n✓ Agent works!")
    print(f"Market Size: ${result['market_size']['total_market_usd_bn']}B")
    print(f"Therapy Area: {result['therapy_area']}")
    print(f"Market Maturity: {result['market_maturity']}")
    
    return result

if __name__ == "__main__":
    asyncio.run(test())
