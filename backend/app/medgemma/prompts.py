"""
MedGemma Prompt Templates for Radiology
Structured prompts for medical imaging analysis
"""
from typing import Dict, List, Optional


class PromptBuilder:
    """Build structured prompts for MedGemma"""

    # Safety disclaimer that must be included
    SAFETY_DISCLAIMER = """
IMPORTANT: This is an AI-powered decision support tool, NOT a diagnostic system.
All findings must be reviewed and verified by a qualified radiologist.
Do not make definitive diagnoses. Use phrases like "suggestive of", "consistent with", "possibly indicates".
Express uncertainty when confidence is low.
"""

    @classmethod
    def build_primary_analysis_prompt(
        cls,
        modality: str,
        body_part: str,
        clinical_indication: str,
        technical_params: Optional[Dict] = None,
    ) -> str:
        """Build prompt for primary imaging analysis"""

        prompt = f"""{cls.SAFETY_DISCLAIMER}

You are analyzing a {modality} scan of the {body_part}.

CLINICAL INDICATION:
{clinical_indication}

TECHNICAL PARAMETERS:
{cls._format_technical_params(technical_params) if technical_params else "Standard protocol"}

TASK:
Please provide a comprehensive analysis following this structure:

1. TECHNIQUE:
   - Briefly describe the imaging technique used

2. FINDINGS:
   - Systematically describe all findings
   - For each finding:
     * Anatomical location
     * Description (size, shape, density/intensity, margins)
     * Quantitative measurements where applicable
     * Confidence level (high/moderate/low)
   - Note any normal structures
   - Identify any artifacts or limitations

3. MEASUREMENTS:
   - Provide specific measurements for significant findings
   - Use standard units (mm for size, HU for density in CT, etc.)
   - Format: "Finding: X mm in [dimension], Y HU" (for CT)

4. IMPRESSION:
   - Summarize key findings
   - Suggest differential diagnoses when appropriate (use "suggestive of", "consistent with")
   - Recommend follow-up if needed
   - Note any urgent or critical findings

5. RECOMMENDATIONS:
   - Clinical correlation recommended
   - Additional imaging if needed
   - Follow-up timeline if applicable

IMPORTANT GUIDELINES:
- Use medical terminology appropriately
- Be specific and quantitative when possible
- Express confidence levels for findings
- Do not make definitive diagnoses
- Recommend radiologist review
- Flag any critical or urgent findings clearly

Please analyze the provided imaging study and respond in this structured format.
"""
        return prompt

    @classmethod
    def build_comparison_analysis_prompt(
        cls,
        modality: str,
        body_part: str,
        clinical_indication: str,
        prior_study_date: str,
        prior_findings: str,
    ) -> str:
        """Build prompt for comparison with prior study"""

        prompt = f"""{cls.SAFETY_DISCLAIMER}

You are comparing a current {modality} scan of the {body_part} with a prior study from {prior_study_date}.

CLINICAL INDICATION:
{clinical_indication}

PRIOR STUDY FINDINGS ({prior_study_date}):
{prior_findings}

TASK:
Please provide a comprehensive comparison analysis following this structure:

1. TECHNIQUE:
   - Briefly describe current imaging technique
   - Note any technique differences from prior study

2. COMPARISON FINDINGS:
   For each finding from the prior study AND new findings:
   - Location and description
   - Current measurements vs prior measurements
   - Change assessment: stable, increased, decreased, resolved, new
   - Percentage change if quantifiable
   - Clinical significance of changes

3. NEW FINDINGS:
   - Identify any findings not present in the prior study
   - Provide detailed description and measurements

4. RESOLVED FINDINGS:
   - Note any findings from prior study that are no longer present

5. IMPRESSION:
   - Summarize overall change assessment
   - Highlight clinically significant changes
   - Recommend action based on interval changes
   - Note any progression or improvement

6. RECOMMENDATIONS:
   - Clinical correlation
   - Follow-up interval
   - Additional imaging if needed

CRITICAL POINTS:
- Be precise about interval changes
- Quantify changes when possible (e.g., "nodule increased from 8mm to 12mm, 50% increase")
- Flag significant progressions or new concerning findings
- Use standard comparison terminology (stable, improved, worsened)
- Do not make definitive diagnoses based on changes

Please analyze and compare the imaging studies.
"""
        return prompt

    @classmethod
    def build_focused_finding_prompt(
        cls,
        modality: str,
        finding_type: str,
        location: str,
        additional_context: Optional[str] = None,
    ) -> str:
        """Build prompt for detailed analysis of specific finding"""

        prompt = f"""{cls.SAFETY_DISCLAIMER}

You are performing a focused analysis of a specific finding on a {modality} scan.

FINDING TO ANALYZE:
Type: {finding_type}
Location: {location}
{f"Additional Context: {additional_context}" if additional_context else ""}

TASK:
Please provide a detailed characterization of this finding:

1. MORPHOLOGICAL CHARACTERISTICS:
   - Size (all dimensions)
   - Shape and margins
   - Density/signal intensity
   - Internal characteristics
   - Relationship to surrounding structures

2. DIFFERENTIAL DIAGNOSIS:
   - List possible diagnoses (use "suggestive of", "consistent with", "may represent")
   - Rank by likelihood based on imaging features
   - Key distinguishing features

3. ADDITIONAL FEATURES:
   - Enhancement pattern (if contrast given)
   - Associated findings
   - Complications or concerning features

4. RECOMMENDATIONS:
   - Additional imaging for characterization
   - Tissue sampling if indicated
   - Follow-up timeline
   - Urgent action if critical

Provide detailed, systematic analysis of this finding.
"""
        return prompt

    @classmethod
    def build_measurement_prompt(
        cls,
        modality: str,
        findings_summary: str,
    ) -> str:
        """Build prompt for extracting quantitative measurements"""

        prompt = f"""
Based on the following imaging findings, extract all quantitative measurements:

FINDINGS:
{findings_summary}

Please provide a structured list of measurements in the following JSON format:
{{
    "measurements": [
        {{
            "finding": "description of finding",
            "location": "anatomical location",
            "measurement_type": "size/volume/density/etc",
            "value": numeric_value,
            "unit": "mm/cm/HU/etc",
            "method": "how it was measured"
        }}
    ]
}}

Include all measurements mentioned in the findings.
Be precise and use standard medical units.
"""
        return prompt

    @staticmethod
    def _format_technical_params(params: Dict) -> str:
        """Format technical parameters for prompt"""
        lines = []
        for key, value in params.items():
            lines.append(f"- {key}: {value}")
        return "\n".join(lines)

    @classmethod
    def extract_confidence_keywords(cls, text: str) -> str:
        """Analyze text for confidence indicators"""
        high_confidence = ["clearly", "definitely", "unequivocally", "certainly"]
        moderate_confidence = ["likely", "probably", "suggestive of", "consistent with"]
        low_confidence = ["possibly", "may represent", "uncertain", "questionable", "cannot exclude"]

        text_lower = text.lower()

        if any(word in text_lower for word in low_confidence):
            return "low"
        elif any(word in text_lower for word in high_confidence):
            return "high"
        elif any(word in text_lower for word in moderate_confidence):
            return "moderate"

        return "moderate"  # default
