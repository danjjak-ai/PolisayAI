@echo off
REM Set character code page to UTF-8
chcp 65001 > nul

SETLOCAL EnableDelayedExpansion

REM PolisayAI Service Startup Script
TITLE PolisayAI - Service Manager
COLOR 0A

echo.
echo  ======================================================
echo     PolisayAI Next-Gen Legislative Intelligence
echo  ======================================================
echo.
echo   Current Directory: %CD%
echo   Time: %TIME%
echo.

REM Check for Environment
IF NOT EXIST ".env" (
    IF NOT EXIST ".env.local" (
        echo [!] Warning: .env or .env.local not found. 
        echo     Please ensure your environment variables (Gemini, Supabase)
        echo     are configured via the admin dashboard or .env file.
        echo.
    )
)

REM Check for node_modules
IF NOT EXIST "node_modules\" (
    echo [!] node_modules not found. Installing dependencies...
    echo.
    call npm install
    IF !ERRORLEVEL! NEQ 0 (
        echo.
        echo [X] Error: Failed to install dependencies.
        echo     Please check your internet connection and Node.js installation.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed successfully.
)

REM Menu Selection
:menu
echo.
echo  ==================== [ MENU ] ====================
echo.
echo   [1] Start Development Server (next dev)
echo   [2] Build and Start Production (build + start)
echo   [3] Clean .next Cache ^& Restart Dev
echo   [4] Lint ^& Check Code Quality
echo   [5] Exit
echo.
echo  ==================================================
echo.
set /p choice="> Selection (1-5): "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto prod
if "%choice%"=="3" goto clean
if "%choice%"=="4" goto lint
if "%choice%"=="5" exit
echo.
echo [!] Invalid selection. Please try again.
pause
goto menu

:dev
echo.
echo  [Status] Launching PolisayAI (Development)...
echo  --------------------------------------------------
npm run dev
goto end

:prod
echo.
echo  [Status] Building PolisayAI Production Artifacts...
echo  --------------------------------------------------
call npm run build
IF !ERRORLEVEL! NEQ 0 (
    echo.
    echo [X] Error: Build failed. Check logs above.
    pause
    goto menu
)
echo.
echo  [Status] Launching PolisayAI (Production)...
echo  --------------------------------------------------
npm start
goto end

:clean
echo.
echo  [Status] Purging .next cache directory...
if exist ".next" rd /s /q .next
echo  [OK] Cache cleared.
echo  [Status] Restarting Development Server...
npm run dev
goto end

:lint
echo.
echo  [Status] Running ESLint...
echo  --------------------------------------------------
call npm run lint
echo.
echo  [OK] Lint check complete.
pause
goto menu

:end
echo.
echo [!] Service stopped.
pause
exit /b 0
