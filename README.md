# Personal Recommender System

A frontend application that provides personalized movie recommendations based on user preferences using the Gemini LLM API.

## Features

- Select movie and music genres through an intuitive chip-based interface
- Add additional preferences to get more personalized recommendations
- Receive AI-powered recommendations tailored to your taste
- Responsive design that works on desktop and mobile devices
- Python scripts for direct Gemini API interaction (alternative to the web interface)
- Advanced Gemini API features including context caching for improved performance

## Project Structure

```
recommender-system/
├── index.html                # Main HTML file
├── server.js                 # Node.js proxy server for API requests
├── start.sh                  # Script to start both servers
├── setup.sh                  # Complete setup script for all components
├── run_all.sh                # One-click script to run everything properly
├── gemini_python_client.py   # Interactive Python client for Gemini API
├── gemini_simple.py          # Simple Python script for Gemini API
├── gemini_caching_example.py # Example demonstrating Gemini API caching
├── gemini_caching_guide.md   # Comprehensive guide to Gemini API caching
├── requirements_python.txt   # Python dependencies
├── src/                      # Source code directory
│   ├── css/                  # CSS stylesheets
│   │   └── styles.css        # Main stylesheet
│   └── js/                   # JavaScript files
│       ├── app.js            # Main application logic
│       └── util.js           # Utility functions
├── .env.example              # Example environment variables
├── README.md                 # Project documentation
```

## Implementation Details

This project demonstrates:

1. **Modern UI Components**: Chip-based selection, loading animations, and responsive design
2. **Preference Collection**: User can select movie genres, music genres, and add additional preferences
3. **Dynamic Prompt Building**: Creates a structured prompt based on user input
4. **API Integration**: Connects to the Gemini LLM API through a proxy server
5. **Recommendation Display**: Shows personalized recommendations with explanations
6. **Python Integration**: Alternative Python scripts for direct API interaction

## Current Limitations

- No data persistence - preferences are not saved between sessions.
- Basic proxy server implementation - in a production environment, you would use a more robust solution

## Getting Started

### Prerequisites

- Node.js installed on your system
- Python 3.6+ installed on your system
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Easiest Setup (Recommended)

We've created a simple one-click solution to set up and run everything:

1. Make sure the setup script is executable:
   ```bash
   chmod +x setup.sh run_all.sh
   ```

2. Run the comprehensive startup script:
   ```bash
   ./run_all.sh
   ```

This script will:
- Check and install all required dependencies
- Set up the Python virtual environment
- Configure your API key
- Start all servers
- Verify everything is working correctly

3. Open your browser and go to:
   ```
   http://localhost:3000/
   ```

### Manual Setup (Alternative)

If you prefer to set up components manually:

1. Run the setup script to install dependencies:
   ```bash
   ./setup.sh
   ```

2. Copy `.env.example` to `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the start script to launch both servers:
   ```bash
   ./start.sh
   ```

4. Open your browser and go to:
   ```
   http://localhost:3000/
   ```

### Troubleshooting

- If you see "Using simulated recommendations" message, check that:
  - Your API key is correctly set in the .env file
  - Both servers are running properly
  - There are no CORS or network errors in your browser's developer console

- If you encounter port conflicts, you can edit the server.js and start.sh files to use different ports.

### Using the Python Scripts

When using the Python scripts:

1. Make sure the Python virtual environment is activated:
   ```bash
   source .venv/bin/activate
   ```

2. Then run any script:
   ```bash
   python gemini_python_client.py
   python gemini_simple.py
   python gemini_caching_example.py
   ```

In addition to the web interface, you can use the provided Python scripts to interact with the Gemini API directly:

1. Install the required Python packages:
   ```bash
   pip install -r requirements_python.txt
   ```

2. Run the interactive script:
   ```bash
   python gemini_python_client.py
   ```
   This script provides an interactive interface to:
   - Generate a short story
   - Get movie recommendations based on your preferences

3. Or run the simple script:
   ```bash
   python gemini_simple.py
   ```
   This script directly calls the Gemini 2.0 Flash model with a prompt to generate a 300-word story.

4. To explore advanced Gemini API caching:
   ```bash
   python gemini_caching_example.py
   ```
   This script demonstrates how to:
   - Create cached content for reuse across multiple queries
   - List, update, and manage cached content
   - Measure performance improvements with caching

5. For more details on caching, refer to the guide:
   ```bash
   cat gemini_caching_guide.md
   ```
   The guide covers caching concepts, best practices, and API usage.

Both Python scripts use the same API key from your `.env` file, so no additional setup is required if you've already configured the web application.

### Troubleshooting Python Scripts

- If you encounter import errors, ensure you've installed all dependencies:
  ```bash
  pip install -r requirements_python.txt
  ```

- If you see authentication errors, check that your `.env` file contains a valid API key:
  ```
  GEMINI_API_KEY=your_api_key_here
  ```

## Security Considerations

The current implementation uses a simple proxy server to protect your API key from being exposed in client-side code. For a production deployment, consider:

- Using a more robust proxy solution
- Setting up a serverless function (e.g., AWS Lambda, Vercel Functions)
- Implementing rate limiting and additional security measures

## Future Enhancements

- Improve security through a more robust proxy
- Add user preference saving (local storage)
- Expand recommendation categories beyond movies
- Add ability to save favorite recommendations
- Implement more sophisticated prompt engineering
- Expand the Python integration with additional features
- Implement context caching in the web interface for performance improvements

## License

MIT License 