export interface GeminiRequest {
  model: string;
  contents: {
    role?: string;
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
}

export interface GeminiResponse {
  candidates: {
    content: {
      role?: string;
      parts: {
        text: string;
      }[];
    };
    finishReason?: string;
    index?: number;
    safetyRatings?: {
      category: string;
      probability: string;
    }[];
  }[];
  promptFeedback?: {
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  };
}

export interface RecommendationResponse {
  recommendations: {
    title: string;
    description: string;
    rating: number;
    category: 'movies' | 'books' | 'food';
  }[];
}