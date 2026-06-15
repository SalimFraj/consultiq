@echo off
setlocal
set "PATH=%APPDATA%\npm;%LOCALAPPDATA%\Programs\Ollama;%PATH%"
echo Switching OpenClaw to general-local...
openclaw models set general-local
echo Opening OpenClaw chat...
openclaw chat
echo.
pause
