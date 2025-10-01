import torch
import cv2
import numpy as np
from PIL import Image
from pathlib import Path
from typing import List, Tuple, Optional
import time

try:
    from sam2.build_sam import build_sam2
    from sam2.sam2_image_predictor import SAM2ImagePredictor
    SAM2_AVAILABLE = True
except ImportError:
    SAM2_AVAILABLE = False
    print("SAM2 not available. Install with: pip install git+https://github.com/facebookresearch/segment-anything-2.git")

from ..core.config import settings
from ..core.schemas import Segment

class SAM2Processor:
    def __init__(self):
        self.predictor = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._load_model()
    
    def _load_model(self):
        """Load SAM2 model"""
        if not SAM2_AVAILABLE:
            raise RuntimeError("SAM2 is not available. Please install it first.")
        
        try:
            # Build SAM2 model
            sam2_checkpoint = settings.sam2_checkpoint
            sam2_cfg_file = settings.sam2_model_cfg
            
            # For now, we'll use a simplified approach
            # In production, you'd download the actual model files
            print(f"Loading SAM2 model on {self.device}")
            
            # This is a placeholder - in real implementation, you'd load the actual model
            self.predictor = None  # Placeholder for actual SAM2 predictor
            
        except Exception as e:
            print(f"Error loading SAM2 model: {e}")
            self.predictor = None
    
    def segment_image(self, image_path: str) -> List[Segment]:
        """
        Segment an image using SAM2 and return vectorized segments
        """
        if not self.predictor:
            # Fallback to mock segmentation for development
            return self._mock_segmentation(image_path)
        
        try:
            # Load image
            image = cv2.imread(image_path)
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Run SAM2 segmentation
            # This would be the actual SAM2 implementation
            # For now, we'll use mock data
            
            return self._mock_segmentation(image_path)
            
        except Exception as e:
            print(f"Error in segmentation: {e}")
            return self._mock_segmentation(image_path)
    
    def _mock_segmentation(self, image_path: str) -> List[Segment]:
        """
        Mock segmentation for development/testing
        """
        # Load image to get dimensions
        image = Image.open(image_path)
        width, height = image.size
        
        # Generate mock segments
        mock_segments = [
            Segment(
                id="segment-1",
                name="Person",
                path=f"M {width*0.2} {height*0.3} L {width*0.4} {height*0.3} L {width*0.4} {height*0.8} L {width*0.2} {height*0.8} Z",
                color="#ff6b6b",
                bbox={"x": width*0.2, "y": height*0.3, "width": width*0.2, "height": height*0.5},
                confidence=0.95
            ),
            Segment(
                id="segment-2",
                name="Background",
                path=f"M 0 0 L {width} 0 L {width} {height} L 0 {height} Z",
                color="#4ecdc4",
                bbox={"x": 0, "y": 0, "width": width, "height": height},
                confidence=0.88
            ),
            Segment(
                id="segment-3",
                name="Object",
                path=f"M {width*0.6} {height*0.4} Q {width*0.7} {height*0.3}, {width*0.8} {height*0.4} Q {width*0.7} {height*0.5}, {width*0.6} {height*0.4} Z",
                color="#45b7d1",
                bbox={"x": width*0.6, "y": height*0.3, "width": width*0.2, "height": height*0.2},
                confidence=0.82
            )
        ]
        
        return mock_segments
    
    def mask_to_svg_path(self, mask: np.ndarray) -> str:
        """
        Convert a binary mask to SVG path using contour detection
        """
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return ""
        
        # Get the largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Simplify contour
        epsilon = 0.02 * cv2.arcLength(largest_contour, True)
        simplified = cv2.approxPolyDP(largest_contour, epsilon, True)
        
        # Convert to SVG path
        path_data = "M"
        for i, point in enumerate(simplified):
            x, y = point[0]
            if i == 0:
                path_data += f" {x} {y}"
            else:
                path_data += f" L {x} {y}"
        
        path_data += " Z"  # Close the path
        return path_data

# Global processor instance
sam2_processor = SAM2Processor()
