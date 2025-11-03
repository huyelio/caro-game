@echo off
REM Script to import seed data into PostgreSQL (Docker or Local) - Windows

echo.
echo 🌱 Caro Game - Import Seed Data
echo ================================
echo.

REM Check if Docker container is running
docker ps | findstr "caro-postgres" >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo ✅ Docker container 'caro-postgres' found
    echo.
    echo 📋 Importing seed data...
    
    REM Copy seed file to container
    docker cp server\src\database\seed_data.sql caro-postgres:/tmp/seed_data.sql
    
    REM Import data
    docker exec caro-postgres psql -U postgres -d caro_game -f /tmp/seed_data.sql
    
    echo.
    echo ✅ Seed data imported successfully!
    echo.
    echo 🎮 Test Accounts (password: 'password123'^):
    echo    - alice@example.com
    echo    - bob@example.com
    echo    - charlie@example.com
    echo    - diana@example.com
    echo    - ethan@example.com
    echo.
) else (
    echo ❌ Docker container 'caro-postgres' not found
    echo.
    echo 💡 Make sure Docker is running:
    echo    docker-compose up
    echo.
    echo Or import to local PostgreSQL:
    echo    psql -U postgres -d caro_game -f server\src\database\seed_data.sql
    echo.
)

pause

