"""
PharmaLens Privacy Toggle Manager
==================================
Handles switching between Cloud (GPT-4, Claude) and Local (Llama 3) AI models.

This is a core component for the hybrid architecture, enabling:
- HIPAA-compliant local processing for sensitive data
- Cloud processing with OpenAI GPT-4 or Anthropic Claude
- Seamless switching between providers
"""

from typing import Dict, Any, Optional
import structlog

from .config import settings

logger = structlog.get_logger(__name__)


class PrivacyManager:
    """
    Manages AI model selection and configuration.
    
    Supported Providers:
    1. Ollama (Local) - llama3:8b, mistral:7b, gemma3:1b
       - HIPAA/GDPR compliant
       - Data never leaves premises
       - Free, unlimited usage
    
    2. OpenAI GPT-4
       - Highest capability for complex analysis
       - Requires API key and internet
       - Pay per token
    
    3. Anthropic Claude 3.5 Sonnet
       - Advanced reasoning and analysis
       - Requires API key and internet
       - Pay per token
    """
    
    def __init__(self):
        self.openai_enabled = settings.OPENAI_ENABLED and settings.OPENAI_API_KEY is not None
        self.anthropic_enabled = settings.ANTHROPIC_ENABLED and settings.ANTHROPIC_API_KEY is not None
        self.ollama_enabled = settings.LOCAL_ENABLED
        self.default_provider = settings.DEFAULT_LLM_PROVIDER
        
        logger.info(
            "PrivacyManager initialized",
            openai_available=self.openai_enabled,
            anthropic_available=self.anthropic_enabled,
            ollama_available=self.ollama_enabled,
            default_provider=self.default_provider
        )
    
    def get_llm_config(self, mode: str = "auto", provider: Optional[str] = None) -> Dict[str, Any]:
        """
        Get LLM configuration based on mode and provider.
        
        Args:
            mode: 'auto' (detect best), 'secure' (local only), 'cloud' (any cloud provider)
            provider: Specific provider - 'ollama', 'openai', 'anthropic' (overrides mode)
            
        Returns:
            Dictionary containing model configuration
        """
        # If specific provider requested, use it
        if provider:
            if provider == "ollama":
                return self._get_ollama_config()
            elif provider == "openai":
                return self._get_openai_config()
            elif provider == "anthropic":
                return self._get_anthropic_config()
            else:
                logger.warning(f"Unknown provider: {provider}, falling back to auto")
        
        # Auto-detect best available provider
        if mode == "auto":
            # Priority: default_provider > ollama > openai > anthropic
            if self.default_provider == "ollama" and self.ollama_enabled:
                return self._get_ollama_config()
            elif self.default_provider == "openai" and self.openai_enabled:
                return self._get_openai_config()
            elif self.default_provider == "anthropic" and self.anthropic_enabled:
                return self._get_anthropic_config()
            # Fallback priority
            elif self.ollama_enabled:
                logger.info("Auto-detected: Ollama (local)")
                return self._get_ollama_config()
            elif self.openai_enabled:
                logger.info("Auto-detected: OpenAI GPT-4")
                return self._get_openai_config()
            elif self.anthropic_enabled:
                logger.info("Auto-detected: Anthropic Claude")
                return self._get_anthropic_config()
            else:
                logger.error("No LLM provider available!")
                raise ValueError("No LLM provider configured. Please enable Ollama, OpenAI, or Anthropic.")
        
        # Secure mode: force local
        if mode == "secure":
            return self._get_ollama_config()
        
        # Cloud mode: prefer configured cloud provider
        if mode == "cloud":
            if self.default_provider == "openai" and self.openai_enabled:
                return self._get_openai_config()
            elif self.default_provider == "anthropic" and self.anthropic_enabled:
                return self._get_anthropic_config()
            elif self.openai_enabled:
                return self._get_openai_config()
            elif self.anthropic_enabled:
                return self._get_anthropic_config()
            else:
                logger.warning("Cloud mode requested but no cloud provider available, falling back to Ollama")
                return self._get_ollama_config()
        
        # Default fallback
        return self._get_ollama_config()
    
    def _get_openai_config(self) -> Dict[str, Any]:
        """Get OpenAI GPT-4 configuration"""
        if not self.openai_enabled:
            logger.warning("OpenAI requested but not available, falling back to Ollama")
            return self._get_ollama_config()
        
        return {
            "provider": "openai",
            "model": settings.OPENAI_MODEL,
            "api_key": settings.OPENAI_API_KEY,
            "temperature": 0.7,
            "max_tokens": 4096,
            "privacy_level": "cloud",
            "data_residency": "cloud",
            "capabilities": {
                "complex_reasoning": True,
                "multi_modal": True,
                "context_window": 128000
            }
        }
    
    def _get_anthropic_config(self) -> Dict[str, Any]:
        """Get Anthropic Claude configuration"""
        if not self.anthropic_enabled:
            logger.warning("Anthropic requested but not available, falling back to Ollama")
            return self._get_ollama_config()
        
        return {
            "provider": "anthropic",
            "model": settings.ANTHROPIC_MODEL,
            "api_key": settings.ANTHROPIC_API_KEY,
            "temperature": 0.7,
            "max_tokens": 4096,
            "privacy_level": "cloud",
            "data_residency": "cloud",
            "capabilities": {
                "complex_reasoning": True,
                "multi_modal": False,
                "context_window": 200000
            }
        }
    
    def _get_ollama_config(self) -> Dict[str, Any]:
        """Get Ollama (local) configuration"""
        if not self.ollama_enabled:
            logger.error("Ollama requested but not available")
            raise ValueError("Ollama not configured or unavailable")
        
        return {
            "provider": "ollama",
            "model": settings.OLLAMA_MODEL,
            "base_url": settings.OLLAMA_BASE_URL,
            "temperature": 0.7,
            "max_tokens": 2048,
            "privacy_level": "hipaa_compliant",
            "data_residency": "on_premise",
            "capabilities": {
                "complex_reasoning": True,
                "multi_modal": False,
                "context_window": 8192
            }
        }
    
    def validate_mode(self, mode: str) -> bool:
        """
        Validate if the requested mode is available.
        
        Args:
            mode: Processing mode to validate
            
        Returns:
            True if mode is available
        """
        if mode == "secure":
            return self.ollama_enabled
        elif mode == "cloud":
            return self.openai_enabled or self.anthropic_enabled
        elif mode == "auto":
            return True  # Auto always works if at least one provider available
        return False
    
    def get_available_providers(self) -> Dict[str, bool]:
        """Get all available LLM providers"""
        return {
            "ollama": self.ollama_enabled,
            "openai": self.openai_enabled,
            "anthropic": self.anthropic_enabled
        }
    
    def get_available_modes(self) -> Dict[str, bool]:
        """Get all available processing modes"""
        return {
            "auto": True,
            "secure": self.ollama_enabled,
            "cloud": self.openai_enabled or self.anthropic_enabled
        }

