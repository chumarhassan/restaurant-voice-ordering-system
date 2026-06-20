@echo off
echo Starting JAFS Voice Ordering System...
echo.

cd /d "%~dp0"

echo Starting Backend Server...
start "JAFS Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Dev Server...
start "JAFS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  Servers Starting!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul
start http://localhost:5173
