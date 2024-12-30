import React from 'react';
import { StarIcon } from 'lucide-react';
import { Recommendation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import translations from '../translations.json';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { language } = useLanguage();
  const { title, description, rating, imageUrl, externalUrl } = recommendation;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-contain p-4 transform hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            console.error(`Failed to load image: ${imageUrl}`);
            const img = e.target as HTMLImageElement;
            img.src = '/images/default-logo.svg';
          }}
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center" title={`${rating} ${translations.results.card.rating[language]}`}>
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            {translations.results.card.learnMore[language]} →
          </a>
        </div>
      </div>
    </div>
  );
}