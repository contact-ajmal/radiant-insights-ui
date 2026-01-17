"""
Mock MedGemma Engine for Local Development
Simulates AI responses without requiring actual model files
"""
import time
from typing import Dict


class MockMedGemma:
    """Mock MedGemma for development/testing"""

    def __init__(self):
        print("🤖 Mock MedGemma initialized (Development Mode)")

    async def generate(self, prompt: str, max_tokens: int = 2048, temperature: float = 0.3) -> str:
        """Generate mock response"""
        # Simulate processing time
        await self._simulate_processing()

        # Generate mock response based on prompt content
        if "COMPARISON" in prompt.upper():
            return self._mock_comparison_response()
        elif "FOCUSED" in prompt.upper() or "FINDING" in prompt.upper():
            return self._mock_focused_response()
        else:
            return self._mock_primary_response()

    async def _simulate_processing(self):
        """Simulate AI processing time"""
        import asyncio
        await asyncio.sleep(2)  # 2 second delay to simulate inference

    def _mock_primary_response(self) -> str:
        """Mock primary analysis response"""
        return """
TECHNIQUE:
CT chest was performed with intravenous contrast enhancement. Multiplanar reformations were obtained.

FINDINGS:

Lungs:
- The lungs are clear. No focal consolidation, pleural effusion, or pneumothorax is identified.
- A small 6mm nodule is noted in the right upper lobe (Series 2, Image 45). This likely represents a benign granuloma.
- No suspicious pulmonary masses or nodules are identified.

Mediastinum:
- The heart size is normal.
- No mediastinal or hilar lymphadenopathy is present.
- The great vessels appear unremarkable.

Airways:
- The trachea and main bronchi are patent.

Chest Wall:
- No suspicious bone lesions are identified.
- The visualized soft tissues are unremarkable.

Pleura:
- No pleural effusion or thickening.

MEASUREMENTS:
- Right upper lobe nodule: 6 x 5 mm
- Cardiac diameter: within normal limits

IMPRESSION:
1. Small 6mm right upper lobe nodule, likely representing a benign granuloma. However, clinical correlation and possible follow-up imaging in 6-12 months is recommended to confirm stability.
2. Otherwise unremarkable CT chest examination.
3. No evidence of acute pulmonary embolism or other acute findings.

RECOMMENDATIONS:
- Clinical correlation recommended
- Consider follow-up CT in 6-12 months to confirm stability of right upper lobe nodule
- No urgent intervention required

⚠️ IMPORTANT: This analysis was generated using AI assistance and must be reviewed by a qualified radiologist before clinical use.
"""

    def _mock_comparison_response(self) -> str:
        """Mock comparison analysis response"""
        return """
TECHNIQUE:
Current CT chest with IV contrast is compared to prior study dated 6 months ago.

COMPARISON FINDINGS:

Lungs:
- Previously noted 6mm right upper lobe nodule is now measured at 6mm, demonstrating stability (no significant change from prior 6mm).
- No new pulmonary nodules or masses are identified.
- The lungs remain clear with no consolidation or effusion.

Mediastinum:
- Heart size remains within normal limits - stable.
- No new lymphadenopathy. No change from prior.

INTERVAL CHANGES:
- RIGHT UPPER LOBE NODULE: STABLE (6mm vs 6mm, 0% change)
- All other findings: STABLE

NEW FINDINGS:
- None

RESOLVED FINDINGS:
- None

IMPRESSION:
1. Stable 6mm right upper lobe nodule - no significant interval change over 6 months. Continued stability supports benign etiology.
2. No new concerning findings.
3. Overall stable examination compared to prior study.

RECOMMENDATIONS:
- Given stability, recommend continued surveillance with CT in 12 months
- Clinical correlation recommended
- No intervention required at this time

⚠️ IMPORTANT: This comparison analysis was generated using AI assistance and must be reviewed by a qualified radiologist before clinical use.
"""

    def _mock_focused_response(self) -> str:
        """Mock focused finding analysis response"""
        return """
FOCUSED ANALYSIS: Lung Nodule

MORPHOLOGICAL CHARACTERISTICS:
- Size: 6 x 5 x 5 mm (length x width x height)
- Shape: Round, well-circumscribed
- Margins: Smooth, well-defined
- Density: Solid, approximately 45 HU (soft tissue density)
- Internal characteristics: Homogeneous, no calcification
- Location: Right upper lobe, posterior segment
- Relationship: No vessel involvement, subpleural location

DIFFERENTIAL DIAGNOSIS:
1. Benign granuloma (most likely)
   - Small size, smooth margins, solid appearance
   - Common in endemic areas

2. Small hamartoma (possible)
   - Benign appearance, though typically show fat or calcification

3. Early malignancy (less likely)
   - Size and smooth margins favor benign etiology
   - However, cannot be definitively excluded without biopsy

ADDITIONAL FEATURES:
- No enhancement pattern assessment (non-contrast study or post-contrast images not available)
- No satellite nodules
- No lymphadenopathy
- No pleural involvement

RECOMMENDATIONS:
- Follow-up CT in 6-12 months to confirm stability
- Comparison with any prior imaging if available
- Tissue sampling not recommended at this time given benign features and small size
- Clinical correlation with patient history (smoking, exposure, symptoms)

CONFIDENCE LEVEL: Moderate-High for benign etiology based on imaging characteristics.

⚠️ IMPORTANT: This focused analysis was generated using AI assistance and must be reviewed by a qualified radiologist before clinical use.
"""

    def get_model_info(self) -> Dict:
        """Get mock model information"""
        return {
            "type": "mock",
            "model_name": "Mock-MedGemma-1.5-DEV",
            "note": "Development mode - simulated responses"
        }
