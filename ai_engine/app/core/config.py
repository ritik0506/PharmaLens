"""
PharmaLens AI Engine Configuration
===================================
Application settings and configuration management.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    
    # Application
    APP_NAME: str = "PharmaLens AI Engine"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Cloud AI - OpenAI GPT-4
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_ENABLED: bool = False
    
    # Cloud AI - Anthropic Claude
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"
    ANTHROPIC_ENABLED: bool = False
    
    # Legacy setting
    CLOUD_ENABLED: bool = True
    
    # Local AI (Llama 3 via Ollama)
    LOCAL_MODEL_PATH: Optional[str] = None
    LOCAL_MODEL_NAME: str = "llama3:8b"
    LOCAL_ENABLED: bool = True
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3:8b"
    
    # Default LLM Provider
    DEFAULT_LLM_PROVIDER: str = "ollama"  # ollama, openai, anthropic
    
    # Node.js Backend
    NODE_BACKEND_URL: str = "http://localhost:3001"
    
    # Neo4j (Knowledge Graph)
    NEO4J_URI: Optional[str] = "bolt://localhost:7687"
    NEO4J_USER: Optional[str] = "neo4j"
    NEO4J_PASSWORD: Optional[str] = None
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
