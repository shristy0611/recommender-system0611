#!/usr/bin/env python3
"""
Gemini API Context Caching Example

This script demonstrates how to use context caching with the Gemini API
to improve performance and reduce costs when making multiple queries
about the same content.
"""

import os
import time
from datetime import datetime, timedelta
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure the Gemini API client with your API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: API key not found in .env file")
    print("Please add your API key to the .env file")
    exit(1)
    
genai.configure(api_key=api_key)

def create_cached_content(content_text, model_name="gemini-2.0-flash"):
    """
    Create a cached content resource that can be reused in multiple requests
    
    Args:
        content_text: The text content to cache
        model_name: The Gemini model to use
        
    Returns:
        The cached content resource object
    """
    print(f"Creating cached content using {model_name}...")
    
    # Create a client that can access the CachedContent API
    client = genai.Client()
    
    # Set up the content to cache
    content = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": content_text}]
            }
        ],
        "model": f"models/{model_name}",
        # Set cache to expire in 24 hours
        "ttl": "86400s",
        "displayName": f"Movie analysis cache {datetime.now().strftime('%Y-%m-%d-%H-%M-%S')}"
    }
    
    # Create the cached content resource
    cached_content = client.cached_contents.create(content)
    
    print(f"Created cached content: {cached_content.name}")
    print(f"Display name: {cached_content.display_name}")
    print(f"Expires: {cached_content.expire_time}")
    
    return cached_content

def list_cached_contents():
    """List all cached contents in your project"""
    print("\nListing all cached contents:")
    
    client = genai.Client()
    cached_contents = client.cached_contents.list()
    
    for content in cached_contents.cached_contents:
        print(f"- {content.name}: {content.display_name} (Expires: {content.expire_time})")
    
    return cached_contents.cached_contents

def generate_with_cached_content(cached_content_name, prompt):
    """
    Generate content using a cached content resource
    
    Args:
        cached_content_name: The full resource name of the cached content
        prompt: The prompt to send with the cached content
        
    Returns:
        The generated response
    """
    print(f"\nGenerating with cached content: {cached_content_name}")
    print(f"Prompt: '{prompt}'")
    
    # Create a client that can generate content
    client = genai.Client()
    
    # Prepare the generation request using the cached content
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 1024,
    }
    
    # Create the request with the cached content name in the request
    response = client.generate_content(
        model="models/gemini-2.0-flash",
        contents=[{"role": "user", "parts": [{"text": prompt}]}],
        generation_config=generation_config,
        cached_content=cached_content_name
    )
    
    print("\nResponse:")
    print(response.text)
    
    return response

def delete_cached_content(cached_content_name):
    """Delete a cached content resource"""
    print(f"\nDeleting cached content: {cached_content_name}")
    
    client = genai.Client()
    client.cached_contents.delete(cached_content_name)
    
    print("Deleted successfully")

def update_cached_content_expiry(cached_content_name, new_ttl="604800s"):  # 7 days
    """Update the expiration time of a cached content resource"""
    print(f"\nUpdating expiry time for: {cached_content_name}")
    
    client = genai.Client()
    
    # Get the current cached content
    cached_content = client.cached_contents.get(cached_content_name)
    
    # Update the TTL
    updated_content = client.cached_contents.patch(
        cached_content_name=cached_content_name,
        cached_content={"ttl": new_ttl},
        update_mask=["ttl"]
    )
    
    print(f"Updated expiry time to: {updated_content.expire_time}")
    
    return updated_content

def run_caching_demo():
    """Run a complete demo of the caching functionality"""
    # Movie script/content to cache (simplified for the example)
    movie_content = """
    The Godfather is a 1972 American crime film directed by Francis Ford Coppola.
    It stars Marlon Brando as the powerful patriarch of the Corleone crime family.
    The story spans 10 years from 1945 to 1955, focusing on the transformation of 
    Michael Corleone from reluctant family outsider to ruthless mafia boss.
    
    Key characters:
    - Vito Corleone: The aging patriarch of the crime family
    - Michael Corleone: Vito's youngest son who initially wanted nothing to do with the family business
    - Sonny Corleone: The hot-headed eldest son
    - Tom Hagen: The family's consigliere (advisor) and adopted son of Vito
    - Kay Adams: Michael's girlfriend and eventual wife
    
    The film is known for famous lines like "I'm gonna make him an offer he can't refuse"
    and the iconic scene with the horse's head in a Hollywood producer's bed.
    """
    
    try:
        # 1. Create cached content
        cached_content = create_cached_content(movie_content)
        cached_content_name = cached_content.name
        
        # 2. List all cached contents
        all_cached_contents = list_cached_contents()
        
        # 3. Make multiple queries using the same cached content
        print("\n=== Making multiple queries with cached content ===")
        
        # First query
        start_time = time.time()
        generate_with_cached_content(
            cached_content_name, 
            "Who is the main character in this movie and what's their character arc?"
        )
        first_query_time = time.time() - start_time
        print(f"First query time: {first_query_time:.2f} seconds")
        
        # Second query
        start_time = time.time()
        generate_with_cached_content(
            cached_content_name, 
            "What are some of the famous quotes from this movie?"
        )
        second_query_time = time.time() - start_time
        print(f"Second query time: {second_query_time:.2f} seconds")
        
        # 4. Update the cached content expiry (to 7 days)
        update_cached_content_expiry(cached_content_name)
        
        # 5. Optional: Clean up by deleting the cached content
        # Uncomment this if you want to delete the cache after running the demo
        # delete_cached_content(cached_content_name)
        
    except Exception as e:
        print(f"Error in cache demo: {e}")

if __name__ == "__main__":
    print("=== Gemini API Context Caching Demo ===")
    run_caching_demo()
    print("\n=== Demo completed ===") 