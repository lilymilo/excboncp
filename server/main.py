"""
ExcbonCP Central Server — Main application entrypoint.

FastAPI application configuring middleware, lifespan lifecycle,
authentication, per-user credential isolation, agent coordination,
task orchestration, and operational monitoring.
"""

from __future__ import annotations

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from server.agents.router import router as agents_router
from server.auth.router import router as auth_router
from server.config import settings
from server.credentials.router import router as credentials_router
from server.database import close_db, init_db
from server.monitoring.router import router as monitoring_router
from server.tasks.router import router as tasks_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("excboncp.server")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifecycle manager: initialize database on startup and close on shutdown."""
    logger.info("Initializing ExcbonCP Central Server...")
    await init_db()
    logger.info("ExcbonCP Central Server startup complete.")
    yield
    logger.info("Shutting down ExcbonCP Central Server...")
    await close_db()
    logger.info("ExcbonCP Central Server shutdown complete.")


app = FastAPI(
    title="ExcbonCP Central AI Engineering Server",
    description=(
        "Centralized, multi-user engineering server for ExcbonCP Decentralized MRV Forest System. "
        "Provides role-based access control, per-user encrypted AI provider credentials, "
        "task orchestration with workspace isolation, and team monitoring."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(credentials_router)
app.include_router(agents_router)
app.include_router(tasks_router)
app.include_router(monitoring_router)


@app.get("/", summary="Root API discovery", tags=["discovery"])
async def root_discovery() -> dict[str, str]:
    """Root endpoint for service discovery and documentation links."""
    return {
        "service": "ExcbonCP Central Engineering Server",
        "version": "0.1.0",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
        "description": "Multi-user AI engineering runtime with credential isolation and task orchestration.",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Safely log and return unexpected server errors without leaking secrets."""
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact the administrator."},
    )
