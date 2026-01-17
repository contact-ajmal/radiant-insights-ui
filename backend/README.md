# RadiantAI Backend - MedGemma-Powered Radiology Assistant

Complete backend system for AI-powered radiology analysis using MedGemma multimodal model.

## Features

- **Dual Mode Operation**: Seamlessly switch between OFFLINE (rural/local) and ONLINE (hospital/cloud) deployment
- **MedGemma AI Integration**: Local or API-based inference for radiology analysis
- **DICOM Support**: Full CT/MRI DICOM processing and management
- **Patient Management**: Complete patient demographic and imaging history tracking
- **Study Ingestion**: Automated DICOM study upload, parsing, and organization
- **AI Analysis**: MedGemma-powered finding detection, measurement, and comparison
- **Report Generation**: Automated radiology report generation with structured findings
- **Multi-format Export**: PDF, JSON, and DICOM-SR export capabilities
- **Storage Flexibility**: Local filesystem, AWS S3, or Azure Blob Storage
- **Security**: JWT authentication, role-based access control, audit logging

## Architecture

### Module Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── config/                 # Configuration and database models
│   │   ├── settings.py         # Environment-based settings
│   │   ├── database.py         # Database connection management
│   │   └── models.py           # SQLAlchemy ORM models
│   ├── patients/               # Patient management
│   ├── studies/                # Study and DICOM ingestion
│   ├── dicom/                  # DICOM processing utilities
│   ├── volumes/                # 3D volume reconstruction
│   ├── analysis/               # MedGemma AI analysis
│   ├── medgemma/               # MedGemma engine and prompts
│   ├── reports/                # Report generation
│   ├── export/                 # Export (PDF, JSON, DICOM-SR)
│   ├── storage/                # Storage abstraction layer
│   ├── integrations/           # PACS, RIS, FHIR integrations
│   ├── audit/                  # Audit logging
│   └── auth/                   # Authentication and authorization
├── data/                       # Data directories (offline mode)
│   ├── uploads/                # Temporary upload storage
│   ├── volumes/                # Processed volumes
│   └── storage/                # Permanent file storage
├── models/                     # MedGemma model files (offline mode)
└── logs/                       # Application logs
```

## Installation

### Prerequisites

- Python 3.10 or higher
- CUDA-capable GPU (for offline mode with local MedGemma)
- PostgreSQL (for online mode)
- 16GB+ RAM recommended
- 50GB+ storage for DICOM studies

### Quick Start

1. **Clone and setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Initialize database**

```bash
# For offline mode (SQLite) - automatic on first run
# For online mode (PostgreSQL) - ensure PostgreSQL is running

# Run migrations (optional, using alembic)
alembic upgrade head
```

4. **Download MedGemma model (for offline mode)**

```bash
# Download MedGemma-1.5 model files to ./models/medgemma-1.5/
# This would typically be done via Hugging Face:
# git lfs install
# git clone https://huggingface.co/google/medgemma-1.5 ./models/medgemma-1.5
```

5. **Run the application**

```bash
python -m app.main

# Or with uvicorn directly:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

API documentation at `http://localhost:8000/docs`

## Configuration

### Offline Mode (Rural/Local Deployment)

Perfect for rural hospitals or clinics with limited internet connectivity.

```bash
# .env
MODE=offline

# Database (SQLite)
SQLITE_DATABASE_URL=sqlite+aiosqlite:///./data/radiantai.db

# MedGemma (Local)
MEDGEMMA_MODEL_PATH=./models/medgemma-1.5
MEDGEMMA_DEVICE=cuda  # or cpu
MEDGEMMA_QUANTIZATION=4bit  # 4bit, 8bit, or none

# Storage (Local)
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./data/storage
```

### Online Mode (Hospital/Cloud Deployment)

Ideal for larger hospitals with reliable internet and cloud infrastructure.

```bash
# .env
MODE=online

# Database (PostgreSQL)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=radiantai
POSTGRES_USER=radiantai_user
POSTGRES_PASSWORD=secure_password

# MedGemma (API)
MEDGEMMA_API_ENDPOINT=https://api.medgemma.example.com/v1/inference
MEDGEMMA_API_KEY=your-api-key-here

# Storage (S3)
STORAGE_TYPE=s3
S3_BUCKET=radiantai-production
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
```

## API Usage

### Authentication

