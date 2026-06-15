@echo off
setlocal
set "PATH=%LOCALAPPDATA%\Programs\Ollama;%APPDATA%\npm;%PATH%"
echo Starting local general model: qwen3:14b
start "" "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe"
timeout /t 3 /nobreak >nul
ollama run qwen3:14b
echo.
pause
