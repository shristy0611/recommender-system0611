import { UserPreferences, Recommendation } from '../types';
import { GeminiRequest, GeminiResponse, RecommendationResponse } from '../types/api';
import { APIError, handleAPIError } from '../utils/errorHandling';
import { API_CONFIG } from '../config/constants';
import { getSearchResult } from './searchService';

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

// Cache for storing previous recommendations
const recommendationCache = new Map<string, RecommendationResponse>();

// Cache key generator
function generateCacheKey(preferences: UserPreferences): string {
  return JSON.stringify({
    language: preferences.language,
    name: preferences.name,
    otherPreferences: preferences.otherPreferences
  });
}

function createPrompt(preferences: UserPreferences): string {
  const { language, name, ...otherPreferences } = preferences;
  const preferencesText = Object.entries(otherPreferences)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const isJapanese = language === 'ja';
  const languageContext = isJapanese ? 
    "あなたは日本の文化と国際メディアを専門とする推薦システムの研究者として、知的で刺激的な推薦を提供してください。日本の感性とグローバルな視点を組み合わせた推薦が求められています。" :
    "Generate personalized recommendations based on the user's preferences and the following mappings of correlated tastes. Analyze the user's choices to suggest items that align with their preferences while considering possible patterns or connections between their movie, book, and cuisine choices. Include relevant and authentic URLs for images to accompany each recommendation.";

  const mappingPatterns = isJapanese ?
    `好みの相関関係:
- アクション映画のファンはスリラーや叙事詩的な小説を好む傾向
- ロマンティックなジャンルのファンは、ドラマ小説やフランス・イタリア料理を好む傾向
- ミステリー愛好家は心理スリラーと豊かでエキゾチックな料理を楽しむ傾向` :
    `Mapping Patterns:
- Users who enjoy action movies may prefer thrillers or epic novels
- Fans of romantic genres may gravitate towards drama books and French or Italian cuisines
- Mystery lovers might enjoy psychological thrillers and rich, exotic foods`;

  const responseInstructions = isJapanese ? 
    `以下の形式の有効なJSONオブジェクトのみで応答してください:
{
  "recommendations": [
    {
      "title": "作品名",
      "description": "説明（50文字以内）",
      "rating": 数値（1-5の間）,
      "category": "movies" | "books" | "food"
    }
  ]
}` :
    `Respond with ONLY a valid JSON object following this EXACT format:
{
  "recommendations": [
    {
      "title": "string",
      "description": "string (under 50 chars)",
      "rating": number (between 1-5),
      "category": "movies" | "books" | "food"
    }
  ]
}`;

  const rules = isJapanese ? 
    `ルール:
- 各カテゴリー5つずつ（合計15の推薦）
- 説明は50文字以内で、知的/文化的重要性を強調
- 評価（1-5）は文化的影響力と知的深さを反映
- カテゴリーは "movies"、"books"、"food" のいずれか
- 推薦内容:
  * 映画: 複雑なテーマを探求する映画的に重要な作品
  * 本: 文学的傑作と思考を刺激する作品
  * 料理: 歴史的背景のある文化的に重要な料理
- ユーザーの具体的な好みに合わせる
- 正しいJSON形式で、ダブルクォートを使用
- JSON以外のテキストは含めない` :
    `Rules:
- Generate 5 recommendations per category (15 total)
- Each description must be under 50 chars
- Rating (1-5) should reflect cultural impact
- Category must be exactly: "movies", "books", or "food"
- Recommendations should:
  * Movies: Focus on cinematically significant works
  * Books: Emphasize literary masterpieces
  * Food: Highlight culturally significant dishes
- Match user's specific preferences
- Format as clean JSON with double quotes
- No text outside the JSON object`;

  return `${languageContext}

${mappingPatterns}

${isJapanese ? '以下の好みを学術的な厳密さで分析してください:' : 'Analyze these preferences with academic rigor:'}

${isJapanese ? 'ユーザープロフィール:' : 'User Profile:'}
${isJapanese ? '名前' : 'Name'}: ${name}
${preferencesText}

${responseInstructions}

${rules}`;
}

