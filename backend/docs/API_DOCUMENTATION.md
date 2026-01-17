# RadiantAI API Documentation

Complete API reference for the RadiantAI backend system.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.radiantai.example.com`

## Authentication

All API endpoints (except `/auth/register` and `/auth/token`) require authentication using JWT Bearer tokens.

```http
Authorization: Bearer <your_token_here>
```

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "full_name": "string",
  "role": "admin|radiologist|technician|viewer"
}
```

#### POST `/api/auth/token`
Login and obtain access token.

**Form Data:**
- `username`: string
- `password`: string

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

### Patients

#### POST `/api/patients`
Create a new patient record.

#### GET `/api/patients`
List all patients with pagination.

**Query Parameters:**
- `skip`: int (default: 0)
- `limit`: int (default: 100)
- `search`: string (optional)

#### GET `/api/patients/{patient_id}`
Get patient details.

#### GET `/api/patients/{patient_id}/history`
Get patient with complete imaging history.

**Response includes:**
- Patient demographics
- Total number of studies
- Latest study date
- List of modalities used

#### PATCH `/api/patients/{patient_id}`
Update patient information.

#### DELETE `/api/patients/{patient_id}`
Delete patient and all associated studies (cascade delete).

### Studies

#### POST `/api/studies/upload`
Upload DICOM study files.

**Multipart Form Data:**
- `patient_id`: string
- `files`: array of DICOM files

**Response:**
```json
{
  "study_id": "uuid",
  "study_instance_uid": "string",
  "series_count": 2,
  "total_images": 150,
  "status": "completed"
}
```

#### GET `/api/studies/{study_id}`
Get study details with all series.

#### GET `/api/studies/patient/{patient_id}`
List all studies for a specific patient.

### Analysis

#### POST `/api/analysis`
Trigger AI analysis using MedGemma.

**Request Body:**
```json
{
  "study_id": "uuid",
  "clinical_indication": "string",
  "analysis_type": "primary|comparison|focused",
  "prior_study_id": "uuid (optional, required for comparison)"
}
```

**Response:**
```json
{
  "analysis_id": "uuid",
  "status": "completed",
  "findings_count": 3,
  "measurements_count": 5,
  "confidence_score": 0.85,
  "processing_time": 12.5
}
```

#### GET `/api/analysis/{analysis_id}`
Get complete analysis results.

**Response includes:**
- Raw AI response
- Structured findings
- Measurements
- Confidence scores
- Processing metadata

#### GET `/api/analysis/study/{study_id}/analyses`
List all analyses for a study.

### Reports

#### POST `/api/reports`
Generate radiology report from analysis.

**Request Body:**
```json
{
  "study_id": "uuid",
  "analysis_id": "uuid",
  "include_ai_disclaimer": true
}
```

#### GET `/api/reports/{report_id}`
Get report by ID.

#### GET `/api/reports/study/{study_id}`
Get all reports for a study.

#### PATCH `/api/reports/{report_id}/finalize`
Mark report as final (requires radiologist approval).

### Export

#### GET `/api/export/report/{report_id}/pdf`
Export report as PDF.

**Returns:** PDF file download

#### GET `/api/export/report/{report_id}/json`
Export report as structured JSON.

**Response includes complete report data in JSON format.**

#### GET `/api/export/study/{study_id}/dicom-sr`
Export as DICOM Structured Report (future implementation).

### System

#### GET `/`
Root endpoint - system information.

#### GET `/health`
Health check endpoint.

#### GET `/api/config`
Get public configuration.

**Response:**
```json
{
  "mode": "offline|online",
  "features": {
    "pacs_integration": false,
    "ris_integration": false,
    "fhir_integration": false,
    "offline_sync": true
  },
  "supported_modalities": ["CT", "MRI"],
  "max_upload_size": 5368709120
}
```

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API rate limits (when enabled):
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated endpoints

## Data Models

### Patient
```json
{
  "id": "uuid",
  "patient_id": "string",
  "first_name": "string",
  "last_name": "string",
  "date_of_birth": "date",
  "gender": "male|female|other|unknown",
  "contact_phone": "string",
  "contact_email": "string",
  "medical_record_number": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Study
```json
{
  "id": "uuid",
  "study_instance_uid": "string",
  "patient_id": "uuid",
  "accession_number": "string",
  "study_date": "datetime",
  "modality": "CT|MR|XR|US|OTHER",
  "study_description": "string",
  "clinical_indication": "string",
  "status": "pending|processing|completed|failed|archived"
}
```

### Analysis
```json
{
  "id": "uuid",
  "study_id": "uuid",
  "analysis_type": "string",
  "status": "queued|processing|completed|failed|reviewed",
  "raw_response": "string",
  "structured_findings": "object",
  "confidence_score": "float",
  "processing_time_seconds": "float",
  "findings": ["array"],
  "measurements": ["array"]
}
```

### Report
```json
{
  "id": "uuid",
  "study_id": "uuid",
  "status": "draft|final|amended|archived",
  "clinical_indication": "string",
  "technique": "string",
  "findings_narrative": "string",
  "impression": "string",
  "recommendations": "string",
  "ai_generated": "boolean",
  "disclaimer": "string"
}
```
