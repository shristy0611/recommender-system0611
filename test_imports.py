#!/usr/bin/env python3
"""
Test script to verify that Python imports are working correctly.
"""
import sys
import os

print("Python version:", sys.version)
print()

try:
    print("Testing import google.generativeai...")
    import google.generativeai as genai
    print("✅ Success: google.generativeai imported correctly")
    
    print("\nTesting import dotenv...")
    from dotenv import load_dotenv
    print("✅ Success: dotenv imported correctly")
    
    print("\nTesting API key loading...")
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        masked_key = f"{api_key[:4]}...{api_key[-4:]}" if len(api_key) > 8 else "***"
        print(f"✅ Success: API key loaded: {masked_key}")
    else:
        print("❌ Error: API key not found in .env file")
    
    print("\nConfiguration test complete. All imports are working correctly.")
    
except ImportError as e:
    print(f"❌ Error: {e}")
    print("\nPlease verify that you have installed all required packages:")
    print("pip install -r requirements_python.txt")

except Exception as e:
    print(f"❌ Unexpected error: {e}") 