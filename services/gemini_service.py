"""Gemini service with support for both Vertex AI and Direct API."""

import os
import sys
from typing import Optional, Union
import logging

# Ensure dotenv is loaded
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("GeminiService: Loaded environment variables from .env file")
except ImportError:
    print("GeminiService: python-dotenv not installed, using environment variables as is")

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google's Gemini models."""
    
    def __init__(
        self,
        project_id: Optional[str] = None,
        location: Optional[str] = None,
        model_name: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        provider: Optional[str] = None,  # 'vertex' or 'direct'
        api_key: Optional[str] = None    # for direct API
    ):
        """Initialize Gemini service with provider selection."""
        
        # Determine provider
        self.provider = provider or os.getenv("GEMINI_PROVIDER", "vertex")
        
        # Common settings
        self.temperature = temperature if temperature is not None else float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
        self.max_tokens = max_tokens if max_tokens is not None else int(os.getenv("GEMINI_MAX_TOKENS", "8192"))
        
        if self.provider == "direct":
            # Direct Gemini API setup
            self.api_key = api_key or os.getenv("GEMINI_API_KEY")
            self.model_name = model_name or os.getenv("GEMINI_MODEL_DIRECT", "gemini-2.5-pro")
            logger.info(f"Using Direct Gemini API with model {self.model_name}")
        else:
            # Vertex AI setup
            self.project_id = project_id or os.getenv("GCP_PROJECT_ID")
            self.location = location or os.getenv("GCP_LOCATION", "us-central1")
            
            # Explicitly log where we're getting the model name from
            env_model = os.getenv("GEMINI_MODEL_VERTEX")
            if env_model:
                self.model_name = model_name or env_model
                logger.info(f"Using model from GEMINI_MODEL_VERTEX env var: {self.model_name}")
            else:
                self.model_name = model_name or "gemini-2.5-pro"
                logger.info(f"GEMINI_MODEL_VERTEX not set, using default model: {self.model_name}")
            
            # Only initialize Vertex AI if project_id is available
            if self.project_id:
                try:
                    from google.cloud import aiplatform
                    aiplatform.init(project=self.project_id, location=self.location)
                    logger.info(f"Initialized Vertex AI with project {self.project_id} in {self.location}")
                except Exception as e:
                    logger.warning(f"Failed to initialize Vertex AI: {e}")
                    logger.warning("Consider setting GEMINI_PROVIDER=direct in your .env file to use Direct API instead")
            else:
                logger.warning("No GCP_PROJECT_ID found. Vertex AI initialization skipped.")
                logger.warning("Consider setting GEMINI_PROVIDER=direct in your .env file to use Direct API instead")
            
            logger.info(f"Using Vertex AI with model {self.model_name}")
        
        # Create the model instance
        self.model = self._create_model()
    
    def _create_model(self) -> Union['ChatVertexAI', 'ChatGoogleGenerativeAI']:
        """Create model based on provider."""
        
        if self.provider == "direct":
            # Use direct Gemini API
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                
                if not self.api_key:
                    logger.error("No GEMINI_API_KEY found for Direct API mode")
                    logger.error("Please set GEMINI_API_KEY in your .env file")
                    raise ValueError("GEMINI_API_KEY is required for Direct API mode")
                
                # Using REST transport to avoid SSL certificate issues
                logger.info(f"Creating Direct API model: {self.model_name}")
                return ChatGoogleGenerativeAI(
                    model=self.model_name,
                    google_api_key=self.api_key,
                    temperature=self.temperature,
                    max_output_tokens=self.max_tokens,
                    convert_system_message_to_human=True,
                    transport="rest",  # Force REST instead of gRPC
                    streaming=True     # Enable streaming
                )
            except Exception as e:
                logger.error(f"Failed to create Direct API model: {e}")
                raise
            
            # Original gRPC implementation (commented out)
            # return ChatGoogleGenerativeAI(
            #     model=self.model_name,
            #     google_api_key=self.api_key,
            #     temperature=self.temperature,
            #     max_output_tokens=self.max_tokens,
            #     convert_system_message_to_human=True
            # )
        else:
            # Use Vertex AI
            try:
                from langchain_google_vertexai import ChatVertexAI
                
                if not self.project_id:
                    logger.error("No GCP_PROJECT_ID found for Vertex AI mode")
                    logger.error("Please set GCP_PROJECT_ID in your .env file or use GEMINI_PROVIDER=direct")
                    raise ValueError("GCP_PROJECT_ID is required for Vertex AI mode")
                
                logger.info(f"Creating Vertex AI model: {self.model_name}")
                return ChatVertexAI(
                    model=self.model_name,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    project=self.project_id,
                    location=self.location,
                    streaming=True,
                    convert_system_message_to_human=True,
                    verbose=False
                )
            except Exception as e:
                logger.error(f"Failed to create Vertex AI model: {e}")
                logger.error("Consider setting GEMINI_PROVIDER=direct in your .env file to use Direct API instead")
                raise
    
    def get_model(self):
        """Get the configured model instance."""
        return self.model
        
    async def agenerate_with_logging(self, prompt: str, **kwargs) -> str:
        """
        Generate text asynchronously with logging.
        
        Args:
            prompt: The prompt to generate from
            **kwargs: Additional parameters for generation
            
        Returns:
            Generated text
        """
        try:
            # Log the request
            logger.info(f"Sending request to Gemini model: {self.model_name}")
            logger.info(f"Prompt preview: {prompt[:100]}...")
            
            # Get the model
            model = self.get_model()
            
            # Generate
            start_time = __import__('time').time()
            response = await model.ainvoke(prompt)
            end_time = __import__('time').time()
            
            # Log the response
            duration = round(end_time - start_time, 2)
            logger.info(f"Received response from Gemini in {duration}s")
            logger.info(f"Response preview: {str(response)[:100]}...")
            
            return response
        except Exception as e:
            logger.error(f"Error generating with Gemini: {str(e)}")
            raise
    
    def create_agent_model(
        self,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ):
        """
        Create a model instance for a specific agent.
        
        Args:
            temperature: Override temperature for this agent
            max_tokens: Override max tokens for this agent
            system_prompt: System prompt to bind to the model
            
        Returns:
            Configured model instance
        """
        if self.provider == "direct":
            from langchain_google_genai import ChatGoogleGenerativeAI
            
            # Using REST transport to avoid SSL certificate issues
            model = ChatGoogleGenerativeAI(
                model=self.model_name,
                google_api_key=self.api_key,
                temperature=temperature or self.temperature,
                max_output_tokens=max_tokens or self.max_tokens,
                convert_system_message_to_human=True,
                transport="rest",  # Force REST instead of gRPC
                streaming=True     # Enable streaming
            )
            
            # Original gRPC implementation (commented out)
            # model = ChatGoogleGenerativeAI(
            #     model=self.model_name,
            #     google_api_key=self.api_key,
            #     temperature=temperature or self.temperature,
            #     max_output_tokens=max_tokens or self.max_tokens,
            #     convert_system_message_to_human=True
            # )
        else:
            from langchain_google_vertexai import ChatVertexAI
            
            model = ChatVertexAI(
                model=self.model_name,
                temperature=temperature or self.temperature,
                max_tokens=max_tokens or self.max_tokens,
                project=self.project_id,
                location=self.location,
                streaming=True,
                convert_system_message_to_human=True,
                verbose=False
            )
        
        # Bind system prompt if provided
        if system_prompt:
            model = model.bind(system=system_prompt)
        
        return model
    
    def update_config(
        self,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ):
        """Update service configuration."""
        if temperature is not None:
            self.temperature = temperature
        if max_tokens is not None:
            self.max_tokens = max_tokens
        
        # Recreate model with new config
        self.model = self._create_model()
        
        logger.info(f"Updated Gemini config: temp={self.temperature}, max_tokens={self.max_tokens}")


def create_gemini_service(
    project_id: Optional[str] = None,
    **kwargs
) -> GeminiService:
    """
    Factory function to create Gemini service.
    
    Args:
        project_id: GCP project ID
        **kwargs: Additional configuration options
        
    Returns:
        Configured GeminiService instance
    """
    return GeminiService(project_id=project_id, **kwargs)
