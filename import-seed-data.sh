#!/bin/bash
# Script to import seed data into PostgreSQL (Docker or Local)

echo "🌱 Caro Game - Import Seed Data"
echo "================================"
echo ""

# Check if Docker is running
if docker ps | grep -q caro-postgres; then
    echo "✅ Docker container 'caro-postgres' found"
    echo ""
    echo "📋 Importing seed data..."
    
    # Copy seed file to container
    docker cp server/src/database/seed_data.sql caro-postgres:/tmp/seed_data.sql
    
    # Import data
    docker exec caro-postgres psql -U postgres -d caro_game -f /tmp/seed_data.sql
    
    echo ""
    echo "✅ Seed data imported successfully!"
    echo ""
    echo "🎮 Test Accounts (password: 'password123'):"
    echo "   - alice@example.com"
    echo "   - bob@example.com"
    echo "   - charlie@example.com"
    echo "   - diana@example.com"
    echo "   - ethan@example.com"
    
else
    echo "❌ Docker container 'caro-postgres' not found"
    echo ""
    echo "💡 Make sure Docker is running:"
    echo "   docker-compose up"
    echo ""
    echo "Or import to local PostgreSQL:"
    echo "   psql -U postgres -d caro_game -f server/src/database/seed_data.sql"
fi

