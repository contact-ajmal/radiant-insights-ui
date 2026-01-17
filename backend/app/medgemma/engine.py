"""
MedGemma Inference Engine
Supports both local (offline) and API-based (online) inference
"""
import json
import time
from typing import Dict, List, Optional
from abc import ABC, abstractmethod

import httpx
from app.config.settings import get_settings


class MedGemmaBase(ABC):
    """Abstract base class for MedGemma inference"""

    @abstractmethod
    async def generate(self, prompt: str, max_tokens: int = 2048, temperature: float = 0.3) -> str:
        """Generate response from MedGemma"""
        pass

    @abstractmethod
    def get_model_info(self) -> Dict:
        """Get model information"""
        pass


class LocalMedGemma(MedGemmaBase):
    """Local MedGemma inference using transformers"""

    def __init__(self, model_path: str, device: str = "cuda", quantization: str = "4bit"):
        """
        Initialize local MedGemma model

        Args:
            model_path: Path to local model files
            device: Device to use (cuda/cpu)
            quantization: Quantization level (4bit/8bit/none)
        """
        self.model_path = model_path
        self.device = device
        self.quantization = quantization
        self.model = None
        self.tokenizer = None
        self._load_model()

    def _load_model(self):
        """Load model and tokenizer"""
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
            import torch

            print(f"Loading MedGemma from {self.model_path}...")

            # Configure quantization
            quantization_config = None
            if self.quantization == "4bit":
                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_use_double_quant=True,
                    bnb_4bit_quant_type="nf4"
                )
            elif self.quantization == "8bit":
                quantization_config = BitsAndBytesConfig(load_in_8bit=True)

            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_path,
                trust_remote_code=True
            )

            # Load model
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                quantization_config=quantization_config,
                device_map="auto" if self.device == "cuda" else None,
                trust_remote_code=True,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            )

            print("MedGemma loaded successfully")

        except Exception as e:
            print(f"Error loading MedGemma: {e}")
            raise

    async def generate(self, prompt: str, max_tokens: int = 2048, temperature: float = 0.3) -> str:
        """Generate response from local model"""
        import torch

        # Tokenize input
        inputs = self.tokenizer(prompt, return_tensors="pt")

        if self.device == "cuda":
            inputs = inputs.to("cuda")

        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                top_p=0.9,
                repetition_penalty=1.1,
            )

        # Decode response
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Remove the prompt from response
        if response.startswith(prompt):
            response = response[len(prompt):].strip()

        return response

    def get_model_info(self) -> Dict:
        """Get model information"""
        return {
            "type": "local",
            "model_path": self.model_path,
            "device": self.device,
            "quantization": self.quantization,
            "model_name": "MedGemma-1.5"
        }


class APIMedGemma(MedGemmaBase):
    """Remote MedGemma inference via API"""

    def __init__(self, endpoint: str, api_key: str):
        """
        Initialize API-based MedGemma

        Args:
            endpoint: API endpoint URL
            api_key: API authentication key
        """
        self.endpoint = endpoint
        self.api_key = api_key
        self.client = httpx.AsyncClient(timeout=300.0)  # 5 minute timeout

    async def generate(self, prompt: str, max_tokens: int = 2048, temperature: float = 0.3) -> str:
        """Generate response from API"""
        try:
            response = await self.client.post(
                self.endpoint,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "prompt": prompt,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "model": "medgemma-1.5",
                }
            )

            response.raise_for_status()
            data = response.json()

            return data.get("response", data.get("text", ""))

        except httpx.HTTPError as e:
            raise Exception(f"MedGemma API error: {str(e)}")

    def get_model_info(self) -> Dict:
        """Get model information"""
        return {
            "type": "api",
            "endpoint": self.endpoint,
            "model_name": "MedGemma-1.5"
        }

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


class MedGemmaEngine:
    """
    Main MedGemma engine that handles both local and API modes
    Automatically switches based on configuration
    """

    def __init__(self):
        """Initialize MedGemma engine based on settings"""
        self.settings = get_settings()
        self.engine: Optional[MedGemmaBase] = None
        self._initialize_engine()

    def _initialize_engine(self):
        """Initialize appropriate engine based on mode"""
        import os
        config = self.settings.medgemma_config

        if config["type"] == "local":
            # Check if model files exist, otherwise use mock
            model_path = config["model_path"]
            if not os.path.exists(model_path):
                print(f"⚠️  Model path {model_path} not found. Using Mock MedGemma for development...")
                from .mock_engine import MockMedGemma
                self.engine = MockMedGemma()
            else:
                print("Initializing local MedGemma engine...")
                self.engine = LocalMedGemma(
                    model_path=config["model_path"],
                    device=config["device"],
                    quantization=config["quantization"]
                )
        elif config["type"] == "api":
            print("Initializing API MedGemma engine...")
            self.engine = APIMedGemma(
                endpoint=config["endpoint"],
                api_key=config["api_key"]
            )
        else:
            raise ValueError(f"Unknown MedGemma type: {config['type']}")

    async def analyze(
        self,
        prompt: str,
        max_tokens: int = 2048,
        temperature: float = 0.3,
    ) -> Dict:
        """
        Perform analysis using MedGemma

        Returns:
            Dict with response, metadata, and timing
        """
        start_time = time.time()

        try:
            response = await self.engine.generate(prompt, max_tokens, temperature)

            processing_time = time.time() - start_time

            return {
                "response": response,
                "prompt": prompt,
                "processing_time": processing_time,
                "model_info": self.engine.get_model_info(),
                "status": "success"
            }

        except Exception as e:
            processing_time = time.time() - start_time
            return {
                "response": "",
                "prompt": prompt,
                "processing_time": processing_time,
                "model_info": self.engine.get_model_info(),
                "status": "error",
                "error": str(e)
            }

    def get_info(self) -> Dict:
        """Get engine information"""
        return {
            "mode": self.settings.mode,
            **self.engine.get_model_info()
        }

    async def close(self):
        """Cleanup resources"""
        if isinstance(self.engine, APIMedGemma):
            await self.engine.close()


# Global engine instance
_engine: Optional[MedGemmaEngine] = None


def get_medgemma_engine() -> MedGemmaEngine:
    """Get or create global MedGemma engine instance"""
    global _engine
    if _engine is None:
        _engine = MedGemmaEngine()
    return _engine
