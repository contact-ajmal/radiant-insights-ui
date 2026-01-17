"""
DICOM Processing Utilities
Handles DICOM file parsing, metadata extraction, and validation
"""
import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pydicom
from pydicom.dataset import Dataset
from PIL import Image

from app.config.models import Modality


class DICOMProcessor:
    """DICOM file processing and metadata extraction"""

    @staticmethod
    def parse_dicom(file_path: str) -> Dataset:
        """Parse DICOM file"""
        return pydicom.dcmread(file_path, force=True)

    @staticmethod
    def extract_study_metadata(dcm: Dataset) -> Dict:
        """Extract study-level metadata"""
        return {
            "study_instance_uid": str(dcm.get("StudyInstanceUID", "")),
            "study_date": DICOMProcessor._parse_dicom_date(dcm.get("StudyDate")),
            "study_time": str(dcm.get("StudyTime", "")),
            "study_description": str(dcm.get("StudyDescription", "")),
            "accession_number": str(dcm.get("AccessionNumber", "")),
            "modality": DICOMProcessor._parse_modality(dcm.get("Modality", "OTHER")),
            "referring_physician": str(dcm.get("ReferringPhysicianName", "")),
            "performing_physician": str(dcm.get("PerformingPhysicianName", "")),
            "institution_name": str(dcm.get("InstitutionName", "")),
        }

    @staticmethod
    def extract_series_metadata(dcm: Dataset) -> Dict:
        """Extract series-level metadata"""
        return {
            "series_instance_uid": str(dcm.get("SeriesInstanceUID", "")),
            "series_number": int(dcm.get("SeriesNumber", 0)) if dcm.get("SeriesNumber") else None,
            "series_description": str(dcm.get("SeriesDescription", "")),
            "modality": str(dcm.get("Modality", "")),
            "body_part_examined": str(dcm.get("BodyPartExamined", "")),
            "protocol_name": str(dcm.get("ProtocolName", "")),
        }

    @staticmethod
    def extract_image_metadata(dcm: Dataset) -> Dict:
        """Extract image/instance-level metadata"""
        pixel_spacing = dcm.get("PixelSpacing")
        if pixel_spacing:
            pixel_spacing = f"{pixel_spacing[0]},{pixel_spacing[1]}"

        image_position = dcm.get("ImagePositionPatient")
        if image_position:
            image_position = f"{image_position[0]},{image_position[1]},{image_position[2]}"

        image_orientation = dcm.get("ImageOrientationPatient")
        if image_orientation:
            image_orientation = ",".join([str(x) for x in image_orientation])

        return {
            "sop_instance_uid": str(dcm.get("SOPInstanceUID", "")),
            "instance_number": int(dcm.get("InstanceNumber", 0)) if dcm.get("InstanceNumber") else None,
            "image_position": image_position,
            "image_orientation": image_orientation,
            "slice_location": float(dcm.get("SliceLocation", 0)) if dcm.get("SliceLocation") else None,
            "slice_thickness": float(dcm.get("SliceThickness", 0)) if dcm.get("SliceThickness") else None,
            "pixel_spacing": pixel_spacing,
            "rows": int(dcm.get("Rows", 0)) if dcm.get("Rows") else None,
            "columns": int(dcm.get("Columns", 0)) if dcm.get("Columns") else None,
            "window_center": float(dcm.get("WindowCenter", 0)) if dcm.get("WindowCenter") else None,
            "window_width": float(dcm.get("WindowWidth", 0)) if dcm.get("WindowWidth") else None,
        }

    @staticmethod
    def extract_patient_metadata(dcm: Dataset) -> Dict:
        """Extract patient metadata"""
        dob = DICOMProcessor._parse_dicom_date(dcm.get("PatientBirthDate"))

        return {
            "patient_id": str(dcm.get("PatientID", "")),
            "patient_name": str(dcm.get("PatientName", "")),
            "date_of_birth": dob,
            "gender": DICOMProcessor._parse_gender(dcm.get("PatientSex", "O")),
        }

    @staticmethod
    def generate_thumbnail(dcm: Dataset, output_path: str, size: Tuple[int, int] = (256, 256)) -> str:
        """Generate thumbnail from DICOM image"""
        try:
            # Get pixel array
            pixel_array = dcm.pixel_array

            # Normalize to 0-255
            pixel_array = pixel_array.astype(float)
            pixel_array = (pixel_array - pixel_array.min()) / (pixel_array.max() - pixel_array.min())
            pixel_array = (pixel_array * 255).astype(np.uint8)

            # Create PIL image
            image = Image.fromarray(pixel_array)
            image = image.resize(size, Image.LANCZOS)

            # Save thumbnail
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            image.save(output_path, "PNG")

            return output_path
        except Exception as e:
            print(f"Error generating thumbnail: {e}")
            return None

    @staticmethod
    def _parse_dicom_date(date_str: Optional[str]) -> Optional[datetime]:
        """Parse DICOM date string (YYYYMMDD) to datetime"""
        if not date_str:
            return None
        try:
            return datetime.strptime(str(date_str), "%Y%m%d")
        except ValueError:
            return None

    @staticmethod
    def _parse_modality(modality_str: str) -> Modality:
        """Parse modality string to enum"""
        modality_map = {
            "CT": Modality.CT,
            "MR": Modality.MRI,
            "XR": Modality.XR,
            "US": Modality.US,
        }
        return modality_map.get(modality_str, Modality.OTHER)

    @staticmethod
    def _parse_gender(sex_str: str) -> str:
        """Parse DICOM sex to gender"""
        gender_map = {
            "M": "male",
            "F": "female",
            "O": "other",
        }
        return gender_map.get(sex_str.upper(), "unknown")

    @staticmethod
    def validate_dicom(file_path: str) -> Tuple[bool, Optional[str]]:
        """Validate DICOM file"""
        try:
            dcm = pydicom.dcmread(file_path, force=True)

            # Check required fields
            required_fields = ["SOPInstanceUID", "StudyInstanceUID", "SeriesInstanceUID"]
            for field in required_fields:
                if not hasattr(dcm, field) or not getattr(dcm, field):
                    return False, f"Missing required field: {field}"

            # Check modality
            modality = dcm.get("Modality", "")
            if modality not in ["CT", "MR", "XR", "US"]:
                return False, f"Unsupported modality: {modality}"

            return True, None
        except Exception as e:
            return False, str(e)

    @staticmethod
    def organize_series(dicom_files: List[str]) -> Dict[str, List[str]]:
        """Organize DICOM files by series"""
        series_map = {}

        for file_path in dicom_files:
            try:
                dcm = pydicom.dcmread(file_path, stop_before_pixels=True)
                series_uid = str(dcm.SeriesInstanceUID)

                if series_uid not in series_map:
                    series_map[series_uid] = []

                series_map[series_uid].append(file_path)
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
                continue

        # Sort files within each series by instance number
        for series_uid in series_map:
            series_map[series_uid] = sorted(
                series_map[series_uid],
                key=lambda f: DICOMProcessor._get_instance_number(f)
            )

        return series_map

    @staticmethod
    def _get_instance_number(file_path: str) -> int:
        """Get instance number from DICOM file"""
        try:
            dcm = pydicom.dcmread(file_path, stop_before_pixels=True)
            return int(dcm.get("InstanceNumber", 0))
        except:
            return 0
