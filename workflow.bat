@echo off
title Magic Scissors - Complete Workflow Runner
echo ========================================================
echo     MAGIC SCISSORS - STUDIO SALONS ^| WORKFLOW RUNNER
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Check Node.js and NPM
echo [1/4] Checking Node.js and dependencies...
if not exist "node_modules\" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
) else (
    echo [INFO] Dependencies verified.
)

:: 2. Run Verification Test Suite
echo.
echo [2/4] Executing Node.js automated verification test suite...
call node scratch/test-suite.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Verification test suite failed. Please review errors above.
    pause
    exit /b %errorlevel%
)

:: 3. Run Production Build Validation
echo.
echo [3/4] Validating Vite production build...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed. Please inspect build output above.
    pause
    exit /b %errorlevel%
)
echo [INFO] Production build succeeded cleanly.

:: 4. Launch Local Development Server
echo.
echo [4/4] Launching Magic Scissors development server...
echo [INFO] Opening default browser...
start "" http://localhost:3000
call npm run dev

pause
