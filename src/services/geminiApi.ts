import { UserPreferences, Recommendation } from '../types';
import { GeminiRequest, GeminiResponse, RecommendationResponse } from '../types/api';
import { APIError, handleAPIError } from '../utils/errorHandling';
import { API_CONFIG } from '../config/constants';

function createPrompt(preferences: UserPreferences): string {
  const preferencesText = Object.entries(preferences)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `As an AI recommendation expert, analyze these preferences and provide exactly 5 highly personalized recommendations.

User Preferences:
${preferencesText}

Important: Respond with ONLY a valid JSON object following this EXACT format, with no additional text or explanation:
{
  "recommendations": [
    {
      "title": "string",
      "description": "string (max 100 chars)",
      "rating": number (1-5),
      "category": string (movies, books, or food)
    }
  ]
}

Rules:
- Generate exactly 5 recommendations
- Each description must be under 100 characters
- Rating must be between 1 and 5
- Category must be one of: movies, books, food
- Ensure recommendations are highly relevant to the user's preferences
- Include specific, notable titles that can be found on IMDb, Goodreads, or recipe websites`;
}

async function makeGeminiRequest(prompt: string): Promise<GeminiResponse> {
  const request: GeminiRequest = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };

  try {
    const response = await fetch(`${API_CONFIG.GEMINI_URL}?key=${API_CONFIG.GEMINI_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new APIError(
        'Failed to get recommendations',
        response.status,
        await response.text()
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError('Failed to connect to Gemini API', undefined, error);
  }
}

function parseRecommendations(data: GeminiResponse): RecommendationResponse {
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from API');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(parsed.recommendations) || parsed.recommendations.length !== 5) {
      throw new Error('Invalid recommendations format or count');
    }

    parsed.recommendations.forEach((rec: any, index: number) => {
      if (!rec.title || !rec.description || !rec.category || typeof rec.rating !== 'number') {
        throw new Error(`Invalid recommendation format at index ${index}`);
      }
      if (!['movies', 'books', 'food'].includes(rec.category)) {
        rec.category = 'movies';
      }
      if (rec.rating < 1 || rec.rating > 5) {
        rec.rating = Math.max(1, Math.min(5, rec.rating));
      }
    });
    
    return parsed;
  } catch (error) {
    throw new APIError(
      'Failed to parse recommendations',
      undefined,
      error instanceof Error ? error.message : error
    );
  }
}

function enrichRecommendations(recommendations: RecommendationResponse['recommendations']): Recommendation[] {
  return recommendations.map((rec, index) => ({
    ...rec,
    id: `${index + 1}`,
    imageUrl: `https://source.unsplash.com/featured/800x600?${rec.category},${encodeURIComponent(rec.title)}`
  }));
}

export async function getRecommendations(preferences: UserPreferences): Promise<Recommendation[]> {
  try {
    const prompt = createPrompt(preferences);
    const response = await makeGeminiRequest(prompt);
    const { recommendations } = parseRecommendations(response);
    return enrichRecommendations(recommendations);
  } catch (error) {
    console.error('Recommendation error:', error);
    throw handleAPIError(error);
  }
}