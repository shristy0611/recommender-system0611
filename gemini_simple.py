#!/usr/bin/env python3
"""
Simple script to generate content using Gemini 2.0 Flash model
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Configure the Gemini API client with your API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: API key not found in .env file")
    print("Please add your API key to the .env file")
    exit(1)

genai.configure(api_key=api_key)

# Create a client
client = genai.GenerativeModel('gemini-2.0-flash')

# Generate content
print("Generating content using Gemini 2.0 Flash...")
response = client.generate_content('Tell me a story in 300 words.')

# Print the response text
print("\n----- GENERATED STORY -----\n")
print(response.text)
print("\n----- END OF STORY -----\n")

# Print the response structure
print("\n----- RESPONSE STRUCTURE -----\n")
print(response) 