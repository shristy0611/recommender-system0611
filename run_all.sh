#!/bin/bash

echo "===== Personal Recommender System Startup ====="
echo "This script will ensure everything is working properly before starting the servers."

# Check if setup.sh exists and run it if needed
if [ ! -d ".venv" ] || [ ! -f ".env" ]; then
    echo "Initial setup required..."
    ./setup.sh
fi

# Activate virtual environment
echo ""
echo "===== Activating Python environment ====="
source .venv/bin/activate

# Verify Python packages
echo ""
echo "===== Verifying Python packages ====="
if ! python -c "import google.generativeai" 2>/dev/null; then
    echo "ERROR: Google Generative AI package not found. Running setup again..."
    ./setup.sh
    source .venv/bin/activate
    
    if ! python -c "import google.generativeai" 2>/dev/null; then
        echo "ERROR: Setup failed. Please try manually:"
        echo "pip install google-generativeai"
        exit 1
    fi
fi
echo "Python packages verified."

# Verify API key
echo ""
echo "===== Verifying API key ====="
API_KEY=$(grep -o 'GEMINI_API_KEY=.*' .env | cut -d'=' -f2)

if [ "$API_KEY" = "your_api_key_here" ] || [ -z "$API_KEY" ]; then
    echo "ERROR: API key not set in .env file."
    echo "Please edit the .env file and add your Gemini API key."
    exit 1
fi
echo "API key verified."

# Kill any existing servers
echo ""
echo "===== Stopping any running servers ====="
pkill -f "python -m http.server" || true
pkill -f "python3 -m http.server" || true
pkill -f "node server.js" || true
echo "Previous servers stopped."

# Start the servers
echo ""
echo "===== Starting servers ====="
echo "Starting Node.js server and Python HTTP server..."
./start.sh &
SERVER_PID=$!

# Wait for servers to start
echo "Waiting for servers to start..."
sleep 3

# Improved server checking - checks for any process with http.server regardless of python/python3
if ! ps aux | grep -v grep | grep -q "node server.js"; then
    echo "ERROR: Node.js server failed to start."
    exit 1
else
    echo "✅ Node.js server is running"
fi

if ! ps aux | grep -v grep | grep -q "http.server"; then
    echo "ERROR: Python HTTP server failed to start."
    exit 1
else
    echo "✅ Python HTTP server is running"
fi

echo ""
echo "===== All servers started successfully! ====="
echo ""
echo "You can now access the application at:"
echo "- Main interface (recommended): http://localhost:3000/"
echo "- Alternative interface: http://localhost:8000/"
echo ""
echo "To stop all servers, press Ctrl+C"

# Wait for the user to press Ctrl+C
wait $SERVER_PID 