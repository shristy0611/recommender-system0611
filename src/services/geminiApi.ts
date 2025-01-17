import { UserPreferences, Recommendation } from '../types';
import { APIError } from '../utils/errorHandling';

interface GeminiRequest {
  model: string;
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig: {
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
  };
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
    finishReason?: string;
  }[];
}

interface RecommendationResponse {
  recommendations: Recommendation[];
}

interface RawRecommendation {
  title: string;
  description: string;
  description_en: string;
  category: string;
  context_relevance: string;
  context_relevance_en: string;
  traits_alignment: string[];
  growth_aspects: string;
  growth_aspects_en: string;
  examples: Array<{
    name: string;
    details: string;
    details_en: string;
    reason: string;
    reason_en: string;
  }>;
}

// Cache for storing previous recommendations
const recommendationCache = new Map<string, RecommendationResponse>();

/**
 * Generates a unique cache key based on user preferences
 * to allow reuse of recommendations for the same user profile.
 */
function generateCacheKey(preferences: UserPreferences): string {
  return JSON.stringify({
    language: preferences.language,
    profile: {
      traits: preferences.profile.traits,
      interests: preferences.profile.interests.sort(),
      goals: preferences.profile.goals.sort()
    },
    context: {
      mood: preferences.context.mood,
      timeOfDay: preferences.context.timeOfDay,
      energyLevel: preferences.context.energyLevel
    },
    lifestyle: {
      activityLevel: preferences.lifestyle.activityLevel,
      workStyle: preferences.lifestyle.workStyle,
      socialStyle: preferences.lifestyle.socialStyle
    }
  });
}

/**
 * Creates a prompt for the LLM, emphasizing that it should act as
 * an exceptionally intelligent psychological scholar by analyzing
 * user traits, goals, and context holistically.
 */
function createPrompt(preferences: UserPreferences): string {
  const { language, profile, context, lifestyle } = preferences;
  const isJapanese = language === 'ja';

  // Convert trait object to a printable string
  const traits = Object.entries(profile.traits)
    .map(([trait, value]) => `${trait}: ${value}/5`)
    .join(', ');

  const interestList = profile.interests.join(', ');
  const goalsList = profile.goals.join(', ');
  const moodAndTime = `Current mood: ${context.mood}, Time: ${context.timeOfDay}, Energy: ${context.energyLevel}/5`;
  const lifestylePrefs = `Activity level: ${lifestyle.activityLevel}, Work style: ${lifestyle.workStyle}, Social style: ${lifestyle.socialStyle}`;

  // Main prompt text
  const basePrompt = `
You are an exceptionally intelligent recommendation system with deep knowledge of global culture, entertainment, and lifestyle activities.
${isJapanese ? 'You are also deeply knowledgeable about Japanese culture, media, and lifestyle.' : ''}

USER PROFILE AND CONTEXT:
- Traits: ${traits}
- Interests: ${interestList}
- Goals: ${goalsList}
- Current State: ${moodAndTime}
- Lifestyle: ${lifestylePrefs}

Your task:
1. Generate 5 recommendation categories that match their interests and current context.
2. For each category, provide 3-4 specific examples with detailed information.
3. Focus on actionable, concrete suggestions they can try immediately.

Important guidelines:
${isJapanese ? `- For Japanese users:
  * All recommendations must be in Japanese first, followed by English translations
  * Include both Japanese and international options, with emphasis on Japanese content
  * Format examples like this:
    - Music: "YOASOBI - アイドル (Idol)" 
    - Books: "村上春樹 - 海辺のカフカ (Kafka on the Shore)"
    - Movies: "千と千尋の神隠し (Spirited Away)"
  * For each recommendation, include:
    - Japanese title/name (in kanji/kana)
    - English translation
    - Japanese description
    - English description
    - Why it matches their preferences (in both languages)`
: `- For English users:
  * Provide recommendations in English
  * Focus on international content, with emphasis on their cultural interests
  * Include specific details like:
    - Music: Artist name, song title, genre, year
    - Books: Author, title, genre, themes
    - Movies: Title, director, key actors, genre
  * Explain why each recommendation matches their preferences`}

Format your response as a valid JSON object with this structure:

{
  "recommendations": [
    {
      "category": "string (e.g., 'Music Collection', 'Wellness Routine')",
      "title": ${isJapanese ? '"string (Japanese title / English translation)"' : '"string (engaging title)"'},
      "description": ${isJapanese ? '"string (Japanese description / English description)"' : '"string (description)"'},
      "examples": [
        {
          "name": ${isJapanese ? '"string (Japanese name / English name)"' : '"string (specific name)"'},
          "details": ${isJapanese ? '"string (Japanese details / English details)"' : '"string (specific details)"'},
          "reason": ${isJapanese ? '"string (Japanese reason / English reason)"' : '"string (specific reason)"}' }
        }
      ],
      "traits_alignment": ["string (key traits this matches)"],
      "context_relevance": "string (when/how to best engage with these)",
      "growth_aspects": ${isJapanese ? '"string (Japanese growth aspects / English growth aspects)"' : '"string (growth aspects)"'}
    }
  ]
}
`.trim();

  return basePrompt;
}

