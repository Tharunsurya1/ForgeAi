Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "        ForgeAI Fullstack Development Launcher          " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$backendDir = Join-Path $rootDir "ForageAi\forgeai-backend"
$frontendDir = Join-Path $rootDir "ForageAi\forgeai-frontend"

Write-Host "Starting Backend (FastAPI on http://127.0.0.1:8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting Frontend (Next.js on http://localhost:3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev"

Write-Host ""
Write-Host "Both servers are starting in new terminal windows!" -ForegroundColor Yellow
Write-Host "Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://127.0.0.1:8000/api/v1" -ForegroundColor White
Write-Host "Swagger UI:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
