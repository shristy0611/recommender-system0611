import React from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { Recommendation } from '../types';
import { EXTERNAL_LINKS } from '../config/constants';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const externalLink = EXTERNAL_LINKS[recommendation.category](recommendation.title);

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="relative h-48 overflow-hidden">
        <img
          src={recommendation.imageUrl}
          alt={recommendation.title}
          className="w-full h-full object-cover transition-transform hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2">{recommendation.title}</h3>
        <p className="text-gray-600 text-sm mb-3 flex-grow">{recommendation.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < recommendation.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
          >
            Learn More
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}