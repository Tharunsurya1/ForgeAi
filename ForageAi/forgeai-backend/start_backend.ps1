Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "   Starting ForgeAI FastAPI Backend Server    " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

if (-Not (Test-Path "venv\Scripts\activate.ps1")) {
    Write-Host "Virtual environment not found! Creating venv..." -ForegroundColor Yellow
    python -m venv venv
    .\venv\Scripts\pip.exe install -r requirements.txt
}

Write-Host "Activating virtual environment..." -ForegroundColor Green
.\venv\Scripts\Activate.ps1

Write-Host "Starting Uvicorn Server at http://127.0.0.1:8000..." -ForegroundColor Green
Write-Host "API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
