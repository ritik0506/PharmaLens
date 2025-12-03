"""
PharmaLens AI Engine - Main Application
========================================
FastAPI entry point for the Multi-Agent Drug Repurposing System.

This engine provides:
- Multi-agent orchestration (Clinical, Patent, Market, Vision)
- Hybrid processing mode (Cloud GPT-4 / Local Llama 3)
- Knowledge Graph integration
- ROI calculation endpoints
"""

import os
import random
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import structlog
import logging

# Configure standard logging
logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(message)s",
    level=logging.INFO
)

# Configure structured logging with simpler configuration
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.dev.ConsoleRenderer()
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True
)

logger = structlog.get_logger(__name__)

# Import agents
from app.agents.market_agent import MarketAgent
from app.agents.clinical_agent import ClinicalAgent
from app.agents.patent_agent import PatentAgent
from app.agents.vision_agent import VisionAgent
from app.core.config import settings
from app.core.privacy_toggle import PrivacyManager


# ======================
# PYDANTIC MODELS
# ======================

class AnalyzeRequest(BaseModel):
    """Request model for compound analysis"""
    molecule: str = Field(..., min_length=2, max_length=200, description="Name of the drug/compound")
    mode: str = Field(default="cloud", pattern="^(secure|cloud)$", description="Processing mode")
    request_id: str = Field(..., description="Unique request identifier")
    agents: Optional[List[str]] = Field(
        default=["clinical", "patent", "market", "vision"],
        description="List of agents to engage"
    )


class ROIRequest(BaseModel):
    """Request model for ROI calculation"""
    molecule: str = Field(..., min_length=2, description="Name of the drug/compound")
    request_id: str = Field(..., description="Unique request identifier")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    timestamp: str
    mode_available: dict


# ======================
# APPLICATION LIFECYCLE
# ======================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager"""
    logger.info("🚀 Starting PharmaLens AI Engine", version=settings.VERSION)
    logger.info("🔧 Privacy modes available", 
                cloud=settings.CLOUD_ENABLED, 
                local=settings.LOCAL_ENABLED)
    
    # Initialize agents
    app.state.market_agent = MarketAgent()
    app.state.clinical_agent = ClinicalAgent()
    app.state.patent_agent = PatentAgent()
    app.state.vision_agent = VisionAgent()
    app.state.privacy_manager = PrivacyManager()
    
    yield
    
    logger.info("👋 Shutting down PharmaLens AI Engine")


# ======================
# FASTAPI APPLICATION
# ======================

