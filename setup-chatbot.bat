@echo off
echo 🏏 Setting up Cricket Chatbot Backend...
echo.

echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo 🐳 Starting Redis with Docker...
docker-compose up -d redis
if %errorlevel% neq 0 (
    echo ❌ Failed to start Redis. Make sure Docker is running.
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for Redis to be ready...
timeout /t 5 /nobreak >nul

echo.
echo 🚀 Starting Chat Backend Server...
start "Cricket Chat Backend" cmd /k "npm run dev"

echo.
echo ✅ Setup complete! 
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3001
echo 📊 Redis: localhost:6379
echo 🖥️  Redis Commander: http://localhost:8081 (optional)
echo.
echo 💡 To start Redis Commander: docker-compose --profile tools up -d
echo.
pause
