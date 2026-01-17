"""
Study Management and DICOM Upload API
"""
import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.models import Study, Series, Image, Patient, StudyStatus
from app.config.settings import get_settings
from app.dicom.processor import DICOMProcessor
from app.storage import get_storage_manager

router = APIRouter(prefix="/api/studies", tags=["studies"])
settings = get_settings()


@router.post("/upload")
async def upload_dicom_study(
    files: List[UploadFile] = File(...),
    patient_id: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload DICOM study files
    Processes DICOM files, extracts metadata, and organizes by series
    """
    storage = get_storage_manager()
    processor = DICOMProcessor()

    # Verify patient exists
    patient = await db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Save uploaded files temporarily
    temp_files = []
    upload_id = str(uuid.uuid4())

    try:
        for file in files:
            # Save to temp directory
            temp_path = os.path.join(settings.temp_upload_dir, upload_id, file.filename)
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)

            with open(temp_path, "wb") as f:
                content = await file.read()
                f.write(content)

            temp_files.append(temp_path)

        # Organize files by series
        series_map = processor.organize_series(temp_files)

        # Process first file to get study metadata
        first_dcm = processor.parse_dicom(temp_files[0])
        study_meta = processor.extract_study_metadata(first_dcm)

        # Create or get study
        study = Study(
            study_instance_uid=study_meta["study_instance_uid"],
            patient_id=patient_id,
            accession_number=study_meta["accession_number"],
            study_date=study_meta["study_date"],
            study_time=study_meta["study_time"],
            study_description=study_meta["study_description"],
            modality=study_meta["modality"],
            referring_physician=study_meta["referring_physician"],
            performing_physician=study_meta["performing_physician"],
            institution_name=study_meta["institution_name"],
            status=StudyStatus.PROCESSING
        )
        db.add(study)
        await db.flush()

        # Process each series
        for series_uid, series_files in series_map.items():
            # Get series metadata from first file
            series_dcm = processor.parse_dicom(series_files[0])
            series_meta = processor.extract_series_metadata(series_dcm)

            # Create series
            series = Series(
                series_instance_uid=series_uid,
                study_id=study.id,
                series_number=series_meta["series_number"],
                series_description=series_meta["series_description"],
                modality=series_meta["modality"],
                body_part_examined=series_meta["body_part_examined"],
                protocol_name=series_meta["protocol_name"],
                image_count=len(series_files)
            )
            db.add(series)
            await db.flush()

            # Process each image in series
            for file_path in series_files:
                dcm = processor.parse_dicom(file_path)
                image_meta = processor.extract_image_metadata(dcm)

                # Save DICOM file to storage
                storage_path = f"studies/{study.id}/series/{series.id}/{os.path.basename(file_path)}"
                with open(file_path, 'rb') as f:
                    await storage.save_file(storage_path, f)

                # Generate thumbnail
                thumbnail_path = f"thumbnails/{study.id}/{series.id}/{image_meta['sop_instance_uid']}.png"
                thumbnail_full_path = os.path.join(settings.temp_upload_dir, thumbnail_path)
                processor.generate_thumbnail(dcm, thumbnail_full_path)

                if os.path.exists(thumbnail_full_path):
                    with open(thumbnail_full_path, 'rb') as f:
                        await storage.save_file(thumbnail_path, f)

                # Create image record
                image = Image(
                    sop_instance_uid=image_meta["sop_instance_uid"],
                    series_id=series.id,
                    instance_number=image_meta["instance_number"],
                    image_position=image_meta["image_position"],
                    image_orientation=image_meta["image_orientation"],
                    slice_location=image_meta["slice_location"],
                    slice_thickness=image_meta["slice_thickness"],
                    pixel_spacing=image_meta["pixel_spacing"],
                    rows=image_meta["rows"],
                    columns=image_meta["columns"],
                    window_center=image_meta["window_center"],
                    window_width=image_meta["window_width"],
                    storage_path=storage_path,
                    thumbnail_path=thumbnail_path,
                    file_size=os.path.getsize(file_path)
                )
                db.add(image)

        # Update study status
        study.status = StudyStatus.COMPLETED
        await db.commit()

        return {
            "study_id": study.id,
            "study_instance_uid": study.study_instance_uid,
            "series_count": len(series_map),
            "total_images": sum(len(files) for files in series_map.values()),
            "status": "completed"
        }

    except Exception as e:
        # Rollback database changes
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    finally:
        # Cleanup temp files
        import shutil
        temp_dir = os.path.join(settings.temp_upload_dir, upload_id)
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)


@router.get("/{study_id}")
async def get_study(study_id: str, db: AsyncSession = Depends(get_db)):
    """Get study details"""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Study)
        .where(Study.id == study_id)
        .options(selectinload(Study.series))
    )
    study = result.scalar_one_or_none()

    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    return study


@router.get("/")
async def list_studies(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all studies"""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Study)
        .options(selectinload(Study.patient))
        .order_by(Study.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    studies = result.scalars().all()
    
    # Enrich with patient name
    response = []
    for study in studies:
        study_dict = {c.name: getattr(study, c.name) for c in study.__table__.columns}
        if study.patient:
            study_dict["patient_name"] = f"{study.patient.first_name} {study.patient.last_name}"
        response.append(study_dict)
        
    return response


@router.get("/patient/{patient_id}")
async def list_patient_studies(patient_id: str, db: AsyncSession = Depends(get_db)):
    """List all studies for a patient"""
    from sqlalchemy import select

    result = await db.execute(
        select(Study)
        .where(Study.patient_id == patient_id)
        .order_by(Study.study_date.desc())
    )
    studies = result.scalars().all()
    return list(studies)
