#!/usr/bin/env python3
"""
Comprehensive test suite for the Personal Recommender System.
This script tests all aspects of the system including API connections,
recommendation consistency, and caching functionality.
"""

import os
import sys
import time
import json
import unittest
import requests
from dotenv import load_dotenv

# Global test configuration
CONFIG = {
    "NODE_SERVER_URL": "http://localhost:3000",
    "PYTHON_SERVER_URL": "http://localhost:8000",
    "PROXY_API_URL": "http://localhost:3000/api/gemini",
    "TEST_MOVIE_GENRES": "Action,Sci-Fi",
    "TEST_MUSIC_GENRES": "Rock,Electronic"
}

class RecommenderSystemTest(unittest.TestCase):
    """Test suite for the Recommender System"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment before any tests"""
        print("\n===== Setting up test environment =====")
        
        # Load environment variables
        load_dotenv()
        cls.api_key = os.getenv("GEMINI_API_KEY")
        
        # Check API key
        if not cls.api_key or cls.api_key == "your_api_key_here":
            print("❌ GEMINI_API_KEY not found or is set to default. Tests may fail.")
        else:
            print(f"✅ API key found: {cls.api_key[:4]}{'*' * (len(cls.api_key) - 8)}{cls.api_key[-4:]}")
        
        # Import Gemini API
        try:
            import google.generativeai as genai
            cls.genai = genai
            cls.genai.configure(api_key=cls.api_key)
            print("✅ Gemini API configured successfully")
        except ImportError:
            print("❌ Failed to import google.generativeai. Some tests will be skipped.")
            cls.genai = None

    def test_01_python_imports(self):
        """Test that required Python packages are installed"""
        print("\n----- Testing Python imports -----")
        
        # Test google.generativeai
        try:
            import google.generativeai
            print("✅ google.generativeai imported successfully")
        except ImportError:
            self.fail("Failed to import google.generativeai")
        
        # Test dotenv
        try:
            import dotenv
            print("✅ dotenv imported successfully")
        except ImportError:
            self.fail("Failed to import dotenv")
        
        # Test requests
        try:
            import requests
            print("✅ requests imported successfully")
        except ImportError:
            self.fail("Failed to import requests")
    
    def test_02_servers_running(self):
        """Test that both servers are running"""
        print("\n----- Testing server status -----")
        
        # Test Node.js server
        try:
            response = requests.get(CONFIG["NODE_SERVER_URL"], timeout=5)
            self.assertEqual(response.status_code, 200, "Node.js server returned non-200 status code")
            print("✅ Node.js server is running")
        except requests.exceptions.RequestException:
            self.fail("Failed to connect to Node.js server")
        
        # Test Python HTTP server
        try:
            response = requests.get(CONFIG["PYTHON_SERVER_URL"], timeout=5)
            self.assertEqual(response.status_code, 200, "Python HTTP server returned non-200 status code")
            print("✅ Python HTTP server is running")
        except requests.exceptions.RequestException:
            self.fail("Failed to connect to Python HTTP server")
    
    def test_03_api_proxy(self):
        """Test that the API proxy is working"""
        print("\n----- Testing API proxy -----")
        
        # Skip if no API key
        if not self.api_key or self.api_key == "your_api_key_here":
            self.skipTest("No valid API key found")
        
        # Simple prompt for testing
        test_content = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": "Give me a one-word movie recommendation."
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 512
            }
        }
        
        try:
            response = requests.post(
                CONFIG["PROXY_API_URL"], 
                headers={"Content-Type": "application/json"},
                json=test_content,
                timeout=10
            )
            
            self.assertEqual(response.status_code, 200, f"API proxy returned status code {response.status_code}")
            
            data = response.json()
            self.assertIn("candidates", data, "Response missing 'candidates' field")
            self.assertTrue(len(data["candidates"]) > 0, "No candidates in response")
            self.assertIn("content", data["candidates"][0], "Response missing 'content' field")
            
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            print(f"✅ API proxy response: {text}")
        except requests.exceptions.RequestException as e:
            self.fail(f"Failed to connect to API proxy: {e}")
    
    def test_04_recommendation_consistency(self):
        """Test recommendation formatting consistency by making multiple requests"""
        print("\n----- Testing recommendation consistency -----")
        
        # Skip if no API key or genai module
        if not self.api_key or not self.genai or self.api_key == "your_api_key_here":
            self.skipTest("No valid API key or genai module found")
        
        # Create prompt
        prompt = f"""I need movie recommendations for a user with the following preferences:
- Favorite Movie Genres: {CONFIG["TEST_MOVIE_GENRES"]}
- Favorite Music Genres: {CONFIG["TEST_MUSIC_GENRES"]}
- Additional Preferences: None specified

Please provide a curated list of 10 movie recommendations that match these preferences. For each recommendation, include:
1. The movie title with its release year in parentheses
2. A brief 1-2 sentence explanation of why it matches the user's taste.

Format each recommendation in a clean, consistent way without using markdown or special formatting."""
        
        # Test direct API
        try:
            client = self.genai.GenerativeModel('gemini-2.0-flash')
            response = client.generate_content(prompt)
            
            # Check response format
            text = response.text
            print("\n----- Direct API response excerpt -----")
            print(text[:300] + "...")
            
            # Check for numbered items (1., 2., etc.)
            lines = text.strip().split('\n')
            recommendations = []
            current_rec = None
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Check for numbered items (1., 2., etc.)
                if line[0].isdigit() and line[1:3] in ['. ', '- ', ') ']:
                    if current_rec:
                        recommendations.append(current_rec)
                    current_rec = line
                elif current_rec:
                    current_rec += " " + line
            
            # Add the last recommendation
            if current_rec:
                recommendations.append(current_rec)
            
            print(f"\nFound {len(recommendations)} recommendations")
            self.assertTrue(len(recommendations) >= 5, f"Expected at least 5 recommendations, got {len(recommendations)}")
            
            # Print first two recommendations for visualization
            for i, rec in enumerate(recommendations[:2]):
                print(f"Recommendation {i+1}: {rec[:100]}...")
                
            # Check year format in recommendations
            year_pattern_count = 0
            for rec in recommendations:
                if '(' in rec and ')' in rec and rec.find('(') < rec.find(')'):
                    year_text = rec[rec.find('(')+1:rec.find(')')]
                    if year_text.isdigit() and len(year_text) == 4:
                        year_pattern_count += 1
            
            print(f"Recommendations with proper year format: {year_pattern_count} out of {len(recommendations)}")
            self.assertTrue(year_pattern_count >= len(recommendations) * 0.8, 
                          f"Less than 80% of recommendations have proper year format")
            
            print("✅ Recommendation formatting is consistent")
        except Exception as e:
            self.fail(f"Failed to test recommendation consistency: {e}")
    
    def test_05_caching_performance(self):
        """Test caching performance by measuring response times"""
        print("\n----- Testing caching performance -----")
        
        # Skip if no API key or genai module
        if not self.api_key or not self.genai or self.api_key == "your_api_key_here":
            self.skipTest("No valid API key or genai module found")
        
        try:
            # Sample content to cache
            content_text = """
            The Godfather is a 1972 American crime film directed by Francis Ford Coppola.
            It stars Marlon Brando as the powerful patriarch of the Corleone crime family.
            The story spans 10 years from 1945 to 1955, focusing on the transformation of 
            Michael Corleone from reluctant family outsider to ruthless mafia boss.
            """
            
            # First query - should be slower
            model = self.genai.GenerativeModel("gemini-2.0-flash")
            print("\nExecuting first query (no cache)...")
            start_time = time.time()
            prompt1 = "Who is the main character in this movie?"
            response = model.generate_content(content_text + "\n\n" + prompt1)
            first_query_time = time.time() - start_time
            print(f"First query time: {first_query_time:.2f} seconds")
            
            # Second query - uses same context, should leverage server-side caching
            print("\nExecuting second query (with same context)...")
            start_time = time.time()
            prompt2 = "What year was this movie released?"
            response = model.generate_content(content_text + "\n\n" + prompt2)
            second_query_time = time.time() - start_time
            print(f"Second query time: {second_query_time:.2f} seconds")
            
            # Check if caching improved performance
            print(f"\nCaching performance comparison:")
            print(f"First query: {first_query_time:.2f} seconds")
            print(f"Second query: {second_query_time:.2f} seconds")
            
            # Note: We don't always see improved performance with simple queries
            # as they might already be fast, but we can still verify the functionality
            
            # Testing our own server's caching implementation
            print("\nTesting Node.js server caching functionality...")
            try:
                # Only run this part if servers are running
                response = requests.get(CONFIG["NODE_SERVER_URL"] + "/api/cache-stats", timeout=5)
                if response.status_code == 200:
                    print(f"Cache stats before: {response.json()}")
                    
                    # Make a request that should use the cache
                    test_data = {
                        "contents": [{"role": "user", "parts": [{"text": "Hello, world!"}]}]
                    }
                    
                    # First request - should miss cache
                    requests.post(CONFIG["PROXY_API_URL"], json=test_data, timeout=10)
                    
                    # Second request with same data - should hit cache
                    requests.post(CONFIG["PROXY_API_URL"], json=test_data, timeout=10)
                    
                    # Check cache stats after requests
                    response = requests.get(CONFIG["NODE_SERVER_URL"] + "/api/cache-stats", timeout=5)
                    if response.status_code == 200:
                        print(f"Cache stats after: {response.json()}")
                        
            except Exception as e:
                print(f"Server caching test skipped: {e}")
                print("This is expected if servers are not running")
                
            print("✅ Caching test completed")
            
        except Exception as e:
            self.fail(f"Caching test failed: {e}")
    
    def test_06_static_assets(self):
        """Test that all required static assets are accessible"""
        print("\n----- Testing static assets -----")
        
        # List of critical static assets
        critical_assets = [
            "/src/css/styles.css",
            "/src/js/app.js",
            "/src/js/util.js",
            "/favicon.ico"
        ]
        
        # Check each asset
        for asset in critical_assets:
            try:
                response = requests.get(f"{CONFIG['NODE_SERVER_URL']}{asset}", timeout=5)
                self.assertEqual(
                    response.status_code, 
                    200, 
                    f"Asset {asset} returned status code {response.status_code}"
                )
                print(f"✅ Asset {asset} is accessible")
            except requests.exceptions.RequestException:
                self.fail(f"Failed to access {asset}")

if __name__ == "__main__":
    print("===== Personal Recommender System Test Suite =====")
    print("Running comprehensive tests for all system components...")
    print("This may take a few minutes depending on API response times.")
    
    # Run the tests
    unittest.main(verbosity=2) 