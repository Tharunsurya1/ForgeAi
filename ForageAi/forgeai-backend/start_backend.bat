@echo off
title ForgeAI FastAPI Backend Server
echo ==============================================
echo    Starting ForgeAI FastAPI Backend Server
echo ==============================================
cd /d "%~dp0"

if not exist "venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\pip.exe install -r requirements.txt
)

echo Starting Uvicorn on http://127.0.0.1:8000 ...
echo Swagger UI Docs: http://127.0.0.1:8000/docs
echo.
venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
pause
