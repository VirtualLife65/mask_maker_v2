# AI Image Editor Backend

This is the backend API for the AI-powered image editor that provides image segmentation and vectorization services.

## Features

- **Image Upload**: Handle PNG/JPEG image uploads
- **AI Segmentation**: Automatic object segmentation using SAM2
- **Vector Generation**: Convert masks to SVG paths
- **Export**: Generate SVG and PSD files
- **RESTful API**: Clean API endpoints for frontend integration

## API Endpoints

### Upload
- `POST /api/upload` - Upload an image file
- `GET /api/upload/{file_id}/info` - Get upload information

### Segmentation
- `GET /api/segments/{image_id}` - Get AI-generated segments
- `GET /api/segments/{image_id}/status` - Check segmentation status

### Export
- `POST /api/export` - Export edited image as SVG or PSD
- `GET /api/export/{export_id}/download` - Download exported file

## Setup

### Prerequisites
- Python 3.11+
- pip

### Installation

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

### API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Development

### Project Structure
```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── core/
│   ├── config.py          # Configuration settings
│   ├── schemas.py          # Pydantic models
│   └── sam2_processor.py   # SAM2 integration
└── api/
    ├── upload.py           # Upload endpoints
    ├── segments.py         # Segmentation endpoints
    └── export.py           # Export endpoints
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
DEBUG=true
UPLOAD_DIR=uploads
PROCESSED_DIR=processed
EXPORT_DIR=exports
MAX_FILE_SIZE=20971520
```

## SAM2 Integration

The backend uses Meta's Segment Anything Model 2 (SAM2) for image segmentation. Currently, it uses a mock implementation for development. To use the real SAM2:

1. Install SAM2:
   ```bash
   pip install git+https://github.com/facebookresearch/segment-anything-2.git
   ```

2. Download model checkpoints:
   ```bash
   # Download SAM2 model files
   wget https://dl.fbaipublicfiles.com/segment_anything_2/072824/sam2_hiera_large.pt
   wget https://dl.fbaipublicfiles.com/segment_anything_2/072824/sam2_hiera_l.yaml
   ```

3. Update `core/sam2_processor.py` to use real SAM2 implementation.

## Docker Support

Run with Docker:

```bash
docker-compose up
```

This will start both frontend and backend services.

## Production Deployment

For production deployment:

1. Set up proper file storage (AWS S3, etc.)
2. Configure CORS for your domain
3. Set up proper logging and monitoring
4. Use a production WSGI server like Gunicorn
5. Set up proper error handling and validation
