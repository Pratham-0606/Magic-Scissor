@echo off
title Magic Scissors - Netlify Deployment
echo ========================================================
echo        MAGIC SCISSORS - DEPLOY TO NETLIFY
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Building latest production assets...
call npm run build

echo.
echo [2/2] Deploying to Netlify...
echo (If this is your first time, it will open your browser to log in)
echo.

npx -y netlify-cli deploy --prod --dir=dist

pause
