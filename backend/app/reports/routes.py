"""
Report Generation API
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.models import Report, Study, MedGemmaAnalysis, ReportStatus

router = APIRouter(prefix="/api/reports", tags=["reports"])


class ReportRequest(BaseModel):
    """Request to generate a report"""
    study_id: str
    analysis_id: str
    include_ai_disclaimer: bool = True


@router.post("")
async def generate_report(
    request: ReportRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate radiology report from AI analysis"""
    # Get study and analysis
    study = await db.get(Study, request.study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(MedGemmaAnalysis)
        .where(MedGemmaAnalysis.id == request.analysis_id)
        .options(
            selectinload(MedGemmaAnalysis.findings),
            selectinload(MedGemmaAnalysis.measurements)
        )
    )
    analysis = result.scalar_one_or_none()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Generate report sections from analysis
    findings_narrative = _generate_findings_narrative(analysis)
    impression = _generate_impression(analysis)
    measurements_table = _generate_measurements_table(analysis)

    # AI Disclaimer
    disclaimer = None
    if request.include_ai_disclaimer:
        disclaimer = (
            "IMPORTANT DISCLAIMER: This report was generated with AI assistance using MedGemma "
            "as a decision support tool. All findings and recommendations must be reviewed and "
            "verified by a qualified radiologist before clinical use. This is not a substitute "
            "for professional medical judgment."
        )

    # Create report
    report = Report(
        study_id=request.study_id,
        analysis_id=request.analysis_id,
        clinical_indication=study.clinical_indication or "Not specified",
        technique=f"{study.modality.value} imaging of {study.study_description}",
        findings_narrative=findings_narrative,
        impression=impression,
        recommendations="Clinical correlation recommended. Radiologist review required.",
        structured_findings=analysis.structured_findings,
        measurements_table=measurements_table,
        ai_generated=True,
        status=ReportStatus.DRAFT,
        disclaimer=disclaimer
    )

    db.add(report)
    await db.commit()
    await db.refresh(report)

    return report


@router.get("/{report_id}")
async def get_report(report_id: str, db: AsyncSession = Depends(get_db)):
    """Get report by ID"""
    report = await db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/study/{study_id}")
async def get_study_reports(study_id: str, db: AsyncSession = Depends(get_db)):
    """Get all reports for a study"""
    from sqlalchemy import select

    result = await db.execute(
        select(Report)
        .where(Report.study_id == study_id)
        .order_by(Report.created_at.desc())
    )
    reports = result.scalars().all()
    return list(reports)


@router.patch("/{report_id}/finalize")
async def finalize_report(report_id: str, db: AsyncSession = Depends(get_db)):
    """Mark report as final"""
    report = await db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = ReportStatus.FINAL
    report.approved_at = datetime.utcnow()
    await db.commit()

    return report


def _generate_findings_narrative(analysis: MedGemmaAnalysis) -> str:
    """Generate narrative findings section"""
    if analysis.raw_response:
        # Extract findings section from raw response
        response = analysis.raw_response

        # Simple extraction (production would use better parsing)
        if "FINDINGS:" in response:
            findings_start = response.find("FINDINGS:")
            findings_end = response.find("IMPRESSION:", findings_start)
            if findings_end == -1:
                findings_end = response.find("MEASUREMENTS:", findings_start)
            if findings_end == -1:
                findings_end = len(response)

            return response[findings_start:findings_end].strip()

    return "Please refer to AI analysis for detailed findings."


def _generate_impression(analysis: MedGemmaAnalysis) -> str:
    """Generate impression section"""
    if analysis.raw_response:
        response = analysis.raw_response

        # Extract impression section
        if "IMPRESSION:" in response:
            impression_start = response.find("IMPRESSION:")
            impression_end = response.find("RECOMMENDATIONS:", impression_start)
            if impression_end == -1:
                impression_end = len(response)

            return response[impression_start:impression_end].strip()

    return "AI-generated analysis suggests further radiologist review."


def _generate_measurements_table(analysis: MedGemmaAnalysis) -> dict:
    """Generate structured measurements table"""
    measurements = []

    for m in analysis.measurements:
        measurements.append({
            "finding": m.finding.description if m.finding else "General measurement",
            "type": m.measurement_type,
            "value": m.value,
            "unit": m.unit,
            "location": m.location
        })

    return {
        "measurements": measurements,
        "total_count": len(measurements)
    }
