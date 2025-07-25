"""Application settings and configuration."""

import json
import sys
from typing import Dict, Any
from pathlib import Path


def load_vertex_ai_config() -> Dict[str, Any]:
    """Load Vertex AI configuration from config.json file."""
    config_path = Path(__file__).parent / "vertex_ai_config.json"
    
    try:
        with open(config_path, 'r') as config_file:
            config = json.load(config_file)
            return config
    except FileNotFoundError:
        print(f"Error: {config_path} file not found. Please create it with your Vertex AI configuration.")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in {config_path} file.")
        sys.exit(1)


def validate_vertex_ai_config(config: Dict[str, Any]) -> None:
    """Validate required Vertex AI configuration fields."""
    required_fields = ['project_id', 'location', 'staging_bucket']
    for field in required_fields:
        if field not in config or config[field].startswith('YOUR_'):
            print(f"Error: Please update {field} in vertex_ai_config.json with your actual value.")
            sys.exit(1)


# MCP Server Configuration
MCP_SERVER_URL = "https://idx-fi-mcp-dev-94592976-554022930653.asia-south1.run.app"

# Application Settings
class Settings:
    """Application settings."""
    
    def __init__(self):
        self.vertex_ai_config = load_vertex_ai_config()
        validate_vertex_ai_config(self.vertex_ai_config)
        self.mcp_server_url = MCP_SERVER_URL
    
    @property
    def project_id(self) -> str:
        return self.vertex_ai_config['project_id']
    
    @property
    def location(self) -> str:
        return self.vertex_ai_config['location']
    
    @property
    def staging_bucket(self) -> str:
        return self.vertex_ai_config['staging_bucket']


# Global settings instance
settings = Settings()
