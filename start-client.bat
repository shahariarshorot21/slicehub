@echo off
title SliceHub Client Startup
echo.
echo ==========================================
echo  SliceHub - Pizza Ordering Platform
echo ==========================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo Installing client dependencies...
    npm install --legacy-peer-deps
)

echo Starting SliceHub Client on http://localhost:3000...
echo.
npm run dev
pause
