# RadiantAI Backend - Complete System Summary

## Overview

A production-ready FastAPI backend for AI-powered radiology analysis using Google's MedGemma multimodal model. Designed for both rural offline deployment and hospital online deployment with **identical API interfaces**.

## Key Features

### ✅ Core Capabilities
- **Dual-Mode Operation**: Seamless OFFLINE ↔ ONLINE switching via configuration
- **MedGemma AI**: Local GPU inference or cloud API, decision-support only
- **DICOM Processing**: Complete CT/MRI support with metadata extraction
- **3D Volume Reconstruction**: Slice stacking, resampling, and normalization
- **AI Analysis Pipeline**: Automated finding detection, measurements, and comparisons
- **Report Generation**: Structured radiology reports with narrative and tables
- **Multi-Format Export**: PDF, JSON, and DICOM-SR (partial)
- **Storage Flexibility**: Local filesystem, AWS S3, or Azure Blob Storage
- **Security**: JWT auth, RBAC, complete audit trails

### ✅ Medical Safety
- **No Definitive Diagnosis**: AI provides suggestions only ("suggestive of", "consistent with")
- **Confidence Scoring**: All findings include confidence levels
- **Mandatory Review**: Explicit disclaimers requiring radiologist verification
- **Audit Logging**: Complete trail of all AI interactions
- **Immutable Reports**: Version control for report modifications

## Architecture

### Technology Stack
- **Framework**: FastAPI (async, high-performance)
- **Database**: SQLAlchemy (SQLite offline, PostgreSQL online)
- **AI Model**: MedGemma 1.5 (Transformers, quantized for efficiency)
- **DICOM**: pydicom, SimpleITK, nibabel
- **Export**: ReportLab (PDF), DICOM-SR
- **Storage**: Local FS, boto3 (S3), Azure SDK
- **Auth**: python-jose (JWT), passlib (bcrypt)

### Module Structure
```
app/
├── config/          # Settings, database, models
├── auth/            # Authentication & authorization
├── patients/        # Patient management
├── studies/         # Study upload & ingestion
├── dicom/           # DICOM processing utilities
├── volumes/         # 3D volume reconstruction
├── analysis/        # MedGemma AI integration
├── medgemma/        # AI engine & prompts
├── reports/         # Report generation
├── export/          # PDF, JSON, DICOM-SR export
├── storage/         # Storage abstraction layer
├── integrations/    # PACS, RIS, FHIR adapters
└── audit/           # Audit logging
```

### Database Schema (14 Tables)
1. **Users** - Authentication with roles
2. **Patients** - Demographics and medical records
3. **Studies** - Imaging studies
4. **Series** - DICOM series
5. **Images** - Individual slices
6. **Volumes** - 3D reconstructions
7. **MedGemmaAnalyses** - AI analysis results
8. **Findings** - Detected abnormalities
9. **Measurements** - Quantitative data
10. **Reports** - Generated reports
11. **AuditLogs** - Complete audit trail
12. **SyncQueue** - Offline/online sync

## Deployment Modes

### OFFLINE Mode (Rural/Clinic)
**Use Case**: Limited internet, local GPU inference

**Configuration**:
- Database: SQLite
- MedGemma: Local model (./models/medgemma-1.5)
- Storage: Local filesystem
- Quantization: 4-bit for efficiency

**Advantages**:
- No internet required
- Data privacy (everything local)
- Low latency
- Full control

**Requirements**:
- CUDA GPU (recommended) or CPU
- 16GB+ RAM
- Model files (~5GB)

### ONLINE Mode (Hospital/Cloud)
**Use Case**: Hospital deployment with cloud resources

**Configuration**:
- Database: PostgreSQL
- MedGemma: Cloud API
- Storage: S3 or Azure Blob
- Scalable infrastructure

**Advantages**:
- Centralized data
- Automatic scaling
- Easier model updates
- Lower local requirements

**Requirements**:
- Internet connectivity
- Cloud account (AWS/Azure)
- MedGemma API access

## API Endpoints (Summary)

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/token` - Login (get JWT)
- `GET /api/auth/me` - Current user info

### Patients
- `POST /api/patients` - Create patient
- `GET /api/patients` - List patients (paginated, searchable)
- `GET /api/patients/{id}` - Get patient
- `GET /api/patients/{id}/history` - Complete imaging history
- `PATCH /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### Studies
- `POST /api/studies/upload` - Upload DICOM files
- `GET /api/studies/{id}` - Get study details
- `GET /api/studies/patient/{id}` - List patient studies

### Analysis
- `POST /api/analysis` - Run MedGemma analysis
- `GET /api/analysis/{id}` - Get analysis results
- `GET /api/analysis/study/{id}/analyses` - List study analyses

### Reports
- `POST /api/reports` - Generate report
- `GET /api/reports/{id}` - Get report
- `GET /api/reports/study/{id}` - List study reports
- `PATCH /api/reports/{id}/finalize` - Finalize report

### Export
- `GET /api/export/report/{id}/pdf` - Export as PDF
- `GET /api/export/report/{id}/json` - Export as JSON
- `GET /api/export/study/{id}/dicom-sr` - Export as DICOM-SR

## MedGemma Integration

### Prompt Engineering
Three primary prompt types:
1. **Primary Analysis**: Initial study interpretation
2. **Comparison Analysis**: Current vs prior study
3. **Focused Finding**: Detailed lesion characterization

### Safety Mechanisms
- **Structured Prompts**: Every prompt includes safety disclaimers
- **Confidence Expression**: Models trained to use uncertainty phrases
- **No Diagnosis**: Only decision support, not diagnostic conclusions
- **Radiologist Review**: Mandatory review workflow

