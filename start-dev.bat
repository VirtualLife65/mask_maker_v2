@echo off
echo 🚀 Starting AI Image Editor Development Environment...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    pause
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating directories...
if not exist uploads mkdir uploads
if not exist processed mkdir processed
if not exist exports mkdir exports

REM Install backend dependencies
echo 🐍 Installing Python dependencies...
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

REM Install frontend dependencies
echo 📦 Installing Node.js dependencies...
npm install

REM Start backend in background
echo 🔧 Starting backend server...
cd backend
call venv\Scripts\activate.bat
start /B python main.py
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend server...
start /B npm run dev

echo.
echo ✅ Development environment started!
echo 🌐 Frontend: http://localhost:8080
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to stop all services

pause
