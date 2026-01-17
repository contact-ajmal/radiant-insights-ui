# MedGemma Prompt Engineering for Radiology

This document describes the prompt templates and strategies used for MedGemma-based radiology analysis in RadiantAI.

## Core Principles

1. **Safety First**: Every prompt includes explicit disclaimers and uncertainty expression guidelines
2. **Structured Output**: Prompts request specific sections for consistent parsing
3. **Confidence Expression**: Models are instructed to express confidence levels
4. **Medical Accuracy**: Use standard medical terminology and measurement units
5. **Radiologist Review**: Always emphasize need for professional review

## Prompt Templates

### 1. Primary Analysis Prompt

Used for initial interpretation of a new imaging study.

**Template Structure:**
```
SAFETY_DISCLAIMER

Clinical Context:
- Modality: CT/MRI
- Body Part: chest/abdomen/brain/etc
- Clinical Indication: reason for exam

TASK:
1. TECHNIQUE - describe imaging method
2. FINDINGS - systematic description
   - Each finding: location, description, measurements, confidence
3. MEASUREMENTS - quantitative data with units
4. IMPRESSION - summary and differential
5. RECOMMENDATIONS - follow-up suggestions

GUIDELINES:
- Use "suggestive of", "consistent with", not definitive diagnosis
- Include confidence levels
- Flag critical findings
- Recommend radiologist review
```

**Example Usage:**
```
You are analyzing a CT scan of the chest.

CLINICAL INDICATION:
Chronic cough for 3 months, smoker, rule out lung cancer

TASK:
Please provide a comprehensive analysis...

[Rest of structured prompt]
```

### 2. Comparison Analysis Prompt

Used for comparing current study with prior imaging.

**Key Additions:**
- Prior study date
- Prior findings summary
- Change assessment framework
- Interval change quantification

**Change Assessment Terms:**
- **Stable**: No significant change
- **Increased**: Growth or progression
- **Decreased**: Reduction in size/severity
- **Resolved**: No longer present
- **New**: Not present in prior study

**Example:**
```
You are comparing a current CT chest scan with a prior study from 2023-06-15.

PRIOR STUDY FINDINGS (2023-06-15):
- 8mm nodule right upper lobe
- No lymphadenopathy
- No pleural effusion

CURRENT STUDY:
[AI analyzes current images]

TASK:
For each prior finding and any new findings:
1. Current status
2. Measurements: current vs prior
3. Change percentage if applicable
4. Clinical significance
```

### 3. Focused Finding Analysis

Used for detailed characterization of a specific abnormality.

**Structure:**
```
FINDING TO ANALYZE:
Type: nodule/mass/fracture/lesion
Location: specific anatomical location

TASK:
1. MORPHOLOGICAL CHARACTERISTICS
   - Size (all dimensions)
   - Shape, margins, density
   - Internal features

2. DIFFERENTIAL DIAGNOSIS
   - Possible diagnoses (ranked)
   - Key distinguishing features

3. RECOMMENDATIONS
   - Additional imaging
   - Tissue sampling if needed
   - Follow-up timeline
```

## Safety Disclaimers

**Standard Disclaimer (included in all prompts):**
```
IMPORTANT: This is an AI-powered decision support tool, NOT a diagnostic system.
All findings must be reviewed and verified by a qualified radiologist.
Do not make definitive diagnoses. Use phrases like "suggestive of",
"consistent with", "possibly indicates".
Express uncertainty when confidence is low.
```

## Confidence Expression Guidelines

### High Confidence (0.8-1.0)
Use phrases:
- "clearly visible"
- "well-defined"
- "typical appearance of"
- "highly suggestive of"

### Moderate Confidence (0.5-0.8)
Use phrases:
- "likely represents"
- "suggestive of"
- "consistent with"
- "may indicate"

### Low Confidence (0.0-0.5)
Use phrases:
- "possibly represents"
- "cannot exclude"
- "questionable"
- "uncertain"
- "further evaluation needed"

## Measurement Standards

### Size Measurements
- **Linear**: millimeters (mm) for lesions <10cm, centimeters for larger
- **Volume**: cubic centimeters (cm³)
- **All dimensions**: report length × width × height for 3D lesions

### Density/Intensity
- **CT**: Hounsfield Units (HU)
- **MRI**: Relative signal intensity (hypointense/isointense/hyperintense)

### Example Measurement Format:
```
Right upper lobe nodule:
- Size: 12 × 10 × 11 mm
- Density: 45 HU (soft tissue)
- Location: Posterior segment RUL
- Margins: Irregular, spiculated
```

## Critical Findings

Prompts instruct the model to flag:
- Large masses (>3cm)
- Acute fractures
- Pneumothorax
- Pulmonary embolism
- Acute hemorrhage
- Signs of infection

**Critical Finding Format:**
```
⚠️ CRITICAL FINDING:
[Description]
URGENT radiologist review and clinical correlation recommended.
```

## Quality Assurance

### Prompt Validation Checklist:
- [ ] Safety disclaimer included
- [ ] Structured output sections defined
- [ ] Confidence expression guidelines provided
- [ ] Standard medical terminology requested
- [ ] Quantitative measurements specified
- [ ] Radiologist review emphasized

### Response Validation:
- [ ] No definitive diagnoses made
- [ ] Confidence levels expressed
- [ ] Measurements include units
- [ ] Critical findings flagged
- [ ] Recommendations include radiologist review

## Example Complete Prompt

```
IMPORTANT DISCLAIMER: This is an AI-powered decision support tool, NOT
a diagnostic system. All findings must be reviewed and verified by a
qualified radiologist. Do not make definitive diagnoses. Use phrases
like "suggestive of", "consistent with", "possibly indicates".
Express uncertainty when confidence is low.

You are analyzing a CT scan of the chest.

CLINICAL INDICATION:
Chronic cough for 3 months, 55-year-old male, 30 pack-year smoking
history, rule out malignancy

TECHNICAL PARAMETERS:
- Contrast: IV contrast enhanced
- Slice thickness: 1.25mm
- Reconstruction: Standard and lung windows

TASK:
Please provide a comprehensive analysis following this structure:

1. TECHNIQUE:
   Briefly describe the imaging technique used

2. FINDINGS:
   - Systematically describe all findings
   - For each finding:
     * Anatomical location
     * Description (size, shape, density, margins)
     * Quantitative measurements where applicable
     * Confidence level (high/moderate/low)
   - Note any normal structures
   - Identify any artifacts or limitations

3. MEASUREMENTS:
   - Provide specific measurements for significant findings
   - Use standard units (mm for size, HU for density)
   - Format: "Finding: X mm in [dimension], Y HU"

4. IMPRESSION:
   - Summarize key findings
   - Suggest differential diagnoses (use "suggestive of", "consistent with")
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

Please analyze the provided CT chest study and respond in this
structured format.
```

## Prompt Customization

The system allows customization based on:
- **Modality**: CT vs MRI specific terminology
- **Body Part**: Anatomy-specific checklists
- **Clinical Context**: Adjusting focus based on indication
- **Comparison Needs**: Prior study integration

## Future Enhancements

Planned improvements to prompting:
1. Multi-modal prompts (image + text)
2. Interactive refinement
3. Specialty-specific templates (neuro, MSK, cardiac)
4. Integration of patient history
5. Automated quality scoring of responses
