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

// Cache for storing previous recommendations
const recommendationCache = new Map<string, RecommendationResponse>();

// Cache key generator
function generateCacheKey(preferences: UserPreferences): string {
  return JSON.stringify({
    language: preferences.language,
    profile: {
      traits: preferences.profile.traits,
      interests: preferences.profile.interests,
      values: preferences.profile.values,
      goals: preferences.profile.goals
    },
    context: {
      mood: preferences.context.mood,
      timeOfDay: preferences.context.timeOfDay,
      energyLevel: preferences.context.energyLevel
    }
  });
}

function createPrompt(preferences: UserPreferences): string {
  const { language, profile, context, lifestyle } = preferences;
  const isJapanese = language === 'ja';

  const preferencesText = JSON.stringify({
    personality: profile.traits,
    interests: profile.interests,
    values: profile.values,
    goals: profile.goals,
    context: {
      mood: context.mood,
      timeOfDay: context.timeOfDay,
      energyLevel: context.energyLevel
    },
    lifestyle: {
      activityLevel: lifestyle.activityLevel,
      workStyle: lifestyle.workStyle,
      socialStyle: lifestyle.socialStyle
    }
  }, null, 2);

  const languageContext = isJapanese ? 
    "あなたは個人の充実した生活をサポートするライフスタイルアドバイザーとして、以下の観点から分析を行います：\n" +
    "1. 趣味と個人の成長\n" +
    "2. エンターテインメントと創造性\n" +
    "3. 心身の健康とウェルビーイング\n" +
    "4. 文化的活動と自己表現\n" +
    "5. 社会的つながりと個人の満足度\n\n" +
    "重要: 映画、音楽、瞑想などの活動を通じて、より豊かな個人生活を実現する方法を提案してください。" :
    "As a lifestyle advisor focused on personal enrichment, analyze from these perspectives:\n" +
    "1. Hobbies and personal growth\n" +
    "2. Entertainment and creativity\n" +
    "3. Physical and mental wellbeing\n" +
    "4. Cultural activities and self-expression\n" +
    "5. Social connections and personal satisfaction\n\n" +
    "Important: Suggest ways to enhance personal life through movies, music, meditation, and other enriching activities.";

  const responseInstructions = isJapanese ? 
    `以下の形式の有効なJSONオブジェクトのみで応答してください。
各推薦は個人の充実した生活を実現するための具体的な提案としてください。
趣味や文化的活動が、なぜ個人の幸福度を高めるのかを説明してください。
すべての文章は日本語で書き、親しみやすく説明してください。` :
    `Respond with ONLY a valid JSON object. 
Each recommendation should focus on personal enrichment and life satisfaction.
Explain how hobbies and cultural activities enhance personal happiness.
All text must be in English and kept friendly and approachable.`;

  const formatInstructions = isJapanese ? `
{
  "recommendations": [
    {
      "title": "心を豊かにする活動のタイトル",
      "description": "活動の詳細な説明と、それがどのように人生を豊かにするか（2-3文）",
      "category": "entertainment|creativity|wellness|culture|social|nature|learning|relaxation",
      "rating": 1-5,
      "impact": {
        "primary": "主な生活への影響",
        "secondary": ["その他の良い影響"],
        "score": 0-1
      },
      "contextualRelevance": {
        "mood": ["この活動に適した気分"],
        "timeOfDay": ["おすすめの時間帯"],
        "energyRequired": 1-5
      },
      "personalizedInsights": {
        "alignmentReason": ["性格との相性", "興味との一致"],
        "benefitAreas": ["心身の健康", "個人の成長"],
        "challengeAreas": ["始める際の課題"]
      },
      "enjoymentFactors": {
        "shortTerm": "すぐに感じられる喜び",
        "longTerm": "長期的な充実感",
        "relatedInterests": ["関連する趣味や活動"]
      },
      "wellbeingAspects": {
        "mindfulness": boolean,
        "fulfillmentScore": 0-1,
        "personalGrowth": "成長につながる側面"
      },
      "socialAspect": {
        "groupActivity": boolean,
        "interactionType": "一人/グループ/オンライン等",
        "socialInteractionLevel": 0-5
      }
    }
  ]
}` : `
{
  "recommendations": [
    {
      "title": "life-enriching activity title",
      "description": "detailed activity description and how it enriches life (2-3 sentences)",
      "category": "entertainment|creativity|wellness|culture|social|nature|learning|relaxation",
      "rating": 1-5,
      "impact": {
        "primary": "main life impact area",
        "secondary": ["other positive effects"],
        "score": 0-1
      },
      "contextualRelevance": {
        "mood": ["suitable moods for this activity"],
        "timeOfDay": ["recommended times"],
        "energyRequired": 1-5
      },
      "personalizedInsights": {
        "alignmentReason": ["personality fit", "interest match"],
        "benefitAreas": ["mental/physical wellbeing", "personal growth"],
        "challengeAreas": ["getting started challenges"]
      },
      "enjoymentFactors": {
        "shortTerm": "immediate joy and satisfaction",
        "longTerm": "lasting fulfillment",
        "relatedInterests": ["connected hobbies and activities"]
      },
      "wellbeingAspects": {
        "mindfulness": boolean,
        "fulfillmentScore": 0-1,
        "personalGrowth": "growth and development aspects"
      },
      "socialAspect": {
        "groupActivity": boolean,
        "interactionType": "solo/group/online etc",
        "socialInteractionLevel": 0-5
      }
    }
  ]
}`;

  const importantNotes = isJapanese ? `
重要な注意点:
1. 個人の興味と成長に焦点を当てる
2. 映画、音楽、文学などの文化的活動の個人的な価値を説明
3. 瞑想やマインドフルネスの実践的な効果を提示
4. 6つの推薦を目指す: 
   - 創造的活動2件（芸術、音楽、料理など）
   - 心身の健康活動2件（運動、瞑想など）
   - 社会的/文化的活動2件（グループ活動、文化体験など）
5. 各推薦は個人の幸福度向上に焦点を当てる
6. すべての内容は日本語で提供する` : `
Important Notes:
1. Focus on personal interests and growth
2. Explain the personal value of cultural activities like films, music, and literature
3. Present practical benefits of meditation and mindfulness
4. Aim for 6 recommendations:
   - 2 creative activities (art, music, cooking, etc.)
   - 2 wellness activities (exercise, meditation, etc.)
   - 2 social/cultural activities (group activities, cultural experiences)
5. Each recommendation should focus on enhancing personal happiness
6. Provide all content in English`;

  return `${languageContext}

${isJapanese ? 'プロフィール分析:' : 'Profile Analysis:'}
${preferencesText}

${responseInstructions}
${formatInstructions}
${importantNotes}

Additional Context:
- Movies can inspire creativity, emotional awareness, and cultural understanding
- Music enhances mood, emotional expression, and personal enjoyment
- Meditation improves mental clarity, emotional balance, and inner peace
- Literature develops imagination, empathy, and personal reflection
- Cultural activities build social connections and broaden perspectives
- Creative pursuits foster self-expression and personal satisfaction

Personalization Guidelines:
- For high energy levels: More active and engaging activities
- For low energy levels: Calming and restorative experiences
- Morning recommendations: Energizing and inspiring activities
- Evening recommendations: Relaxing and reflective pursuits
- Consider weather and seasonal activities
- Adapt to social preferences (solo vs. group activities)
- Account for current mood in activity selection
- Balance familiar comforts with new experiences`;
}

