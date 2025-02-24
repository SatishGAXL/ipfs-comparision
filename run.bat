@echo off
echo Starting frontend and backend development servers...

:: Open a new terminal for the frontend
start cmd /k "cd frontend && npm run dev"

:: Open a new terminal for the backend
start cmd /k "cd backend && npm run dev"

:: Wait for user to press Ctrl+C
echo Press Ctrl+C to stop both terminals...
pause >nul

:: Close all terminals with the title "npm run dev"
taskkill /FI "WINDOWTITLE eq npm run dev*" /T /F

echo All terminals closed.
