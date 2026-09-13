"""
Production-grade Embedding Provider Abstraction for ForgeAI RAG.
Supports OpenAI embeddings with retry/timeout handling, and a deterministic
mock embedding provider for offline testing and development.
"""

from abc import ABC, abstractmethod
import hashlib
import logging
import math
import time
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger("forgeai.embedding_service")


class EmbeddingError(Exception):
    """Base exception for embedding provider errors."""
    def __init__(self, message: str, provider_name: str = "unknown", details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.provider_name = provider_name
        self.details = details or {}


class EmbeddingConfigurationError(EmbeddingError):
    """Raised when required API credentials or configurations are missing."""
    pass


class EmbeddingAuthenticationError(EmbeddingError):
    """Raised on 401 Unauthorized from embedding API."""
    pass


class EmbeddingRateLimitError(EmbeddingError):
    """Raised on 429 Too Many Requests from embedding API."""
    pass


class EmbeddingTimeoutError(EmbeddingError):
    """Raised on connection or read timeout."""
    pass


class BaseEmbeddingProvider(ABC):
    """Abstract interface for generating vector embeddings from text."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    @abstractmethod
    def dimension(self) -> int:
        pass

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        """Generate an embedding vector for a single string."""
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a list of strings."""
        pass


class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    """
    Real OpenAI text embedding provider using the embeddings endpoint.
    Supports text-embedding-3-small, text-embedding-3-large, text-embedding-ada-002.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        dimension: Optional[int] = None,
        timeout: Optional[float] = None,
        max_retries: Optional[int] = None,
    ):
        self.api_key = api_key or settings.OPENAI_API_KEY
        if not self.api_key:
            raise EmbeddingConfigurationError(
                "OPENAI_API_KEY is required for OpenAI embeddings",
                provider_name="openai",
            )
        self.base_url = (base_url or settings.OPENAI_BASE_URL).rstrip("/")
        self.model = model or settings.EMBEDDING_MODEL or "text-embedding-3-small"
        self._dimension = dimension or settings.EMBEDDING_DIMENSION or 1536
        self.timeout = timeout or settings.EMBEDDING_TIMEOUT_SECONDS or 30.0
        self.max_retries = max_retries or settings.EMBEDDING_MAX_RETRIES or 2

    @property
    def provider_name(self) -> str:
        return "openai"

    @property
    def dimension(self) -> int:
        return self._dimension

    def embed_text(self, text: str) -> List[float]:
        results = self.embed_batch([text])
        if not results:
            raise EmbeddingError("Empty embedding result from OpenAI", provider_name="openai")
        return results[0]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        # Filter empty texts or replace with whitespace to avoid OpenAI rejection
        sanitized = [t if t.strip() else " " for t in texts]

        url = f"{self.base_url}/embeddings"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "input": sanitized,
        }

        last_error: Optional[Exception] = None
        for attempt in range(1, self.max_retries + 2):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(url, headers=headers, json=payload)

                if response.status_code == 401:
                    raise EmbeddingAuthenticationError(
                        "Invalid OpenAI API key for embeddings",
                        provider_name="openai",
                        details={"status_code": 401, "body": response.text},
                    )

                if response.status_code == 429:
                    if attempt <= self.max_retries:
                        sleep_s = 0.5 * (2 ** (attempt - 1))
                        time.sleep(sleep_s)
                        continue
                    raise EmbeddingRateLimitError(
                        "OpenAI embeddings rate limit exceeded",
                        provider_name="openai",
                        details={"status_code": 429, "body": response.text},
                    )

                if response.status_code >= 500:
                    if attempt <= self.max_retries:
                        time.sleep(0.5 * attempt)
                        continue
                    raise EmbeddingError(
                        f"OpenAI server error {response.status_code}",
                        provider_name="openai",
                        details={"status_code": response.status_code, "body": response.text},
                    )

                if response.status_code != 200:
                    raise EmbeddingError(
                        f"OpenAI embeddings returned HTTP {response.status_code}: {response.text}",
                        provider_name="openai",
                        details={"status_code": response.status_code, "body": response.text},
                    )

                body = response.json()
                data_items = body.get("data", [])
                # OpenAI returns items sorted by index
                sorted_items = sorted(data_items, key=lambda x: x.get("index", 0))
                embeddings = [item["embedding"] for item in sorted_items]

                if len(embeddings) != len(texts):
                    raise EmbeddingError(
                        f"Expected {len(texts)} embeddings, got {len(embeddings)}",
                        provider_name="openai",
                    )
                return embeddings

            except httpx.TimeoutException as te:
                last_error = te
                if attempt <= self.max_retries:
                    time.sleep(0.5 * attempt)
                    continue
                raise EmbeddingTimeoutError(
                    f"OpenAI embeddings timed out after {self.timeout}s: {te}",
                    provider_name="openai",
                ) from te
            except (EmbeddingAuthenticationError, EmbeddingRateLimitError):
                raise
            except Exception as e:
                last_error = e
                if attempt <= self.max_retries:
                    time.sleep(0.5 * attempt)
                    continue
                break

        raise EmbeddingError(
            f"Failed to generate OpenAI embeddings after {self.max_retries + 1} attempts: {last_error}",
            provider_name="openai",
        )


class DeterministicMockEmbeddingProvider(BaseEmbeddingProvider):
    """
    Deterministic pseudo-embedding generator for testing and offline development.
    Produces repeatable normalized vectors of fixed dimension using SHA256 of the text.
    """

    def __init__(self, dimension: int = 1536):
        self._dimension = dimension

    @property
    def provider_name(self) -> str:
        return "mock"

    @property
    def dimension(self) -> int:
        return self._dimension

    def _generate_vector(self, text: str) -> List[float]:
        # Generate deterministic floats based on sha256 hashes
        vec: List[float] = []
        seed_bytes = text.encode("utf-8")
        h = hashlib.sha256(seed_bytes).digest()

        for i in range(self._dimension):
            # Roll hash buffer to generate pseudo-random continuous float in [-1.0, 1.0]
            byte_val = h[i % len(h)]
            float_val = ((byte_val ^ ((i * 37) & 0xFF)) / 127.5) - 1.0
            vec.append(float_val)

        # Normalize vector to unit length (L2 norm) for cosine similarity
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    def embed_text(self, text: str) -> List[float]:
        return self._generate_vector(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self._generate_vector(t) for t in texts]


def get_embedding_provider(provider_type: Optional[str] = None) -> BaseEmbeddingProvider:
    """
    Factory to retrieve configured embedding provider.
    - If provider is explicitly 'openai' and key is present -> OpenAIEmbeddingProvider
    - If provider is explicitly 'openai' and key is missing -> raises EmbeddingConfigurationError
    - If provider is 'mock' -> DeterministicMockEmbeddingProvider
    - If provider is 'auto': uses OpenAI if OPENAI_API_KEY is configured, else DeterministicMockEmbeddingProvider
    """
    chosen = (provider_type or settings.EMBEDDING_PROVIDER or "auto").lower()

    if chosen == "openai":
        return OpenAIEmbeddingProvider()

    if chosen == "mock":
        return DeterministicMockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)

    # auto mode
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip():
        return OpenAIEmbeddingProvider()

    return DeterministicMockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)
