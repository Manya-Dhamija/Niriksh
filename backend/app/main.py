import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import analyze, sites

load_dotenv()

app = FastAPI(
    title="Niriksh API",
    description="Planetary intelligence for renewable project pre-feasibility — V1: utility-scale solar, India.",
    version="0.1.0",
)

origins = os.getenv("NIRIKSH_CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sites.router)
app.include_router(analyze.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "niriksh-api", "version": "0.1.0"}
