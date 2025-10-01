from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import json
import uuid
from typing import List

from ..core.config import settings
from ..core.schemas import ExportRequest, ExportFormat, Layer

router = APIRouter()

@router.post("/export")
async def export_image(request: ExportRequest):
    """
    Export the edited image as SVG or PSD
    """
    try:
        # Find the original image
        upload_dir = settings.upload_dir
        files = list(upload_dir.glob(f"{request.image_id}.*"))
        
        if not files:
            raise HTTPException(status_code=404, detail="Original image not found")
        
        original_file = files[0]
        
        # Generate export filename
        export_filename = request.filename or f"export_{request.image_id}_{request.format.value}"
        if request.format == ExportFormat.SVG:
            export_filename += ".svg"
        elif request.format == ExportFormat.PSD:
            export_filename += ".psd"
        
        export_path = settings.export_dir / export_filename
        
        if request.format == ExportFormat.SVG:
            await _export_svg(request, original_file, export_path)
        elif request.format == ExportFormat.PSD:
            await _export_psd(request, original_file, export_path)
        
        # Return the file
        return FileResponse(
            path=export_path,
            filename=export_filename,
            media_type="application/octet-stream"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

async def _export_svg(request: ExportRequest, original_file: Path, export_path: Path):
    """
    Export as SVG format
    """
    try:
        from PIL import Image
        import cairosvg
        
        # Get original image dimensions
        with Image.open(original_file) as img:
            width, height = img.size
        
        # Create SVG content
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .layer {{ opacity: 1; }}
        </style>
    </defs>
'''
        
        # Add background image
        svg_content += f'''    <image href="{original_file.name}" width="{width}" height="{height}" opacity="0.3"/>
'''
        
        # Add layers
        for layer in request.layers:
            if not layer.visible:
                continue
                
            opacity = layer.opacity
            if layer.type == "mask" and layer.data and "path" in layer.data:
                path_data = layer.data["path"]
                color = layer.color or "#ffffff"
                
                svg_content += f'''    <path d="{path_data}" fill="{color}" opacity="{opacity}" class="layer" id="{layer.id}"/>
'''
        
        svg_content += "</svg>"
        
        # Write SVG file
        with open(export_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
            
    except Exception as e:
        raise Exception(f"SVG export failed: {str(e)}")

async def _export_psd(request: ExportRequest, original_file: Path, export_path: Path):
    """
    Export as PSD format (simplified implementation)
    """
    try:
        from PIL import Image, ImageDraw
        import json
        
        # For now, we'll create a simple PSD-like structure
        # In production, you'd use psd-tools or similar library
        
        # Create a composite image
        with Image.open(original_file) as img:
            composite = img.copy()
        
        # Add layers (simplified)
        for layer in request.layers:
            if not layer.visible:
                continue
                
            # Create a new layer
            layer_img = Image.new('RGBA', composite.size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(layer_img)
            
            if layer.type == "mask" and layer.data and "path" in layer.data:
                # This is a simplified implementation
                # In production, you'd parse the SVG path and draw it
                color = layer.color or "#ffffff"
                # For now, just draw a placeholder rectangle
                draw.rectangle([50, 50, 150, 150], fill=color)
            
            # Composite the layer
            composite = Image.alpha_composite(composite.convert('RGBA'), layer_img)
        
        # Save as PNG (PSD export would require additional libraries)
        composite.save(export_path.with_suffix('.png'), 'PNG')
        
        # For now, return the PNG file instead of PSD
        export_path = export_path.with_suffix('.png')
        
    except Exception as e:
        raise Exception(f"PSD export failed: {str(e)}")

@router.get("/export/{export_id}/download")
async def download_export(export_id: str):
    """
    Download a previously exported file
    """
    try:
        export_dir = settings.export_dir
        files = list(export_dir.glob(f"*{export_id}*"))
        
        if not files:
            raise HTTPException(status_code=404, detail="Export file not found")
        
        export_file = files[0]
        
        return FileResponse(
            path=export_file,
            filename=export_file.name,
            media_type="application/octet-stream"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")
