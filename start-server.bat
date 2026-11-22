@echo off
title SliceHub Server Startup
echo.
echo ==========================================
echo  SliceHub - Pizza Ordering Platform
echo ==========================================
echo.

cd /d "%~dp0..\slicehub-server"

if not exist node_modules (
    echo Installing server dependencies...
    npm install --legacy-peer-deps
)

echo Starting SliceHub API on http://localhost:4000...
echo.
npm run dev
pause
