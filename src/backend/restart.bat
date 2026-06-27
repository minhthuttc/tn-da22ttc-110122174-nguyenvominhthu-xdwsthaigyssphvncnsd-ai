@echo off
echo Stopping backend server...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq backend*" 2>nul
timeout /t 2 /nobreak >nul

echo Starting backend server...
start "backend" node index.js

echo Backend restarted!
pause
