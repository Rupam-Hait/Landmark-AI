import datetime
import json
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from .database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    file_type = Column(String(50), default="image/jpeg")
    doc_type = Column(String(100), default="Jamabandi / RoR")
    status = Column(String(50), default="PROCESSED")
    raw_ocr_text = Column(Text, nullable=True)
    image_width = Column(Integer, default=1200)
    image_height = Column(Integer, default=1600)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    records = relationship("LandRecord", back_populates="document", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "filepath": self.filepath,
            "file_type": self.file_type,
            "doc_type": self.doc_type,
            "status": self.status,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "raw_ocr_text": self.raw_ocr_text,
            "image_width": self.image_width,
            "image_height": self.image_height,
        }


class LandRecord(Base):
    __tablename__ = "land_records"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    record_identifier = Column(String(64), unique=True, index=True)
    
    owner_name = Column(String(255), nullable=False, index=True)
    parentage = Column(String(255), nullable=True)
    khata_number = Column(String(100), nullable=True, index=True)
    khasra_number = Column(String(100), nullable=False, index=True)
    
    area_value = Column(Float, nullable=False)
    area_unit = Column(String(50), default="Acres")
    area_acres = Column(Float, nullable=False)
    
    village = Column(String(150), nullable=False, index=True)
    tehsil = Column(String(150), nullable=False, index=True)
    district = Column(String(150), nullable=False, index=True)
    state = Column(String(150), default="Rajasthan")
    
    land_classification = Column(String(100), default="Agricultural (Irrigated)")
    document_type = Column(String(100), default="Jamabandi / RoR")
    registration_date = Column(String(50), nullable=True)
    
    overall_confidence = Column(Float, default=90.0)
    field_confidences = Column(Text, default="{}")
    
    status = Column(String(50), default="AUTO_VERIFIED", index=True)  # AUTO_VERIFIED, HUMAN_VERIFIED, PENDING_REVIEW, FLAGGED, REJECTED
    is_flagged = Column(Boolean, default=False)
    flag_reason = Column(Text, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="records")
    validation_issues = relationship("ValidationIssue", back_populates="record", cascade="all, delete-orphan")

    def get_field_confidences(self):
        try:
            return json.loads(self.field_confidences) if self.field_confidences else {}
        except Exception:
            return {}

    def to_dict(self):
        return {
            "id": self.id,
            "document_id": self.document_id,
            "document_filepath": self.document.filepath if self.document else None,
            "record_identifier": self.record_identifier,
            "owner_name": self.owner_name,
            "parentage": self.parentage,
            "khata_number": self.khata_number,
            "khasra_number": self.khasra_number,
            "area_value": self.area_value,
            "area_unit": self.area_unit,
            "area_acres": round(self.area_acres, 3) if self.area_acres is not None else 0.0,
            "village": self.village,
            "tehsil": self.tehsil,
            "district": self.district,
            "state": self.state,
            "land_classification": self.land_classification,
            "document_type": self.document_type,
            "registration_date": self.registration_date,
            "overall_confidence": round(self.overall_confidence, 1) if self.overall_confidence is not None else 0.0,
            "field_confidences": self.get_field_confidences(),
            "status": self.status,
            "is_flagged": self.is_flagged,
            "flag_reason": self.flag_reason,
            "reviewer_notes": self.reviewer_notes,
            "reviewed_by": self.reviewed_by,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "validation_issues": [issue.to_dict() for issue in self.validation_issues],
            "raw_ocr_text": self.document.raw_ocr_text if self.document else "",
        }


class ValidationIssue(Base):
    __tablename__ = "validation_issues"

    id = Column(Integer, primary_key=True, index=True)
    land_record_id = Column(Integer, ForeignKey("land_records.id", ondelete="CASCADE"), nullable=False)
    issue_type = Column(String(64), nullable=False)  # DUPLICATE_SUSPECT, OUT_OF_RANGE_AREA, MISSING_FIELD, LOW_CONFIDENCE, SYNTAX_ERROR
    severity = Column(String(32), default="WARNING") # CRITICAL, WARNING, INFO
    field_name = Column(String(64), nullable=True)
    message = Column(Text, nullable=False)
    details = Column(Text, default="{}")
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    record = relationship("LandRecord", back_populates="validation_issues")

    def get_details(self):
        try:
            return json.loads(self.details) if self.details else {}
        except Exception:
            return {}

    def to_dict(self):
        return {
            "id": self.id,
            "land_record_id": self.land_record_id,
            "issue_type": self.issue_type,
            "severity": self.severity,
            "field_name": self.field_name,
            "message": self.message,
            "details": self.get_details(),
            "is_resolved": self.is_resolved,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    land_record_id = Column(Integer, nullable=True, index=True)
    action = Column(String(64), nullable=False)  # OCR_PARSED, AUTO_ACCEPTED, HUMAN_VERIFIED, HUMAN_EDITED, FLAGGED, REJECTED
    performed_by = Column(String(100), default="SYSTEM_AI")
    changes = Column(Text, default="{}")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "land_record_id": self.land_record_id,
            "action": self.action,
            "performed_by": self.performed_by,
            "changes": json.loads(self.changes) if self.changes else {},
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
