"""
Database Models for RadiantAI
Complete schema for patients, studies, analyses, and reports
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from enum import Enum

from .database import Base


# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    RADIOLOGIST = "radiologist"
    TECHNICIAN = "technician"
    VIEWER = "viewer"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    UNKNOWN = "unknown"


class StudyStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    ARCHIVED = "archived"


class Modality(str, Enum):
    CT = "CT"
    MRI = "MR"
    XR = "XR"
    US = "US"
    OTHER = "OTHER"


class AnalysisStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REVIEWED = "reviewed"


class ReportStatus(str, Enum):
    DRAFT = "draft"
    FINAL = "final"
    AMENDED = "amended"
    ARCHIVED = "archived"


# Helper function for UUID
def generate_uuid():
    return str(uuid.uuid4())


# Models
class User(Base):
    """User accounts with role-based access"""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    audit_logs = relationship("AuditLog", back_populates="user")


class Patient(Base):
    """Patient demographic and clinical information"""
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(100), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    gender = Column(SQLEnum(Gender), default=Gender.UNKNOWN)
    contact_phone = Column(String(50))
    contact_email = Column(String(255))
    address = Column(Text)
    medical_record_number = Column(String(100), index=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    studies = relationship("Study", back_populates="patient", cascade="all, delete-orphan")


class Study(Base):
    """Imaging study container"""
    __tablename__ = "studies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    study_instance_uid = Column(String(255), unique=True, nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    accession_number = Column(String(100), index=True)
    study_date = Column(DateTime, nullable=False)
    study_time = Column(String(50))
    study_description = Column(String(500))
    modality = Column(SQLEnum(Modality), nullable=False)
    referring_physician = Column(String(255))
    performing_physician = Column(String(255))
    institution_name = Column(String(255))
    clinical_indication = Column(Text)
    status = Column(SQLEnum(StudyStatus), default=StudyStatus.PENDING, nullable=False)
    prior_study_id = Column(String(36), ForeignKey("studies.id"), nullable=True)
    extra_metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="studies")
    series = relationship("Series", back_populates="study", cascade="all, delete-orphan")
    volumes = relationship("Volume", back_populates="study", cascade="all, delete-orphan")
    analyses = relationship("MedGemmaAnalysis", back_populates="study", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="study", cascade="all, delete-orphan")
    prior_study = relationship("Study", remote_side=[id], backref="follow_up_studies")


class Series(Base):
    """DICOM series within a study"""
    __tablename__ = "series"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    series_instance_uid = Column(String(255), unique=True, nullable=False, index=True)
    study_id = Column(String(36), ForeignKey("studies.id", ondelete="CASCADE"), nullable=False)
    series_number = Column(Integer)
    series_description = Column(String(500))
    modality = Column(String(10))
    body_part_examined = Column(String(100))
    protocol_name = Column(String(255))
    image_count = Column(Integer, default=0)
    extra_metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    study = relationship("Study", back_populates="series")
    images = relationship("Image", back_populates="series", cascade="all, delete-orphan")


class Image(Base):
    """Individual DICOM image/slice"""
    __tablename__ = "images"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sop_instance_uid = Column(String(255), unique=True, nullable=False, index=True)
    series_id = Column(String(36), ForeignKey("series.id", ondelete="CASCADE"), nullable=False)
    instance_number = Column(Integer)
    image_position = Column(String(100))  # x,y,z coordinates
    image_orientation = Column(String(200))
    slice_location = Column(Float)
    slice_thickness = Column(Float)
    pixel_spacing = Column(String(50))  # row,column spacing
    rows = Column(Integer)
    columns = Column(Integer)
    window_center = Column(Float)
    window_width = Column(Float)
    storage_path = Column(String(500), nullable=False)  # Path to DICOM file
    thumbnail_path = Column(String(500))  # Path to thumbnail
    file_size = Column(Integer)  # bytes
    extra_metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    series = relationship("Series", back_populates="images")


class Volume(Base):
    """3D volume reconstructed from series"""
    __tablename__ = "volumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    study_id = Column(String(36), ForeignKey("studies.id", ondelete="CASCADE"), nullable=False)
    series_id = Column(String(36), ForeignKey("series.id"), nullable=True)
    volume_name = Column(String(255), nullable=False)
    dimensions = Column(String(100))  # x,y,z dimensions
    spacing = Column(String(100))  # voxel spacing
    origin = Column(String(100))  # volume origin
    direction = Column(JSON)  # direction matrix
    storage_path = Column(String(500), nullable=False)  # Path to volume file (nifti/mha)
    volume_stats = Column(JSON)  # min, max, mean, std
    processing_params = Column(JSON)  # resampling, normalization params
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    study = relationship("Study", back_populates="volumes")


class MedGemmaAnalysis(Base):
    """AI analysis results from MedGemma"""
    __tablename__ = "medgemma_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    study_id = Column(String(36), ForeignKey("studies.id", ondelete="CASCADE"), nullable=False)
    analysis_type = Column(String(100), nullable=False)  # e.g., "primary", "comparison", "follow-up"
    prompt = Column(Text, nullable=False)  # Prompt sent to MedGemma
    raw_response = Column(Text, nullable=False)  # Raw model response
    structured_findings = Column(JSON)  # Parsed structured findings
    confidence_score = Column(Float)  # Overall confidence
    processing_time_seconds = Column(Float)
    model_version = Column(String(100))
    status = Column(SQLEnum(AnalysisStatus), default=AnalysisStatus.QUEUED, nullable=False)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)

    # Relationships
    study = relationship("Study", back_populates="analyses")
    findings = relationship("Finding", back_populates="analysis", cascade="all, delete-orphan")
    measurements = relationship("Measurement", back_populates="analysis", cascade="all, delete-orphan")


class Finding(Base):
    """Individual findings identified by MedGemma"""
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("medgemma_analyses.id", ondelete="CASCADE"), nullable=False)
    finding_type = Column(String(100), nullable=False)  # e.g., "nodule", "fracture", "lesion"
    anatomical_location = Column(String(255))
    description = Column(Text, nullable=False)
    severity = Column(String(50))  # e.g., "mild", "moderate", "severe"
    confidence_score = Column(Float)
    coordinates = Column(JSON)  # 3D coordinates if available
    extra_metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    analysis = relationship("MedGemmaAnalysis", back_populates="findings")
    measurements = relationship("Measurement", back_populates="finding", cascade="all, delete-orphan")


class Measurement(Base):
    """Quantitative measurements"""
    __tablename__ = "measurements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("medgemma_analyses.id", ondelete="CASCADE"), nullable=False)
    finding_id = Column(String(36), ForeignKey("findings.id"), nullable=True)
    measurement_type = Column(String(100), nullable=False)  # e.g., "size", "volume", "density"
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)  # e.g., "mm", "cm3", "HU"
    method = Column(String(100))  # How it was measured
    location = Column(String(255))
    comparison_value = Column(Float)  # Value from prior study
    change_percentage = Column(Float)
    extra_metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    analysis = relationship("MedGemmaAnalysis", back_populates="measurements")
    finding = relationship("Finding", back_populates="measurements")


class Report(Base):
    """Generated radiology reports"""
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    study_id = Column(String(36), ForeignKey("studies.id", ondelete="CASCADE"), nullable=False)
    analysis_id = Column(String(36), ForeignKey("medgemma_analyses.id"), nullable=True)
    report_type = Column(String(100), default="radiology")
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.DRAFT, nullable=False)
    version = Column(Integer, default=1, nullable=False)

    # Report Content
    clinical_indication = Column(Text)
    technique = Column(Text)
    findings_narrative = Column(Text, nullable=False)
    impression = Column(Text, nullable=False)
    recommendations = Column(Text)
    comparison_notes = Column(Text)

    # Structured Data
    structured_findings = Column(JSON)
    measurements_table = Column(JSON)

    # Metadata
    ai_generated = Column(Boolean, default=True)
    reviewed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    approved_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    disclaimer = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    reviewed_at = Column(DateTime)
    approved_at = Column(DateTime)

    # Relationships
    study = relationship("Study", back_populates="reports")


class AuditLog(Base):
    """Comprehensive audit trail"""
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # e.g., "create_study", "run_analysis", "export_report"
    resource_type = Column(String(100))  # e.g., "study", "report", "analysis"
    resource_id = Column(String(36))
    details = Column(JSON)
    ip_address = Column(String(50))
    user_agent = Column(String(500))
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


class SyncQueue(Base):
    """Offline sync queue for online mode synchronization"""
    __tablename__ = "sync_queue"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    operation_type = Column(String(50), nullable=False)  # "upload_study", "sync_report", etc.
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(36), nullable=False)
    payload = Column(JSON)
    status = Column(String(50), default="pending")  # pending, syncing, completed, failed
    retry_count = Column(Integer, default=0)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    synced_at = Column(DateTime)
