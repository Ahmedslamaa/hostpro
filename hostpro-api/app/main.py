from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import asyncio
import logging

from app.core.config import settings
from app.api.v1.router import api_router

logger = logging.getLogger("hostpro")

app = FastAPI(
    title="HOST PRO API",
    description="PMS SaaS premium pour la gestion locative saisonnière",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = str(round(time.time() - start, 4))
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(status_code=500, content={"detail": str(exc), "trace": traceback.format_exc()})


app.include_router(api_router)


# ── iCal Auto-sync scheduler ──────────────────────────────────

_sync_task: asyncio.Task | None = None


@app.on_event("startup")
async def startup():
    global _sync_task
    logger.info("HOST PRO API démarré ✓")
    # Lancer le scheduler iCal en arrière-plan
    from app.services.ical_sync import auto_sync_loop
    _sync_task = asyncio.create_task(auto_sync_loop())
    logger.info("iCal scheduler démarré — sync automatique toutes les 15 min ✓")


@app.on_event("shutdown")
async def shutdown():
    global _sync_task
    if _sync_task and not _sync_task.done():
        _sync_task.cancel()
        try:
            await _sync_task
        except asyncio.CancelledError:
            pass
    logger.info("HOST PRO API arrêté.")


# ── Health & Root ─────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": "1.0.0"}


@app.get("/")
async def root():
    return {"message": f"Bienvenue sur {settings.APP_NAME} API", "docs": "/docs"}