### Example Analysis Flow
```
1. Upload DICOM → Parse metadata → Store images
2. Trigger Analysis → Build prompt → Call MedGemma
3. Parse Response → Extract findings → Create measurements
4. Generate Report → Add disclaimers → Export PDF
5. Radiologist Review → Finalize → Archive
```

## Workflow Example

### Complete Patient-to-Report Flow

```bash
# 1. Register and login
curl -X POST /api/auth/register -d {...}
curl -X POST /api/auth/token -d {...}
# → Receive JWT token

# 2. Create patient
curl -X POST /api/patients -H "Authorization: Bearer <token>" -d {
  "patient_id": "MRN123",
  "first_name": "John",
  "last_name": "Doe",
  ...
}
# → patient_id: "abc-123"

# 3. Upload DICOM study
curl -X POST /api/studies/upload \
  -F "patient_id=abc-123" \
  -F "files=@scan1.dcm" \
  -F "files=@scan2.dcm" ...
# → study_id: "def-456", series_count: 2, total_images: 150

# 4. Run AI analysis
curl -X POST /api/analysis -d {
  "study_id": "def-456",
  "clinical_indication": "Chest pain, rule out PE",
  "analysis_type": "primary"
}
# → analysis_id: "ghi-789"
# → Processing... (10-30 seconds)
# → status: "completed", findings_count: 3, confidence: 0.85

# 5. Generate report
curl -X POST /api/reports -d {
  "study_id": "def-456",
  "analysis_id": "ghi-789",
  "include_ai_disclaimer": true
}
# → report_id: "jkl-012"

# 6. Export as PDF
curl /api/export/report/jkl-012/pdf --output report.pdf
# → Downloads professional radiology report PDF
```

## Deployment Instructions

### Quick Start (Development)
```bash
cd backend
./scripts/setup.sh
python -m app.main
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Docker Deployment
```bash
docker-compose up -d
# Starts: backend + PostgreSQL + (optional) frontend
```

### Production Considerations
1. **Security**: Use HTTPS, rotate SECRET_KEY, enable rate limiting
2. **Database**: PostgreSQL with backups, connection pooling
3. **Storage**: S3/Azure with encryption, retention policies
4. **MedGemma**: GPU optimization or API rate limits
5. **Monitoring**: Logs, metrics, error tracking, audit analysis

## File Structure

```
backend/
├── app/                      # Application code
│   ├── main.py              # FastAPI app entry
│   ├── config/              # Configuration & models
│   ├── auth/                # Authentication
│   ├── patients/            # Patient management
│   ├── studies/             # Study ingestion
│   ├── dicom/               # DICOM processing
│   ├── volumes/             # Volume reconstruction
│   ├── analysis/            # AI analysis
│   ├── medgemma/            # MedGemma engine
│   ├── reports/             # Report generation
│   ├── export/              # Export functionality
│   ├── storage/             # Storage abstraction
│   ├── integrations/        # External integrations
│   └── audit/               # Audit logging
├── data/                    # Runtime data
│   ├── uploads/             # Temporary uploads
│   ├── storage/             # Permanent storage
│   └── volumes/             # Processed volumes
├── models/                  # MedGemma model files
├── logs/                    # Application logs
├── docs/                    # Documentation
│   ├── API_DOCUMENTATION.md
│   └── MEDGEMMA_PROMPTS.md
├── scripts/                 # Utility scripts
│   └── setup.sh
├── requirements.txt         # Python dependencies
├── .env.example            # Configuration template
├── Dockerfile              # Docker image
├── docker-compose.yml      # Docker orchestration
└── README.md               # Main documentation
```

## Testing

```bash
# Unit tests
pytest tests/

# Coverage
pytest --cov=app tests/

# Integration tests
pytest tests/integration/

# Load testing
locust -f tests/load/locustfile.py
```

## Maintenance

### Regular Tasks
- **Database backups**: Daily PostgreSQL dumps
- **Log rotation**: Weekly log archival
- **Model updates**: Quarterly MedGemma updates
- **Security patches**: Monthly dependency updates
- **Audit reviews**: Monthly log analysis

### Monitoring
- Application logs (structlog JSON format)
- Performance metrics (response times, throughput)
- Error tracking (exception rates, failed analyses)
- Audit logs (AI usage, report generation, exports)

## Known Limitations & Future Work

### Current Limitations
1. **Modality Support**: Currently CT and MRI only (not X-ray, Ultrasound)
2. **DICOM-SR Export**: Partial implementation
3. **Volume Reconstruction**: Basic stacking (no advanced registration)
4. **PACS Integration**: Framework only, not fully implemented
5. **Multi-language**: English only

### Roadmap
1. **Q1**: Full PACS/RIS integration
2. **Q2**: Additional modalities (X-ray, Ultrasound)
3. **Q3**: Advanced volume processing (registration, segmentation)
4. **Q4**: Multi-language support, enhanced UI

## License & Compliance

- **License**: Proprietary
- **HIPAA**: Designed for compliance (encryption, audit, access control)
- **Medical Device**: NOT FDA-cleared, decision support only
- **Data Retention**: Configurable policies

## Medical Disclaimer

**CRITICAL**: This software is a **DECISION SUPPORT TOOL**, not a diagnostic device. All AI-generated findings and reports **MUST** be reviewed and verified by qualified radiologists before clinical use. This software does **NOT** replace professional medical judgment.

## Support

- **Documentation**: See `/docs` folder
- **API Reference**: http://localhost:8000/docs (when running)
- **Issues**: GitHub repository
- **Email**: support@radiantai.example.com

---

**Built with**: FastAPI, MedGemma, SQLAlchemy, PyDICOM, and ❤️ for medical imaging

**Version**: 1.0.0
**Last Updated**: 2026-01-17
