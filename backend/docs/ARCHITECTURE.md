# RadiantAI Backend Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend UI (React)                          │
│                     (Lovable-generated Interface)                    │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTPS/REST API
                         │
┌────────────────────────▼────────────────────────────────────────────┐
│                      FastAPI Backend                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    API Layer (REST)                           │  │
│  │  /patients  /studies  /analysis  /reports  /export  /auth   │  │
│  └────────────┬─────────────────────────────────────────────────┘  │
│               │                                                      │
│  ┌────────────▼──────────────────────────────────────────────────┐ │
│  │                 Business Logic Layer                           │ │
│  │                                                                 │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │ │
│  │  │  Patient    │  │   Study      │  │    Analysis       │   │ │
│  │  │  Service    │  │   Service    │  │    Service        │   │ │
│  │  └─────────────┘  └──────────────┘  └───────────────────┘   │ │
│  │                                                                 │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │ │
│  │  │   Report    │  │   Export     │  │     Auth          │   │ │
│  │  │   Service   │  │   Service    │  │     Service       │   │ │
│  │  └─────────────┘  └──────────────┘  └───────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                  Core Processing Layer                        │ │
│  │                                                                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │    DICOM     │  │   Volume     │  │    MedGemma       │  │ │
│  │  │  Processor   │  │  Processor   │  │     Engine        │  │ │
│  │  │              │  │              │  │                   │  │ │
│  │  │  - Parse     │  │  - Stack     │  │  - Prompts        │  │ │
│  │  │  - Metadata  │  │  - Resample  │  │  - Inference      │  │ │
│  │  │  - Validate  │  │  - Normalize │  │  - Parse Results  │  │ │
│  │  └──────────────┘  └──────────────┘  └───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                  Infrastructure Layer                          │ │
│  │                                                                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │   Storage    │  │  Database    │  │      Audit        │  │ │
│  │  │   Manager    │  │   Manager    │  │      Logger       │  │ │
│  │  │              │  │              │  │                   │  │ │
│  │  │  - Local FS  │  │  - SQLite    │  │  - Actions        │  │ │
│  │  │  - S3        │  │  - Postgres  │  │  - Users          │  │ │
│  │  │  - Azure     │  │  - Async     │  │  - Resources      │  │ │
│  │  └──────────────┘  └──────────────┘  └───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                         │                 │                │
                         │                 │                │
         ┌───────────────▼──┐   ┌─────────▼──────┐   ┌────▼────────┐
         │  Storage Backend │   │   Database     │   │  MedGemma   │
         │                  │   │                │   │   Model     │
         │  - Local Files   │   │  - SQLite      │   │             │
         │  - AWS S3        │   │  - PostgreSQL  │   │  - Local    │
         │  - Azure Blob    │   │                │   │  - API      │
         └──────────────────┘   └────────────────┘   └─────────────┘
```

## Data Flow

### Study Upload and Analysis Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. Upload DICOM files
     ▼
┌────────────────┐
│ Upload Handler │
└────┬───────────┘
     │ 2. Save temp files
     ▼
┌─────────────────┐
│ DICOM Processor │ ──→ Parse metadata
└────┬────────────┘     Extract patient/study/series/image info
     │ 3. Organize by series
     ▼
┌──────────────────┐
│ Storage Manager  │ ──→ Save DICOM files (local/S3/Azure)
└────┬─────────────┘     Generate thumbnails
     │ 4. Store files & create DB records
     ▼
┌───────────────┐
│   Database    │ ──→ Create: Study → Series → Images
└────┬──────────┘
     │ 5. Study ready for analysis
     ▼
┌───────────────────┐
│ Analysis Trigger  │
└────┬──────────────┘
     │ 6. Build MedGemma prompt
     ▼
┌──────────────────┐
│ MedGemma Engine  │ ──→ Local inference OR API call
└────┬─────────────┘     10-30 seconds processing
     │ 7. Return analysis
     ▼
┌──────────────────┐
│ Response Parser  │ ──→ Extract findings
└────┬─────────────┘     Extract measurements
     │ 8. Structure results
     ▼
┌───────────────┐
│   Database    │ ──→ Create: Analysis → Findings → Measurements
└────┬──────────┘
     │ 9. Analysis complete
     ▼
┌──────────────────┐
│ Report Generator │ ──→ Build narrative report
└────┬─────────────┘     Add disclaimers
     │ 10. Create report
     ▼
┌───────────────┐
│   Database    │ ──→ Create: Report
└────┬──────────┘
     │ 11. Report ready
     ▼
┌──────────────┐
│ Export to PDF│ ──→ Generate professional PDF
└────┬─────────┘
     │ 12. Deliver to client
     ▼
┌──────────┐
│  Client  │
└──────────┘
```

## Component Interaction

### Patient-Study-Analysis Relationship

```
Patient (1)
    │
    │ has many
    ▼
Study (N)
    │
    ├─→ Series (N)
    │       │
    │       └─→ Images (N)
    │
    ├─→ Volumes (N)
    │
    ├─→ Analyses (N)
    │       │
    │       ├─→ Findings (N)
    │       └─→ Measurements (N)
    │
    └─→ Reports (N)
```

### Mode Switching Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Application Code                        │
│              (Mode-agnostic logic)                       │
└───────────────┬────────────────────────┬─────────────────┘
                │                        │
        ┌───────▼────────┐      ┌───────▼────────┐
        │  OFFLINE Mode  │      │  ONLINE Mode   │
        └───────┬────────┘      └───────┬────────┘
                │                        │
    ┌───────────▼───────────┐  ┌────────▼──────────┐
    │ Database: SQLite      │  │ Database: Postgres │
    │ MedGemma: Local Model │  │ MedGemma: API      │
    │ Storage: Local FS     │  │ Storage: S3/Azure  │
    └───────────────────────┘  └────────────────────┘
