# AI Image Editor

A professional AI-powered image editor that transforms raster images into editable vector layers using advanced segmentation technology.

## 🚀 Features

- **AI-Powered Segmentation**: Automatic object detection and segmentation using SAM2
- **Vector Layer Editing**: Convert segmented objects into editable SVG paths
- **Professional UI**: Figma/Photoshop-quality interface with modern design
- **Real-time Editing**: Move, resize, recolor, and transform individual objects
- **Export Options**: Export as SVG or PSD for further editing
- **Drag & Drop**: Intuitive file upload with drag-and-drop support

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript
- **Fabric.js** for canvas manipulation and vector editing
- **TailwindCSS** with custom design system
- **Framer Motion** for smooth animations
- **shadcn/ui** component library

### Backend (Python + FastAPI)
- **FastAPI** for high-performance API
- **SAM2** for AI-powered image segmentation
- **OpenCV** for image processing
- **PIL/Pillow** for image manipulation
- **SVG/PSD** export capabilities

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + shadcn/ui
- Fabric.js (canvas library)
- Framer Motion (animations)
- React Query (state management)

### Backend
- Python 3.11+
- FastAPI (web framework)
- SAM2 (segmentation model)
- OpenCV (computer vision)
- PIL/Pillow (image processing)
- Docker (containerization)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd maskmaker-studio-main
   ```

2. **Start development environment**:
   
   **Windows**:
   ```bash
   start-dev.bat
   ```
   
   **Linux/Mac**:
   ```bash
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

3. **Access the application**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Manual Setup

#### Frontend
```bash
npm install
npm run dev
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 📁 Project Structure

```
maskmaker-studio-main/
├── src/                          # Frontend source code
│   ├── components/
│   │   ├── editor/              # Editor components
│   │   │   ├── Canvas.tsx       # Fabric.js canvas
│   │   │   ├── LayersSidebar.tsx # Layer management
│   │   │   ├── PropertiesSidebar.tsx # Properties panel
│   │   │   ├── Toolbar.tsx      # Top toolbar
│   │   │   └── UploadArea.tsx    # File upload
│   │   ├── ui/                  # shadcn/ui components
│   │   └── ImageEditor.tsx      # Main editor component
│   ├── pages/                   # Page components
│   └── types/                   # TypeScript definitions
├── backend/                     # Backend API
│   ├── api/                     # API endpoints
│   │   ├── upload.py            # Upload endpoints
│   │   ├── segments.py          # Segmentation endpoints
│   │   └── export.py            # Export endpoints
│   ├── core/                    # Core modules
│   │   ├── config.py            # Configuration
│   │   ├── schemas.py           # Pydantic models
│   │   └── sam2_processor.py    # SAM2 integration
│   ├── main.py                  # FastAPI app
│   └── requirements.txt         # Python dependencies
├── docker-compose.yml           # Docker setup
└── README.md                   # This file
```

## 🔧 API Endpoints

### Upload
- `POST /api/upload` - Upload image file
- `GET /api/upload/{file_id}/info` - Get upload info

### Segmentation
- `GET /api/segments/{image_id}` - Get AI segments
- `GET /api/segments/{image_id}/status` - Check status

### Export
- `POST /api/export` - Export as SVG/PSD
- `GET /api/export/{export_id}/download` - Download file

## 🎨 Usage

1. **Upload Image**: Drag and drop or select a PNG/JPEG image
2. **AI Segmentation**: Click "Generate AI Segments" to detect objects
3. **Edit Layers**: Select layers to edit colors, opacity, and transforms
4. **Export**: Choose SVG or PSD format for download

## 🐳 Docker Support

Run with Docker Compose:
```bash
docker-compose up
```

## 🔮 Future Enhancements

- **Real SAM2 Integration**: Replace mock segmentation with actual SAM2
- **Advanced Editing**: Add more transform tools and filters
- **Cloud Storage**: Integrate with AWS S3 or similar
- **User Accounts**: Add authentication and project saving
- **Batch Processing**: Process multiple images at once
- **AI Inpainting**: Fill missing areas with AI-generated content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Meta AI for SAM2 (Segment Anything Model 2)
- Fabric.js for canvas manipulation
- shadcn/ui for beautiful components
- FastAPI for the excellent web framework