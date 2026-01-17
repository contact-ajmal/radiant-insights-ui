"""
Patient service layer
Handles business logic for patient management
"""
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config.models import Patient, Study
from .schemas import PatientCreate, PatientUpdate


class PatientService:
    """Service for patient operations"""

    @staticmethod
    async def create_patient(db: AsyncSession, patient_data: PatientCreate) -> Patient:
        """Create a new patient"""
        patient = Patient(**patient_data.model_dump())
        db.add(patient)
        await db.commit()
        await db.refresh(patient)
        return patient

    @staticmethod
    async def get_patient(db: AsyncSession, patient_id: str) -> Optional[Patient]:
        """Get patient by ID"""
        result = await db.execute(
            select(Patient)
            .where(Patient.id == patient_id)
            .options(selectinload(Patient.studies))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_patient_by_patient_id(db: AsyncSession, patient_id: str) -> Optional[Patient]:
        """Get patient by patient_id (medical record number)"""
        result = await db.execute(
            select(Patient)
            .where(Patient.patient_id == patient_id)
            .options(selectinload(Patient.studies))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_patients(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None
    ) -> list[Patient]:
        """List patients with pagination and search"""
        query = select(Patient)

        if search:
            search_filter = f"%{search}%"
            query = query.where(
                (Patient.first_name.ilike(search_filter)) |
                (Patient.last_name.ilike(search_filter)) |
                (Patient.patient_id.ilike(search_filter)) |
                (Patient.medical_record_number.ilike(search_filter))
            )

        query = query.offset(skip).limit(limit).order_by(Patient.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_patient(
        db: AsyncSession,
        patient_id: str,
        patient_data: PatientUpdate
    ) -> Optional[Patient]:
        """Update patient information"""
        patient = await PatientService.get_patient(db, patient_id)
        if not patient:
            return None

        update_data = patient_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(patient, field, value)

        await db.commit()
        await db.refresh(patient)
        return patient

    @staticmethod
    async def delete_patient(db: AsyncSession, patient_id: str) -> bool:
        """Delete patient (cascade delete studies)"""
        patient = await PatientService.get_patient(db, patient_id)
        if not patient:
            return False

        await db.delete(patient)
        await db.commit()
        return True

    @staticmethod
    async def get_patient_history(db: AsyncSession, patient_id: str) -> dict:
        """Get patient's imaging history summary"""
        patient = await PatientService.get_patient(db, patient_id)
        if not patient:
            return None

        # Get study statistics
        stats_query = select(
            func.count(Study.id).label("total_studies"),
            func.max(Study.study_date).label("latest_study_date"),
        ).where(Study.patient_id == patient_id)

        stats_result = await db.execute(stats_query)
        stats = stats_result.first()

        # Get unique modalities
        modalities_query = select(Study.modality.distinct()).where(Study.patient_id == patient_id)
        modalities_result = await db.execute(modalities_query)
        modalities = [m[0].value for m in modalities_result.all()]

        return {
            "patient": patient,
            "total_studies": stats.total_studies or 0,
            "latest_study_date": stats.latest_study_date,
            "modalities": modalities
        }
