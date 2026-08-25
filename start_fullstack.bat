@echo off
title ForgeAI Fullstack Launcher
echo ========================================================
echo        ForgeAI Fullstack Development Launcher
echo ========================================================
echo.
echo Starting Backend (FastAPI on port 8000)...
start "ForgeAI Backend" cmd /k "cd /d %~dp0ForageAi\forgeai-backend && start_backend.bat"

echo Starting Frontend (Next.js on port 3000)...
start "ForgeAI Frontend" cmd /k "cd /d %~dp0ForageAi\forgeai-frontend && npm run dev"

echo.
echo Both servers are starting!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000/api/v1
echo Swagger Docs: http://localhost:8000/docs
echo ========================================================
