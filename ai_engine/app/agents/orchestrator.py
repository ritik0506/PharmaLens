"""
PharmaLens Master Orchestrator Agent
=====================================
Coordinates all worker agents and manages the analysis pipeline.

Responsibilities (per EY specification):
- Orchestrates the conversation
- Decomposes queries into sub-tasks
- Routes tasks to appropriate worker agents
- Synthesizes the final response
"""

import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
import structlog

from .clinical_agent import ClinicalAgent
from .patent_agent import PatentAgent
from .iqvia_agent import IQVIAInsightsAgent
from .exim_agent import EXIMAgent
from .web_intelligence_agent import WebIntelligenceAgent
from .internal_knowledge_agent import InternalKnowledgeAgent
# Strategic Agents
from .regulatory_agent import RegulatoryComplianceAgent
from .patient_sentiment_agent import PatientSentimentAgent
from .esg_agent import ESGSustainabilityAgent

logger = structlog.get_logger(__name__)


class MasterOrchestrator:
    """
    Master Orchestrator Agent - The brain of the multi-agent system.
    
    7 Mandatory Agents (per EY specification):
    1. Master Orchestrator - Orchestrates conversation and synthesizes responses
    2. IQVIA Insights Agent - Market size, CAGR trends, therapy-level competition
    3. EXIM Trends Agent - Export-import data, trade volumes, sourcing insights
    4. Patent Landscape Agent - USPTO patents, expiry timelines, FTO flags
    5. Clinical Trials Agent - Trial pipeline, sponsor profiles, phase distributions
    6. Internal Knowledge Agent - Summarizes uploaded internal PDFs
    7. Web Intelligence Agent - Real-time web search for guidelines and news
    
    3 Strategic Agents (High Value - EY Focus):
    - Regulatory & Compliance Agent - FDA/EMA compliance, black-box warnings
    - Patient Sentiment Agent - Unmet medical needs identification
    - ESG & Sustainability Agent - Green sourcing, carbon footprint scoring
    
    Plus Report Generator Agent for PDF/Excel output formatting
    """
    
    def __init__(self):
        self.name = "MasterOrchestrator"
        self.version = "2.1.0"
        
        # Initialize 6 mandatory worker agents (7th is the Orchestrator itself)
        self.agents = {
            "iqvia": IQVIAInsightsAgent(),
            "exim": EXIMAgent(),
            "patent": PatentAgent(),
            "clinical": ClinicalAgent(),
            "internal": InternalKnowledgeAgent(),
            "web_intel": WebIntelligenceAgent(),
            # Strategic Agents
            "regulatory": RegulatoryComplianceAgent(),
            "patient_sentiment": PatientSentimentAgent(),
            "esg": ESGSustainabilityAgent()
        }
        
        logger.info(f"Initialized {self.name} v{self.version}", 
                    agents_available=list(self.agents.keys()))
    
    async def process_query(
        self, 
        query: str, 
        molecule: str,
        llm_config: Dict[str, Any],
        requested_agents: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Process a user query through the multi-agent pipeline.
        
        Args:
            query: Natural language query from user
            molecule: Drug/compound name to analyze
            llm_config: LLM configuration (cloud/local)
            requested_agents: Specific agents to engage (optional)
            
        Returns:
            Comprehensive analysis results from all agents
        """
        start_time = datetime.now()
        request_id = f"orch_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        logger.info(
            "orchestration_started",
            request_id=request_id,
            query=query[:100],
            molecule=molecule
        )
        
        # Step 1: Decompose query into sub-tasks
        sub_tasks = self._decompose_query(query, molecule)
        
        # Step 2: Determine agents to engage
        agents_to_run = requested_agents or self._determine_agents(sub_tasks)
        
        logger.info(
            "agents_selected",
            request_id=request_id,
            agents=agents_to_run
        )
        
        # Step 3: Execute agents in parallel
        results = await self._execute_agents(
            molecule=molecule,
            agents=agents_to_run,
            llm_config=llm_config,
            request_id=request_id
        )
        
        # Step 4: Add orchestrator summary
        orchestrator_result = {
            "agents_engaged": len(results),
            "complexity": "High" if len(results) > 4 else "Medium" if len(results) > 2 else "Low",
            "response_time": (datetime.now() - start_time).total_seconds(),
            "confidence": 92,
            "summary": f"Comprehensive analysis of {molecule} completed across {len(results)} specialized agents.",
            "recommendations": [
                "Review IQVIA market data for commercial opportunity",
                "Verify patent landscape for FTO clearance",
                "Monitor clinical trial progress for efficacy signals"
            ]
        }
        results["orchestrator"] = orchestrator_result
        
        # Step 5: Aggregate and generate summary
        summary = self._generate_summary(results, molecule)
        
        # Calculate total processing time
        total_time_ms = (datetime.now() - start_time).total_seconds() * 1000
        
        final_result = {
            "request_id": request_id,
            "query": query,
            "molecule": molecule,
            "processing_mode": llm_config.get("provider"),
            "model_used": llm_config.get("model"),
            "sub_tasks": sub_tasks,
            "agents_executed": [
                {
                    "name": agent_name,
                    "status": "completed" if agent_name in results else "skipped",
                    "duration_ms": results.get(agent_name, {}).get("processing_time_ms", 0)
                }
                for agent_name in agents_to_run
            ],
            "results": results,
            "summary": summary,
            "total_processing_time_ms": round(total_time_ms, 2),
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(
            "orchestration_completed",
            request_id=request_id,
            agents_count=len(results),
            total_time_ms=round(total_time_ms, 2)
        )
        
        return final_result
    
    def _decompose_query(self, query: str, molecule: str) -> List[Dict[str, Any]]:
        """
        Decompose a complex query into sub-tasks.
        
        Args:
            query: User's natural language query
            molecule: Target molecule/drug
            
        Returns:
            List of sub-tasks with priorities
        """
        query_lower = query.lower()
        sub_tasks = []
        
        # IQVIA/Market Intelligence task
        if any(kw in query_lower for kw in ['iqvia', 'sales', 'cagr', 'competitor', 'volume shift', 'commercial', 'market', 'roi', 'revenue']):
            sub_tasks.append({
                "type": "iqvia_analysis",
                "agent": "iqvia",
                "priority": 1,
                "description": f"IQVIA market intelligence for {molecule}"
            })
        
        # EXIM Trade Intelligence task
        if any(kw in query_lower for kw in ['exim', 'trade', 'import', 'export', 'supply chain', 'sourcing', 'api']):
            sub_tasks.append({
                "type": "exim_analysis",
                "agent": "exim",
                "priority": 2,
                "description": f"Export-Import trade analysis for {molecule}"
            })
        
        # Patent analysis task
        if any(kw in query_lower for kw in ['patent', 'ip', 'fto', 'intellectual property', 'expir', 'uspto']):
            sub_tasks.append({
                "type": "patent_analysis",
                "agent": "patent",
                "priority": 2,
                "description": f"Analyze patent landscape for {molecule}"
            })
        
        # Clinical analysis task
        if any(kw in query_lower for kw in ['clinical', 'trial', 'safety', 'efficacy', 'indication', 'phase', 'sponsor']):
            sub_tasks.append({
                "type": "clinical_analysis",
                "agent": "clinical",
                "priority": 1,
                "description": f"Analyze clinical trial data for {molecule}"
            })
        
        # Internal Knowledge task
        if any(kw in query_lower for kw in ['internal', 'document', 'history', 'previous', 'prior', 'strategy', 'pdf', 'deck']):
            sub_tasks.append({
                "type": "internal_knowledge",
                "agent": "internal",
                "priority": 3,
                "description": f"Internal knowledge search for {molecule}"
            })
        
        # Web Intelligence task
        if any(kw in query_lower for kw in ['news', 'web', 'pubmed', 'publication', 'regulatory', 'fda', 'guideline']):
            sub_tasks.append({
                "type": "web_intelligence",
                "agent": "web_intel",
                "priority": 3,
                "description": f"Real-time web intelligence for {molecule}"
            })
        
        # ===== STRATEGIC AGENTS (High Value - EY Focus) =====
        
        # Regulatory & Compliance Agent task
        if any(kw in query_lower for kw in ['regulatory', 'compliance', 'fda', 'ema', 'approval', 'black box', 'warning', 'orange book', 'anda', '505']):
            sub_tasks.append({
                "type": "regulatory_analysis",
                "agent": "regulatory",
                "priority": 1,
                "description": f"FDA/EMA regulatory compliance analysis for {molecule}"
            })
        
        # Patient Sentiment Agent task (Unmet Medical Needs)
        if any(kw in query_lower for kw in ['patient', 'unmet', 'need', 'sentiment', 'complaint', 'side effect', 'tolerability', 'forum', 'experience']):
            sub_tasks.append({
                "type": "patient_sentiment",
                "agent": "patient_sentiment",
                "priority": 2,
                "description": f"Patient sentiment and unmet needs analysis for {molecule}"
            })
        
        # ESG & Sustainability Agent task
        if any(kw in query_lower for kw in ['esg', 'sustainability', 'green', 'carbon', 'ethical', 'sourcing', 'environment', 'social', 'governance']):
            sub_tasks.append({
                "type": "esg_analysis",
                "agent": "esg",
                "priority": 3,
                "description": f"ESG and sustainability assessment for {molecule}"
            })
        
        # If no specific keywords, run all agents (comprehensive analysis)
        if not sub_tasks:
            sub_tasks = [
                # Mandatory Agents
                {"type": "iqvia_analysis", "agent": "iqvia", "priority": 1, "description": f"IQVIA market intelligence for {molecule}"},
                {"type": "exim_analysis", "agent": "exim", "priority": 2, "description": f"EXIM trade analysis for {molecule}"},
                {"type": "patent_analysis", "agent": "patent", "priority": 2, "description": f"Patent landscape analysis for {molecule}"},
                {"type": "clinical_analysis", "agent": "clinical", "priority": 1, "description": f"Clinical trials analysis for {molecule}"},
                {"type": "internal_knowledge", "agent": "internal", "priority": 3, "description": f"Internal knowledge for {molecule}"},
                {"type": "web_intelligence", "agent": "web_intel", "priority": 3, "description": f"Web intelligence for {molecule}"},
                # Strategic Agents
                {"type": "regulatory_analysis", "agent": "regulatory", "priority": 1, "description": f"Regulatory compliance for {molecule}"},
                {"type": "patient_sentiment", "agent": "patient_sentiment", "priority": 2, "description": f"Patient unmet needs for {molecule}"},
                {"type": "esg_analysis", "agent": "esg", "priority": 3, "description": f"ESG assessment for {molecule}"},
            ]
        
        # Sort by priority
        return sorted(sub_tasks, key=lambda x: x["priority"])
    
    def _determine_agents(self, sub_tasks: List[Dict[str, Any]]) -> List[str]:
        """Determine which agents to run based on sub-tasks."""
        return list(set(task["agent"] for task in sub_tasks))
    
    async def _execute_agents(
        self,
        molecule: str,
        agents: List[str],
        llm_config: Dict[str, Any],
        request_id: str
    ) -> Dict[str, Any]:
        """
        Execute multiple agents in parallel.
        
        Args:
            molecule: Target molecule
            agents: List of agent names to execute
            llm_config: LLM configuration
            request_id: Request identifier
            
        Returns:
            Dictionary of agent results
        """
        results = {}
        tasks = []
        
        for agent_name in agents:
            if agent_name in self.agents and agent_name != "validation":
                agent = self.agents[agent_name]
                
                if agent_name == "market":
                    task = agent.calculate_roi(molecule)
                else:
                    task = agent.analyze(molecule, llm_config)
                
                tasks.append((agent_name, task))
        
        # Execute all tasks concurrently
        for agent_name, task in tasks:
            try:
                result = await task
                results[agent_name] = result
                logger.info(f"agent_completed", agent=agent_name, request_id=request_id)
            except Exception as e:
                logger.error(f"agent_failed", agent=agent_name, error=str(e))
                results[agent_name] = {"error": str(e), "status": "failed"}
        
        return results
    
    def _generate_summary(self, results: Dict[str, Any], molecule: str) -> Dict[str, Any]:
        """
        Generate an executive summary from all agent results.
        
        Args:
            results: Combined results from all agents
            molecule: Target molecule
            
        Returns:
            Executive summary with key insights
        """
        summary = {
            "molecule": molecule,
            "overall_assessment": "FAVORABLE",
            "key_findings": [],
            "risks": [],
            "opportunities": [],
            "recommended_actions": []
        }
        
        # Extract clinical findings
        if "clinical" in results and "error" not in results["clinical"]:
            clinical = results["clinical"]
            summary["key_findings"].append(
                f"Found {clinical.get('total_trials_found', 0)} clinical trials with safety score {clinical.get('safety_score', 'N/A')}/10"
            )
            if clinical.get("potential_new_indications"):
                summary["opportunities"].extend([
                    f"Potential new indication: {ind}" 
                    for ind in clinical["potential_new_indications"][:2]
                ])
        
        # Extract patent findings
        if "patent" in results and "error" not in results["patent"]:
            patent = results["patent"]
            summary["key_findings"].append(
                f"Patent expiration: {patent.get('earliest_expiration', 'Unknown')} | FTO Status: {patent.get('freedom_to_operate', 'Unknown')}"
            )
            if patent.get("blocking_patents", 0) > 0:
                summary["risks"].append(
                    f"{patent['blocking_patents']} blocking patents identified"
                )
        
        # Extract market findings
        if "market" in results and "error" not in results["market"]:
            market = results["market"]
            summary["key_findings"].append(
                f"Projected ROI: {market.get('roi_percentage', 0)}% | Market Size: ${market.get('market_size_billions', 0)}B"
            )
            summary["recommended_actions"].append(
                f"Investment recommendation: {market.get('recommendation', 'REVIEW')}"
            )
        
        # Extract validation concerns
        if "validation" in results and "error" not in results["validation"]:
            validation = results["validation"]
            summary["risks"].extend(validation.get("risk_flags", [])[:3])
            
            # Adjust overall assessment based on validation
            if validation.get("overall_confidence", "HIGH") == "LOW":
                summary["overall_assessment"] = "CAUTIOUS"
            elif validation.get("critical_issues", []):
                summary["overall_assessment"] = "REVIEW_REQUIRED"
        
        return summary
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get status of all available agents."""
        return {
            "orchestrator": {
                "name": self.name,
                "version": self.version,
                "status": "active"
            },
            "agents": [
                {
                    "name": agent.name,
                    "version": agent.version,
                    "status": "active"
                }
                for agent in self.agents.values()
            ]
        }
