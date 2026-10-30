@echo off
rem Windows: double-click to choose sections, or to download only what changed on the site since last time.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\trb.ps1" update
echo.
pause
