import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "land_records.db")
STATIC_DIR = os.path.join(BASE_DIR, "static")
DOCUMENTS_DIR = os.path.join(STATIC_DIR, "documents")
SAMPLES_DIR = os.path.join(STATIC_DIR, "samples")

os.makedirs(DOCUMENTS_DIR, exist_ok=True)
os.makedirs(SAMPLES_DIR, exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
