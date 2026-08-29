import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base, STATIC_DIR
from .routes import records, ocr, dashboard, districts
from .seed_data import seed_database
from .sample_generator import generate_samples

app = FastAPI(
    title="Landmark AI - Land Records Digitization API",
    description="AI-Powered Legacy Land Records Digitization, OCR Parsing, Rule Validation, and Human Verification Platform",
    version="2.4.0",
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for scanned documents and sample templates
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include Routers
app.include_router(records.router)
app.include_router(ocr.router)
app.include_router(dashboard.router)
app.include_router(districts.router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Generate test sample images
    generate_samples()
    # Seed realistic land records
    seed_database()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Landmark AI Backend",
        "version": "2.4.0",
    }

@app.get("/")
def root():
    return {
        "message": "Landmark AI Platform API is running.",
        "docs": "/docs",
    }
