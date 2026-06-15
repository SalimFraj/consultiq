@echo off
setlocal
set "PATH=%APPDATA%\npm;%LOCALAPPDATA%\Programs\Ollama;%PATH%"
echo Switching OpenClaw to coder-local...
openclaw models set coder-local
echo Opening OpenClaw chat...
openclaw chat
echo.
pause
