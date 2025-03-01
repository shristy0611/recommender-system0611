#!/bin/bash

echo "===== Personal Recommender System Setup ====="
echo "This script will set up all components of the system."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip is not installed. Please install pip and try again."
    exit 1
fi

echo ""
echo "===== Setting up Python environment ====="
echo "Creating Python virtual environment..."

# Create Python virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "Virtual environment created."
else
    echo "Virtual environment already exists."
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements_python.txt

# Verify Google Generative AI package is installed
echo "Verifying Google Generative AI package..."
if python -c "import google.generativeai" 2>/dev/null; then
    echo "Google Generative AI package verified."
else
    echo "Installing Google Generative AI package directly..."
    pip install google-generativeai
    
    # Verify again
    if python -c "import google.generativeai" 2>/dev/null; then
        echo "Google Generative AI package installed successfully."
    else
        echo "ERROR: Failed to install Google Generative AI package. Please try manually:"
        echo "pip install google-generativeai"
        exit 1
    fi
fi

echo ""
echo "===== Setting up environment variables ====="

# Check if .env file exists, if not, create it from .env.example
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "Creating .env file from .env.example..."
        cp .env.example .env
        echo "Please edit the .env file to add your Gemini API key."
    else
        echo "Creating new .env file..."
        echo "# Gemini API Key" > .env
        echo "# Get your API key from https://makersuite.google.com/app/apikey" >> .env
        echo "GEMINI_API_KEY=your_api_key_here" >> .env
        echo "Please edit the .env file to add your Gemini API key."
    fi
else
    echo ".env file already exists."
fi

echo ""
echo "===== Testing API key ====="
API_KEY=$(grep -o 'GEMINI_API_KEY=.*' .env | cut -d'=' -f2)

if [ "$API_KEY" = "your_api_key_here" ] || [ -z "$API_KEY" ]; then
    echo "WARNING: API key not found or using default value."
    echo "Please edit the .env file and add your Gemini API key."
else
    echo "API key found in .env file."
fi

echo ""
echo "===== Setting up executable permissions ====="
echo "Making scripts executable..."
chmod +x start.sh gemini_python_client.py gemini_simple.py gemini_caching_example.py

echo ""
echo "===== Setup Complete ====="
echo ""
echo "To run the recommender system:"
echo "1. Start the servers: ./start.sh"
echo "2. Access the web interface: http://localhost:3000/"
echo ""
echo "To run Python examples:"
echo "- Make sure to activate the virtual environment first:"
echo "  source .venv/bin/activate"
echo "- Then run any script:"
echo "  python gemini_python_client.py"
echo "  python gemini_simple.py"
echo "  python gemini_caching_example.py"
echo ""
echo "Enjoy your Personal Recommender System!" 