```bash
# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "radiologist1",
    "email": "radiologist@hospital.com",
    "password": "secure_password",
    "full_name": "Dr. Smith",
    "role": "radiologist"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/token \
  -d "username=radiologist1&password=secure_password"

# Returns:
# {"access_token": "eyJhbGc...", "token_type": "bearer"}

# Use token in subsequent requests:
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:8000/api/patients
```

### Patient Management

```bash
# Create patient
curl -X POST http://localhost:8000/api/patients \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "MRN123456",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1980-01-15",
    "gender": "male",
    "contact_phone": "+1234567890",
    "medical_record_number": "MRN123456"
  }'

# Get patient with imaging history
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/patients/{patient_id}/history
```

### DICOM Study Upload

```bash
# Upload DICOM files
curl -X POST http://localhost:8000/api/studies/upload \
  -H "Authorization: Bearer <token>" \
  -F "patient_id=<patient_id>" \
  -F "files=@scan1.dcm" \
  -F "files=@scan2.dcm" \
  -F "files=@scan3.dcm"

# Returns:
# {
#   "study_id": "uuid",
#   "study_instance_uid": "1.2.3.4...",
#   "series_count": 2,
#   "total_images": 150,
#   "status": "completed"
# }
```

### AI Analysis

```bash
# Run MedGemma analysis
curl -X POST http://localhost:8000/api/analysis \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "study_id": "<study_id>",
    "clinical_indication": "Chest pain, rule out pulmonary embolism",
    "analysis_type": "primary"
  }'

# Get analysis results
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/analysis/{analysis_id}
```

### Report Generation

```bash
# Generate report
curl -X POST http://localhost:8000/api/reports \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "study_id": "<study_id>",
    "analysis_id": "<analysis_id>",
    "include_ai_disclaimer": true
  }'

# Export as PDF
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/export/report/{report_id}/pdf \
  --output report.pdf

# Export as JSON
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/export/report/{report_id}/json
```

## Database Schema

### Key Tables

- **Users**: User accounts with role-based access
- **Patients**: Patient demographics and medical records
- **Studies**: Imaging studies container
- **Series**: DICOM series within studies
- **Images**: Individual DICOM slices/images
- **Volumes**: 3D reconstructed volumes
- **MedGemmaAnalyses**: AI analysis results
- **Findings**: Individual findings identified by AI
- **Measurements**: Quantitative measurements
- **Reports**: Generated radiology reports
- **AuditLogs**: Complete audit trail

See `app/config/models.py` for full schema definition.

## MedGemma Integration

### Prompt Templates

The system uses carefully crafted prompts for radiology analysis:

- **Primary Analysis**: Initial study interpretation
- **Comparison Analysis**: Comparison with prior studies
- **Focused Finding**: Detailed characterization of specific findings

All prompts include safety disclaimers and uncertainty expression guidelines.

### Safety Features

- No definitive diagnoses - uses phrases like "suggestive of", "consistent with"
- Confidence scoring for all findings
- Explicit AI disclaimers in reports
- Mandatory radiologist review workflow
- Audit logging of all AI interactions

## Deployment

### Production Deployment (Docker)

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t radiantai-backend .
docker run -p 8000:8000 --env-file .env radiantai-backend
```

### Production Considerations

1. **Security**:
   - Use strong `SECRET_KEY` in production
   - Enable HTTPS/TLS
   - Implement rate limiting
   - Regular security audits

2. **Database**:
   - Use PostgreSQL in production
   - Regular backups
   - Connection pooling

3. **Storage**:
   - Use S3/Azure for scalability
   - Implement data retention policies
   - DICOM data encryption

4. **MedGemma**:
   - For offline: GPU optimization, model quantization
   - For online: API rate limits, failover

5. **Monitoring**:
   - Application logs
   - Performance metrics
   - Error tracking
   - Audit log analysis

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test
pytest tests/test_patients.py
```

## License

Proprietary - All Rights Reserved

## Medical Disclaimer

**IMPORTANT**: This software is a decision support tool and NOT a diagnostic device. All AI-generated findings and reports MUST be reviewed and verified by qualified radiologists before clinical use. This software does not replace professional medical judgment.

## Support

For issues and questions:
- GitHub Issues: [Repository URL]
- Email: support@radiantai.example.com
- Documentation: [Docs URL]
