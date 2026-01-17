"""
Configuration Management for RadiantAI
Supports both OFFLINE (local) and ONLINE (cloud) deployment modes
"""
from functools import lru_cache
from typing import Literal
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment-based configuration"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

    # Core Settings
    mode: Literal["offline", "online"] = Field(
        default="offline",
        description="Deployment mode: offline (rural/local) or online (hospital/cloud)"
    )
    app_name: str = "RadiantAI"
    app_version: str = "1.0.0"
    debug: bool = False

    # Database Configuration
    sqlite_database_url: str = "sqlite+aiosqlite:///./data/radiantai.db"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "radiantai"
    postgres_user: str = "radiantai_user"
    postgres_password: str = ""

    # MedGemma Configuration
    medgemma_model_path: str = "./models/medgemma-1.5"
    medgemma_device: Literal["cuda", "cpu"] = "cuda"
    medgemma_quantization: Literal["4bit", "8bit", "none"] = "4bit"
    medgemma_api_endpoint: str = ""
    medgemma_api_key: str = ""

    # Storage Configuration
    storage_type: Literal["local", "s3", "azure"] = "local"
    local_storage_path: str = "./data/storage"
    s3_bucket: str = ""
    s3_region: str = "us-east-1"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    azure_storage_connection_string: str = ""
    azure_container_name: str = ""

    # Security
    secret_key: str = Field(..., min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 43200  # 30 days

    # CORS
    cors_origins: str = "http://localhost:8080,http://localhost:3000"

    # File Processing
    max_upload_size: int = 5368709120  # 5GB
    temp_upload_dir: str = "./data/uploads"
    volume_cache_dir: str = "./data/volumes"

    # Integration Settings
    pacs_ae_title: str = "RADIANTAI"
    pacs_port: int = 11112
    dicom_storage_ae_title: str = "RADIANTAI_STORE"

    # Logging
    log_level: str = "INFO"
    log_file: str = "./logs/radiantai.log"

    # Feature Flags
    enable_pacs_integration: bool = False
    enable_ris_integration: bool = False
    enable_fhir_integration: bool = False
    enable_offline_sync: bool = True

    @property
    def database_url(self) -> str:
        """Get database URL based on mode"""
        if self.mode == "offline":
            return self.sqlite_database_url
        else:
            return (
                f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
                f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
            )

    @property
    def is_offline_mode(self) -> bool:
        """Check if running in offline mode"""
        return self.mode == "offline"

    @property
    def is_online_mode(self) -> bool:
        """Check if running in online mode"""
        return self.mode == "online"

    @property
    def medgemma_config(self) -> dict:
        """Get MedGemma configuration based on mode"""
        if self.is_offline_mode:
            return {
                "type": "local",
                "model_path": self.medgemma_model_path,
                "device": self.medgemma_device,
                "quantization": self.medgemma_quantization
            }
        else:
            return {
                "type": "api",
                "endpoint": self.medgemma_api_endpoint,
                "api_key": self.medgemma_api_key
            }

    @property
    def storage_config(self) -> dict:
        """Get storage configuration"""
        if self.storage_type == "local":
            return {
                "type": "local",
                "path": self.local_storage_path
            }
        elif self.storage_type == "s3":
            return {
                "type": "s3",
                "bucket": self.s3_bucket,
                "region": self.s3_region,
                "access_key": self.s3_access_key,
                "secret_key": self.s3_secret_key
            }
        else:  # azure
            return {
                "type": "azure",
                "connection_string": self.azure_storage_connection_string,
                "container": self.azure_container_name
            }

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins as list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
