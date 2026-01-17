"""
Report Export API - PDF, JSON, DICOM-SR
"""
import json
from datetime import datetime
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet

from app.config.database import get_db
from app.config.models import Report, Study, Patient

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/report/{report_id}/pdf")
async def export_report_pdf(report_id: str, db: AsyncSession = Depends(get_db)):
    """Export report as PDF"""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Report)
        .where(Report.id == report_id)
        .options(selectinload(Report.study).selectinload(Study.patient))
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Generate PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Header
    story.append(Paragraph("<b>RADIOLOGY REPORT</b>", styles['Title']))
    story.append(Spacer(1, 12))

    # Patient Info
    patient = report.study.patient
    story.append(Paragraph(f"<b>Patient:</b> {patient.first_name} {patient.last_name}", styles['Normal']))
    story.append(Paragraph(f"<b>Patient ID:</b> {patient.patient_id}", styles['Normal']))
    story.append(Paragraph(f"<b>DOB:</b> {patient.date_of_birth.strftime('%Y-%m-%d')}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Study Info
    study = report.study
    story.append(Paragraph(f"<b>Study Date:</b> {study.study_date.strftime('%Y-%m-%d')}", styles['Normal']))
    story.append(Paragraph(f"<b>Modality:</b> {study.modality.value}", styles['Normal']))
    story.append(Paragraph(f"<b>Study Description:</b> {study.study_description}", styles['Normal']))
    story.append(Paragraph(f"<b>Accession Number:</b> {study.accession_number}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Clinical Indication
    story.append(Paragraph("<b>CLINICAL INDICATION:</b>", styles['Heading2']))
    story.append(Paragraph(report.clinical_indication or "Not specified", styles['Normal']))
    story.append(Spacer(1, 12))

    # Technique
    story.append(Paragraph("<b>TECHNIQUE:</b>", styles['Heading2']))
    story.append(Paragraph(report.technique or "Standard protocol", styles['Normal']))
    story.append(Spacer(1, 12))

    # Findings
    story.append(Paragraph("<b>FINDINGS:</b>", styles['Heading2']))
    story.append(Paragraph(report.findings_narrative, styles['Normal']))
    story.append(Spacer(1, 12))

    # Measurements table if available
    if report.measurements_table and report.measurements_table.get('measurements'):
        story.append(Paragraph("<b>MEASUREMENTS:</b>", styles['Heading2']))

        table_data = [["Finding", "Type", "Value", "Unit", "Location"]]
        for m in report.measurements_table['measurements']:
            table_data.append([
                m.get('finding', ''),
                m.get('type', ''),
                str(m.get('value', '')),
                m.get('unit', ''),
                m.get('location', '')
            ])

        table = Table(table_data)
        story.append(table)
        story.append(Spacer(1, 12))

    # Impression
    story.append(Paragraph("<b>IMPRESSION:</b>", styles['Heading2']))
    story.append(Paragraph(report.impression, styles['Normal']))
    story.append(Spacer(1, 12))

    # Recommendations
    if report.recommendations:
        story.append(Paragraph("<b>RECOMMENDATIONS:</b>", styles['Heading2']))
        story.append(Paragraph(report.recommendations, styles['Normal']))
        story.append(Spacer(1, 12))

    # AI Disclaimer
    if report.disclaimer:
        story.append(Spacer(1, 24))
        story.append(Paragraph("<b>DISCLAIMER:</b>", styles['Heading3']))
        story.append(Paragraph(report.disclaimer, styles['Normal']))

    # Report metadata
    story.append(Spacer(1, 24))
    story.append(Paragraph(f"<i>Report generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</i>", styles['Normal']))
    story.append(Paragraph(f"<i>Report ID: {report.id}</i>", styles['Normal']))
    story.append(Paragraph(f"<i>Status: {report.status.value}</i>", styles['Normal']))

    # Build PDF
    doc.build(story)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=radiology_report_{report_id}.pdf"
        }
    )


@router.get("/report/{report_id}/json")
async def export_report_json(report_id: str, db: AsyncSession = Depends(get_db)):
    """Export report as JSON"""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Report)
        .where(Report.id == report_id)
        .options(selectinload(Report.study).selectinload(Study.patient))
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Build JSON structure
    patient = report.study.patient
    study = report.study

    report_data = {
        "report_id": report.id,
        "version": report.version,
        "status": report.status.value,
        "generated_at": report.created_at.isoformat(),
        "ai_generated": report.ai_generated,
        "patient": {
            "patient_id": patient.patient_id,
            "name": f"{patient.first_name} {patient.last_name}",
            "date_of_birth": patient.date_of_birth.isoformat(),
            "gender": patient.gender.value
        },
        "study": {
            "study_id": study.id,
            "study_instance_uid": study.study_instance_uid,
            "accession_number": study.accession_number,
            "study_date": study.study_date.isoformat(),
            "modality": study.modality.value,
            "study_description": study.study_description
        },
        "content": {
            "clinical_indication": report.clinical_indication,
            "technique": report.technique,
            "findings": report.findings_narrative,
            "impression": report.impression,
            "recommendations": report.recommendations,
            "comparison_notes": report.comparison_notes
        },
        "structured_data": {
            "findings": report.structured_findings,
            "measurements": report.measurements_table
        },
        "disclaimer": report.disclaimer
    }

    return report_data


@router.get("/study/{study_id}/dicom-sr")
async def export_dicom_sr(study_id: str, db: AsyncSession = Depends(get_db)):
    """
    Export as DICOM Structured Report (DICOM-SR)
    Note: This is a simplified implementation
    """
    # This would require pydicom SR creation
    # For now, return a placeholder response
    return {
        "message": "DICOM-SR export not yet implemented",
        "study_id": study_id,
        "note": "Production implementation would use pydicom to create proper DICOM-SR files"
    }
