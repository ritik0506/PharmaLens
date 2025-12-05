"""
PharmaLens Regulatory & Compliance Agent
=========================================
Checks molecules against FDA Orange Book, EMA guidelines,
black-box warnings, and regulatory rejections.

High-value agent addressing Pharma regulatory constraints.
"""

import random
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import structlog

logger = structlog.get_logger(__name__)


class RegulatoryComplianceAgent:
    """
    Regulatory & Compliance Agent - Ensures regulatory awareness.
    
    Responsibilities:
    - Check FDA Orange Book for existing approvals
    - Identify black-box warnings and contraindications
    - Flag previous regulatory rejections (CRLs)
    - Monitor EMA/MHRA/PMDA guideline alignment
    - Track 505(b)(2) and ANDA pathway eligibility
    """
    
    def __init__(self):
        self.name = "RegulatoryComplianceAgent"
        self.version = "1.0.0"
        
        # Simulated regulatory databases
        self.fda_orange_book = self._init_orange_book()
        self.black_box_warnings = self._init_black_box_warnings()
        self.regulatory_rejections = self._init_rejections()
        
        logger.info(f"Initialized {self.name} v{self.version}")
    
    def _init_orange_book(self) -> Dict[str, Any]:
        """Initialize simulated FDA Orange Book data."""
        return {
            "metformin": {
                "approval_date": "1994-12-29",
                "application_type": "NDA",
                "application_number": "020357",
                "therapeutic_equivalence": "AB",
                "patent_expiry": "Expired",
                "exclusivity_expiry": "Expired",
                "reference_listed_drug": True
            },
            "aspirin": {
                "approval_date": "1965-01-01",
                "application_type": "NDA",
                "therapeutic_equivalence": "AB",
                "patent_expiry": "Expired",
                "exclusivity_expiry": "Expired",
                "reference_listed_drug": True
            },
            "semaglutide": {
                "approval_date": "2017-12-05",
                "application_type": "NDA",
                "application_number": "209637",
                "therapeutic_equivalence": "RS",
                "patent_expiry": "2031-06-15",
                "exclusivity_expiry": "2024-12-05",
                "reference_listed_drug": True
            },
            "imatinib": {
                "approval_date": "2001-05-10",
                "application_type": "NDA",
                "application_number": "021588",
                "therapeutic_equivalence": "AB",
                "patent_expiry": "2015-01-25",
                "exclusivity_expiry": "Expired",
                "reference_listed_drug": True
            }
        }
    
    def _init_black_box_warnings(self) -> Dict[str, List[str]]:
        """Initialize black-box warning database."""
        return {
            "metformin": ["Lactic acidosis risk in renal impairment"],
            "rosiglitazone": ["Cardiovascular risk - heart failure", "MI risk increase"],
            "celecoxib": ["Cardiovascular thrombotic events", "GI bleeding risk"],
            "isotretinoin": ["Teratogenicity - iPLEDGE program required", "Psychiatric effects"],
            "clozapine": ["Agranulocytosis", "Myocarditis", "Seizure risk"],
            "thalidomide": ["Severe birth defects", "REMS program required"]
        }
    
    def _init_rejections(self) -> Dict[str, List[Dict[str, Any]]]:
        """Initialize regulatory rejection history."""
        return {
            "aducanumab": [{
                "agency": "FDA",
                "date": "2020-11-06",
                "type": "Advisory Committee Rejection",
                "reason": "Insufficient efficacy evidence",
                "outcome": "Accelerated approval 2021 (controversial)"
            }],
            "eteplirsen": [{
                "agency": "FDA",
                "date": "2016-04-25",
                "type": "Complete Response Letter",
                "reason": "Insufficient clinical benefit evidence",
                "outcome": "Accelerated approval after appeal"
            }]
        }
    
    async def analyze(
        self,
        molecule: str,
        indication: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Perform comprehensive regulatory analysis.
        
        Args:
            molecule: Drug/compound name
            indication: Target therapeutic indication
            
        Returns:
            Regulatory compliance assessment
        """
        start_time = datetime.now()
        molecule_lower = molecule.lower()
        
        logger.info(
            "regulatory_analysis_started",
            molecule=molecule,
            indication=indication
        )
        
        # Check FDA Orange Book
        orange_book_data = self._check_orange_book(molecule_lower)
        
        # Check black-box warnings
        safety_warnings = self._check_safety_warnings(molecule_lower)
        
        # Check regulatory history
        rejection_history = self._check_rejection_history(molecule_lower)
        
        # Assess pathway eligibility
        pathway_assessment = self._assess_regulatory_pathway(molecule_lower, orange_book_data)
        
        # Generate compliance score
        compliance_score = self._calculate_compliance_score(
            orange_book_data, safety_warnings, rejection_history
        )
        
        # EMA/International considerations
        international_status = self._check_international_status(molecule_lower)
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        result = {
            "agent": self.name,
            "molecule": molecule,
            "indication": indication,
            "timestamp": datetime.now().isoformat(),
            "processing_time_ms": round(processing_time, 2),
            
            # FDA Orange Book Status
            "fda_orange_book": orange_book_data,
            
            # Safety & Warnings
            "black_box_warnings": safety_warnings["warnings"],
            "warning_count": safety_warnings["count"],
            "safety_risk_level": safety_warnings["risk_level"],
            
            # Regulatory History
            "rejection_history": rejection_history,
            "has_prior_rejections": len(rejection_history) > 0,
            
            # Pathway Assessment
            "recommended_pathway": pathway_assessment["pathway"],
            "pathway_rationale": pathway_assessment["rationale"],
            "estimated_timeline_months": pathway_assessment["timeline"],
            "pathway_complexity": pathway_assessment["complexity"],
            
            # Compliance Scoring
            "compliance_score": compliance_score["score"],
            "compliance_grade": compliance_score["grade"],
            "compliance_flags": compliance_score["flags"],
            
            # International Status
            "international_status": international_status,
            
            # Recommendations
            "recommendations": self._generate_recommendations(
                orange_book_data, safety_warnings, pathway_assessment
            ),
            
            # Summary
            "summary": self._generate_summary(
                molecule, compliance_score, pathway_assessment, safety_warnings
            )
        }
        
        logger.info(
            "regulatory_analysis_completed",
            molecule=molecule,
            compliance_score=compliance_score["score"],
            processing_time_ms=processing_time
        )
        
        return result
    
    def _check_orange_book(self, molecule: str) -> Dict[str, Any]:
        """Check FDA Orange Book for molecule status."""
        if molecule in self.fda_orange_book:
            return {
                "listed": True,
                **self.fda_orange_book[molecule]
            }
        
        # Generate simulated data for unknown molecules
        return {
            "listed": False,
            "potential_rld": None,
            "generic_available": random.choice([True, False]),
            "exclusivity_opportunities": [
                "New indication exclusivity (3 years)",
                "Pediatric exclusivity potential (6 months)",
                "Orphan drug designation possible (7 years)"
            ]
        }
    
    def _check_safety_warnings(self, molecule: str) -> Dict[str, Any]:
        """Check for black-box warnings and safety concerns."""
        warnings = self.black_box_warnings.get(molecule, [])
        
        # Simulate additional safety signals
        if not warnings and random.random() > 0.7:
            warnings = [random.choice([
                "Monitor for hepatotoxicity",
                "QT prolongation risk - ECG monitoring recommended",
                "Drug interaction potential with CYP3A4 substrates"
            ])]
        
        risk_level = "Low"
        if len(warnings) >= 2:
            risk_level = "High"
        elif len(warnings) == 1:
            risk_level = "Moderate"
        
        return {
            "warnings": warnings,
            "count": len(warnings),
            "risk_level": risk_level,
            "rems_required": len(warnings) >= 2
        }
    
    def _check_rejection_history(self, molecule: str) -> List[Dict[str, Any]]:
        """Check for prior regulatory rejections."""
        if molecule in self.regulatory_rejections:
            return self.regulatory_rejections[molecule]
        return []
    
    def _assess_regulatory_pathway(
        self, 
        molecule: str, 
        orange_book_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Assess optimal regulatory pathway."""
        
        if orange_book_data.get("listed"):
            # Existing drug - consider 505(b)(2) or ANDA
            if orange_book_data.get("patent_expiry") == "Expired":
                return {
                    "pathway": "ANDA (505(j))",
                    "rationale": "Reference Listed Drug with expired patents - generic pathway available",
                    "timeline": 24,
                    "complexity": "Low",
                    "estimated_cost": "$2-5M"
                }
            else:
                return {
                    "pathway": "505(b)(2)",
                    "rationale": "Can reference existing safety/efficacy data for new indication",
                    "timeline": 36,
                    "complexity": "Medium",
                    "estimated_cost": "$10-30M"
                }
        else:
            # New molecule considerations
            pathways = [
                {
                    "pathway": "505(b)(1) NDA",
                    "rationale": "Full NDA with complete clinical package required",
                    "timeline": 60,
                    "complexity": "High",
                    "estimated_cost": "$50-100M"
                },
                {
                    "pathway": "505(b)(2) NDA",
                    "rationale": "Hybrid pathway referencing published literature",
                    "timeline": 42,
                    "complexity": "Medium",
                    "estimated_cost": "$15-40M"
                }
            ]
            return random.choice(pathways)
    
    def _calculate_compliance_score(
        self,
        orange_book_data: Dict[str, Any],
        safety_warnings: Dict[str, Any],
        rejection_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate overall regulatory compliance score."""
        score = 100
        flags = []
        
        # Deduct for safety warnings
        warning_count = safety_warnings["count"]
        if warning_count > 0:
            score -= warning_count * 15
            flags.append(f"{warning_count} safety warning(s) identified")
        
        # Deduct for prior rejections
        if rejection_history:
            score -= 20
            flags.append("Prior regulatory rejection on record")
        
        # Bonus for Orange Book listing
        if orange_book_data.get("listed"):
            score += 10
        
        # Determine grade
        if score >= 90:
            grade = "A"
        elif score >= 80:
            grade = "B"
        elif score >= 70:
            grade = "C"
        elif score >= 60:
            grade = "D"
        else:
            grade = "F"
        
        return {
            "score": max(0, min(100, score)),
            "grade": grade,
            "flags": flags
        }
    
    def _check_international_status(self, molecule: str) -> Dict[str, Any]:
        """Check international regulatory status."""
        return {
            "ema_status": random.choice(["Approved", "Under Review", "Not Submitted"]),
            "pmda_japan": random.choice(["Approved", "Under Review", "Not Submitted"]),
            "nmpa_china": random.choice(["Approved", "Under Review", "Not Submitted"]),
            "health_canada": random.choice(["Approved", "Under Review", "Not Submitted"]),
            "tga_australia": random.choice(["Approved", "Under Review", "Not Submitted"]),
            "ich_harmonization": "ICH M4 CTD format recommended for global submissions"
        }
    
    def _generate_recommendations(
        self,
        orange_book_data: Dict[str, Any],
        safety_warnings: Dict[str, Any],
        pathway_assessment: Dict[str, Any]
    ) -> List[str]:
        """Generate regulatory recommendations."""
        recommendations = []
        
        if safety_warnings["count"] > 0:
            recommendations.append(
                "Develop comprehensive Risk Evaluation and Mitigation Strategy (REMS)"
            )
        
        if not orange_book_data.get("listed"):
            recommendations.append(
                "Consider Pre-IND meeting with FDA to align on development strategy"
            )
        
        if pathway_assessment["pathway"] == "505(b)(2)":
            recommendations.append(
                "Conduct thorough literature review to support bridge study design"
            )
        
        recommendations.extend([
            f"Estimated regulatory pathway: {pathway_assessment['pathway']}",
            f"Plan for {pathway_assessment['timeline']}-month approval timeline",
            "Engage regulatory affairs consultant for submission strategy"
        ])
        
        return recommendations
    
    def _generate_summary(
        self,
        molecule: str,
        compliance_score: Dict[str, Any],
        pathway_assessment: Dict[str, Any],
        safety_warnings: Dict[str, Any]
    ) -> str:
        """Generate executive summary."""
        return (
            f"Regulatory assessment for {molecule}: Compliance Grade {compliance_score['grade']} "
            f"(Score: {compliance_score['score']}/100). "
            f"Recommended pathway: {pathway_assessment['pathway']} with estimated "
            f"{pathway_assessment['timeline']}-month timeline. "
            f"Safety profile: {safety_warnings['risk_level']} risk with "
            f"{safety_warnings['count']} identified warning(s)."
        )
