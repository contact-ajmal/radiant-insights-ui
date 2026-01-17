"""
Pydantic schemas for Patient API
"""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.config.models import Gender


class PatientBase(BaseModel):
    """Base patient schema"""
    patient_id: str = Field(..., description="Unique patient identifier")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date
    gender: Gender = Gender.UNKNOWN
    contact_phone: Optional[str] = Field(None, max_length=50)
    contact_email: Optional[EmailStr] = None
    address: Optional[str] = None
    medical_record_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class PatientCreate(PatientBase):
    """Schema for creating a patient"""
    pass


class PatientUpdate(BaseModel):
    """Schema for updating a patient"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    contact_email: Optional[EmailStr] = None
    address: Optional[str] = None
    medical_record_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class PatientResponse(PatientBase):
    """Schema for patient response"""
    id: str
    created_at: datetime
    updated_at: datetime
    study_count: int = 0

    class Config:
        from_attributes = True


class PatientWithHistory(PatientResponse):
    """Patient with imaging history summary"""
    total_studies: int
    latest_study_date: Optional[datetime]
    modalities: list[str]  # List of modalities used
