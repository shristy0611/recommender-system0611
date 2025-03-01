document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const preferenceForm = document.getElementById('preferenceForm');
    const movieGenresContainer = document.getElementById('movieGenresContainer');
    const musicGenresContainer = document.getElementById('musicGenresContainer');
    const movieGenresInput = document.getElementById('movieGenres');
    const musicGenresInput = document.getElementById('musicGenres');
    const additionalPreferences = document.getElementById('additionalPreferences');
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    const loadingContainer = document.getElementById('loadingContainer');

    // Gemini API Configuration
    // We'll use our proxy server instead of making direct API calls
    const useProxy = true; // Set to true to use the proxy server
    const API_KEY = ''; // Leave this empty since we're using the proxy
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    const PROXY_URL = 'http://localhost:3000/api/gemini';

    // Initialize chip selection for movie genres
    initializeChipSelection(movieGenresContainer, movieGenresInput);
    
    // Initialize chip selection for music genres
    initializeChipSelection(musicGenresContainer, musicGenresInput);

    // Handle form submission
    preferenceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            alert('Please select at least one movie genre and one music genre');
            return;
        }
        
        // Show loading spinner
        loadingContainer.style.display = 'flex';
        
        try {
            // Get recommendations
            const recommendations = await getRecommendations();
            
            // Display recommendations
            displayRecommendations(recommendations);
        } catch (error) {
            console.error('Error getting recommendations:', error);
            displayError();
        } finally {
            // Hide loading spinner
            loadingContainer.style.display = 'none';
        }
    });

    // Function to initialize chip selection
    function initializeChipSelection(container, hiddenInput) {
        const chips = container.querySelectorAll('.chip');
        
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('selected');
                updateSelectedGenres(container, hiddenInput);
            });
        });
    }
    
    // Function to update selected genres in hidden input
    function updateSelectedGenres(container, hiddenInput) {
        const selectedChips = container.querySelectorAll('.chip.selected');
        const selectedGenres = Array.from(selectedChips).map(chip => chip.dataset.genre);
        hiddenInput.value = selectedGenres.join(',');
    }
    
    // Function to validate form
    function validateForm() {
        const selectedMovieGenres = movieGenresInput.value;
        const selectedMusicGenres = musicGenresInput.value;
        
        return selectedMovieGenres !== '' && selectedMusicGenres !== '';
    }
    
    // Function to get recommendations
    async function getRecommendations() {
        // Get form values
        const movieGenres = movieGenresInput.value;
        const musicGenres = musicGenresInput.value;
        const additionalPrefs = additionalPreferences.value;
        
        // Construct the prompt for Gemini
        const prompt = constructPrompt(movieGenres, musicGenres, additionalPrefs);
        
        try {
            console.log('Attempting to call Gemini API...');
            if (useProxy) {
                // When using proxy, we don't need to check for API_KEY
                // as the key is managed on the server side
                return await callGeminiAPIViaProxy(prompt);
            } else {
                // Only check for API key when making direct API calls
                if (!API_KEY) {
                    console.warn('No API key provided for direct API call. Using simulated response.');
                    return simulateGeminiAPICall(prompt);
                }
                return await callGeminiAPI(prompt);
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            // Fall back to simulated response
            return simulateGeminiAPICall(prompt);
        }
    }
    
    // Function to construct the prompt for Gemini
    function constructPrompt(movieGenres, musicGenres, additionalPrefs) {
        return `I need movie recommendations for a user with the following preferences:
- Favorite Movie Genres: ${movieGenres}
- Favorite Music Genres: ${musicGenres}
- Additional Preferences: ${additionalPrefs || 'None specified'}

Please provide a curated list of 10 movie recommendations that match these preferences. For each recommendation, include:
1. The movie title with its release year in parentheses
2. A brief 1-2 sentence explanation of why it matches the user's taste.

IMPORTANT FORMATTING INSTRUCTIONS:
- Format each recommendation as a numbered item (1., 2., etc.)
- Include the movie title with the year in parentheses
- Follow each title with a brief explanation
- Provide consistent formatting for all recommendations
- Do not use markdown formatting
- Do not use special characters or formatting
- Keep your response structured and easy to parse

Example format:
1. Movie Title (YYYY): Brief explanation about why this movie matches the user's preferences.
2. Another Movie (YYYY): Why this movie is recommended based on the user's genres.`;
    }
    
    // Function to call Gemini API via our proxy server
    async function callGeminiAPIViaProxy(prompt) {
        console.log('Using proxy server to call Gemini API');
        console.log('Proxy URL:', PROXY_URL);
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024
            }
        };
        
        console.log('Sending request to proxy server...');
        
        try {
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API response not OK:', response.status, errorText);
                throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }

            // Check if this was a cached response
            const cacheStatus = response.headers.get('X-Cache');
            const isCached = cacheStatus === 'HIT';
            console.log(`Cache status: ${cacheStatus || 'Not specified'}`);
            
            const data = await response.json();
            console.log('Received API response:', data);
            
            // Check if the response contains an error
            if (data.error) {
                console.error('API returned an error:', data.error);
                throw new Error(`API error: ${data.error.message || JSON.stringify(data.error)}`);
            }
            
            // Parse the response to extract recommendations
            const result = parseGeminiResponse(data);
            // Add cache info to result
            return { ...result, cached: isCached };
        } catch (error) {
            console.error('Error calling Gemini API via proxy:', error);
            throw error;
        }
    }
    
    // Function to call Gemini API directly (may have CORS issues)
    async function callGeminiAPI(prompt) {
        const url = `${API_URL}?key=${API_KEY}`;
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024
            }
        };
        
        console.log('Sending request to Gemini API directly...');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API response not OK:', response.status, errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received API response:', data);
        
        // Parse the response to extract recommendations
        return parseGeminiResponse(data);
    }
    
    // Function to parse the Gemini API response
    function parseGeminiResponse(responseData) {
        try {
            // Access the generated text from the response
            const generatedText = responseData.candidates[0].content.parts[0].text;
            console.log('Generated text from API:', generatedText);
            
            // Split the text by lines to identify recommendations
            const lines = generatedText.split('\n');
            
            // Initialize array to store recommendations
            let recommendations = [];
            let currentRec = null;
            
            // Regular expressions to identify titles and explanations
            // This regex looks for lines that start with optional numbers or bullets and captures the title
            const titleRegex = /^(?:\d+\.)?\s*(?:\*\*)?(.*?)(?:\*\*)?(?:\s*\(\d{4}\))?:\s*(.*)$/i;
            // This alternative regex looks for titles with years in parentheses
            const titleWithYearRegex = /^(?:\d+\.)?\s*(?:\*\*)?(.*?)\s*\((\d{4})\)(?:\*\*)?:\s*(.*)$/i;
            
            // Process each line
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Skip empty lines
                if (!line) continue;
                
                // Check for title patterns
                const titleMatch = line.match(titleRegex);
                const titleWithYearMatch = line.match(titleWithYearRegex);
                
                // If this line looks like a title and we don't have an active recommendation
                if ((titleMatch || titleWithYearMatch) && !currentRec) {
                    // If we found a title with year
                    if (titleWithYearMatch) {
                        currentRec = {
                            title: `${titleWithYearMatch[1].trim()} (${titleWithYearMatch[2]})`,
                            explanation: titleWithYearMatch[3] ? titleWithYearMatch[3].trim() : ''
                        };
                    } 
                    // If we found a regular title
                    else if (titleMatch) {
                        currentRec = {
                            title: titleMatch[1].trim(),
                            explanation: titleMatch[2] ? titleMatch[2].trim() : ''
                        };
                    }
                } 
                // If we have a current recommendation and this isn't a new title, 
                // it must be part of the explanation
                else if (currentRec && !(titleMatch || titleWithYearMatch)) {
                    if (currentRec.explanation) {
                        currentRec.explanation += ' ' + line;
                    } else {
                        currentRec.explanation = line;
                    }
                    
                    // If this is the last line or the next line seems like a new title, 
                    // add the current recommendation to our list
                    if (i === lines.length - 1 || 
                        (i < lines.length - 1 && 
                         (lines[i + 1].match(titleRegex) || lines[i + 1].match(titleWithYearRegex)))) {
                        // Clean up explanation - remove any markdown formatting
                        currentRec.explanation = currentRec.explanation.replace(/\*\*/g, '').replace(/\*/g, '');
                        recommendations.push(currentRec);
                        currentRec = null;
                    }
                }
            }
            
            // If we still have a pending recommendation, add it
            if (currentRec && currentRec.title) {
                currentRec.explanation = currentRec.explanation.replace(/\*\*/g, '').replace(/\*/g, '');
                recommendations.push(currentRec);
            }
            
            // If we parsed no recommendations or fewer than expected, try a different approach
            if (recommendations.length < 3) {
                console.log('Fallback parsing method for recommendations');
                
                // Try to extract recommendations based on numbered sections
                let alternativeRecs = [];
                
                // Method 1: Look for numbered items with year in parentheses
                const betterNumberedItemRegex = /(\d+\.)\s+(.*?)\s*\((\d{4})\):\s*(.*?)(?=\n\d+\.|\n*$)/gs;
                const betterMatches = [...generatedText.matchAll(betterNumberedItemRegex)];
                
                if (betterMatches.length >= 3) {
                    for (const match of betterMatches) {
                        const title = `${match[2].trim()} (${match[3]})`;
                        const explanation = match[4].trim();
                        
                        alternativeRecs.push({
                            title: title.replace(/\*\*/g, '').replace(/\*/g, ''),
                            explanation: explanation || 'This movie matches your preferences.'
                        });
                    }
                }
                
                // Method 2: Look for regular numbered items
                if (alternativeRecs.length < 3) {
                    const numberedItemRegex = /(\d+\.)\s+(.*?)(?=\n\d+\.|\n*$)/gs;
                    const numberedMatches = [...generatedText.matchAll(numberedItemRegex)];
                    
                    if (numberedMatches.length >= 3) {
                        for (const match of numberedMatches) {
                            const fullText = match[2].trim();
                            // Try to split title and explanation by colon
                            const colonIndex = fullText.indexOf(':');
                            if (colonIndex > 0) {
                                let title = fullText.substring(0, colonIndex).trim();
                                let explanation = fullText.substring(colonIndex + 1).trim();
                                
                                // Look for year pattern in the title
                                const yearMatch = title.match(/^(.*?)\s*\((\d{4})\)$/);
                                if (yearMatch) {
                                    title = `${yearMatch[1].trim()} (${yearMatch[2]})`;
                                }
                                
                                alternativeRecs.push({
                                    title: title.replace(/\*\*/g, '').replace(/\*/g, ''),
                                    explanation: explanation || 'This movie matches your preferences.'
                                });
                            } else {
                                // If we can't find a colon, try to split by the first period
                                const firstSentenceEnd = fullText.indexOf('.');
                                if (firstSentenceEnd > 0) {
                                    let title = fullText.substring(0, firstSentenceEnd + 1).trim();
                                    let explanation = fullText.substring(firstSentenceEnd + 1).trim();
                                    
                                    // Look for year pattern in the title
                                    const yearMatch = title.match(/^(.*?)\s*\((\d{4})\).*$/);
                                    if (yearMatch) {
                                        title = `${yearMatch[1].trim()} (${yearMatch[2]})`;
                                    }
                                    
                                    alternativeRecs.push({
                                        title: title.replace(/\*\*/g, '').replace(/\*/g, ''),
                                        explanation: explanation || 'This movie matches your preferences.'
                                    });
                                } else {
                                    // If we can't find a sentence end, use the whole text as title
                                    alternativeRecs.push({
                                        title: fullText.replace(/\*\*/g, '').replace(/\*/g, ''),
                                        explanation: 'This movie matches your preferences.'
                                    });
                                }
                            }
                        }
                    }
                }
                
                // Method 3: Split by double newlines
                if (alternativeRecs.length < 3) {
                    const paragraphs = generatedText.split(/\n\n+/);
                    for (const paragraph of paragraphs) {
                        if (paragraph.trim() && !paragraph.toLowerCase().includes('recommendation')) {
                            const lines = paragraph.split('\n');
                            // First line might be the title
                            if (lines.length > 0) {
                                // Try to find title with colon and explanation
                                const firstLine = lines[0].trim();
                                const colonIndex = firstLine.indexOf(':');
                                
                                if (colonIndex > 0) {
                                    let title = firstLine.substring(0, colonIndex).trim().replace(/^\d+\.\s*/, '');
                                    let explanation = firstLine.substring(colonIndex + 1).trim();
                                    
                                    // Add additional lines to explanation if available
                                    if (lines.length > 1) {
                                        explanation += ' ' + lines.slice(1).join(' ').trim();
                                    }
                                    
                                    // Look for year pattern in the title
                                    const yearMatch = title.match(/^(.*?)\s*\((\d{4})\)$/);
                                    if (yearMatch) {
                                        title = `${yearMatch[1].trim()} (${yearMatch[2]})`;
                                    }
                                    
                                    if (title) {
                                        alternativeRecs.push({
                                            title: title.replace(/\*\*/g, '').replace(/\*/g, ''),
                                            explanation: explanation || 'This movie matches your preferences.'
                                        });
                                    }
                                } else {
                                    const title = firstLine.replace(/^\d+\.\s*/, '').trim();
                                    const explanation = lines.slice(1).join(' ').trim();
                                    
                                    if (title) {
                                        alternativeRecs.push({
                                            title: title.replace(/\*\*/g, '').replace(/\*/g, ''),
                                            explanation: explanation || 'This movie matches your preferences.'
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                
                // Use the alternative recommendations if they're better
                if (alternativeRecs.length > recommendations.length) {
                    recommendations = alternativeRecs;
                }
            }
            
            // Final sanity check - make sure all recommendations have decent explanations
            for (let i = 0; i < recommendations.length; i++) {
                if (!recommendations[i].explanation || recommendations[i].explanation.length < 10) {
                    recommendations[i].explanation = 'This movie matches your selected genres and preferences.';
                }
            }
            
            console.log('Parsed recommendations:', recommendations);
            return { recommendations, simulated: false };
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            throw new Error('Failed to parse recommendations from API response');
        }
    }
    
    // Function to simulate Gemini API call (fallback)
    function simulateGeminiAPICall(prompt) {
        // Log the prompt that would be sent to the API
        console.log('Using SIMULATED response with prompt:', prompt);
        
        // Simulate API delay
        return new Promise(resolve => {
            setTimeout(() => {
                // Sample response with 10 recommendations
                resolve({
                    recommendations: [
                        {
                            title: "The Matrix (1999)",
                            explanation: "This sci-fi action film blends mind-bending concepts with spectacular action sequences. The film's philosophical undertones and groundbreaking visual effects would appeal to someone who enjoys both thought-provoking narratives and high-energy storytelling."
                        },
                        {
                            title: "Baby Driver (2017)",
                            explanation: "This action-comedy features meticulously choreographed scenes set to an eclectic soundtrack spanning multiple music genres. The film's unique approach to integrating music into the narrative would resonate with someone who has diverse musical tastes."
                        },
                        {
                            title: "Inception (2010)",
                            explanation: "This thrilling sci-fi adventure combines complex storytelling with visually stunning action sequences. The film's intricate plot and emotional core would appeal to viewers who appreciate layered narratives with a mix of thoughtful concepts and exciting moments."
                        },
                        {
                            title: "The Lord of the Rings: The Fellowship of the Ring (2001)",
                            explanation: "This epic fantasy adventure brings Tolkien's world to life with stunning visuals and an emotional story. The film's sweeping score and grand themes align with both fantasy genre preferences and musical appreciation."
                        },
                        {
                            title: "Guardians of the Galaxy (2014)",
                            explanation: "This Marvel superhero film stands out for its fantastic soundtrack featuring classic rock and pop hits. The perfect blend of action, humor, and music makes it ideal for viewers with diverse genre interests."
                        },
                        {
                            title: "La La Land (2016)",
                            explanation: "This musical romantic drama celebrates creativity and passion. Its award-winning score and emotional storytelling would appeal to those who appreciate both musical composition and character-driven narratives."
                        },
                        {
                            title: "Mad Max: Fury Road (2015)",
                            explanation: "This high-octane action film is essentially a two-hour chase sequence set to an intense orchestral score. The film's visual storytelling and rhythmic editing make it feel almost like a feature-length music video."
                        },
                        {
                            title: "Interstellar (2014)",
                            explanation: "This sci-fi epic features a powerful Hans Zimmer score that drives the emotional core of the story. The film's blend of scientific concepts and human emotion would appeal to viewers who enjoy thoughtful sci-fi."
                        },
                        {
                            title: "Whiplash (2014)",
                            explanation: "This intense drama about a jazz drummer and his demanding instructor is perfect for music lovers. The film's exploration of musical excellence and personal sacrifice resonates with anyone passionate about music."
                        },
                        {
                            title: "Scott Pilgrim vs. The World (2010)",
                            explanation: "This unique action-comedy blends video game aesthetics with indie rock music. The film's eclectic soundtrack and visual style make it a perfect recommendation for viewers with diverse entertainment interests."
                        }
                    ],
                    simulated: true
                });
            }, 1500);
        });
    }
    
    // Function to display recommendations
    function displayRecommendations(data) {
        const { recommendations, simulated, cached } = data;
        
        // Get the recommendations container
        const container = document.getElementById('recommendationsContainer');
        container.innerHTML = '';
        
        // Create a header for the recommendations
        const header = document.createElement('div');
        header.className = 'recommendations-header';
        header.innerHTML = `<h2>Your Personalized Movie Recommendations</h2>`;
        
        // Add a badge if the response was simulated or cached
        if (simulated || cached) {
            const badge = document.createElement('span');
            badge.className = simulated ? 'badge simulated' : 'badge cached';
            badge.innerText = simulated ? 'Simulated' : 'Cached';
            header.appendChild(badge);
        }
        
        container.appendChild(header);
        
        // Create a list for the recommendations
        const list = document.createElement('div');
        list.className = 'recommendations-list';
        
        // Add each recommendation to the list
        recommendations.forEach((rec, index) => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            
            const title = document.createElement('div');
            title.className = 'recommendation-title';
            title.innerText = `${index + 1}. ${rec.title}`;
            
            const description = document.createElement('div');
            description.className = 'recommendation-description';
            description.innerText = rec.explanation;
            
            item.appendChild(title);
            item.appendChild(description);
            list.appendChild(item);
        });
        
        container.appendChild(list);
        
        // Scroll to the recommendations
        container.scrollIntoView({ behavior: 'smooth' });
        
        // Refresh the cache statistics after getting recommendations
        if (typeof loadCacheStats === 'function') {
            loadCacheStats();
        }
    }
    
    // Function to display error
    function displayError() {
        recommendationsContainer.innerHTML = `
            <div class="error-message">
                <p>Sorry, we encountered an error while generating your recommendations. Please try again later.</p>
            </div>
        `;
    }
}); 