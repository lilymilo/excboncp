"""
ExcbonCP Central Server — Credential Pydantic models.

Defines request / response schemas for per-user AI credential management.
API keys are NEVER included in response models.
"""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field


class Provider(StrEnum):
    """Supported AI / LLM providers."""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    GEMINI = "gemini"
    OPENCODE = "opencode"
    OPENROUTER = "openrouter"
    GROQ = "groq"
    MISTRAL = "mistral"
    CUSTOM = "custom"


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------


class CredentialCreate(BaseModel):
    """Payload for storing a new API credential."""

    provider: Provider
    api_key: str = Field(..., min_length=1, max_length=512)
    display_label: str = Field(..., min_length=1, max_length=64)


class CredentialUpdate(BaseModel):
    """Payload for updating an existing credential."""

    api_key: str | None = Field(None, min_length=1, max_length=512)
    display_label: str | None = Field(None, min_length=1, max_length=64)
    is_active: bool | None = None


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------


class CredentialResponse(BaseModel):
    """Public-facing credential representation — NEVER includes the api_key."""

    id: str
    provider: str
    display_label: str
    is_active: bool
    created_at: str
