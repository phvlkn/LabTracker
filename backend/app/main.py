from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.database import create_tables
from app.routers import assignments, courses


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    yield


app = FastAPI(
    title=settings.app_name,
    description="API курсов и учебных заданий LabTracker",
    version="0.2.0",
    debug=settings.debug,
    lifespan=lifespan,
)

app.include_router(courses.router, prefix="/api")
app.include_router(assignments.router, prefix="/api")


@app.get("/health", tags=["Служебные"])
def health_check():
    return {"status": "ok"}

