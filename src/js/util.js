/**
 * Utility functions for the application
 */

/**
 * Loads environment variables from the .env file
 * This is a basic implementation for demonstration purposes
 * In a production environment, you would use a proper backend solution
 * 
 * @returns {Object} Environment variables
 */
async function loadEnvVars() {
    try {
        const response = await fetch('/.env');
        if (!response.ok) {
            console.warn('Could not load .env file');
            return {};
        }
        
        const text = await response.text();
        const env = {};
        
        // Parse each line
        text.split('\n').forEach(line => {
            // Skip comments and empty lines
            if (line.trim().startsWith('#') || !line.trim()) {
                return;
            }
            
            // Split on first = character
            const delimiterIndex = line.indexOf('=');
            if (delimiterIndex > 0) {
                const key = line.substring(0, delimiterIndex).trim();
                let value = line.substring(delimiterIndex + 1).trim();
                
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length - 1);
                }
                
                env[key] = value;
            }
        });
        
        return env;
    } catch (error) {
        console.error('Error loading environment variables:', error);
        return {};
    }
}

/**
 * Parses the recommendations from the Gemini API response
 * 
 * @param {Object} responseData The API response data
 * @returns {Object} Parsed recommendations
 */
function parseGeminiResponse(responseData) {
    try {
        // Access the generated text from the response
        const generatedText = responseData.candidates[0].content.parts[0].text;
        
        // Split the text by lines to identify recommendations
        const lines = generatedText.split('\n');
        
        // Initialize array to store recommendations
        const recommendations = [];
        let currentRec = null;
        
        // Regular expressions to identify titles and explanations
        const titleRegex = /^(\d+\.\s*)?(.+)$/i;
        
        // Process each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Check if this line seems like a title (shorter, possibly numbered)
            if (line.length < 100 && titleRegex.test(line) && !currentRec) {
                const matches = line.match(titleRegex);
                currentRec = {
                    title: matches[2].trim(),
                    explanation: ''
                };
            } 
            // If we have a current recommendation and this isn't a new title, 
            // it must be part of the explanation
            else if (currentRec) {
                if (currentRec.explanation) {
                    currentRec.explanation += ' ' + line;
                } else {
                    currentRec.explanation = line;
                }
                
                // If this is the last line or the next line seems like a new title, 
                // add the current recommendation to our list
                if (i === lines.length - 1 || 
                    (i < lines.length - 1 && lines[i + 1].length < 100 && titleRegex.test(lines[i + 1].trim()))) {
                    recommendations.push(currentRec);
                    currentRec = null;
                }
            }
        }
        
        // If we parsed no recommendations, try a different approach
        if (recommendations.length === 0) {
            // Just split the text into three parts as a fallback
            const parts = generatedText.split(/\d+\./);
            for (let i = 1; i < parts.length; i++) { // Start from 1 to skip empty first part
                const part = parts[i].trim();
                if (part) {
                    const firstSentenceEnd = part.indexOf('.');
                    if (firstSentenceEnd > 0) {
                        recommendations.push({
                            title: part.substring(0, firstSentenceEnd).trim(),
                            explanation: part.substring(firstSentenceEnd + 1).trim()
                        });
                    }
                }
            }
        }
        
        return { recommendations };
    } catch (error) {
        console.error('Error parsing Gemini response:', error);
        throw new Error('Failed to parse recommendations from API response');
    }
} 