from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_tables
from app.migrations import upgrade_lab2_schema
from app.routers import assignments, auth, courses, users


@asynccontextmanager
async def lifespan(_: FastAPI):
    upgrade_lab2_schema()
    create_tables()
    yield


app = FastAPI(
    title=settings.app_name,
    description="API курсов и учебных заданий LabTracker",
    version="0.2.0",
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(assignments.router, prefix="/api")


@app.get("/health", tags=["Служебные"])
def health_check():
    return {"status": "ok"}
