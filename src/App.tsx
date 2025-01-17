import React, { useState, ChangeEvent } from 'react';
import { Questionnaire } from './components/Questionnaire';
import { RecommendationCard } from './components/RecommendationCard';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { translations } from './translations/index';
import type { UserPreferences, Recommendation, Language } from './types';
import { getRecommendations } from './services/geminiApi';
import { APIError } from './utils/errorHandling';

interface AppContentProps {}

function AppContent({}: AppContentProps) {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [step, setStep] = useState<'questionnaire' | 'recommendations'>('questionnaire');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleSubmit = async (preferences: UserPreferences) => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    try {
      console.log('Submitting preferences:', JSON.stringify(preferences, null, 2));
      const newRecommendations = await getRecommendations(preferences);
      console.log('Got recommendations:', JSON.stringify(newRecommendations, null, 2));
      
      if (!newRecommendations || newRecommendations.length === 0) {
        throw new Error(translations[language].noRecommendationsError);
      }
      setRecommendations(newRecommendations);
      setStep('recommendations');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      if (error instanceof APIError) {
        setError(error.message);
        setDebugInfo(error.details || null);
      } else {
        setError(typeof error === 'string' ? error : translations[language].generalError);
        setDebugInfo(error instanceof Error ? error.stack || null : null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 'questionnaire' ? translations[language].personalityProfile : translations[language].recommendationsTitle}
            </h1>
            {step === 'questionnaire' && (
              <select
                value={language}
                onChange={handleLanguageChange}
                className="ml-4 px-3 py-2 border rounded-md text-sm"
              >
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="font-bold">{error}</div>
            {debugInfo && (
              <div className="mt-2 text-sm font-mono whitespace-pre-wrap">
                {debugInfo}
              </div>
            )}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : step === 'questionnaire' ? (
          <Questionnaire onSubmit={handleSubmit} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id || Math.random().toString()}
                recommendation={recommendation}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}