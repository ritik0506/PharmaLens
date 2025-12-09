# Timeout Issue Resolution
**Date:** December 9, 2025  
**Issue:** API timeout of 120000ms exceeded during comprehensive analysis

## Problem Analysis

### Root Cause
1. **Sequential Agent Execution**: Orchestrator was executing agents one-by-one instead of in parallel
   - Original code: `for agent_name, task in tasks: result = await task` (sequential)
   - With 5 agents taking ~60s each = 300s total (exceeds 120s timeout)

2. **Insufficient Timeouts**: 2-minute timeouts too short for multi-agent analysis
   - Client timeout: 120s
   - Server timeout: 120s
   - No timeout on individual LLM calls

3. **Ollama Timeouts**: Previous Ollama request taking 60+ seconds each

## Solutions Implemented

### 1. True Parallel Agent Execution (orchestrator.py)
**Fixed `_execute_agents()` method to use `asyncio.gather()`:**

```python
# BEFORE (Sequential - SLOW):
for agent_name, task in tasks:
    result = await task  # Waits for each agent to finish

# AFTER (Parallel - FAST):
async def run_agent(agent_name: str):
    # Wrap each agent in error handling
    return (agent_name, result)

tasks = [run_agent(agent_name) for agent_name in agents]
agent_results = await asyncio.gather(*tasks)  # All run concurrently
```

**Performance Impact:**
- Before: Sum of all agent times (5 agents × 60s = 300s)
- After: Max agent time (longest agent = ~60s)
- **5x speedup for typical 5-agent analysis**

### 2. Increased Timeouts Across Stack

**Client (api.js):**
```javascript
// Before: timeout: 120000 (2 minutes)
// After:  timeout: 300000 (5 minutes)
```

**Server (aiEngineService.js):**
```javascript
// Before: timeout: 120000 (2 minutes)
// After:  timeout: 300000 (5 minutes)
```

**Ollama Client (llm_service.py):**
```python
# Before: timeout=60.0 (1 minute)
# After:  timeout=120.0 (2 minutes)
```

### 3. LLM Timeout Protection (llm_service.py)

**Added `timeout` parameter to `generate_completion()`:**

```python
async def generate_completion(
    self,
    prompt: str,
    llm_config: Dict[str, Any],
    timeout: int = 60  # NEW: Default 60s timeout
) -> str:
    try:
        result = await asyncio.wait_for(
            self._generate_ollama(...),
            timeout=timeout
        )
        return result
    except asyncio.TimeoutError:
        raise TimeoutError(f"Generation exceeded {timeout}s timeout")
```

**Benefits:**
- Prevents individual agents from hanging indefinitely
- Raises clear timeout error instead of silent hang
- Configurable per-call if needed

## Expected Performance

### Before Fixes:
- **5 agents sequential**: 300+ seconds (timeout!)
- **Single agent with LLM**: 60+ seconds

### After Fixes:
- **5 agents parallel**: ~60-90 seconds (no timeout)
- **Single agent with LLM**: ~30-60 seconds (with timeout protection)
- **Comprehensive 10+ agent analysis**: ~120-180 seconds (well within 300s limit)

## Timeout Budget Breakdown

| Layer | Timeout | Purpose |
|-------|---------|---------|
| Client → Server | 300s (5 min) | User wait limit |
| Server → AI Engine | 300s (5 min) | Backend processing |
| AI Engine Internal | N/A | Parallel execution |
| Single LLM Call | 60s | Per-agent generation |
| Ollama HTTP | 120s | Ollama API connection |

**Safety Margin:**
- Parallel execution: Max 1 agent = 60s LLM timeout
- With 5 agents parallel + validation: ~90s total
- Leaves 210s buffer before client timeout
- Can handle 15+ agents in parallel comfortably

## Testing Verification

### Test Case 1: Comprehensive Analysis (5 agents)
```bash
POST http://localhost:3001/api/research
{
  "molecule": "Aspirin",
  "mode": "cloud"
}
```

**Expected Result:**
- ✅ Completes in < 90 seconds
- ✅ No timeout errors
- ✅ All 5 agents run in parallel
- ✅ Results include all agent outputs

### Test Case 2: Full Pipeline (12 agents via orchestrator)
```bash
POST http://localhost:8000/api/analyze
{
  "molecule": "Aspirin",
  "mode": "auto",
  "request_id": "test-001"
}
```

**Expected Result:**
- ✅ Completes in < 180 seconds
- ✅ Parallel execution of all agents
- ✅ Validation runs after main agents
- ✅ Summary generation completes

## Files Modified

1. **ai_engine/app/agents/orchestrator.py**
   - Replaced sequential loop with `asyncio.gather()`
   - Added `run_agent()` helper function with error handling

2. **client/src/services/api.js**
   - Increased timeout: 120000 → 300000

3. **server/src/services/aiEngineService.js**
   - Increased timeout: 120000 → 300000

4. **ai_engine/app/services/llm_service.py**
   - Added `timeout` parameter to `generate_completion()`
   - Wrapped provider calls in `asyncio.wait_for()`
   - Increased Ollama client timeout: 60.0 → 120.0

## Migration Notes

### For Developers:
- **No API changes**: Existing code continues to work
- **Optional timeout**: Can pass `timeout=90` to `generate_completion()` if needed
- **Backwards compatible**: Default timeout is 60s

### For Operations:
- **Monitor agent times**: Check logs for `agent_completed` durations
- **Adjust if needed**: If agents consistently timeout, increase LLM timeout
- **Ollama performance**: If Ollama is slow, consider:
  - Using smaller models (gemma3:1b vs llama3:8b)
  - GPU acceleration
  - Reducing max_tokens

## Future Improvements

1. **Streaming Responses**: Send partial results to client before all agents complete
2. **Agent Prioritization**: Run critical agents first, optional agents later
3. **Caching**: Cache LLM responses for common queries
4. **Progress Updates**: WebSocket updates showing which agents completed
5. **Smart Timeout**: Adjust timeout based on agent complexity and model size

## Monitoring

Check AI engine logs for these metrics:
```
agent_completed          agent=clinical duration_ms=45230
agent_completed          agent=patent duration_ms=38120
orchestration_completed  agents_count=5 total_time_ms=62400
```

**Healthy System:**
- Individual agents: 20-60 seconds
- Total orchestration: < 120 seconds
- No timeout errors in logs

**Unhealthy System:**
- Individual agents: > 90 seconds (investigate LLM/Ollama)
- Total orchestration: > 240 seconds (check parallel execution)
- Frequent `TimeoutError` (increase limits)
