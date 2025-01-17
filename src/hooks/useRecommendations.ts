import { useState } from 'react';
import { getRecommendations } from '../services/geminiApi';
import { Recommendation, UserPreferences } from '../types';
import { APIError } from '../utils/errorHandling';

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async (preferences: UserPreferences) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await getRecommendations(preferences);
      setRecommendations(results);
    } catch (err) {
      const message = err instanceof APIError
        ? `Error: ${err.message}`
        : 'Failed to get recommendations. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations,
  };
}