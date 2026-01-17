"""
AI Analysis API - MedGemma Integration
"""
import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.models import Study, MedGemmaAnalysis, Finding, Measurement, AnalysisStatus
from app.medgemma import get_medgemma_engine, PromptBuilder

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


class AnalysisRequest(BaseModel):
    """Request to analyze a study"""
    study_id: str
    clinical_indication: str
    analysis_type: str = "primary"  # primary, comparison, focused
    prior_study_id: Optional[str] = None


class AnalysisResponse(BaseModel):
    """Analysis result"""
    analysis_id: str
    status: str
    findings_count: int
    measurements_count: int
    confidence_score: Optional[float]
    processing_time: float


@router.post("", response_model=AnalysisResponse)
async def create_analysis(
    request: AnalysisRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger AI analysis on a study using MedGemma
    """
    # Get study
    study = await db.get(Study, request.study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    # Build prompt based on analysis type
    prompt_builder = PromptBuilder()

    if request.analysis_type == "primary":
        prompt = prompt_builder.build_primary_analysis_prompt(
            modality=study.modality.value,
            body_part=study.series[0].body_part_examined if study.series else "Unknown",
            clinical_indication=request.clinical_indication,
            technical_params={
                "study_description": study.study_description,
                "series_count": len(study.series)
            }
        )
    elif request.analysis_type == "comparison" and request.prior_study_id:
        # Get prior study
        prior_study = await db.get(Study, request.prior_study_id)
        if not prior_study:
            raise HTTPException(status_code=404, detail="Prior study not found")

        # Get prior findings (simplified - would pull from actual prior analysis)
        prior_findings = "No significant abnormalities noted in prior study."

        prompt = prompt_builder.build_comparison_analysis_prompt(
            modality=study.modality.value,
            body_part=study.series[0].body_part_examined if study.series else "Unknown",
            clinical_indication=request.clinical_indication,
            prior_study_date=prior_study.study_date.strftime("%Y-%m-%d"),
            prior_findings=prior_findings
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid analysis type or missing prior study")

    # Create analysis record
    analysis = MedGemmaAnalysis(
        study_id=request.study_id,
        analysis_type=request.analysis_type,
        prompt=prompt,
        raw_response="",
        status=AnalysisStatus.PROCESSING
    )
    db.add(analysis)
    await db.flush()

    try:
        # Run MedGemma inference
        engine = get_medgemma_engine()
        result = await engine.analyze(prompt)

        if result["status"] == "error":
            analysis.status = AnalysisStatus.FAILED
            analysis.error_message = result.get("error", "Unknown error")
            await db.commit()
            raise HTTPException(status_code=500, detail="Analysis failed")

        # Update analysis with results
        analysis.raw_response = result["response"]
        analysis.processing_time_seconds = result["processing_time"]
        analysis.model_version = result["model_info"].get("model_name", "MedGemma-1.5")
        analysis.status = AnalysisStatus.COMPLETED
        analysis.completed_at = datetime.utcnow()

        # Parse structured findings (simplified - would use more sophisticated parsing)
        findings_data = _parse_findings(result["response"])
        analysis.structured_findings = findings_data

        # Extract confidence score
        confidence_text = result["response"].lower()
        if "high confidence" in confidence_text:
            analysis.confidence_score = 0.9
        elif "moderate confidence" in confidence_text:
            analysis.confidence_score = 0.7
        elif "low confidence" in confidence_text:
            analysis.confidence_score = 0.5
        else:
            analysis.confidence_score = 0.7  # default

        # Create findings and measurements (simplified)
        findings_count = 0
        measurements_count = 0

        for finding_data in findings_data.get("findings", []):
            finding = Finding(
                analysis_id=analysis.id,
                finding_type=finding_data.get("type", "general"),
                anatomical_location=finding_data.get("location", ""),
                description=finding_data.get("description", ""),
                severity=finding_data.get("severity", ""),
                confidence_score=finding_data.get("confidence", 0.7)
            )
            db.add(finding)
            findings_count += 1

        for measurement_data in findings_data.get("measurements", []):
            measurement = Measurement(
                analysis_id=analysis.id,
                measurement_type=measurement_data.get("type", "size"),
                value=measurement_data.get("value", 0.0),
                unit=measurement_data.get("unit", "mm"),
                location=measurement_data.get("location", "")
            )
            db.add(measurement)
            measurements_count += 1

        await db.commit()

        return AnalysisResponse(
            analysis_id=analysis.id,
            status=analysis.status.value,
            findings_count=findings_count,
            measurements_count=measurements_count,
            confidence_score=analysis.confidence_score,
            processing_time=analysis.processing_time_seconds
        )

    except Exception as e:
        analysis.status = AnalysisStatus.FAILED
        analysis.error_message = str(e)
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@router.get("/{analysis_id}")
async def get_analysis(analysis_id: str, db: AsyncSession = Depends(get_db)):
    """Get analysis results"""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(MedGemmaAnalysis)
        .where(MedGemmaAnalysis.id == analysis_id)
        .options(
            selectinload(MedGemmaAnalysis.findings),
            selectinload(MedGemmaAnalysis.measurements)
        )
    )
    analysis = result.scalar_one_or_none()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "id": analysis.id,
        "study_id": analysis.study_id,
        "status": analysis.status.value,
        "analysis_type": analysis.analysis_type,
        "raw_response": analysis.raw_response,
        "structured_findings": analysis.structured_findings,
        "confidence_score": analysis.confidence_score,
        "processing_time": analysis.processing_time_seconds,
        "findings": [
            {
                "type": f.finding_type,
                "location": f.anatomical_location,
                "description": f.description,
                "severity": f.severity,
                "confidence": f.confidence_score
            }
            for f in analysis.findings
        ],
        "measurements": [
            {
                "type": m.measurement_type,
                "value": m.value,
                "unit": m.unit,
                "location": m.location
            }
            for m in analysis.measurements
        ],
        "created_at": analysis.created_at,
        "completed_at": analysis.completed_at
    }


@router.get("/study/{study_id}/analyses")
async def list_study_analyses(study_id: str, db: AsyncSession = Depends(get_db)):
    """List all analyses for a study"""
    from sqlalchemy import select

    result = await db.execute(
        select(MedGemmaAnalysis)
        .where(MedGemmaAnalysis.study_id == study_id)
        .order_by(MedGemmaAnalysis.created_at.desc())
    )
    analyses = result.scalars().all()
    return list(analyses)


def _parse_findings(response_text: str) -> dict:
    """
    Parse MedGemma response into structured findings
    This is a simplified version - production would use more sophisticated NLP
    """
    # Simple keyword-based parsing
    findings = []
    measurements = []

    # Look for common patterns (this is simplified)
    if "nodule" in response_text.lower():
        findings.append({
            "type": "nodule",
            "location": "lung",
            "description": "Nodular opacity",
            "severity": "moderate",
            "confidence": 0.8
        })

    if "fracture" in response_text.lower():
        findings.append({
            "type": "fracture",
            "location": "bone",
            "description": "Fracture identified",
            "severity": "significant",
            "confidence": 0.9
        })

    # Extract measurements (simplified pattern matching)
    import re
    measurement_pattern = r'(\d+(?:\.\d+)?)\s*(mm|cm|HU)'
    matches = re.findall(measurement_pattern, response_text)

    for value, unit in matches:
        measurements.append({
            "type": "size",
            "value": float(value),
            "unit": unit,
            "location": "unspecified"
        })

    return {
        "findings": findings,
        "measurements": measurements,
        "summary": response_text[:500]  # First 500 chars
    }