```

## Security Architecture

```
┌────────────────────────────────────────────────────┐
│                   Client Request                    │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ CORS Middleware│ ──→ Validate origin
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ Auth Middleware│ ──→ Verify JWT token
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ RBAC Check     │ ──→ Check user role/permissions
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ Audit Logger   │ ──→ Log action
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ Business Logic │ ──→ Process request
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ Audit Logger   │ ──→ Log result
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │   Response     │
        └────────────────┘
```

## Scalability Considerations

### Horizontal Scaling (Online Mode)

```
                    Load Balancer
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼─────┐   ┌────▼─────┐   ┌────▼─────┐
    │ Backend  │   │ Backend  │   │ Backend  │
    │ Instance │   │ Instance │   │ Instance │
    │    #1    │   │    #2    │   │    #3    │
    └────┬─────┘   └────┬─────┘   └────┬─────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
              ┌──────────▼──────────┐
              │  PostgreSQL         │
              │  (Primary/Replica)  │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │   S3 / Azure Blob   │
              └─────────────────────┘
```

### Performance Optimization

1. **Database**:
   - Connection pooling
   - Query optimization
   - Indexed fields (patient_id, study_instance_uid, etc.)
   - Async operations

2. **Storage**:
   - CDN for image delivery (online mode)
   - Local caching
   - Chunked uploads for large studies

3. **AI Processing**:
   - Queue-based processing
   - GPU optimization (offline)
   - Batch inference
   - Result caching

4. **API**:
   - Response compression
   - Pagination
   - Field selection
   - Rate limiting

## Monitoring & Observability

```
┌─────────────────────────────────────────────────┐
│            Application Metrics                   │
│                                                  │
│  - Request rate, latency, errors                │
│  - AI inference time                            │
│  - Database query performance                   │
│  - Storage I/O                                  │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│           Structured Logging                     │
│                                                  │
│  - JSON format (structlog)                      │
│  - Request ID tracking                          │
│  - Error context                                │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│            Audit Trail                           │
│                                                  │
│  - User actions                                 │
│  - AI usage                                     │
│  - Report generation                            │
│  - Data access                                  │
└──────────────────────────────────────────────────┘
```

## Deployment Architectures

### Rural Clinic (Offline)

```
┌─────────────────────────────────────┐
│      Local Server/Workstation       │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  RadiantAI Backend (Docker)  │  │
│  │  - FastAPI                   │  │
│  │  - SQLite DB                 │  │
│  │  - Local MedGemma            │  │
│  │  - Local Storage             │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Frontend UI                 │  │
│  │  (Nginx)                     │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
         │
         │ Local Network
         ▼
┌─────────────────────┐
│  Radiologist       │
│  Workstation       │
└─────────────────────┘
```

### Hospital (Online)

```
┌─────────────────────────────────────────────────────┐
│                    Cloud (AWS/Azure)                 │
│                                                      │
│  ┌────────────────┐    ┌──────────────────────┐   │
│  │  API Gateway   │    │  Backend (ECS/AKS)   │   │
│  │  + Load        │───▶│  - Multiple          │   │
│  │    Balancer    │    │    Instances         │   │
│  └────────────────┘    └──────────┬───────────┘   │
│                                   │               │
│  ┌────────────────────────────────▼──────────┐   │
│  │         PostgreSQL (RDS/Azure DB)         │   │
│  └───────────────────────────────────────────┘   │
│                                                    │
│  ┌───────────────────────────────────────────┐   │
│  │       S3 / Azure Blob Storage             │   │
│  └───────────────────────────────────────────┘   │
│                                                    │
│  ┌───────────────────────────────────────────┐   │
│  │       MedGemma API Service                │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         │
         │ HTTPS
         ▼
┌─────────────────────┐
│  Hospital Network  │
│  - Workstations    │
│  - PACS System     │
└─────────────────────┘
```

## Technology Decisions

### Why FastAPI?
- **Async by default**: Perfect for I/O-bound medical imaging operations
- **Automatic API docs**: OpenAPI/Swagger built-in
- **Type safety**: Pydantic models for validation
- **Performance**: One of the fastest Python frameworks
- **Modern Python**: Leverages async/await, type hints

### Why SQLAlchemy?
- **ORM abstraction**: Easy database switching (SQLite ↔ PostgreSQL)
- **Async support**: AsyncIO compatibility
- **Type safety**: Mypy compatible
- **Migrations**: Alembic integration
- **Relationships**: Clean model definitions

### Why MedGemma?
- **Medical-specific**: Trained on medical data
- **Multimodal**: Text + image understanding
- **Safety-aware**: Designed for clinical decision support
- **Open weights**: Can run locally (offline mode)
- **Google backing**: Continuous improvements

## Future Architecture Enhancements

1. **Microservices Split**:
   - Separate AI inference service
   - Dedicated DICOM service
   - Report generation service

2. **Event-Driven**:
   - Message queue (RabbitMQ/Kafka)
   - Async processing pipelines
   - Real-time notifications

3. **Caching Layer**:
   - Redis for session management
   - Result caching for common queries
   - Image thumbnail cache

4. **CDN Integration**:
   - Global image delivery
   - Frontend asset distribution
   - API edge caching

5. **Advanced Monitoring**:
   - Prometheus metrics
   - Grafana dashboards
   - Distributed tracing (Jaeger)
