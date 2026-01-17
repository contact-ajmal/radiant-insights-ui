#!/bin/bash

# RadiantAI Backend Setup Script

echo "=================================="
echo "RadiantAI Backend Setup"
echo "=================================="

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "Creating data directories..."
mkdir -p data/uploads
mkdir -p data/storage
mkdir -p data/volumes
mkdir -p models
mkdir -p logs

# Copy environment template
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
else
    echo ".env file already exists"
fi

# Initialize database (SQLite for offline mode)
echo "Initializing database..."
python -c "
import asyncio
from app.config.database import init_db

async def main():
    await init_db()
    print('Database initialized successfully')

asyncio.run(main())
"

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. For OFFLINE mode: Download MedGemma model to ./models/medgemma-1.5/"
echo "3. For ONLINE mode: Configure PostgreSQL connection"
echo "4. Run the application:"
echo "   python -m app.main"
echo "   or"
echo "   uvicorn app.main:app --reload"
echo ""
echo "API will be available at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"
echo ""