async function makeGeminiRequest(prompt: string): Promise<GeminiResponse> {
  const request: GeminiRequest = {
    model: "gemini-2.0-flash-exp",
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    },
  };

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  console.log('Making Gemini API request:', request);
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
  console.log('API URL:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response text:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw new APIError(
      'Failed to get recommendations from API',
      undefined,
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Memoized logo URL function
const logoUrlCache = new Map<string, string>();

function getLogoUrl(category: string): string {
  const key = category.toLowerCase();
  if (logoUrlCache.has(key)) {
    return logoUrlCache.get(key)!;
  }

  let url;
  switch (key) {
    case 'movies':
      url = 'https://icon-library.com/images/movies-icon-png/movies-icon-png-29.jpg';
      break;
    case 'books':
      url = 'https://icon-library.com/images/book-stack-icon-png/book-stack-icon-png-3.jpg';
      break;
    case 'food':
      url = 'https://icon-library.com/images/food-app-icon/food-app-icon-0.jpg';
      break;
    default:
      url = '/src/images/default-logo.svg';
  }

  logoUrlCache.set(key, url);
  return url;
}

async function parseRecommendations(data: GeminiResponse, language: string = 'ja'): Promise<RecommendationResponse> {
  try {
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      throw new Error('Invalid JSON response from Gemini API');
    }

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid recommendations format');
    }

    // Process all recommendations in parallel
    const validatedRecommendations = await Promise.all(
      parsed.recommendations.map(async (rec: any) => {
        if (!rec.title || !rec.description || !rec.category || typeof rec.rating !== 'number') {
          throw new Error(`Invalid recommendation format`);
        }

        const rating = Math.min(Math.max(Math.round(rec.rating), 1), 5);
        const category = rec.category.toLowerCase();

        // Get search result for external URL
        const searchResult = await getSearchResult(category, rec.title, language);

        return {
          title: rec.title,
          description: rec.description,
          category,
          rating,
          imageUrl: getLogoUrl(category),
          externalUrl: searchResult.url,
          japaneseSource: searchResult.japaneseSource
        };
      })
    );

    return {
      recommendations: validatedRecommendations
    };
  } catch (error) {
    console.error('Error parsing recommendations:', error);
    throw error;
  }
}

function getExternalUrl(category: string, title: string): string {
  const encodedTitle = encodeURIComponent(title);
  switch (category) {
    case 'movies':
      return `https://www.imdb.com/find?q=${encodedTitle}`;
    case 'books':
      return `https://www.goodreads.com/search?q=${encodedTitle}`;
    case 'food':
      return `https://www.allrecipes.com/search?q=${encodedTitle}`;
  }
}

function enrichRecommendations(recommendations: RecommendationResponse['recommendations']): Recommendation[] {
  return recommendations.map((rec, index) => ({
    ...rec,
    id: `${index + 1}`
  }));
}

export async function getRecommendations(preferences: UserPreferences): Promise<Recommendation[]> {
  try {
    // Check cache first
    const cacheKey = generateCacheKey(preferences);
    const cachedResponse = recommendationCache.get(cacheKey);
    if (cachedResponse) {
      console.log('Returning cached recommendations');
      return enrichRecommendations(cachedResponse.recommendations);
    }

    const prompt = createPrompt(preferences);
    const response = await makeGeminiRequest(prompt);
    console.log('Raw API response:', response);
    
    const { recommendations } = await parseRecommendations(response, preferences.language);
    console.log('Parsed recommendations:', recommendations);
    
    const enriched = enrichRecommendations(recommendations);

    // Cache the response
    const result = { recommendations: enriched };
    recommendationCache.set(cacheKey, result);
    
    return enriched;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw handleAPIError(error);
  }
}

function handleAPIError(error: unknown): never {
  if (error instanceof APIError) {
    throw error;
  }
  throw new APIError(
    'Failed to get recommendations',
    undefined,
    error instanceof Error ? error.message : String(error)
  );
}