"""
Production-grade LLM Provider Abstraction for ForgeAI Agents.
Supports OpenAI, Anthropic (Claude), and Deterministic Mock providers.
Features:
- Environment variable credential loading (Zero hardcoded secrets)
- Connection pooling & async/sync HTTP via httpx
- Configurable model, temperature, max_tokens, timeout
- Exponential backoff retries on rate-limits (429) and server errors (5xx)
- Pydantic structured output validation with automated repair loops
"""

from abc import ABC, abstractmethod
import asyncio
import json
import logging
import os
import time
from typing import Any, Dict, Optional, Type
import httpx
from pydantic import BaseModel, ValidationError

from app.core.config import settings

logger = logging.getLogger("forgeai.llm_provider")


class LLMProviderError(Exception):
    """Base exception for all LLM provider errors."""
    def __init__(self, message: str, provider_name: str = "unknown", details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.provider_name = provider_name
        self.details = details or {}


class LLMConfigurationError(LLMProviderError):
    """Raised when provider credentials or required configuration is missing."""
    pass


class LLMAuthenticationError(LLMProviderError):
    """Raised on 401 Unauthorized from model API."""
    pass


class LLMRateLimitError(LLMProviderError):
    """Raised on 429 Too Many Requests from model API."""
    pass


class LLMTimeoutError(LLMProviderError):
    """Raised on HTTP or gateway timeout."""
    pass


class LLMSchemaValidationError(LLMProviderError):
    """Raised when model response fails Pydantic schema validation after retries."""
    pass


class LLMProvider(ABC):
    """
    Abstract interface that all LLM provider backends must implement.
    """
    provider_name: str = "base"

    @abstractmethod
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> str:
        """Synchronously request completion from the model."""
        pass

    @abstractmethod
    async def agenerate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> str:
        """Asynchronously request completion from the model."""
        pass

    def generate_structured(
        self,
        prompt: str,
        schema: Type[BaseModel],
        system_prompt: Optional[str] = None,
        max_retries: int = 2,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """
        Request structured completion validated against a Pydantic schema.
        Includes automated schema instruction injection and error-repair loops.
        """
        from app.ai.agents.utils import extract_json_payload

        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        instructions = (
            f"\n\nCRITICAL REQUIREMENT: Your output must be a valid JSON object strictly matching this schema:\n"
            f"{schema_json}\n"
            f"Respond ONLY with valid JSON. Do not include markdown explanation."
        )
        current_prompt = prompt + instructions
        last_error = ""

        for attempt in range(max_retries + 1):
            raw_response = self.generate(
                prompt=current_prompt,
                system_prompt=system_prompt,
                schema=schema,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs,
            )

            parsed = extract_json_payload(raw_response)
            if parsed is not None:
                try:
                    validated = schema.model_validate(parsed)
                    return validated.model_dump()
                except ValidationError as ve:
                    last_error = str(ve)
                    logger.warning(
                        f"[{self.provider_name}] Attempt {attempt + 1} schema validation failed: {last_error}"
                    )
            else:
                last_error = "Response did not contain valid JSON dictionary"
                logger.warning(f"[{self.provider_name}] Attempt {attempt + 1} JSON extraction failed.")

            # Append repair prompt for retry attempt
            if attempt < max_retries:
                current_prompt = (
                    f"{prompt}\n\n"
                    f"Your previous response failed validation with error: {last_error}\n"
                    f"Please re-generate strictly adhering to this schema:\n{schema_json}\n"
                    f"Return ONLY valid JSON."
                )

        raise LLMSchemaValidationError(
            message=f"Model output failed schema validation for {schema.__name__} after {max_retries} retries: {last_error}",
            provider_name=self.provider_name,
            details={"schema": schema.__name__, "last_error": last_error},
        )

    async def agenerate_structured(
        self,
        prompt: str,
        schema: Type[BaseModel],
        system_prompt: Optional[str] = None,
        max_retries: int = 2,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """
        Asynchronously request structured completion validated against a Pydantic schema.
        Includes automated schema instruction injection and error-repair loops.
        """
        from app.ai.agents.utils import extract_json_payload

        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        instructions = (
            f"\n\nCRITICAL REQUIREMENT: Your output must be a valid JSON object strictly matching this schema:\n"
            f"{schema_json}\n"
            f"Respond ONLY with valid JSON. Do not include markdown explanation."
        )
        current_prompt = prompt + instructions
        last_error = ""

        for attempt in range(max_retries + 1):
            raw_response = await self.agenerate(
                prompt=current_prompt,
                system_prompt=system_prompt,
                schema=schema,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs,
            )

            parsed = extract_json_payload(raw_response)
            if parsed is not None:
                try:
                    validated = schema.model_validate(parsed)
                    return validated.model_dump()
                except ValidationError as ve:
                    last_error = str(ve)
                    logger.warning(
                        f"[{self.provider_name}] Attempt {attempt + 1} async schema validation failed: {last_error}"
                    )
            else:
                last_error = "Response did not contain valid JSON dictionary"
                logger.warning(f"[{self.provider_name}] Attempt {attempt + 1} async JSON extraction failed.")

            if attempt < max_retries:
                current_prompt = (
                    f"{prompt}\n\n"
                    f"Your previous response failed validation with error: {last_error}\n"
                    f"Please re-generate strictly adhering to this schema:\n{schema_json}\n"
                    f"Return ONLY valid JSON."
                )

        raise LLMSchemaValidationError(
            message=f"Model output failed async schema validation for {schema.__name__} after {max_retries} retries: {last_error}",
            provider_name=self.provider_name,
            details={"schema": schema.__name__, "last_error": last_error},
        )


class OpenAIProvider(LLMProvider):
    """
    OpenAI Chat Completion API Provider.
    """
    provider_name: str = "openai"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout_seconds: Optional[float] = None,
        max_retries: Optional[int] = None,
    ):
        self.api_key = api_key or settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY", "")
        if not self.api_key:
            raise LLMConfigurationError(
                "OpenAI API key is missing. Set OPENAI_API_KEY environment variable or config setting.",
                provider_name=self.provider_name,
            )
        self.model = model or settings.OPENAI_MODEL or "gpt-4o"
        self.base_url = (base_url or settings.OPENAI_BASE_URL).rstrip("/")
        self.timeout = timeout_seconds or settings.LLM_TIMEOUT_SECONDS
        self.max_retries = max_retries if max_retries is not None else settings.LLM_MAX_RETRIES

    def _build_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _build_payload(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature if temperature is not None else settings.LLM_TEMPERATURE,
            "max_tokens": max_tokens or settings.LLM_MAX_TOKENS,
        }
        if schema is not None:
            payload["response_format"] = {"type": "json_object"}
        return payload

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> str:
        payload = self._build_payload(prompt, system_prompt, schema, temperature, max_tokens)
        headers = self._build_headers()
        url = f"{self.base_url}/chat/completions"

        last_exc: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(url, headers=headers, json=payload)
                    if response.status_code == 401:
                        raise LLMAuthenticationError("OpenAI authentication failed: Invalid API Key.", provider_name=self.provider_name)
                    if response.status_code == 429:
                        if attempt < self.max_retries:
                            time.sleep(2 ** attempt)
                            continue
                        raise LLMRateLimitError("OpenAI rate limit exceeded (429).", provider_name=self.provider_name)
                    if response.status_code >= 500:
                        if attempt < self.max_retries:
                            time.sleep(2 ** attempt)
                            continue
                        raise LLMProviderError(f"OpenAI server error: HTTP {response.status_code}", provider_name=self.provider_name)
                    response.raise_for_status()
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
            except httpx.TimeoutException as te:
                last_exc = te
                if attempt < self.max_retries:
                    time.sleep(1)
                    continue
                raise LLMTimeoutError(f"OpenAI request timed out after {self.timeout}s.", provider_name=self.provider_name) from te
            except (LLMProviderError, LLMAuthenticationError, LLMRateLimitError, LLMTimeoutError):
                raise
            except Exception as e:
                last_exc = e
                if attempt < self.max_retries:
                    time.sleep(1)
                    continue
                raise LLMProviderError(f"OpenAI execution failed: {str(e)}", provider_name=self.provider_name) from e

        raise LLMProviderError(f"OpenAI request failed after retries: {str(last_exc)}", provider_name=self.provider_name)

    async def agenerate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> str:
        payload = self._build_payload(prompt, system_prompt, schema, temperature, max_tokens)
        headers = self._build_headers()
        url = f"{self.base_url}/chat/completions"

        last_exc: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(url, headers=headers, json=payload)
                    if response.status_code == 401:
                        raise LLMAuthenticationError("OpenAI authentication failed: Invalid API Key.", provider_name=self.provider_name)
                    if response.status_code == 429:
                        if attempt < self.max_retries:
                            await asyncio.sleep(2 ** attempt)
                            continue
                        raise LLMRateLimitError("OpenAI rate limit exceeded (429).", provider_name=self.provider_name)
                    if response.status_code >= 500:
                        if attempt < self.max_retries:
                            await asyncio.sleep(2 ** attempt)
                            continue
                        raise LLMProviderError(f"OpenAI server error: HTTP {response.status_code}", provider_name=self.provider_name)
                    response.raise_for_status()
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
            except httpx.TimeoutException as te:
                last_exc = te
                if attempt < self.max_retries:
                    await asyncio.sleep(1)
                    continue
                raise LLMTimeoutError(f"OpenAI request timed out after {self.timeout}s.", provider_name=self.provider_name) from te
            except (LLMProviderError, LLMAuthenticationError, LLMRateLimitError, LLMTimeoutError):
                raise
            except Exception as e:
                last_exc = e
                if attempt < self.max_retries:
                    await asyncio.sleep(1)
                    continue
                raise LLMProviderError(f"OpenAI async execution failed: {str(e)}", provider_name=self.provider_name) from e

        raise LLMProviderError(f"OpenAI async request failed after retries: {str(last_exc)}", provider_name=self.provider_name)


class AnthropicProvider(LLMProvider):
    """
    Anthropic Claude Messages API Provider.
    """
    provider_name: str = "anthropic"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout_seconds: Optional[float] = None,
        max_retries: Optional[int] = None,
    ):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY or os.environ.get("ANTHROPIC_API_KEY", "")
        if not self.api_key:
            raise LLMConfigurationError(
                "Anthropic API key is missing. Set ANTHROPIC_API_KEY environment variable or config setting.",
                provider_name=self.provider_name,
            )
        self.model = model or settings.ANTHROPIC_MODEL or "claude-3-5-sonnet-20241022"
        self.base_url = (base_url or settings.ANTHROPIC_BASE_URL).rstrip("/")
        self.timeout = timeout_seconds or settings.LLM_TIMEOUT_SECONDS
        self.max_retries = max_retries if max_retries is not None else settings.LLM_MAX_RETRIES

    def _build_headers(self) -> Dict[str, str]:
        return {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _build_payload(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens or settings.LLM_MAX_TOKENS,
            "temperature": temperature if temperature is not None else settings.LLM_TEMPERATURE,
        }
        if system_prompt:
            payload["system"] = system_prompt
        return payload

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> str:
        payload = self._build_payload(prompt, system_prompt, temperature, max_tokens)
        headers = self._build_headers()
        url = f"{self.base_url}/messages"

        last_exc: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(url, headers=headers, json=payload)
                    if response.status_code == 401:
                        raise LLMAuthenticationError("Anthropic authentication failed: Invalid API Key.", provider_name=self.provider_name)
                    if response.status_code == 429:
                        if attempt < self.max_retries:
                            time.sleep(2 ** attempt)
                            continue
                        raise LLMRateLimitError("Anthropic rate limit exceeded (429).", provider_name=self.provider_name)
                    if response.status_code >= 500:
                        if attempt < self.max_retries:
                            time.sleep(2 ** attempt)
                            continue
                        raise LLMProviderError(f"Anthropic server error: HTTP {response.status_code}", provider_name=self.provider_name)
                    response.raise_for_status()
                    data = response.json()
                    # Extract text content from content blocks
                    content_blocks = data.get("content", [])
                    texts = [b.get("text", "") for b in content_blocks if b.get("type") == "text"]
                    return "".join(texts)
            except httpx.TimeoutException as te:
                last_exc = te
                if attempt < self.max_retries:
                    time.sleep(1)
                    continue
                raise LLMTimeoutError(f"Anthropic request timed out after {self.timeout}s.", provider_name=self.provider_name) from te
            except (LLMProviderError, LLMAuthenticationError, LLMRateLimitError, LLMTimeoutError):
                raise
            except Exception as e:
                last_exc = e
                if attempt < self.max_retries:
                    time.sleep(1)
                    continue
                raise LLMProviderError(f"Anthropic execution failed: {str(e)}", provider_name=self.provider_name) from e

        raise LLMProviderError(f"Anthropic request failed after retries: {str(last_exc)}", provider_name=self.provider_name)

    async def agenerate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> str:
        payload = self._build_payload(prompt, system_prompt, temperature, max_tokens)
        headers = self._build_headers()
        url = f"{self.base_url}/messages"

        last_exc: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(url, headers=headers, json=payload)
                    if response.status_code == 401:
                        raise LLMAuthenticationError("Anthropic authentication failed: Invalid API Key.", provider_name=self.provider_name)
                    if response.status_code == 429:
                        if attempt < self.max_retries:
                            await asyncio.sleep(2 ** attempt)
                            continue
                        raise LLMRateLimitError("Anthropic rate limit exceeded (429).", provider_name=self.provider_name)
                    if response.status_code >= 500:
                        if attempt < self.max_retries:
                            await asyncio.sleep(2 ** attempt)
                            continue
                        raise LLMProviderError(f"Anthropic server error: HTTP {response.status_code}", provider_name=self.provider_name)
                    response.raise_for_status()
                    data = response.json()
                    content_blocks = data.get("content", [])
                    texts = [b.get("text", "") for b in content_blocks if b.get("type") == "text"]
                    return "".join(texts)
            except httpx.TimeoutException as te:
                last_exc = te
                if attempt < self.max_retries:
                    await asyncio.sleep(1)
                    continue
                raise LLMTimeoutError(f"Anthropic request timed out after {self.timeout}s.", provider_name=self.provider_name) from te
            except (LLMProviderError, LLMAuthenticationError, LLMRateLimitError, LLMTimeoutError):
                raise
            except Exception as e:
                last_exc = e
                if attempt < self.max_retries:
                    await asyncio.sleep(1)
                    continue
                raise LLMProviderError(f"Anthropic async execution failed: {str(e)}", provider_name=self.provider_name) from e

        raise LLMProviderError(f"Anthropic async request failed after retries: {str(last_exc)}", provider_name=self.provider_name)


class DeterministicMockProvider(LLMProvider):
    """
    Default deterministic mock provider for testing, sandbox environments, and offline runs.
    Returns deterministic responses without external network dependencies.
    """
    provider_name: str = "mock"

    def __init__(self, canned_responses: Optional[Dict[str, str]] = None):
        self.canned_responses = canned_responses or {}

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> str:
        for key, value in self.canned_responses.items():
            if key in prompt:
                return value
        return f"[DETERMINISTIC_MOCK_OUTPUT] Generated for: {prompt[:80]}"

    def generate_structured(
        self,
        prompt: str,
        schema: Type[BaseModel],
        system_prompt: Optional[str] = None,
        max_retries: int = 2,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> Optional[Dict[str, Any]]:
        from app.ai.agents.utils import extract_json_payload
        for key, value in self.canned_responses.items():
            if key in prompt:
                parsed = extract_json_payload(value)
                if parsed is not None:
                    return schema.model_validate(parsed).model_dump()
        return None

    async def agenerate_structured(
        self,
        prompt: str,
        schema: Type[BaseModel],
        system_prompt: Optional[str] = None,
        max_retries: int = 2,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> Optional[Dict[str, Any]]:
        return self.generate_structured(
            prompt=prompt,
            schema=schema,
            system_prompt=system_prompt,
            max_retries=max_retries,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs,
        )

    async def agenerate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> str:
        return self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            schema=schema,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs,
        )


def create_llm_provider(
    provider_type: Optional[str] = None,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
) -> LLMProvider:
    """
    Factory function to instantiate the configured or requested LLM provider.
    Priority:
    1. Explicit provider_type argument
    2. settings.LLM_PROVIDER
    3. If 'auto': OpenAI if key present, else Anthropic if key present, else DeterministicMockProvider.
    """
    choice = (provider_type or settings.LLM_PROVIDER or "auto").lower().strip()

    if choice == "openai":
        return OpenAIProvider(api_key=api_key, model=model)
    elif choice in ("anthropic", "claude"):
        return AnthropicProvider(api_key=api_key, model=model)
    elif choice in ("mock", "deterministic"):
        return DeterministicMockProvider()
    elif choice == "auto":
        # Check environment variables
        openai_key = api_key or settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY", "")
        if openai_key:
            return OpenAIProvider(api_key=openai_key, model=model)
        anthropic_key = api_key or settings.ANTHROPIC_API_KEY or os.environ.get("ANTHROPIC_API_KEY", "")
        if anthropic_key:
            return AnthropicProvider(api_key=anthropic_key, model=model)
        logger.info("No external LLM credentials configured. Defaulting to DeterministicMockProvider.")
        return DeterministicMockProvider()
    else:
        raise LLMConfigurationError(f"Unsupported LLM provider: '{choice}'. Supported: 'openai', 'anthropic', 'mock', 'auto'")


_GLOBAL_PROVIDER: Optional[LLMProvider] = None


def get_default_provider() -> LLMProvider:
    """Retrieve or initialize the globally configured LLM provider."""
    global _GLOBAL_PROVIDER
    if _GLOBAL_PROVIDER is None:
        _GLOBAL_PROVIDER = create_llm_provider()
    return _GLOBAL_PROVIDER


def set_default_provider(provider: LLMProvider) -> None:
    """Set the globally configured LLM provider."""
    global _GLOBAL_PROVIDER
    _GLOBAL_PROVIDER = provider
