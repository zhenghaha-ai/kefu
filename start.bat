@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title AutoMailReplySystem

echo Current dir: %CD%
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found

if not exist "node_modules" (
    echo [*] Installing backend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
)
echo [OK] Backend dependencies ready

if not exist "frontend\dist" (
    echo [*] Installing frontend dependencies...
    cd frontend
    if not exist "node_modules" (
        call npm install
        if %errorlevel% neq 0 (
            echo [ERROR] Frontend npm install failed
            cd ..
            pause
            exit /b 1
        )
    )
    echo [*] Building frontend...
    call npm run build
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend build failed
        cd ..
        pause
        exit /b 1
    )
    cd ..
)
echo [OK] Frontend ready

for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    echo [*] Releasing port 3000 PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ============================================
echo   http://localhost:3000
echo   Close this window to stop the service.
echo ============================================
echo.

:: Open browser after 2s delay (runs in background while node starts)
start /b cmd /c "ping -n 3 127.0.0.1 >nul && start http://localhost:3000"

node src/index.js

pause
