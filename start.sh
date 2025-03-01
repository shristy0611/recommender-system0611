#!/bin/bash

# Start the main server
echo "Starting main server on port 3000..."
node server.js &
MAIN_PID=$!

# Check if main server started
sleep 1
if ! ps -p $MAIN_PID > /dev/null; then
    echo "ERROR: Main server failed to start. Check for errors above."
    exit 1
fi

echo "Starting Python HTTP server on port 8000 (for backward compatibility)..."

# Try python first, then python3 if that fails
if command -v python &> /dev/null; then
    python -m http.server 8000 &
    PYTHON_PID=$!
elif command -v python3 &> /dev/null; then
    python3 -m http.server 8000 &
    PYTHON_PID=$!
else
    echo "ERROR: Neither python nor python3 command found"
    kill $MAIN_PID
    exit 1
fi

# Check if Python server started
sleep 1
if ! ps -p $PYTHON_PID > /dev/null; then
    echo "WARNING: Python HTTP server may not have started properly. The application will still work via the main server."
fi

echo "Servers running. Visit http://localhost:3000/ to use the application."
echo "Press Ctrl+C to stop the servers"

# Handle interrupts to kill both processes
trap "kill $MAIN_PID $PYTHON_PID 2>/dev/null; exit" INT

# Wait for both processes to finish
wait 