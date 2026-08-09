@echo off
title TailorHub Measurement Engine
echo.
echo ============================================
echo   TailorHub Measurement Engine - Setup
echo ============================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install from https://python.org
    pause
    exit /b 1
)

REM Install dependencies
echo [1/2] Installing Python dependencies...
pip install -r requirements.txt --quiet

echo.
echo [2/2] Starting measurement server on port 5001...
echo.
python measure_server.py
pause
