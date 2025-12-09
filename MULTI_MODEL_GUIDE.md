# Multi-Model LLM Configuration Guide

## ✅ Three LLM Providers Integrated

PharmaLens now supports switching between **three different LLM providers**:

### 1. **Ollama (Local)** - llama3:8b
- ✅ **CONFIGURED & RUNNING**
- 🔒 100% Private - HIPAA compliant
- 💰 Free, unlimited usage
- 🚀 Good performance for most tasks
- 📍 On-premise - data never leaves server

### 2. **OpenAI GPT-4o** 
- ⚠️ **NOT CONFIGURED** (requires API key)
- 🧠 Highest intelligence for complex analysis
- 💰 Pay per token (~$0.01-0.03 per 1K tokens)
- 🌐 Requires internet connection
- 📊 Best for: Complex reasoning, multi-step analysis

### 3. **Anthropic Claude 3.5 Sonnet**
- ⚠️ **NOT CONFIGURED** (requires API key)
- 🎯 Excellent for detailed analysis
- 💰 Pay per token (~$0.003-0.015 per 1K tokens)
- 🌐 Requires internet connection
- 📊 Best for: Long documents, nuanced reasoning

---

## 🔧 Configuration

### Current Configuration (.env)

```bash
# Ollama (Local) - ACTIVE
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3:8b
LOCAL_ENABLED=true

# OpenAI GPT-4 - INACTIVE
# OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
OPENAI_ENABLED=false

# Anthropic Claude - INACTIVE
# ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_ENABLED=false

# Default Provider
DEFAULT_LLM_PROVIDER=ollama
```

### To Enable OpenAI GPT-4:

1. Get API key from: https://platform.openai.com/api-keys
2. Edit `ai_engine/.env`:
   ```bash
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   OPENAI_ENABLED=true
   ```
3. Restart AI engine

### To Enable Anthropic Claude:

1. Get API key from: https://console.anthropic.com/
2. Edit `ai_engine/.env`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ANTHROPIC_ENABLED=true
   ```
3. Restart AI engine

---

## 🎯 How to Switch Models

### Method 1: Specify Provider in API Request (Recommended)

```json
{
  "molecule": "Aspirin",
  "mode": "auto",
  "provider": "ollama",  // or "openai" or "anthropic"
  "request_id": "test-001"
}
```

### Method 2: Use Mode to Auto-Select

```json
{
  "molecule": "Aspirin",
  "mode": "secure",  // Forces Ollama (local)
  "request_id": "test-001"
}
```

```json
{
  "molecule": "Aspirin",
  "mode": "cloud",  // Uses OpenAI or Claude (whichever is configured)
  "request_id": "test-001"
}
```

```json
{
  "molecule": "Aspirin",
  "mode": "auto",  // Auto-detects best available provider
  "request_id": "test-001"
}
```

### Method 3: Change Default Provider

Edit `ai_engine/.env`:
```bash
DEFAULT_LLM_PROVIDER=openai  # or "ollama" or "anthropic"
```

Then use `mode: "auto"` in requests.

---

## 📊 Provider Comparison

| Feature | Ollama (llama3:8b) | OpenAI GPT-4o | Claude 3.5 Sonnet |
|---------|-------------------|---------------|-------------------|
| **Privacy** | ✅ 100% Private | ⚠️ Cloud | ⚠️ Cloud |
| **Cost** | ✅ Free | 💰 $0.01-0.03/1K | 💰 $0.003-0.015/1K |
| **Speed** | ⚡ Fast (2-5s) | ⚡ Very Fast (1-3s) | ⚡ Fast (2-4s) |
| **Intelligence** | 🧠 Good | 🧠🧠🧠 Excellent | 🧠🧠🧠 Excellent |
| **Context Window** | 8K tokens | 128K tokens | 200K tokens |
| **Best For** | General queries | Complex analysis | Long documents |
| **Setup** | ✅ None needed | ⚠️ API key required | ⚠️ API key required |
| **Status** | ✅ ACTIVE | ⚠️ Needs API key | ⚠️ Needs API key |

---

## 🚀 API Examples

### Example 1: Force Ollama (Local, Private)

**POST** `/analyze/clinical`
```json
{
  "molecule": "Metformin",
  "mode": "secure",
  "request_id": "secure-001"
}
```

Or explicitly:
```json
{
  "molecule": "Metformin",
  "provider": "ollama",
  "request_id": "ollama-001"
}
```

### Example 2: Use OpenAI GPT-4 (Once Configured)

**POST** `/analyze/clinical`
```json
{
  "molecule": "Keytruda",
  "provider": "openai",
  "request_id": "gpt4-001"
}
```

### Example 3: Use Claude (Once Configured)

**POST** `/analyze/clinical`
```json
{
  "molecule": "Humira",
  "provider": "anthropic",
  "request_id": "claude-001"
}
```

### Example 4: Auto-Select Best Available

**POST** `/analyze/clinical`
```json
{
  "molecule": "Aspirin",
  "mode": "auto",
  "request_id": "auto-001"
}
```

This will use:
1. Default provider (currently: Ollama)
2. Or fallback to any available provider

---

## 🔍 Response Differences

### Response Fields

All responses include these fields to show which model was used:

```json
{
  "success": true,
  "data": {
    "molecule": "Aspirin",
    "provider_used": "ollama",  // or "openai" or "anthropic"
    "model_used": "llama3:8b",  // or "gpt-4o" or "claude-3-5-sonnet-20241022"
    "llm_enhanced": true,
    "llm_interpretation": "AI-generated insights...",
    ...
  }
}
```

### Quality Comparison Example

#### Ollama (llama3:8b) Response:
```
"Based on 45 clinical trials, Aspirin shows good cardiovascular 
protection with moderate safety profile. Commonly used for heart 
attack prevention."
```

#### GPT-4o Response:
```
"Comprehensive analysis of 45 clinical trials reveals Aspirin's 
multifaceted pharmacological profile. Primary mechanism involves 
irreversible COX-1 inhibition, resulting in decreased thromboxane A2 
synthesis. Clinical efficacy demonstrated across cardiovascular 
indications including primary prevention (NNT=250-500), secondary 
prevention (NNT=50-100), with established risk-benefit ratio favoring 
use in high-risk populations..."
```

#### Claude 3.5 Sonnet Response:
```
"The clinical evidence for Aspirin, drawn from 45 comprehensive trials, 
demonstrates a nuanced therapeutic profile worthy of detailed examination. 
The compound exhibits a well-characterized mechanism through selective 
COX-1 inhibition, leading to sustained antiplatelet effects. Of particular 
clinical significance is the dose-dependent efficacy observed across 
cardiovascular prevention strategies, with low-dose regimens (75-100mg) 
achieving optimal benefit-risk profiles in secondary prevention contexts..."
```

---

## 💡 Best Practices

### Use Ollama For:
- ✅ All general queries
- ✅ Testing and development
- ✅ HIPAA-compliant applications
- ✅ Cost-sensitive workloads
- ✅ High-volume queries

### Use GPT-4o For:
- 🎯 Complex multi-step reasoning
- 🎯 Novel drug mechanism analysis
- 🎯 Regulatory strategy planning
- 🎯 Competitive intelligence
- 🎯 When highest quality needed

### Use Claude For:
- 📚 Long document analysis
- 📚 Detailed literature reviews
- 📚 Nuanced regulatory interpretations
- 📚 Patient narrative analysis
- 📚 Complex clinical protocols

---

## 🧪 Testing Different Models

### Test Script

```python
import requests

