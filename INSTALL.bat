@echo off
echo.
echo ========================================
echo  JAFS Voice Ordering System - Setup
echo ========================================
echo.

cd /d "%~dp0"

echo ----------------------------------------
echo Installing Backend Dependencies...
echo ----------------------------------------
cd backend
call npm install

echo.
echo ----------------------------------------
echo Installing Frontend Dependencies...
echo ----------------------------------------
cd ..\frontend
call npm install

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo To start the system:
echo   1. Open a terminal in backend folder and run: npm start
echo   2. Open another terminal in frontend folder and run: npm run dev
echo   3. Open http://localhost:5173 in your browser
echo.
pause