async function makeGeminiRequest(prompt: string): Promise<GeminiResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new APIError('Please set a valid Gemini API key in your .env file');
  }

  const request: GeminiRequest = {
    model: "gemini-pro",
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

async function parseRecommendations(data: GeminiResponse, language: string = 'ja'): Promise<RecommendationResponse> {
  try {
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new APIError(
        language === 'ja'
          ? 'Gemini APIからの応答フォーマットが無効です'
          : 'Invalid response format from Gemini API'
      );
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('Raw API response text:', responseText);
    
    // Extract JSON from the response text (it might be wrapped in markdown code blocks)
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    
    // Attempt to fix truncated JSON
    let cleanedText = jsonText.trim();
    
    // Fix common truncation patterns
    if (cleanedText.match(/description":\s*"[^"]*"(?:\s*,\s*)?$/)) {
      cleanedText += '}}]}';
    } else if (cleanedText.match(/description":\s*"[^"]*$/)) {
      cleanedText += '"}}}]}';
    } else if (!cleanedText.endsWith('}}]}')) {
      // Count braces and fix if needed
      const openBraces = (cleanedText.match(/{/g) || []).length;
      const closeBraces = (cleanedText.match(/}/g) || []).length;
      
      if (openBraces > closeBraces) {
        const missingBraces = openBraces - closeBraces;
        cleanedText += '}'.repeat(missingBraces) + ']}';
        console.log('Fixed truncated JSON by adding missing braces:', cleanedText);
      }
    }
    
    console.log('Cleaned JSON text:', cleanedText);
    
    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (error) {
      console.error('JSON parse error:', error);
      console.error('Problematic JSON:', cleanedText);
      
      // Extract complete recommendations
      const recommendations = [];
      const recMatches = cleanedText.matchAll(/{(?:[^{}]|{[^{}]*})*}/g);
      for (const match of recMatches) {
        try {
          const rec = JSON.parse(match[0]);
          if (rec.title && rec.description && rec.category) {
            recommendations.push(rec);
          }
        } catch (e) {
          console.warn('Failed to parse recommendation:', match[0]);
        }
      }
      
      if (recommendations.length > 0) {
        parsed = { recommendations };
        console.log('Successfully extracted partial recommendations:', parsed);
      } else {
        throw new APIError(
          language === 'ja'
            ? 'APIレスポンスの解析に失敗しました。モデルが無効なJSONを返しました。'
            : 'Failed to parse API response. The model returned invalid JSON.',
          undefined,
          cleanedText
        );
      }
    }

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new APIError(
        language === 'ja'
          ? '無効な推薦フォーマット：推薦配列が見つからないか無効です'
          : 'Invalid recommendations format: missing or invalid recommendations array'
      );
    }

    // Process all recommendations in parallel
    const validatedRecommendations = parsed.recommendations.map((rec: any, index: number) => {
      if (!rec.title || !rec.description || !rec.category) {
        throw new APIError(
          language === 'ja'
            ? `インデックス ${index} の推薦フォーマットが無効です：必須フィールドが不足しています`
            : `Invalid recommendation format at index ${index}: missing required fields`
        );
      }

      const rating = Math.min(Math.max(Math.round(rec.rating || 3), 1), 5);
      const category = (rec.category || '').toLowerCase();

      return {
        id: `${index + 1}`,
        title: rec.title,
        description: rec.description,
        category,
        rating,
        impact: rec.impact || {
          primary: category,
          secondary: [],
          score: rating / 5
        },
        contextualRelevance: rec.contextualRelevance || {
          mood: [],
          timeOfDay: [],
          energyRequired: 3
        },
        personalizedInsights: rec.personalizedInsights || {
          alignmentReason: [],
          benefitAreas: [],
          challengeAreas: []
        },
        enjoymentFactors: rec.enjoymentFactors || {
          shortTerm: '',
          longTerm: '',
          relatedInterests: []
        },
        wellbeingAspects: rec.wellbeingAspects || {
          mindfulness: true,
          fulfillmentScore: rating / 5,
          personalGrowth: ''
        },
        socialAspect: rec.socialAspect || {
          groupActivity: false,
          interactionType: 'solo',
          socialInteractionLevel: 1
        }
      };
    });

    return {
      recommendations: validatedRecommendations
    };
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

function enrichRecommendations(recommendations: Recommendation[], index: number): Recommendation {
  return {
    ...recommendations[index],
    id: `${index + 1}`
  };
}

export async function getRecommendations(preferences: UserPreferences): Promise<Recommendation[]> {
  try {
    // Try to get from cache first
    const cacheKey = generateCacheKey(preferences);
    const cachedResponse = recommendationCache.get(cacheKey);
    if (cachedResponse) {
      console.log('Returning cached recommendations');
      return cachedResponse.recommendations;
    }

    console.log('Generating recommendations for:', preferences);
    const prompt = createPrompt(preferences);
    console.log('Generated prompt length:', prompt.length);
    
    const response = await makeGeminiRequest(prompt);
    console.log('Got API response:', response);
    
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