from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import aiofiles
import uuid
from pathlib import Path
from PIL import Image
import time

from ..core.config import settings
from ..core.schemas import UploadResponse

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image file for processing
    """
    try:
        # Validate file type
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in settings.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_extension} not allowed. Allowed types: {settings.allowed_extensions}"
            )
        
        # Validate file size
        content = await file.read()
        if len(content) > settings.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.max_file_size / (1024*1024):.1f}MB"
            )
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        filename = f"{file_id}{file_extension}"
        file_path = settings.upload_dir / filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Get image dimensions
        try:
            with Image.open(file_path) as img:
                width, height = img.size
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
        
        # Generate URL (in production, this would be a proper CDN URL)
        file_url = f"/uploads/{filename}"
        
        return UploadResponse(
            image_id=file_id,
            url=file_url,
            filename=filename,
            size=len(content),
            dimensions={"width": width, "height": height}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/upload/{file_id}/info")
async def get_upload_info(file_id: str):
    """
    Get information about an uploaded file
    """
    try:
        # Find the file
        upload_dir = settings.upload_dir
        files = list(upload_dir.glob(f"{file_id}.*"))
        
        if not files:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_path = files[0]
        
        # Get file info
        stat = file_path.stat()
        
        with Image.open(file_path) as img:
            width, height = img.size
        
        return {
            "image_id": file_id,
            "filename": file_path.name,
            "size": stat.st_size,
            "dimensions": {"width": width, "height": height},
            "created_at": stat.st_ctime
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get file info: {str(e)}")
