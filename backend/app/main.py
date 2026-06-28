from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
import os
from dotenv import load_dotenv
from . import models

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Habit Tracker API", version="1.0.0", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Routes
from .routes import auth, habits, logs, stats

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(habits.router, prefix="/api/habits", tags=["habits"])
app.include_router(logs.router, prefix="/api/logs", tags=["logs"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
