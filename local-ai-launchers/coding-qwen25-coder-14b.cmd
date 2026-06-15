@echo off
setlocal
set "PATH=%LOCALAPPDATA%\Programs\Ollama;%APPDATA%\npm;%PATH%"
echo Starting local coding model: qwen2.5-coder:14b
start "" "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe"
timeout /t 3 /nobreak >nul
ollama run qwen2.5-coder:14b
echo.
pause
