export interface TranslationsWithFunctions {
  // General
  interests: string;
  goals: string;
  getRecommendations: string;
  recommendationsTitle: string;
  currentContext: string;
  personalityTraits: string;
  personalityProfile: string;
  
  // Recommendation Card
  impactPrimary: string;
  contextRelevance: string;
  personalFit: string;
  enjoymentFactors: string;
  shortTerm: string;
  longTerm: string;
  mindfulness: string;
  groupActivity: string;
  noRecommendationsError: string;
  generalError: string;
  
  // Personality Traits
  openness: string;
  conscientiousness: string;
  extraversion: string;
  agreeableness: string;
  neuroticism: string;
  
  // Activity Levels
  activityLevel: string;
  activityLevelLow: string;
  activityLevelModerate: string;
  activityLevelHigh: string;
  
  // Work Preferences
  workPreference: string;
  workStyleFocused: string;
  workStyleBalanced: string;
  workStyleFlexible: string;
  
  // Social Preferences
  socialPreference: string;
  socialStyleIntroverted: string;
  socialStyleBalanced: string;
  socialStyleExtroverted: string;
  
  // Moods
  mood: string;
  moodEnergetic: string;
  moodFocused: string;
  moodRelaxed: string;
  moodCreative: string;
  moodSocial: string;
  
  // Times
  timeOfDay: string;
  timeMorning: string;
  timeAfternoon: string;
  timeEvening: string;
  timeNight: string;
  
  // Energy
  energyLevel: string;
  energyLow: string;
  energyHigh: string;
  
  // Categories
  movies: string;
  musicCategory: string;
  cuisine: string;
  
  // Recommendations
  movieSuggestion: string;
  musicSuggestion: string;
  cuisineSuggestion: string;
  
  // Functions
  daysPerWeek: (days: number) => string;
}

export interface Translations {
  common: {
    noRecommendations: {
      en: string;
      ja: string;
    };
  };
  errors: {
    general: {
      en: string;
      ja: string;
    };
  };
  [key: string]: any;
}

export interface UserPreferences {
  language: string;
  profile: {
    traits: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    interests: string[];
    values: string[];
    goals: string[];
  };
  context: {
    mood: string;
    timeOfDay: string;
    energyLevel: number;
    recentActivities: string[];
    stressLevel: number;
  };
  lifestyle: {
    activityLevel: string;
    workStyle: string;
    socialStyle: string;
  };
}

export interface Recommendation {
  id?: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  impact: {
    primary: string;
    secondary: string[];
    score: number;
  };
  contextualRelevance: {
    mood: string[];
    timeOfDay: string[];
    energyRequired: number;
  };
  personalizedInsights: {
    alignmentReason: string[];
  };
  enjoymentFactors: {
    shortTerm: string;
    longTerm: string;
  };
  wellbeingAspects: {
    mindfulness: boolean;
    fulfillment: string;
  };
  socialAspect: {
    groupActivity: boolean;
    interactionType: string;
    socialInteractionLevel: number;
  };
} 