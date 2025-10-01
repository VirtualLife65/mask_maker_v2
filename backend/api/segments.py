from fastapi import APIRouter, HTTPException, Path
from pathlib import Path
import time

from ..core.config import settings
from ..core.schemas import SegmentsResponse
from ..core.sam2_processor import sam2_processor

router = APIRouter()

@router.get("/segments/{image_id}", response_model=SegmentsResponse)
async def get_segments(image_id: str):
    """
    Get AI-generated segments for an uploaded image
    """
    try:
        # Find the uploaded file
        upload_dir = settings.upload_dir
        files = list(upload_dir.glob(f"{image_id}.*"))
        
        if not files:
            raise HTTPException(status_code=404, detail="Image not found")
        
        file_path = files[0]
        
        # Process the image with SAM2
        start_time = time.time()
        segments = sam2_processor.segment_image(str(file_path))
        processing_time = time.time() - start_time
        
        return SegmentsResponse(
            image_id=image_id,
            segments=segments,
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Segmentation failed: {str(e)}")

@router.get("/segments/{image_id}/status")
async def get_segmentation_status(image_id: str):
    """
    Check the status of segmentation processing
    """
    try:
        # Check if processed file exists
        processed_file = settings.processed_dir / f"{image_id}_segments.json"
        
        if processed_file.exists():
            return {"status": "completed", "image_id": image_id}
        else:
            return {"status": "processing", "image_id": image_id}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")
