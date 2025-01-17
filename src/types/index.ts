export type Language = 'en' | 'ja';

export type Category = 
  | 'health' 
  | 'career' 
  | 'finance' 
  | 'hobbies' 
  | 'relationships'
  | 'movies'
  | 'music'
  | 'cuisine';

export type MoodType = 'energetic' | 'focused' | 'relaxed' | 'creative' | 'social';
export type TimeContext = 'morning' | 'afternoon' | 'evening' | 'night';
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface PersonalityProfile {
  traits: PersonalityTraits;
  interests: string[];
  values: string[];
  goals: string[];
}

export interface UserContext {
  mood: MoodType;
  timeOfDay: TimeContext;
  energyLevel: EnergyLevel;
  recentActivities?: string[];
  stressLevel?: number;
}

export interface UserPreferences {
  language: Language;
  profile: PersonalityProfile;
  context: UserContext;
  lifestyle: {
    activityLevel: 'low' | 'moderate' | 'high';
    workStyle: 'focused' | 'balanced' | 'flexible';
    socialStyle: 'introverted' | 'balanced' | 'extroverted';
  };
}

export interface Recommendation {
  id?: string;
  title: string;
  description: string;
  category: Category;
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
    benefitAreas: string[];
    challengeAreas: string[];
  };
  growthPotential: {
    shortTerm: string;
    longTerm: string;
    relatedSkills: string[];
  };
  sustainability: {
    ecoFriendly: boolean;
    sustainabilityScore: number;
    environmentalImpact: string;
  };
  socialAspect: {
    groupActivity: boolean;
    collaborationType: string;
    socialInteractionLevel: number;
  };
}

export interface TranslationStrings {
  // General
  personalityProfile: string;
  currentContext: string;
  recommendationsTitle: string;
  getRecommendations: string;
  
  // Personality Traits
  openness: string;
  conscientiousness: string;
  extraversion: string;
  agreeableness: string;
  neuroticism: string;
  
  // Current Context
  mood: string;
  timeOfDay: string;
  energyLevel: string;
  
  // Lifestyle Preferences
  lifestylePreferences: string;
  activityLevel: string;
  activityLevelLow: string;
  activityLevelModerate: string;
  activityLevelHigh: string;
  workStyle: string;
  workStyleFocused: string;
  workStyleBalanced: string;
  workStyleFlexible: string;
  socialStyle: string;
  socialStyleIntroverted: string;
  socialStyleBalanced: string;
  socialStyleExtroverted: string;
  
  // Categories
  health: string;
  career: string;
  finance: string;
  hobbies: string;
  relationships: string;
  movies: string;
  music: string;
  cuisine: string;
  
  // Recommendations
  movieSuggestion: string;
  musicSuggestion: string;
  cuisineSuggestion: string;
  
  // Recommendation Details
  impactPrimary: string;
  contextRelevance: string;
  personalFit: string;
  growthOpportunity: string;
  shortTerm: string;
  longTerm: string;
  ecoFriendly: string;
  groupActivity: string;
  
  // Time Periods
  morning: string;
  afternoon: string;
  evening: string;
  night: string;
  flexible: string;
}

export interface TranslationsWithFunctions {
  // General
  interests: string;
  goals: string;
  getRecommendations: string;
  recommendationsTitle: string;
  currentContext: string;
  personalityTraits: string;
  
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

export type Translations = {
  [key in Language]: TranslationsWithFunctions;
};