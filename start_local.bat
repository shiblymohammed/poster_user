@echo off
echo ========================================
echo   LAPOAITOOLS USER SITE - LOCAL DEV
echo ========================================
echo.

echo Checking environment...
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo .env file created!
    echo Default API URL: http://localhost:8000
    echo.
)

echo Installing dependencies...
call npm install
echo.

echo ========================================
echo   Starting Vite dev server...
echo ========================================
echo.
echo User site will be available at: http://localhost:5173
echo Make sure backend is running at: http://localhost:8000
echo.
call npm run dev
