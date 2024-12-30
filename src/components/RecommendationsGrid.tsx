import React from 'react';
import { RecommendationCard } from './RecommendationCard';
import { Category, Recommendation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import translations from '../translations.json';

interface RecommendationsGridProps {
  recommendations: Recommendation[];
  selectedCategory: Category;
}

export function RecommendationsGrid({
  recommendations,
  selectedCategory,
}: RecommendationsGridProps) {
  const { language } = useLanguage();
  const filteredRecommendations = recommendations.filter(
    (rec) => rec.category === selectedCategory
  );

  if (!recommendations.length) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">
          {translations.results.noResults.all[language]}
        </p>
      </div>
    );
  }

  if (!filteredRecommendations.length) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">
          {translations.results.noResults.category[language]}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {filteredRecommendations.map((recommendation) => (
        <RecommendationCard
          key={recommendation.id}
          recommendation={recommendation}
        />
      ))}
    </div>
  );
}