import React, { useState } from 'react';
import { WelcomePage } from './components/WelcomePage';
import { QuestionnaireForm } from './components/QuestionnaireForm';
import { RecommendationsGrid } from './components/RecommendationsGrid';
import { Category, Recommendation, UserPreferences } from './types';
import { Layout } from 'lucide-react';
import { getRecommendations } from './services/geminiApi';
import { APIError } from './utils/errorHandling';

export default function App() {
  const [step, setStep] = useState<'welcome' | 'questionnaire' | 'results'>('welcome');
  const [selectedCategory, setSelectedCategory] = useState<Category>('movies');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setStep('questionnaire');
  };

  const handleQuestionnaireSubmit = async (preferences: UserPreferences) => {
    setLoading(true);
    setError(null);
    
    try {
      const recommendations = await getRecommendations(preferences);
      setRecommendations(recommendations);
      setStep('results');
    } catch (error) {
      const message = error instanceof APIError
        ? `Error: ${error.message}`
        : 'Failed to get recommendations. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'welcome') {
    return <WelcomePage onStart={handleStart} />;
  }

  if (step === 'questionnaire') {
    return (
      <QuestionnaireForm 
        onSubmit={handleQuestionnaireSubmit} 
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-2">
            <Layout className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Your Personalized Recommendations
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
                  {category}
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
}