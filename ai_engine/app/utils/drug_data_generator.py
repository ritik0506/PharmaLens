"""
Drug-Specific Data Generator
=============================
Generates consistent, drug-specific mock data based on drug name.
Uses hashing to ensure same drug always gets same data.
"""

import hashlib
from typing import Dict, Any, List


def get_drug_seed(molecule: str) -> int:
    """Generate consistent seed from drug name."""
    return int(hashlib.md5(molecule.lower().encode()).hexdigest()[:8], 16)


def get_drug_specific_value(molecule: str, min_val: float, max_val: float, offset: int = 0) -> float:
    """Get consistent value in range for a drug."""
    seed = get_drug_seed(molecule) + offset
    # Normalize to 0-1 range
    normalized = (seed % 1000000) / 1000000
    # Scale to desired range
    return min_val + (normalized * (max_val - min_val))


def get_drug_choice(molecule: str, choices: List[str], offset: int = 0) -> str:
    """Get consistent choice from list for a drug."""
    seed = get_drug_seed(molecule) + offset
    return choices[seed % len(choices)]


class DrugDataGenerator:
    """Generate drug-specific mock data."""
    
    # Drug database with real-world information
    DRUG_DATABASE = {
        "aspirin": {
            "primary_use": "pain relief and anti-inflammatory",
            "market_size": 2.5,  # billions
            "patent_status": "expired",
            "safety_profile": "well-established",
            "typical_indications": ["Pain management", "Cardiovascular protection", "Anti-inflammatory"],
            "development_stage": "marketed",
            "competitor_count": "high"
        },
        "ibuprofen": {
            "primary_use": "pain relief and fever reduction",
            "market_size": 3.2,
            "patent_status": "expired",
            "safety_profile": "well-established",
            "typical_indications": ["Pain relief", "Fever reduction", "Inflammation"],
            "development_stage": "marketed",
            "competitor_count": "high"
        },
        "humira": {
            "primary_use": "autoimmune disease treatment",
            "market_size": 20.0,
            "patent_status": "active",
            "safety_profile": "requires monitoring",
            "typical_indications": ["Rheumatoid arthritis", "Crohn's disease", "Psoriasis"],
            "development_stage": "marketed",
            "competitor_count": "medium"
        },
        "metformin": {
            "primary_use": "type 2 diabetes management",
            "market_size": 4.5,
            "patent_status": "expired",
            "safety_profile": "well-established",
            "typical_indications": ["Type 2 diabetes", "Metabolic syndrome", "PCOS"],
            "development_stage": "marketed",
            "competitor_count": "high"
        },
        "lipitor": {
            "primary_use": "cholesterol reduction",
            "market_size": 15.0,
            "patent_status": "expired",
            "safety_profile": "well-established",
            "typical_indications": ["High cholesterol", "Cardiovascular disease prevention"],
            "development_stage": "marketed",
            "competitor_count": "high"
        }
    }
    
    @staticmethod
    def get_drug_info(molecule: str) -> Dict[str, Any]:
        """Get drug-specific information."""
        drug_key = molecule.lower().strip()
        
        # Return known drug data if available
        if drug_key in DrugDataGenerator.DRUG_DATABASE:
            return DrugDataGenerator.DRUG_DATABASE[drug_key]
        
        # Generate consistent mock data for unknown drugs
        seed_val = get_drug_seed(molecule)
        
        return {
            "primary_use": "therapeutic application",
            "market_size": get_drug_specific_value(molecule, 1.0, 15.0),
            "patent_status": get_drug_choice(molecule, ["active", "expired", "pending"]),
            "safety_profile": get_drug_choice(molecule, ["well-established", "requires monitoring", "under evaluation"]),
            "typical_indications": [f"Indication {i+1}" for i in range(int(get_drug_specific_value(molecule, 2, 5)))],
            "development_stage": get_drug_choice(molecule, ["preclinical", "phase1", "phase2", "phase3", "marketed"]),
            "competitor_count": get_drug_choice(molecule, ["low", "medium", "high"])
        }
    
    @staticmethod
    def get_clinical_data(molecule: str) -> Dict[str, Any]:
        """Generate drug-specific clinical data."""
        info = DrugDataGenerator.get_drug_info(molecule)
        seed = get_drug_seed(molecule)
        
        # Base trial count on drug maturity
        base_trials = {
            "marketed": (30, 80),
            "phase3": (15, 40),
            "phase2": (8, 25),
            "phase1": (3, 12),
            "preclinical": (1, 5)
        }
        
        stage = info.get("development_stage", "phase2")
        trial_range = base_trials.get(stage, (10, 30))
        total_trials = int(get_drug_specific_value(molecule, trial_range[0], trial_range[1]))
        
        return {
            "total_trials": total_trials,
            "active_trials": int(get_drug_specific_value(molecule, 2, min(15, total_trials//3), offset=1)),
            "phase_distribution": {
                "phase_1": int(get_drug_specific_value(molecule, 3, max(10, total_trials//4), offset=2)),
                "phase_2": int(get_drug_specific_value(molecule, 5, max(15, total_trials//3), offset=3)),
                "phase_3": int(get_drug_specific_value(molecule, 2, max(8, total_trials//5), offset=4)),
                "phase_4": int(get_drug_specific_value(molecule, 1, max(5, total_trials//8), offset=5))
            },
            "indications": info["typical_indications"],
            "safety_score": round(get_drug_specific_value(molecule, 7.0, 9.5, offset=6), 1),
            "efficacy_rating": get_drug_choice(molecule, ["High", "Moderate-High", "Moderate"], offset=7)
        }
    
    @staticmethod
    def get_market_data(molecule: str) -> Dict[str, Any]:
        """Generate drug-specific market data."""
        info = DrugDataGenerator.get_drug_info(molecule)
        
        # Base revenue on known market size
        market_size = info.get("market_size", 5.0)
        base_revenue = market_size * 50  # Convert billions to millions for revenue
        
        projected_revenue = int(get_drug_specific_value(molecule, base_revenue * 0.7, base_revenue * 1.3))
        development_cost = int(get_drug_specific_value(molecule, 40, 120, offset=1))
        
        return {
            "projected_revenue_millions": projected_revenue,
            "development_cost_millions": development_cost,
            "roi_percentage": round(((projected_revenue - development_cost) / development_cost) * 100, 1),
            "market_size_billions": round(market_size, 1),
            "market_cagr_percent": round(get_drug_specific_value(molecule, 4, 12, offset=2), 1),
            "time_to_market_years": round(get_drug_specific_value(molecule, 2, 5, offset=3), 1),
            "probability_of_success": int(get_drug_specific_value(molecule, 50, 85, offset=4)),
            "patent_status": info.get("patent_status", "unknown"),
            "competitive_landscape": info.get("competitor_count", "medium").capitalize()
        }
    
    @staticmethod
    def get_patent_data(molecule: str) -> Dict[str, Any]:
        """Generate drug-specific patent data."""
        info = DrugDataGenerator.get_drug_info(molecule)
        patent_status = info.get("patent_status", "unknown")
        
        # Active patents have more protection
        if patent_status == "active":
            active_patents = int(get_drug_specific_value(molecule, 8, 25))
            fto_risk = "Low"
        elif patent_status == "expired":
            active_patents = int(get_drug_specific_value(molecule, 0, 3))
            fto_risk = "Very Low"
        else:
            active_patents = int(get_drug_specific_value(molecule, 3, 15))
            fto_risk = "Medium"
        
        return {
            "active_patents": active_patents,
            "expired_patents": int(get_drug_specific_value(molecule, 5, 30, offset=1)),
            "patent_families": int(get_drug_specific_value(molecule, 2, 10, offset=2)),
            "fto_risk_level": fto_risk,
            "key_patent_holders": DrugDataGenerator._get_patent_holders(molecule),
            "patent_cliff_years": round(get_drug_specific_value(molecule, 2, 8, offset=3), 1) if patent_status == "active" else 0
        }
    
    @staticmethod
    def _get_patent_holders(molecule: str) -> List[str]:
        """Get consistent patent holders for drug."""
        pharma_companies = [
            "Pfizer", "Novartis", "Roche", "Johnson & Johnson",
            "Merck", "AstraZeneca", "GSK", "Sanofi", "Bristol Myers Squibb",
            "AbbVie", "Eli Lilly", "Amgen", "Gilead Sciences"
        ]
        
        seed = get_drug_seed(molecule)
        count = min(3, (seed % 3) + 1)
        
        selected = []
        for i in range(count):
            idx = (seed + i * 7) % len(pharma_companies)
            selected.append(pharma_companies[idx])
        
        return selected
    
    @staticmethod
    def get_vision_data(molecule: str) -> Dict[str, Any]:
        """Generate drug-specific molecular structure data."""
        return {
            "molecular_weight": round(get_drug_specific_value(molecule, 200, 800), 2),
            "binding_sites_identified": int(get_drug_specific_value(molecule, 2, 6, offset=1)),
            "binding_affinity_score": round(get_drug_specific_value(molecule, 6.5, 9.8, offset=2), 2),
            "logP": round(get_drug_specific_value(molecule, -1, 5, offset=3), 2),
            "pKa": round(get_drug_specific_value(molecule, 3, 11, offset=4), 2),
            "hbd": int(get_drug_specific_value(molecule, 0, 5, offset=5)),
            "hba": int(get_drug_specific_value(molecule, 1, 10, offset=6)),
            "rotatable_bonds": int(get_drug_specific_value(molecule, 1, 12, offset=7)),
            "tpsa": round(get_drug_specific_value(molecule, 20, 140, offset=8), 1),
            "lipinski_violations": int(get_drug_specific_value(molecule, 0, 2, offset=9)),
            "druglikeness_score": round(get_drug_specific_value(molecule, 0.6, 0.95, offset=10), 2),
            "bioavailability_score": round(get_drug_specific_value(molecule, 0.5, 0.9, offset=11), 2)
        }
    
    @staticmethod
    def get_iqvia_data(molecule: str) -> Dict[str, Any]:
        """Generate drug-specific market intelligence data."""
        info = DrugDataGenerator.get_drug_info(molecule)
        market_size = info.get("market_size", 5.0)
        
        return {
            "global_market_size_usd_bn": round(market_size, 1),
            "five_year_cagr": round(get_drug_specific_value(molecule, 4, 15, offset=1), 1),
            "market_share_percent": round(get_drug_specific_value(molecule, 5, 25, offset=2), 1),
            "sales_trend": get_drug_choice(molecule, ["Growing", "Stable", "Declining"], offset=1),
            "peak_sales_year": int(get_drug_specific_value(molecule, 2020, 2030, offset=3)),
            "current_sales_usd_m": int(get_drug_specific_value(molecule, market_size * 50, market_size * 200, offset=4))
        }
