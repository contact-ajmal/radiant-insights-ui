"""
Storage Manager - Abstraction layer for file storage
Supports local filesystem, S3, and Azure Blob Storage
"""
import os
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO, Optional

import aiofiles
from app.config.settings import get_settings


class StorageBackend(ABC):
    """Abstract storage backend"""

    @abstractmethod
    async def save(self, file_path: str, content: BinaryIO) -> str:
        """Save file and return storage path"""
        pass

    @abstractmethod
    async def load(self, file_path: str) -> bytes:
        """Load file content"""
        pass

    @abstractmethod
    async def delete(self, file_path: str) -> bool:
        """Delete file"""
        pass

    @abstractmethod
    async def exists(self, file_path: str) -> bool:
        """Check if file exists"""
        pass

    @abstractmethod
    async def get_url(self, file_path: str, expires_in: int = 3600) -> str:
        """Get accessible URL for file"""
        pass


class LocalStorage(StorageBackend):
    """Local filesystem storage"""

    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def save(self, file_path: str, content: BinaryIO) -> str:
        """Save file to local filesystem"""
        full_path = self.base_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(full_path, 'wb') as f:
            await f.write(content.read())

        return str(full_path)

    async def load(self, file_path: str) -> bytes:
        """Load file from local filesystem"""
        full_path = self.base_path / file_path

        async with aiofiles.open(full_path, 'rb') as f:
            return await f.read()

    async def delete(self, file_path: str) -> bool:
        """Delete file from local filesystem"""
        try:
            full_path = self.base_path / file_path
            full_path.unlink()
            return True
        except FileNotFoundError:
            return False

    async def exists(self, file_path: str) -> bool:
        """Check if file exists"""
        full_path = self.base_path / file_path
        return full_path.exists()

    async def get_url(self, file_path: str, expires_in: int = 3600) -> str:
        """Get file path (for local storage, return file path)"""
        return str(self.base_path / file_path)


class S3Storage(StorageBackend):
    """AWS S3 storage"""

    def __init__(self, bucket: str, region: str, access_key: str, secret_key: str):
        import boto3

        self.bucket = bucket
        self.s3_client = boto3.client(
            's3',
            region_name=region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key
        )

    async def save(self, file_path: str, content: BinaryIO) -> str:
        """Save file to S3"""
        self.s3_client.put_object(
            Bucket=self.bucket,
            Key=file_path,
            Body=content.read()
        )
        return f"s3://{self.bucket}/{file_path}"

    async def load(self, file_path: str) -> bytes:
        """Load file from S3"""
        response = self.s3_client.get_object(Bucket=self.bucket, Key=file_path)
        return response['Body'].read()

    async def delete(self, file_path: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket, Key=file_path)
            return True
        except Exception:
            return False

    async def exists(self, file_path: str) -> bool:
        """Check if file exists in S3"""
        try:
            self.s3_client.head_object(Bucket=self.bucket, Key=file_path)
            return True
        except Exception:
            return False

    async def get_url(self, file_path: str, expires_in: int = 3600) -> str:
        """Get presigned URL for S3 object"""
        return self.s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': file_path},
            ExpiresIn=expires_in
        )


class AzureStorage(StorageBackend):
    """Azure Blob Storage"""

    def __init__(self, connection_string: str, container: str):
        from azure.storage.blob import BlobServiceClient

        self.container = container
        self.blob_service = BlobServiceClient.from_connection_string(connection_string)
        self.container_client = self.blob_service.get_container_client(container)

        # Create container if it doesn't exist
        try:
            self.container_client.create_container()
        except Exception:
            pass  # Container already exists

    async def save(self, file_path: str, content: BinaryIO) -> str:
        """Save file to Azure Blob"""
        blob_client = self.container_client.get_blob_client(file_path)
        blob_client.upload_blob(content.read(), overwrite=True)
        return f"azure://{self.container}/{file_path}"

    async def load(self, file_path: str) -> bytes:
        """Load file from Azure Blob"""
        blob_client = self.container_client.get_blob_client(file_path)
        return blob_client.download_blob().readall()

    async def delete(self, file_path: str) -> bool:
        """Delete file from Azure Blob"""
        try:
            blob_client = self.container_client.get_blob_client(file_path)
            blob_client.delete_blob()
            return True
        except Exception:
            return False

    async def exists(self, file_path: str) -> bool:
        """Check if file exists in Azure Blob"""
        try:
            blob_client = self.container_client.get_blob_client(file_path)
            blob_client.get_blob_properties()
            return True
        except Exception:
            return False

    async def get_url(self, file_path: str, expires_in: int = 3600) -> str:
        """Get SAS URL for Azure Blob"""
        from azure.storage.blob import generate_blob_sas, BlobSasPermissions
        from datetime import datetime, timedelta

        sas_token = generate_blob_sas(
            account_name=self.blob_service.account_name,
            container_name=self.container,
            blob_name=file_path,
            account_key=self.blob_service.credential.account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(seconds=expires_in)
        )

        return f"{self.container_client.url}/{file_path}?{sas_token}"


class StorageManager:
    """Main storage manager that uses appropriate backend"""

    def __init__(self):
        settings = get_settings()
        config = settings.storage_config

        if config["type"] == "local":
            self.backend = LocalStorage(config["path"])
        elif config["type"] == "s3":
            self.backend = S3Storage(
                bucket=config["bucket"],
                region=config["region"],
                access_key=config["access_key"],
                secret_key=config["secret_key"]
            )
        elif config["type"] == "azure":
            self.backend = AzureStorage(
                connection_string=config["connection_string"],
                container=config["container"]
            )
        else:
            raise ValueError(f"Unsupported storage type: {config['type']}")

    async def save_file(self, relative_path: str, content: BinaryIO) -> str:
        """Save file using configured backend"""
        return await self.backend.save(relative_path, content)

    async def load_file(self, file_path: str) -> bytes:
        """Load file using configured backend"""
        return await self.backend.load(file_path)

    async def delete_file(self, file_path: str) -> bool:
        """Delete file using configured backend"""
        return await self.backend.delete(file_path)

    async def file_exists(self, file_path: str) -> bool:
        """Check if file exists"""
        return await self.backend.exists(file_path)

    async def get_file_url(self, file_path: str, expires_in: int = 3600) -> str:
        """Get accessible URL for file"""
        return await self.backend.get_url(file_path, expires_in)


# Global storage manager instance
_storage_manager: Optional[StorageManager] = None


def get_storage_manager() -> StorageManager:
    """Get or create global storage manager instance"""
    global _storage_manager
    if _storage_manager is None:
        _storage_manager = StorageManager()
    return _storage_manager
