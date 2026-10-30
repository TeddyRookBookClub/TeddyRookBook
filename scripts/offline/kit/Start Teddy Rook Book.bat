@echo off
rem Windows: double-click to open your copy of Teddy Rook Book in the browser. Close this window to stop it.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\trb.ps1" serve
if errorlevel 1 pause
