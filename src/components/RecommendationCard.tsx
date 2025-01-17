import { 
  StarIcon, 
  TrendingUp, 
  Users, 
  Leaf, 
  Brain, 
  Clock, 
  Battery, 
  Target 
} from 'lucide-react';
import { Recommendation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/index';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const tString = (key: keyof typeof t) => typeof t[key] === 'function' ? '' : t[key];
  
  const { 
    title, 
    description, 
    rating,
    impact,
    contextualRelevance,
    personalizedInsights,
    enjoymentFactors,
    wellbeingAspects,
    socialAspect
  } = recommendation;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center" title={`${rating}/5`}>
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-5 h-5 ${
                  i < rating ? 'text-yellow-400 fill-current' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-gray-600 mb-6">{description}</p>
        
        {/* Impact Areas */}
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm font-medium text-indigo-900 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-1" />
            {tString('impactPrimary')}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
              {impact.primary}
            </span>
            {impact.secondary.map((area, index) => (
              <span key={index} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Context & Energy */}
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm font-medium text-purple-900 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {tString('contextRelevance')}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {contextualRelevance.timeOfDay.map((time, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                {time}
              </span>
            ))}
          </div>
          <div className="flex items-center">
            <Battery className="w-4 h-4 mr-1 text-purple-700" />
            <span className="text-sm text-purple-800">
              {tString('energyLevel')}: {contextualRelevance.energyRequired}/5
            </span>
          </div>
        </div>

        {/* Personalized Insights */}
        <div className="mb-4 p-3 bg-rose-50 rounded-lg">
          <p className="text-sm font-medium text-rose-900 mb-2 flex items-center">
            <Brain className="w-4 h-4 mr-1" />
            {tString('personalFit')}
          </p>
          <ul className="space-y-1">
            {personalizedInsights.alignmentReason.map((reason, index) => (
              <li key={index} className="text-sm text-rose-700 flex items-center">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Enjoyment Factors */}
        <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
          <p className="text-sm font-medium text-emerald-900 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {tString('enjoymentFactors')}
          </p>
          <div className="space-y-2">
            <p className="text-sm text-emerald-700">
              <span className="font-medium">{t.shortTerm}:</span> {enjoymentFactors.shortTerm}
            </p>
            <p className="text-sm text-emerald-700">
              <span className="font-medium">{t.longTerm}:</span> {enjoymentFactors.longTerm}
            </p>
          </div>
        </div>

        {/* Wellbeing & Social */}
        <div className="flex gap-2 mt-4">
          {wellbeingAspects.mindfulness && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
              <Leaf className="w-3 h-3 mr-1" />
              {tString('mindfulness')}
            </span>
          )}
          {socialAspect.groupActivity && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {tString('groupActivity')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}