/**
 * Sends a request to the Gemini API with the generated prompt.
 * Ensure you have a valid Gemini API key set in your .env file.
 */
async function makeGeminiRequest(prompt: string): Promise<GeminiResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new APIError('Please set a valid Gemini API key in your .env file');
  }

  const request: GeminiRequest = {
    model: "gemini-2.0-flash-thinking-exp-1219",
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
      maxOutputTokens: 15000,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      stopSequences: ["}}]}"]
    }
  };
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        throw new APIError('Rate limit exceeded. Please try again in a few minutes.');
      } else if (response.status === 403) {
        throw new APIError('Invalid API key or authorization error.');
      } else {
        throw new APIError(`API request failed: ${response.statusText} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('Raw API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new APIError('No response from the API. Please try again.');
    }
    
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to connect to the API. Please check your internet connection.');
  }
}

/**
 * Parses the Gemini API response to extract recommendations.
 * Handles JSON extraction, parsing, and structural validation.
 */
async function parseRecommendations(
  data: GeminiResponse,
  language: string = 'ja'
): Promise<RecommendationResponse> {
  try {
    const candidateContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateContent) {
      throw new APIError(
        language === 'ja'
          ? 'Gemini APIからの応答フォーマットが無効です'
          : 'Invalid response format from Gemini API'
      );
    }

    console.log('Raw API response text:', candidateContent);
    
    // Extract JSON from within possible code blocks
    let jsonText = candidateContent;
    const jsonMatch = candidateContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    
    const cleanedText = jsonText.trim();
    console.log('Cleaned JSON text:', cleanedText);

    // Process the JSON text to handle duplicate keys and incomplete content
    let processedText = cleanedText
      // Remove markdown code block syntax if present
      .replace(/^```json\s*|\s*```$/g, '')
      // Keep only the Japanese description for Japanese users, English for others
      .replace(/"description"\s*:\s*"([^"]+)"\s*,\s*"description"\s*:\s*"([^"]+)"/g, 
        (_, jp, en) => `"description": "${language === 'ja' ? jp : en}"`)
      // Keep only the Japanese details for Japanese users, English for others
      .replace(/"details"\s*:\s*"([^"]+)"\s*,\s*"details"\s*:\s*"([^"]+)"/g,
        (_, jp, en) => `"details": "${language === 'ja' ? jp : en}"`)
      // Keep only the Japanese reason for Japanese users, English for others
      .replace(/"reason"\s*:\s*"([^"]+)"\s*,\s*"reason"\s*:\s*"([^"]+)"/g,
        (_, jp, en) => `"reason": "${language === 'ja' ? jp : en}"`)
      // Keep only the Japanese context_relevance for Japanese users, English for others
      .replace(/"context_relevance"\s*:\s*"([^"]+)"\s*,\s*"context_relevance"\s*:\s*"([^"]+)"/g,
        (_, jp, en) => `"context_relevance": "${language === 'ja' ? jp : en}"`)
      // Keep only the Japanese growth_aspects for Japanese users, English for others
      .replace(/"growth_aspects"\s*:\s*"([^"]+)"\s*,\s*"growth_aspects"\s*:\s*"([^"]+)"/g,
        (_, jp, en) => `"growth_aspects": "${language === 'ja' ? jp : en}"`)
      // Remove any trailing incomplete objects
      .replace(/,\s*{\s*"category":[^}]*$/g, '')
      // Fix trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Remove any extra closing brackets that might have been added
      .replace(/\]\s*\}(\s*\]\s*\})+$/, ']}');

    console.log('Processed JSON text:', processedText);

    let parsed: { recommendations: RawRecommendation[] };
    try {
      parsed = JSON.parse(processedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new APIError(
        language === 'ja'
          ? 'APIレスポンスの解析に失敗しました。モデルが無効なJSONを返しました。'
          : 'Failed to parse API response. The model returned invalid JSON.',
        undefined,
        cleanedText
      );
    }

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new APIError(
        language === 'ja'
          ? '推薦が見つかりませんでした'
          : 'No recommendations found'
      );
    }

    const recommendations = parsed.recommendations.map((rec, index) => ({
      id: `${index + 1}`,
      title: rec.title,
      description: rec.description,
      category: rec.category,
      rating: 4,
      impact: {
        primary: rec.category.toLowerCase(),
        secondary: [],
        score: 0.8
      },
      contextualRelevance: {
        mood: [rec.context_relevance],
        timeOfDay: ['any'],
        energyRequired: 3
      },
      personalizedInsights: {
        alignmentReason: rec.traits_alignment,
        benefitAreas: [rec.growth_aspects],
        challengeAreas: []
      },
      enjoymentFactors: {
        shortTerm: rec.examples.map(ex => ex.name).join(', '),
        longTerm: rec.growth_aspects,
        relatedInterests: []
      },
      wellbeingAspects: {
        mindfulness: true,
        fulfillmentScore: 0.8,
        personalGrowth: rec.growth_aspects
      },
      socialAspect: {
        groupActivity: rec.category.toLowerCase().includes('social'),
        interactionType: rec.category.toLowerCase().includes('social') ? 'shared' : 'solo',
        socialInteractionLevel: rec.category.toLowerCase().includes('social') ? 3 : 1
      },
      specificDetails: {
        examples: rec.examples.map(ex => ({
          name: ex.name,
          details: ex.details,
          reason: ex.reason
        }))
      }
    }));

    return { recommendations };
  } catch (error) {
    console.error('Error parsing recommendations:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      language === 'ja'
        ? '推薦の処理に失敗しました'
        : 'Failed to process recommendations',
      undefined,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Retrieves or generates recommendations based on the user's preferences.
 * If a matching cache entry exists, returns it; otherwise calls the Gemini API.
 */
export async function getRecommendations(preferences: UserPreferences): Promise<Recommendation[]> {
  try {
    // Try to get from cache first
    const cacheKey = generateCacheKey(preferences);
    const cachedResponse = recommendationCache.get(cacheKey);

    if (cachedResponse) {
      console.log('Returning cached recommendations for user:', cacheKey);
      return cachedResponse.recommendations;
    }

    console.log('Generating new recommendations for:', preferences);
    const prompt = createPrompt(preferences);
    console.log('Generated prompt length:', prompt.length);
    
    // Call Gemini API
    const response = await makeGeminiRequest(prompt);
    console.log('Got API response:', response);
    
    // Parse recommendations from response
    const parsedResponse = await parseRecommendations(response, preferences.language);
    console.log('Parsed recommendations:', parsedResponse);
    
    if (!parsedResponse.recommendations || parsedResponse.recommendations.length === 0) {
      throw new APIError(
        preferences.language === 'ja'
          ? 'APIレスポンスから推薦を生成できませんでした'
          : 'No recommendations generated from the API response'
      );
    }

    // Cache the successful response
    recommendationCache.set(cacheKey, parsedResponse);
    
    return parsedResponse.recommendations;
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    if (error instanceof APIError) {
      throw error;
    }
    // Wrap unknown errors
    throw new APIError(
      preferences.language === 'ja' 
        ? 'おすすめの生成中にエラーが発生しました。もう一度お試しください。'
        : 'Error generating recommendations. Please try again.',
      undefined,
      error instanceof Error ? error.message : String(error)
    );
  }
}