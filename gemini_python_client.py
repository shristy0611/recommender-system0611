"""
Python script to interact with Google's Gemini models using the official Python client library
"""

import google.generativeai as genai
import os
from dotenv import load_dotenv  # This requires installation: pip install python-dotenv

# Load environment variables from .env file (we can reuse our existing API key)
load_dotenv()

# Configure the generative AI client with your API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_story():
    """Generate a short story using Gemini 2.0 Flash"""
    try:
        # Create a client instance
        client = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate content
        response = client.generate_content('Tell me a story in 300 words.')
        
        # Print the response text
        print("\n----- GENERATED STORY -----\n")
        print(response.text)
        print("\n----- END OF STORY -----\n")
        
        # Print the response structure
        print("\n----- RESPONSE STRUCTURE -----\n")
        print(response)
        
    except Exception as e:
        print(f"Error: {e}")
        
def get_movie_recommendations(movie_genres, music_genres, additional_prefs=None):
    """Generate movie recommendations based on user preferences"""
    try:
        # Create a client instance
        client = genai.GenerativeModel('gemini-2.0-flash')  # Using the latest model
        
        # Construct the prompt
        prompt = f"""I need movie recommendations for a user with the following preferences:
- Favorite Movie Genres: {movie_genres}
- Favorite Music Genres: {music_genres}
- Additional Preferences: {additional_prefs or 'None specified'}

Please provide a curated list of 10 movie recommendations that match these preferences. For each recommendation, include:
1. The movie title with its release year in parentheses
2. A brief 1-2 sentence explanation of why it matches the user's taste.

Format each recommendation in a clean, consistent way without using markdown or special formatting."""
        
        # Generate content
        response = client.generate_content(prompt)
        
        # Print the response text
        print("\n----- MOVIE RECOMMENDATIONS -----\n")
        print(response.text)
        print("\n----- END OF RECOMMENDATIONS -----\n")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Choose which function to run
    print("What would you like to do?")
    print("1. Generate a short story")
    print("2. Get movie recommendations")
    
    choice = input("Enter your choice (1 or 2): ")
    
    if choice == "1":
        generate_story()
    elif choice == "2":
        movie_genres = input("Enter your favorite movie genres (comma-separated): ")
        music_genres = input("Enter your favorite music genres (comma-separated): ")
        additional_prefs = input("Enter any additional preferences (optional): ")
        get_movie_recommendations(movie_genres, music_genres, additional_prefs)
    else:
        print("Invalid choice. Please run the script again and select 1 or 2.") 