"""
Patient API routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from .schemas import PatientCreate, PatientResponse, PatientUpdate, PatientWithHistory
from .service import PatientService

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.post("", response_model=PatientResponse, status_code=201)
async def create_patient(
    patient: PatientCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new patient"""
    # Check if patient_id already exists
    existing = await PatientService.get_patient_by_patient_id(db, patient.patient_id)
    if existing:
        raise HTTPException(status_code=400, detail="Patient ID already exists")

    return await PatientService.create_patient(db, patient)


@router.get("", response_model=List[PatientResponse])
async def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List all patients with pagination and search"""
    return await PatientService.list_patients(db, skip, limit, search)


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific patient by ID"""
    patient = await PatientService.get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.get("/{patient_id}/history", response_model=PatientWithHistory)
async def get_patient_history(
    patient_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get patient with complete imaging history"""
    history = await PatientService.get_patient_history(db, patient_id)
    if not history:
        raise HTTPException(status_code=404, detail="Patient not found")

    return PatientWithHistory(
        **history["patient"].__dict__,
        total_studies=history["total_studies"],
        latest_study_date=history["latest_study_date"],
        modalities=history["modalities"]
    )


@router.patch("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    patient_update: PatientUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update patient information"""
    patient = await PatientService.update_patient(db, patient_id, patient_update)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.delete("/{patient_id}", status_code=204)
async def delete_patient(
    patient_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a patient and all associated studies"""
    success = await PatientService.delete_patient(db, patient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Patient not found")