app = FastAPI(
    title="PharmaLens AI Engine",
    description="Multi-Agent Drug Repurposing AI System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================
# MIDDLEWARE
# ======================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = datetime.now()
    
    response = await call_next(request)
    
    duration = (datetime.now() - start_time).total_seconds() * 1000
    logger.info(
        "request_processed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=round(duration, 2)
    )
    
    return response


# ======================
# API ENDPOINTS
# ======================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint for service monitoring.
    Returns current service status and available modes.
    """
    return HealthResponse(
        status="healthy",
        service="pharmalens-ai-engine",
        version=settings.VERSION,
        timestamp=datetime.now().isoformat(),
        mode_available={
            "cloud": settings.CLOUD_ENABLED,
            "local": settings.LOCAL_ENABLED
        }
    )


@app.post("/api/analyze")
async def analyze_compound(request: AnalyzeRequest):
    """
    Main analysis endpoint - orchestrates all agents.
    
    This endpoint:
    1. Validates the processing mode (secure/cloud)
    2. Dispatches requests to selected agents
    3. Aggregates results from all agents
    4. Returns comprehensive analysis
    
    Args:
        request: AnalyzeRequest containing molecule name, mode, and agent selection
        
    Returns:
        Aggregated analysis from all agents including ROI calculations
    """
    logger.info(
        "analyze_request_received",
        molecule=request.molecule,
        mode=request.mode,
        request_id=request.request_id,
        agents=request.agents
    )
    
    try:
        # Determine LLM based on mode
        privacy_manager: PrivacyManager = app.state.privacy_manager
        llm_config = privacy_manager.get_llm_config(request.mode)
        
        logger.info(
            "processing_mode_selected",
            mode=request.mode,
            model=llm_config["model"],
            request_id=request.request_id
        )
        
        # Execute agents in parallel (simulated)
        results = {
            "request_id": request.request_id,
            "molecule": request.molecule,
            "processing_mode": request.mode,
            "model_used": llm_config["model"],
            "agents_executed": []
        }
        
        # Run selected agents
        if "clinical" in request.agents:
            clinical_result = await app.state.clinical_agent.analyze(
                request.molecule, 
                llm_config
            )
            results["clinical"] = clinical_result
            results["agents_executed"].append({
                "name": "ClinicalAgent",
                "status": "completed",
                "duration_ms": clinical_result.get("processing_time_ms", 0)
            })
        
        if "patent" in request.agents:
            patent_result = await app.state.patent_agent.analyze(
                request.molecule,
                llm_config
            )
            results["patent"] = patent_result
            results["agents_executed"].append({
                "name": "PatentAgent", 
                "status": "completed",
                "duration_ms": patent_result.get("processing_time_ms", 0)
            })
        
        if "market" in request.agents:
            market_result = await app.state.market_agent.calculate_roi(
                request.molecule
            )
            results["market"] = market_result
            results["agents_executed"].append({
                "name": "MarketAgent",
                "status": "completed", 
                "duration_ms": market_result.get("processing_time_ms", 0)
            })
        
        if "vision" in request.agents:
            vision_result = await app.state.vision_agent.analyze(
                request.molecule,
                llm_config
            )
            results["vision"] = vision_result
            results["agents_executed"].append({
                "name": "VisionAgent",
                "status": "completed",
                "duration_ms": vision_result.get("processing_time_ms", 0)
            })
        
        # Add knowledge graph summary
        results["knowledge_graph"] = {
            "nodes": random.randint(100, 300),
            "edges": random.randint(300, 800),
            "key_pathways": ["PI3K/AKT", "MAPK/ERK", "JAK/STAT", "NF-κB"]
        }
        
        logger.info(
            "analysis_completed",
            request_id=request.request_id,
            agents_count=len(results["agents_executed"])
        )
        
        return results
        
    except Exception as e:
        logger.error(
            "analysis_failed",
            request_id=request.request_id,
            error=str(e)
        )
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.post("/api/agents/market/roi")
async def get_roi_calculation(request: ROIRequest):
    """
    Dedicated ROI calculation endpoint.
    
    Returns detailed financial projections for drug repurposing.
    """
    logger.info(
        "roi_calculation_requested",
        molecule=request.molecule,
        request_id=request.request_id
    )
    
    try:
        market_agent: MarketAgent = app.state.market_agent
        result = await market_agent.calculate_roi(request.molecule)
        
        return {
            "success": True,
            "request_id": request.request_id,
            "data": result
        }
        
    except Exception as e:
        logger.error(
            "roi_calculation_failed",
            request_id=request.request_id,
            error=str(e)
        )
        raise HTTPException(
            status_code=500,
            detail=f"ROI calculation failed: {str(e)}"
        )


@app.get("/api/agents/status")
async def get_agents_status():
    """
    Get status of all available agents.
    """
    return {
        "agents": [
            {"name": "ClinicalAgent", "status": "active", "version": "1.0.0"},
            {"name": "PatentAgent", "status": "active", "version": "1.0.0"},
            {"name": "MarketAgent", "status": "active", "version": "1.0.0"},
            {"name": "VisionAgent", "status": "active", "version": "1.0.0"}
        ],
        "orchestrator": "active",
        "knowledge_graph": "connected"
    }


# ======================
# ERROR HANDLERS
# ======================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "path": str(request.url.path)
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error("unhandled_exception", error=str(exc), path=str(request.url.path))
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "path": str(request.url.path)
        }
    )


# ======================
# ENTRY POINT
# ======================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
