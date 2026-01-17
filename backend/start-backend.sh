#!/bin/bash
# Start RadiantAI Backend Server

echo "🚀 Starting RadiantAI Backend..."

# Activate virtual environment
source venv/bin/activate

# Start FastAPI with uvicorn
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