BASE_URL = "http://localhost:8000"

# Test all three providers
providers = ["ollama", "openai", "anthropic"]

for provider in providers:
    print(f"\n{'='*60}")
    print(f"Testing: {provider.upper()}")
    print('='*60)
    
    response = requests.post(
        f"{BASE_URL}/analyze/clinical",
        json={
            "molecule": "Aspirin",
            "provider": provider,
            "request_id": f"test-{provider}"
        }
    )
    
    if response.status_code == 200:
        data = response.json()["data"]
        print(f"✓ Provider: {data.get('provider_used')}")
        print(f"✓ Model: {data.get('model_used')}")
        print(f"✓ Enhanced: {data.get('llm_enhanced')}")
        print(f"\nInterpretation (first 200 chars):")
        print(data.get('llm_interpretation', '')[:200])
    else:
        print(f"✗ Failed: {response.status_code}")
        print(response.text)
```

---

## 📈 Cost Estimation

### Typical Query Costs

| Query Type | Tokens | Ollama | GPT-4o | Claude 3.5 |
|------------|--------|--------|--------|------------|
| Simple Clinical | 500 | $0.00 | ~$0.015 | ~$0.002 |
| Full Analysis | 2000 | $0.00 | ~$0.06 | ~$0.008 |
| Multi-Agent | 8000 | $0.00 | ~$0.24 | ~$0.032 |
| Daily (100 queries) | 200K | $0.00 | ~$6.00 | ~$0.80 |
| Monthly (3000 queries) | 6M | $0.00 | ~$180 | ~$24 |

💡 **Recommendation**: Use Ollama for 90% of queries, reserve GPT-4/Claude for critical analyses.

---

## 🔄 Switching Workflow

### Development → Production Strategy

1. **Development**: Use Ollama exclusively
   ```bash
   DEFAULT_LLM_PROVIDER=ollama
   ```

2. **Testing**: Add OpenAI for comparison
   ```bash
   # Enable OpenAI for testing
   OPENAI_ENABLED=true
   ```

3. **Production**: Hybrid approach
   ```python
   # Route by query complexity
   if query_complexity == "high":
       provider = "openai"  # or "anthropic"
   else:
       provider = "ollama"
   ```

---

## ✅ Current System Status

```
🟢 Ollama (llama3:8b): ACTIVE
   - Base URL: http://localhost:11434
   - Model: llama3:8b
   - Status: Running
   - Cost: $0.00

🔴 OpenAI (GPT-4o): INACTIVE
   - Requires: OPENAI_API_KEY
   - Status: Not configured
   - Cost: ~$0.01-0.03 per 1K tokens

🔴 Anthropic (Claude 3.5): INACTIVE
   - Requires: ANTHROPIC_API_KEY
   - Status: Not configured
   - Cost: ~$0.003-0.015 per 1K tokens
```

---

## 📝 Configuration Checklist

- [x] Ollama installed and running
- [x] Ollama configured in .env
- [x] LLM service supports all 3 providers
- [x] Privacy manager supports provider switching
- [x] API endpoints accept provider parameter
- [x] Anthropic SDK installed
- [ ] OpenAI API key configured (optional)
- [ ] Anthropic API key configured (optional)

---

## 🎉 You Can Now:

1. ✅ Use Ollama (llama3:8b) for all queries (FREE & PRIVATE)
2. ⚙️ Add OpenAI key to unlock GPT-4o (PREMIUM QUALITY)
3. ⚙️ Add Claude key to unlock Claude 3.5 (EXCELLENT ANALYSIS)
4. 🔄 Switch between providers per request
5. 🎯 Set default provider in configuration
6. 📊 Compare model outputs side-by-side

**Start testing now with Ollama - no setup needed!**

Visit: http://localhost:8000/docs
