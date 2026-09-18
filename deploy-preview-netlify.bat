@echo off
title Magic Scissors - Client Preview Deployment
echo ========================================================
echo      MAGIC SCISSORS - CREATE CLIENT PREVIEW LINK
echo ========================================================
echo.
echo This creates a draft preview only. It does NOT publish to
echo the production site or change the purchased domain.
echo.

cd /d "%~dp0"

echo [1/2] Building latest preview assets...
call npm run build
if errorlevel 1 (
  echo.
  echo Build failed. No preview was deployed.
  pause
  exit /b 1
)

echo.
echo [2/2] Creating Netlify draft preview...
echo Copy the Website Draft URL shown below and share it with the client.
echo.
npx -y netlify-cli deploy --dir=dist

pause
