from pydantic import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    # API Settings
    api_title: str = "AI Image Editor API"
    api_version: str = "1.0.0"
    debug: bool = True
    
    # File Storage
    upload_dir: Path = Path("uploads")
    processed_dir: Path = Path("processed")
    export_dir: Path = Path("exports")
    
    # SAM2 Model Settings
    sam2_checkpoint: str = "sam2_hiera_large.pt"
    sam2_model_cfg: str = "sam2_hiera_l.yaml"
    
    # Processing Settings
    max_file_size: int = 20 * 1024 * 1024  # 20MB
    allowed_extensions: list = [".jpg", ".jpeg", ".png", ".bmp", ".tiff"]
    
    # Export Settings
    svg_precision: int = 2
    psd_compression: str = "zip"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Create directories if they don't exist
        self.upload_dir.mkdir(exist_ok=True)
        self.processed_dir.mkdir(exist_ok=True)
        self.export_dir.mkdir(exist_ok=True)

settings = Settings()
