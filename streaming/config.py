"""Configuration classes for streaming behavior."""

from dataclasses import dataclass, field
from typing import Dict, Optional, List


@dataclass
class StreamingConfig:
    """Configuration for streaming behavior."""
    
    # Progress tracking configuration
    progress_stages: Dict[int, str] = field(default_factory=lambda: {
        1: "Initializing",
        2: "Processing",
        3: "Executing",
        4: "Synthesizing",
        5: "Finalizing"
    })
    
    # Enable/disable specific features
    enable_token_streaming: bool = True
    enable_progress_tracking: bool = True
    enable_tool_tracking: bool = True
    
    # Buffer configuration
    buffer_size: int = 50
    buffer_timeout_ms: int = 100
    
    # Event filtering
    excluded_event_types: List[str] = field(default_factory=list)
    
    # Progress calculation mode
    progress_mode: str = "adaptive"  # "adaptive" or "fixed"
    
    # Timeout settings
    event_timeout: float = 30.0
    
    def get_stage_name(self, stage: int) -> str:
        """Get the name for a given stage."""
        return self.progress_stages.get(stage, f"Stage {stage}")
    
    def get_total_stages(self) -> int:
        """Get the total number of stages."""
        return len(self.progress_stages)


@dataclass 
class FinancialAgentStreamingConfig(StreamingConfig):
    """Specialized streaming config for financial agents."""
    
    progress_stages: Dict[int, str] = field(default_factory=lambda: {
        1: "Parsing financial query",
        2: "Analyzing request context", 
        3: "Fetching financial data",
        4: "Processing transactions",
        5: "Calculating insights",
        6: "Generating financial report",
        7: "Finalizing recommendations"
    })


@dataclass
class DefaultStreamingConfig(StreamingConfig):
    """Default streaming configuration."""
    pass
