"""Application settings and configuration."""

import os
import sys
import logging
from typing import Dict, Any

# Ensure dotenv is loaded
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("Loaded environment variables from .env file")
except ImportError:
    print("python-dotenv not installed, using environment variables as is")

logger = logging.getLogger(__name__)

# Application Settings
class Settings:
    """Application settings."""
    
    def __init__(self):
        # Load configuration from environment variables
        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.location = os.getenv("GCP_LOCATION", "us-central1")
        self.staging_bucket = os.getenv("GCP_STAGING_BUCKET", "gs://agentic_ai_hackathon")
        self.mcp_server_url = os.getenv("FI_MCP_BASE_URL", "https://idx-fi-mcp-dev-94592976-554022930653.asia-south1.run.app")
        
        # Log the configuration
        self._log_config()
        
        # Validate required configuration
        self._validate_config()
    
    def _log_config(self) -> None:
        """Log the current configuration."""
        print(f"Configuration:")
        print(f"  - Provider: {os.getenv('GEMINI_PROVIDER', 'vertex')}")
        print(f"  - Project ID: {self.project_id}")
        print(f"  - Location: {self.location}")
        print(f"  - Staging Bucket: {self.staging_bucket}")
        print(f"  - MCP Server URL: {self.mcp_server_url}")
        print(f"  - Model: {os.getenv('GEMINI_MODEL_VERTEX', 'gemini-2.5-pro')}")
    
    def _validate_config(self) -> None:
        """Validate required configuration fields."""
        # Check if we're using direct API or Vertex AI
        provider = os.getenv("GEMINI_PROVIDER", "vertex")
        
        # Only require project_id for Vertex AI
        if provider == "vertex" and not self.project_id:
            print("Error: GCP_PROJECT_ID environment variable is not set.")
            print("Please set it in your .env file or environment.")
            sys.exit(1)


# Global settings instance
settings = Settings()
