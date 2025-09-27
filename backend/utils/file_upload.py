import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import List

# Directory for storing uploaded documents
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file types for ID verification
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.pdf'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_file(file: UploadFile) -> bool:
    """Validate uploaded file type and size."""
    if not file.filename:
        return False
    
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    # Check file size (if available)
    if hasattr(file, 'size') and file.size > MAX_FILE_SIZE:
        return False
    
    return True

async def save_uploaded_file(file: UploadFile, folder: str) -> str:
    """Save uploaded file and return the file path."""
    if not validate_file(file):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type or size. Allowed: JPG, PNG, PDF up to 5MB"
        )
    
    # Create unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    # Create folder path
    folder_path = UPLOAD_DIR / folder
    folder_path.mkdir(exist_ok=True)
    
    # Save file
    file_path = folder_path / unique_filename
    
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Return relative path for database storage
        return f"uploads/{folder}/{unique_filename}"
    
    except Exception as e:
        # Clean up file if save failed
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )

def delete_file(file_path: str) -> bool:
    """Delete uploaded file."""
    try:
        full_path = Path("/app") / file_path
        if full_path.exists():
            full_path.unlink()
            return True
        return False
    except:
        return False

def get_file_url(file_path: str) -> str:
    """Generate URL for accessing uploaded file."""
    # In production, you'd want to serve these through a secure endpoint
    return f"/api/files/{file_path}"