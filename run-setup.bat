@echo off
TITLE Digital Menu - Auto Setup
color 0a

echo ============================================
echo   DIGITAL MENU PROJECT - AUTO SETUP (Windows)
echo ============================================
echo.

REM Check Node
echo Checking Node.js...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b
)
echo Node.js OK ✓
echo.

REM Install Dependencies
echo Installing project dependencies...
call npm install
echo Dependencies Installed ✓
echo.

REM Create .env if missing
if not exist ".env" (
    echo Creating .env file...
    echo DATABASE_URL= >> .env
    echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env
    echo .env created ✓
) else (
    echo .env already exists ✓
)
echo.

REM Prisma setup
echo Running Prisma setup...
call npx prisma generate
call npx prisma db push
echo Prisma setup completed ✓
echo.

REM Download QR library (safe check)
echo Installing QR Code package...
call npm install react-qr-code
echo QR Code package ready ✓
echo.

REM Start server
echo Starting development server...
echo ============================================
echo   PROJECT STARTING ON: http://localhost:3000
echo ============================================
call npm run dev

pause
