# RadiantAI Backend - Quick Start Guide

## 5-Minute Setup

### Prerequisites Check
```bash
python --version  # Need 3.10+
pip --version
git --version
```

### Installation
```bash
# 1. Navigate to backend
cd backend

# 2. Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Configure environment
cp .env.example .env
nano .env  # Edit MODE=offline or MODE=online

# 4. Start server
python -m app.main
```

**Server running at**: `http://localhost:8000`
**API Docs**: `http://localhost:8000/docs`

## First API Calls

### 1. Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "doctor1",
    "email": "doctor@example.com",
    "password": "secure123",
    "full_name": "Dr. Smith",
    "role": "radiologist"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/token \
  -d "username=doctor1&password=secure123"
```

Response: `{"access_token": "eyJ...", "token_type": "bearer"}`

**Save this token!** Use it in all subsequent requests.

### 3. Create Patient
```bash
TOKEN="your-token-here"

curl -X POST http://localhost:8000/api/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "MRN001",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1980-01-15",
    "gender": "male"
  }'
```

Response: `{"id": "abc-123", ...}`

### 4. Upload DICOM Study
```bash
curl -X POST http://localhost:8000/api/studies/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "patient_id=abc-123" \
  -F "files=@path/to/scan1.dcm" \
  -F "files=@path/to/scan2.dcm"
```

Response: `{"study_id": "def-456", "status": "completed"}`

### 5. Run AI Analysis
```bash
curl -X POST http://localhost:8000/api/analysis \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "study_id": "def-456",
    "clinical_indication": "Chest pain, rule out pulmonary embolism",
    "analysis_type": "primary"
  }'
```

Response: `{"analysis_id": "ghi-789", "status": "completed"}`

### 6. Generate Report
```bash
curl -X POST http://localhost:8000/api/reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "study_id": "def-456",
    "analysis_id": "ghi-789"
  }'
```

Response: `{"id": "jkl-012", ...}`

### 7. Export PDF
```bash
curl http://localhost:8000/api/export/report/jkl-012/pdf \
  -H "Authorization: Bearer $TOKEN" \
  --output radiology_report.pdf
```

## Configuration Quick Reference

### Offline Mode (.env)
```bash
MODE=offline
SQLITE_DATABASE_URL=sqlite+aiosqlite:///./data/radiantai.db
MEDGEMMA_MODEL_PATH=./models/medgemma-1.5
MEDGEMMA_DEVICE=cuda
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./data/storage
SECRET_KEY=your-secret-key-min-32-chars
```

### Online Mode (.env)
```bash
MODE=online
POSTGRES_HOST=localhost
POSTGRES_DB=radiantai
POSTGRES_USER=radiantai
POSTGRES_PASSWORD=secure_password
MEDGEMMA_API_ENDPOINT=https://api.medgemma.example.com/v1
MEDGEMMA_API_KEY=your-api-key
STORAGE_TYPE=s3
S3_BUCKET=radiantai-prod
SECRET_KEY=your-secret-key-min-32-chars
```

## Docker Quick Start

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

## Common Issues

### "Module not found"
```bash
pip install -r requirements.txt
```

### "Database not found"
```bash
# Database is auto-created on first run
# Or manually initialize:
python -c "from app.config.database import init_db; import asyncio; asyncio.run(init_db())"
```

### "MedGemma model not found" (offline mode)
```bash
# Download model files to ./models/medgemma-1.5/
# Or use API mode (MODE=online)
```

### "CUDA out of memory"
```bash
# In .env, change to:
MEDGEMMA_QUANTIZATION=4bit
# Or use CPU:
MEDGEMMA_DEVICE=cpu
```

## Next Steps

1. **Explore API Docs**: Visit http://localhost:8000/docs
2. **Read Full Docs**: See `README.md` and `docs/` folder
3. **Test Workflows**: Try complete patient-to-report flow
4. **Configure for Production**: Update `.env` with production settings
5. **Set up Monitoring**: Check logs in `./logs/`

## Useful Commands

```bash
# Run with auto-reload (development)
uvicorn app.main:app --reload

# Run tests
pytest

# Check database
sqlite3 data/radiantai.db ".tables"

# View logs
tail -f logs/radiantai.log

# Clean data (careful!)
rm -rf data/radiantai.db data/storage/* data/uploads/*
```

## Support

- **Interactive Docs**: http://localhost:8000/docs
- **API Reference**: `docs/API_DOCUMENTATION.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Full Guide**: `README.md`

**Happy coding! 🚀**
