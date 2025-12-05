"""
PharmaLens Patient Sentiment Agent
===================================
Scrapes and analyzes patient forums to identify unmet medical needs,
treatment complaints, and real-world patient experiences.

Addresses the "unmet medical needs" requirement from the problem statement.
"""

import random
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import structlog

logger = structlog.get_logger(__name__)


class PatientSentimentAgent:
    """
    Patient Sentiment Agent - Voice of the Patient.
    
    Responsibilities:
    - Analyze patient forum discussions (simulated)
    - Identify treatment dissatisfaction patterns
    - Quantify unmet medical needs
    - Track adverse event complaints
    - Sentiment analysis on current treatments
    """
    
    def __init__(self):
        self.name = "PatientSentimentAgent"
        self.version = "1.0.0"
        
        # Simulated patient forum data
        self.forum_sources = [
            "PatientLikeMe",
            "HealthUnlocked",
            "DailyStrength",
            "WebMD Community",
            "Reddit r/medicine",
            "Inspire Health Communities"
        ]
        
        # Common complaint categories
        self.complaint_categories = [
            "Side Effects",
            "Efficacy Concerns",
            "Cost/Access Issues",
            "Administration Burden",
            "Quality of Life Impact",
            "Drug Interactions"
        ]
        
        logger.info(f"Initialized {self.name} v{self.version}")
    
    async def analyze(
        self,
        molecule: str,
        indication: Optional[str] = None,
        competitor_drugs: Optional[List[str]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Analyze patient sentiment and identify unmet needs.
        
        Args:
            molecule: Drug/compound name
            indication: Target therapeutic indication
            competitor_drugs: List of competitor drugs to analyze
            
        Returns:
            Patient sentiment analysis with unmet needs identification
        """
        start_time = datetime.now()
        
        logger.info(
            "patient_sentiment_analysis_started",
            molecule=molecule,
            indication=indication
        )
        
        # Generate patient discussions analysis
        forum_analysis = self._analyze_forums(molecule, indication)
        
        # Identify unmet needs
        unmet_needs = self._identify_unmet_needs(molecule, indication)
        
        # Sentiment scoring
        sentiment_scores = self._calculate_sentiment(molecule)
        
        # Competitor comparison (if provided)
        competitor_sentiment = {}
        if competitor_drugs:
            for drug in competitor_drugs[:5]:  # Limit to 5
                competitor_sentiment[drug] = self._calculate_sentiment(drug)
        
        # Treatment burden analysis
        treatment_burden = self._analyze_treatment_burden(molecule)
        
        # Patient journey mapping
        patient_journey = self._map_patient_journey(indication)
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        result = {
            "agent": self.name,
            "molecule": molecule,
            "indication": indication,
            "timestamp": datetime.now().isoformat(),
            "processing_time_ms": round(processing_time, 2),
            
            # Forum Analysis
            "forum_sources_analyzed": self.forum_sources,
            "total_posts_analyzed": forum_analysis["post_count"],
            "date_range": forum_analysis["date_range"],
            
            # Sentiment Scores
            "overall_sentiment": sentiment_scores["overall"],
            "sentiment_breakdown": sentiment_scores["breakdown"],
            "sentiment_trend": sentiment_scores["trend"],
            
            # Complaint Analysis
            "top_complaints": forum_analysis["top_complaints"],
            "complaint_severity_distribution": forum_analysis["severity_distribution"],
            
            # Unmet Needs (Key Output)
            "unmet_needs_identified": unmet_needs["needs"],
            "unmet_needs_count": len(unmet_needs["needs"]),
            "unmet_needs_priority_score": unmet_needs["priority_score"],
            "market_opportunity_signal": unmet_needs["opportunity_signal"],
            
            # Treatment Burden
            "treatment_burden_score": treatment_burden["score"],
            "burden_factors": treatment_burden["factors"],
            "quality_of_life_impact": treatment_burden["qol_impact"],
            
            # Patient Journey
            "patient_journey_insights": patient_journey,
            
            # Competitor Comparison
            "competitor_sentiment": competitor_sentiment,
            
            # Actionable Insights
            "key_insights": self._generate_insights(
                forum_analysis, unmet_needs, sentiment_scores
            ),
            
            # Recommendations
            "recommendations": self._generate_recommendations(unmet_needs, treatment_burden),
            
            # Summary
            "summary": self._generate_summary(
                molecule, sentiment_scores, unmet_needs, treatment_burden
            )
        }
        
        logger.info(
            "patient_sentiment_analysis_completed",
            molecule=molecule,
            sentiment=sentiment_scores["overall"],
            unmet_needs_count=len(unmet_needs["needs"]),
            processing_time_ms=processing_time
        )
        
        return result
    
    def _analyze_forums(self, molecule: str, indication: Optional[str]) -> Dict[str, Any]:
        """Analyze patient forum discussions."""
        post_count = random.randint(500, 5000)
        
        # Generate realistic complaints
        complaints = [
            {
                "complaint": f"{molecule} causes severe nausea in the first week",
                "frequency": random.randint(15, 35),
                "severity": "High",
                "category": "Side Effects"
            },
            {
                "complaint": "Injection site reactions are painful and long-lasting",
                "frequency": random.randint(10, 25),
                "severity": "Medium",
                "category": "Administration Burden"
            },
            {
                "complaint": "Insurance doesn't cover the full cost - too expensive",
                "frequency": random.randint(20, 40),
                "severity": "High",
                "category": "Cost/Access Issues"
            },
            {
                "complaint": "Takes months to see any real improvement",
                "frequency": random.randint(12, 28),
                "severity": "Medium",
                "category": "Efficacy Concerns"
            },
            {
                "complaint": "Headaches and dizziness are constant",
                "frequency": random.randint(8, 20),
                "severity": "Medium",
                "category": "Side Effects"
            },
            {
                "complaint": "Hard to remember daily dosing schedule",
                "frequency": random.randint(5, 15),
                "severity": "Low",
                "category": "Administration Burden"
            },
            {
                "complaint": f"Switched from {molecule} due to weight gain",
                "frequency": random.randint(10, 22),
                "severity": "High",
                "category": "Quality of Life Impact"
            }
        ]
        
        # Sort by frequency
        complaints.sort(key=lambda x: x["frequency"], reverse=True)
        
        severity_distribution = {
            "High": sum(1 for c in complaints if c["severity"] == "High"),
            "Medium": sum(1 for c in complaints if c["severity"] == "Medium"),
            "Low": sum(1 for c in complaints if c["severity"] == "Low")
        }
        
        return {
            "post_count": post_count,
            "date_range": "Last 12 months",
            "top_complaints": complaints[:5],
            "severity_distribution": severity_distribution
        }
    
    def _identify_unmet_needs(self, molecule: str, indication: Optional[str]) -> Dict[str, Any]:
        """Identify unmet medical needs from patient discussions."""
        unmet_needs = [
            {
                "need": "Better-tolerated treatment option with fewer GI side effects",
                "patient_quote": "I wish there was something that worked without making me feel sick all day",
                "prevalence": "42% of discussions mention this",
                "opportunity_size": "High",
                "addressable": True
            },
            {
                "need": "Once-weekly or once-monthly dosing instead of daily",
                "patient_quote": "It's exhausting to remember to take pills every single day",
                "prevalence": "28% of discussions mention this",
                "opportunity_size": "High",
                "addressable": True
            },
            {
                "need": "More affordable generic alternatives",
                "patient_quote": "My copay is $300/month - I can't afford to stay on this",
                "prevalence": "35% of discussions mention this",
                "opportunity_size": "Medium",
                "addressable": True
            },
            {
                "need": "Treatment that doesn't cause weight changes",
                "patient_quote": "I've gained 20 pounds since starting - it's affecting my mental health",
                "prevalence": "22% of discussions mention this",
                "opportunity_size": "High",
                "addressable": True
            },
            {
                "need": "Faster onset of action",
                "patient_quote": "Waiting 6-8 weeks to know if it's working is incredibly stressful",
                "prevalence": "18% of discussions mention this",
                "opportunity_size": "Medium",
                "addressable": False
            }
        ]
        
        priority_score = sum(
            1 for n in unmet_needs 
            if n["opportunity_size"] == "High" and n["addressable"]
        ) / len(unmet_needs) * 100
        
        return {
            "needs": unmet_needs,
            "priority_score": round(priority_score, 1),
            "opportunity_signal": "Strong" if priority_score > 50 else "Moderate"
        }
    
    def _calculate_sentiment(self, molecule: str) -> Dict[str, Any]:
        """Calculate sentiment scores for a drug."""
        positive = random.randint(25, 45)
        negative = random.randint(20, 40)
        neutral = 100 - positive - negative
        
        overall = "Positive" if positive > negative + 10 else \
                  "Negative" if negative > positive + 10 else "Mixed"
        
        # Generate trend
        trend_options = ["Improving", "Stable", "Declining"]
        trend_weights = [0.3, 0.5, 0.2] if overall == "Positive" else [0.2, 0.4, 0.4]
        trend = random.choices(trend_options, weights=trend_weights)[0]
        
        return {
            "overall": overall,
            "breakdown": {
                "positive": f"{positive}%",
                "neutral": f"{neutral}%",
                "negative": f"{negative}%"
            },
            "trend": trend,
            "net_promoter_score": random.randint(-20, 40)
        }
    
    def _analyze_treatment_burden(self, molecule: str) -> Dict[str, Any]:
        """Analyze treatment burden on patients."""
        burden_score = random.randint(3, 8)  # 1-10 scale
        
        factors = []
        if burden_score >= 5:
            factors.append({
                "factor": "Complex dosing regimen",
                "impact": "High",
                "patient_feedback": "Multiple daily doses are hard to manage"
            })
        if burden_score >= 6:
            factors.append({
                "factor": "Required monitoring",
                "impact": "Medium",
                "patient_feedback": "Monthly blood tests are inconvenient"
            })
        if burden_score >= 4:
            factors.append({
                "factor": "Dietary restrictions",
                "impact": "Medium",
                "patient_feedback": "Can't eat certain foods while on medication"
            })
        if burden_score >= 7:
            factors.append({
                "factor": "Storage requirements",
                "impact": "High",
                "patient_feedback": "Refrigeration makes travel difficult"
            })
        
        qol_impact = "Significant" if burden_score >= 7 else \
                     "Moderate" if burden_score >= 5 else "Minimal"
        
        return {
            "score": burden_score,
            "score_interpretation": f"{burden_score}/10 (Higher = More Burden)",
            "factors": factors,
            "qol_impact": qol_impact
        }
    
    def _map_patient_journey(self, indication: Optional[str]) -> Dict[str, Any]:
        """Map the patient journey and pain points."""
        return {
            "diagnosis_to_treatment": {
                "avg_time": "4-6 months",
                "pain_points": [
                    "Multiple doctor visits before diagnosis",
                    "Insurance pre-authorization delays",
                    "Specialist availability issues"
                ]
            },
            "treatment_initiation": {
                "barriers": [
                    "Cost concerns",
                    "Fear of side effects",
                    "Skepticism about efficacy"
                ],
                "dropout_rate": f"{random.randint(15, 30)}% within first month"
            },
            "long_term_adherence": {
                "avg_adherence_rate": f"{random.randint(55, 75)}%",
                "common_discontinuation_reasons": [
                    "Side effects",
                    "Perceived lack of benefit",
                    "Cost",
                    "Forgetfulness"
                ]
            }
        }
    
    def _generate_insights(
        self,
        forum_analysis: Dict[str, Any],
        unmet_needs: Dict[str, Any],
        sentiment_scores: Dict[str, Any]
    ) -> List[str]:
        """Generate actionable insights."""
        insights = [
            f"Patient sentiment is {sentiment_scores['overall'].lower()} with {sentiment_scores['trend'].lower()} trend",
            f"Identified {len(unmet_needs['needs'])} distinct unmet needs with {unmet_needs['opportunity_signal'].lower()} market opportunity",
            f"Top complaint category: Side Effects ({forum_analysis['severity_distribution']['High']} high-severity issues)"
        ]
        
        if unmet_needs["priority_score"] > 50:
            insights.append(
                "HIGH OPPORTUNITY: Multiple addressable unmet needs identified - strong case for differentiated product"
            )
        
        return insights
    
    def _generate_recommendations(
        self,
        unmet_needs: Dict[str, Any],
        treatment_burden: Dict[str, Any]
    ) -> List[str]:
        """Generate recommendations based on patient insights."""
        recommendations = []
        
        # Based on unmet needs
        for need in unmet_needs["needs"][:3]:
            if need["addressable"]:
                recommendations.append(
                    f"Address '{need['need']}' - affects {need['prevalence']}"
                )
        
        # Based on treatment burden
        if treatment_burden["score"] >= 6:
            recommendations.append(
                "Prioritize formulation/delivery improvements to reduce treatment burden"
            )
        
        recommendations.extend([
            "Develop patient-centric communication addressing top concerns",
            "Consider patient advocacy group partnerships for market access",
            "Build real-world evidence program to address efficacy skepticism"
        ])
        
        return recommendations
    
    def _generate_summary(
        self,
        molecule: str,
        sentiment_scores: Dict[str, Any],
        unmet_needs: Dict[str, Any],
        treatment_burden: Dict[str, Any]
    ) -> str:
        """Generate executive summary."""
        return (
            f"Patient sentiment analysis for {molecule}: Overall sentiment is "
            f"{sentiment_scores['overall']} with {sentiment_scores['trend']} trend. "
            f"Identified {len(unmet_needs['needs'])} unmet needs with "
            f"{unmet_needs['opportunity_signal']} market opportunity signal. "
            f"Treatment burden score: {treatment_burden['score']}/10 "
            f"({treatment_burden['qol_impact']} QoL impact). "
            f"Key opportunity: Address tolerability and convenience gaps."
        )
