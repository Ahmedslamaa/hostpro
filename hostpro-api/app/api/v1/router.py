from fastapi import APIRouter
from app.api.v1 import auth, properties, reservations, calendar, tasks, messages, compliance, dashboard, team, uploads

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(properties.router)
api_router.include_router(reservations.router)
api_router.include_router(calendar.router)
api_router.include_router(tasks.router)
api_router.include_router(messages.router)
api_router.include_router(compliance.router)
api_router.include_router(dashboard.router)
api_router.include_router(team.router)
api_router.include_router(uploads.router)
