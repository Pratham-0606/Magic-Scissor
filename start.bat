@echo off
title Magic Scissors - Studio Salons
echo ========================================================
echo     MAGIC SCISSORS - STUDIO SALONS (AMRAVATI)
echo ========================================================
echo.

cd /d "%~dp0"

:: Check if dependencies are installed
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
)

echo [INFO] Starting local development server...
echo [INFO] Opening Magic Scissors in your default browser...
echo.

:: Launch browser in background after short delay
start "" http://localhost:3000

:: Start Vite dev server on port 3000
call npm run dev

pause
