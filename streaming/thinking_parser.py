"""Parse structured thinking from LLM token stream."""

import re
from typing import Optional, Dict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ThinkingStreamParser:
    """Parse structured thinking from LLM token stream."""
    
    def __init__(self):
        self.buffer = ""
        self.sections_found = []
        
    def parse_token(self, token: str) -> Optional[Dict]:
        """Parse token and return structured event if section is complete."""
        self.buffer += token
        
        # Look for complete sections with better patterns
        patterns = {
            "thinking": r"🤔 \*\*Thinking\*\*:\s*(.*?)(?=🔍 \*\*Action\*\*|\📊 \*\*Analysis\*\*|💡 \*\*Insight\*\*|$)",
            "action": r"🔍 \*\*Action\*\*:\s*(.*?)(?=🤔 \*\*Thinking\*\*|\📊 \*\*Analysis\*\*|💡 \*\*Insight\*\*|$)", 
            "analysis": r"📊 \*\*Analysis\*\*:\s*(.*?)(?=🤔 \*\*Thinking\*\*|🔍 \*\*Action\*\*|💡 \*\*Insight\*\*|$)",
            "insight": r"💡 \*\*Insight\*\*:\s*(.*?)(?=🤔 \*\*Thinking\*\*|🔍 \*\*Action\*\*|📊 \*\*Analysis\*\*|$)"
        }
        
        for section_type, pattern in patterns.items():
            matches = re.findall(pattern, self.buffer, re.DOTALL | re.IGNORECASE)
            if matches and section_type not in self.sections_found:
                self.sections_found.append(section_type)
                content = matches[-1].strip()
                
                # Only emit if we have substantial content AND it looks complete
                if len(content) > 20 and not content.endswith('...') and '\n' in content:
                    logger.info(f"Parsed {section_type} section: {content[:100]}...")
                    return {
                        "type": f"ai_{section_type}",
                        "content": content,
                        "timestamp": datetime.utcnow().isoformat(),
                        "metadata": {
                            "section": section_type,
                            "emoji": {"thinking": "🤔", "action": "🔍", "analysis": "📊", "insight": "💡"}[section_type]
                        }
                    }
        
        return None
    
    def reset(self):
        """Reset parser for new query."""
        self.buffer = ""
        self.sections_found = []
        logger.info("Parser reset for new query")
