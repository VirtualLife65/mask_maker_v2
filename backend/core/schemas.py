from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class ExportFormat(str, Enum):
    SVG = "svg"
    PSD = "psd"

class Segment(BaseModel):
    id: str
    name: str
    path: str  # SVG path data
    color: str  # Hex color
    bbox: Optional[Dict[str, float]] = None  # Bounding box
    confidence: Optional[float] = None

class Layer(BaseModel):
    id: str
    name: str
    type: str  # 'image', 'mask', 'shape'
    visible: bool = True
    locked: bool = False
    color: Optional[str] = None
    opacity: float = 1.0
    data: Optional[Dict[str, Any]] = None

class ExportRequest(BaseModel):
    image_id: str
    layers: List[Layer]
    format: ExportFormat
    filename: Optional[str] = None

class UploadResponse(BaseModel):
    image_id: str
    url: str
    filename: str
    size: int
    dimensions: Dict[str, int]

class SegmentsResponse(BaseModel):
    image_id: str
    segments: List[Segment]
    processing_time: float
