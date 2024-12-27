import React from 'react';
import { RecommendationCard } from './RecommendationCard';
import { Category, Recommendation } from '../types';

interface RecommendationsGridProps {
  recommendations: Recommendation[];
  selectedCategory: Category;
}

export function RecommendationsGrid({
  recommendations,
  selectedCategory,
}: RecommendationsGridProps) {
  const filteredRecommendations = recommendations.filter(
    (rec) => rec.category === selectedCategory
  );

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