import React, { useState } from 'react';
import { WelcomePage } from './components/WelcomePage';
import { QuestionnaireForm } from './components/QuestionnaireForm';
import { RecommendationsGrid } from './components/RecommendationsGrid';
import { Category, Recommendation, UserPreferences } from './types';
import { Layout } from 'lucide-react';
import { getRecommendations } from './services/geminiApi';
import { APIError } from './utils/errorHandling';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import translations from './translations.json';

function AppContent() {
  const [step, setStep] = useState<'welcome' | 'questionnaire' | 'results'>('welcome');
  const [selectedCategory, setSelectedCategory] = useState<Category>('movies');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const { language } = useLanguage();

  const handleStart = (name: string) => {
    console.log('Starting with name:', name);
    setUserName(name);
    setStep('questionnaire');
  };

  const handleQuestionnaireSubmit = async (preferences: Partial<UserPreferences>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Add name to preferences
      const fullPreferences: UserPreferences = {
        ...preferences,
        name: userName,
        language
      };

      console.log('Submitting preferences:', fullPreferences);
      const recs = await getRecommendations(fullPreferences);
      console.log('Got recommendations:', recs);
      
      if (!recs || recs.length === 0) {
        throw new Error('No recommendations received');
      }
      
      setRecommendations(recs);
      setStep('results');
    } catch (error) {
      console.error('Error in handleQuestionnaireSubmit:', error);
      const message = error instanceof APIError
        ? `Error: ${error.message}`
        : translations.errors.general[language];
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const ResultsPage = () => {
    if (!recommendations || recommendations.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {translations.common.error[language]}
            </h2>
            <p className="text-gray-600">
              {translations.common.noRecommendations[language]}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-2">
              <Layout className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                {translations.results.header.title[language]}
              </h1>
            </div>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto py-6">
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                {(['movies', 'books', 'food'] as Category[]).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-md capitalize ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {translations.results.categories[category][language]}
                  </button>
                ))}
              </div>
            </div>

            <RecommendationsGrid
              recommendations={recommendations}
              selectedCategory={selectedCategory}
            />
          </div>
        </main>
      </div>
    );
  };

  return (
    <>
      {step === 'welcome' && <WelcomePage onStart={handleStart} />}
      
      {step === 'questionnaire' && (
        <QuestionnaireForm 
          onSubmit={handleQuestionnaireSubmit} 
          loading={loading}
          error={error}
        />
      )}

      {step === 'results' && <ResultsPage />}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}