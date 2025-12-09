# PharmaLens LLM Configuration Guide

## Overview

PharmaLens supports two LLM modes:
1. **Cloud Mode (GPT-4)** - Powered by OpenAI, best for complex analysis
2. **Local Mode (Llama)** - On-premise, HIPAA-compliant processing

**Current Status**: Running in **Deterministic Mode** (no LLM configured)

---

## Option 1: Cloud Mode (GPT-4) - Recommended for Most Users

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Step 2: Configure the API Key

1. Open `ai_engine/.env` file
2. Find the line: `# OPENAI_API_KEY=sk-your-openai-api-key-here`
3. Uncomment it (remove the `#`) and replace with your actual key:
   ```bash
   OPENAI_API_KEY=sk-proj-abc123...your-actual-key
   ```
4. Save the file

### Step 3: Restart the AI Engine

```bash
# Stop the current AI engine (Ctrl+C in its terminal)
# Then restart:
cd ai_engine
python -m uvicorn app.main:app --reload --port 8000
```

### Verification

Check the logs - you should see:
```
✓ Cloud Mode: Enabled (GPT-4)
✓ OpenAI API Key: Configured
```

---

## Option 2: Local Mode (Llama) - For On-Premise/HIPAA Compliance

### Step 1: Install Dependencies

```bash
pip install llama-cpp-python
```

**For GPU acceleration (optional but recommended):**
```bash
# NVIDIA GPU
pip install llama-cpp-python --force-reinstall --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cu118

# Apple M1/M2
pip install llama-cpp-python --force-reinstall --no-cache-dir
```

### Step 2: Download a Model

Choose one of these models:

**Llama 2 7B (Recommended for most systems):**
- Download: https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf
- Size: ~4 GB
- RAM Required: 8 GB

**Llama 2 13B (Better quality, more resources):**
- Download: https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/resolve/main/llama-2-13b-chat.Q4_K_M.gguf
- Size: ~7 GB
- RAM Required: 16 GB

### Step 3: Configure the Model Path

1. Create a models directory (e.g., `D:\models` or `C:\models`)
2. Save the downloaded `.gguf` file there
3. Open `ai_engine/.env`
4. Update the path:
   ```bash
   LOCAL_MODEL_PATH=D:/models/llama-2-7b-chat.Q4_K_M.gguf
   LOCAL_MODEL_NAME=llama-2-7b-chat
   ```

### Step 4: Restart the AI Engine

```bash
cd ai_engine
python -m uvicorn app.main:app --reload --port 8000
```

### Verification

The logs should show:
```
✓ Local Mode: Enabled (Llama)
✓ Model loaded: llama-2-7b-chat
```

---

## Testing LLM Integration

### Test with Python Script

```bash
cd ai_engine
python test_llm_integration.py
```

This will test:
- ✓ LLM service initialization
- ✓ Cloud mode (if API key configured)
- ✓ Local mode (if model configured)
- ✓ Agent LLM integration

### Test via API

```bash
# Test analysis endpoint
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"molecule": "Aspirin", "mode": "cloud", "request_id": "test-001"}'
```

---

## How Agents Use LLM

When LLM is configured, agents use it for:

1. **IQVIA Agent**: Market trend analysis, competitive intelligence
2. **Clinical Agent**: Trial interpretation, safety analysis
3. **Patent Agent**: Patent landscape analysis, FTO assessment
4. **Market Agent**: ROI projections, investment recommendations
5. **Web Intelligence**: Real-time news and sentiment analysis
6. **All Other Agents**: Enhanced reasoning and insights

### Without LLM (Current Mode)

Agents use pre-programmed deterministic responses based on:
- Historical data patterns
- Rule-based algorithms
- Synthetic data generation
- Knowledge base lookups

**This is perfect for testing and development!**

---

## Comparison: Cloud vs Local vs Deterministic

| Feature | Cloud (GPT-4) | Local (Llama) | Deterministic |
|---------|---------------|---------------|---------------|
| **Cost** | ~$0.03-0.06 per request | Free (after model download) | Free |
| **Speed** | ~5-10 seconds | ~10-30 seconds (CPU) / ~3-5s (GPU) | <1 second |
| **Quality** | Highest | Good | Basic |
| **Privacy** | Data sent to OpenAI | 100% local | 100% local |
| **Setup** | API key only | Model download + setup | None needed |
| **Best For** | Production, best insights | HIPAA/sensitive data | Testing, demos |

---

## Troubleshooting

### "OpenAI API Error: Unauthorized"
- Check your API key is correct
- Ensure you have credits/billing set up at OpenAI
- Verify the key starts with `sk-`

### "Model file not found"
- Check the path in `.env` uses forward slashes (`/`) or escaped backslashes (`\\`)
- Verify the `.gguf` file exists at that location
- Ensure the filename matches exactly

### "Out of memory" (Local Mode)
- Use a smaller model (7B instead of 13B)
- Close other applications
- Try quantized versions (Q4_K_M uses less RAM)

### Agents Still Use Deterministic Responses
- Restart the AI engine after changing `.env`
- Check logs for "LLM initialized" message
- Verify no error messages in the terminal

---

## Current Configuration Status

To check your current setup:

```bash
cd ai_engine
python -c "from app.core.config import settings; print(f'OpenAI Key: {'✓ Set' if settings.OPENAI_API_KEY else '✗ Not set'}'); print(f'Local Model: {'✓ Set' if settings.LOCAL_MODEL_PATH else '✗ Not set'}')"
```

---

## Quick Reference

### Enable Cloud Mode
```bash
# ai_engine/.env
OPENAI_API_KEY=sk-your-key-here
```

### Enable Local Mode
```bash
# ai_engine/.env
LOCAL_MODEL_PATH=D:/models/llama-2-7b-chat.Q4_K_M.gguf
```

### Switch Modes at Runtime
```bash
# Use cloud mode for a request
curl -X POST http://localhost:8000/api/analyze -d '{"mode": "cloud", ...}'

# Use secure (local) mode for a request
curl -X POST http://localhost:8000/api/analyze -d '{"mode": "secure", ...}'
```

---

## Need Help?

- Check `ai_engine/test_llm_integration.py` for working examples
- Review logs in the AI engine terminal
- See `docs/llm/LLM_INTEGRATION.md` for technical details

**The application works perfectly without LLM configuration** - add it when you're ready for AI-powered insights!
