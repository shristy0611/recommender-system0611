import type { Translations } from '../types';

export const translations: Translations = {
  en: {
    // General
    interests: 'Your Interests',
    goals: 'Life Goals',
    getRecommendations: 'Get Recommendations',
    recommendationsTitle: 'Your Personalized Recommendations',
    currentContext: 'Current Context',
    personalityTraits: 'Personality Traits',
    
    // Recommendation Card
    impactPrimary: 'Primary Impact',
    contextRelevance: 'Best Times',
    personalFit: 'Personal Fit',
    enjoymentFactors: 'Enjoyment & Growth',
    shortTerm: 'Short Term',
    longTerm: 'Long Term',
    mindfulness: 'Mindful Activity',
    groupActivity: 'Group Activity',
    
    // Personality Traits
    openness: 'Openness',
    conscientiousness: 'Conscientiousness',
    extraversion: 'Extraversion',
    agreeableness: 'Agreeableness',
    neuroticism: 'Neuroticism',
    
    // Activity Levels
    activityLevel: 'Activity Level',
    activityLevelLow: 'Low Activity',
    activityLevelModerate: 'Moderate Activity',
    activityLevelHigh: 'High Activity',
    
    // Work Preferences
    workPreference: 'Work Style',
    workStyleFocused: 'Focused & Structured',
    workStyleBalanced: 'Balanced & Steady',
    workStyleFlexible: 'Flexible & Adaptive',
    
    // Social Preferences
    socialPreference: 'Social Style',
    socialStyleIntroverted: 'Introverted',
    socialStyleBalanced: 'Balanced',
    socialStyleExtroverted: 'Extroverted',
    
    // Moods
    mood: 'Current Mood',
    moodEnergetic: 'Energetic',
    moodFocused: 'Focused',
    moodRelaxed: 'Relaxed',
    moodCreative: 'Creative',
    moodSocial: 'Social',
    
    // Times
    timeOfDay: 'Time of Day',
    timeMorning: 'Morning',
    timeAfternoon: 'Afternoon',
    timeEvening: 'Evening',
    timeNight: 'Night',
    
    // Energy
    energyLevel: 'Energy Level',
    energyLow: 'Low',
    energyHigh: 'High',
    
    // Categories
    movies: 'Movies',
    musicCategory: 'Music',
    cuisine: 'Cuisine',
    
    // Recommendations
    movieSuggestion: 'Movie Suggestion',
    musicSuggestion: 'Music Suggestion',
    cuisineSuggestion: 'Cuisine Suggestion',
    
    // Functions
    daysPerWeek: (days: number) => `${days} days per week`,
  },
  ja: {
    // General
    interests: '興味・関心',
    goals: '人生の目標',
    getRecommendations: 'レコメンデーションを取得',
    recommendationsTitle: 'あなたへのおすすめ',
    currentContext: '現在の状況',
    personalityTraits: '性格特性',
    
    // Recommendation Card
    impactPrimary: '主な影響',
    contextRelevance: 'おすすめの時間',
    personalFit: '個人との相性',
    enjoymentFactors: '楽しさと成長',
    shortTerm: '短期的な効果',
    longTerm: '長期的な効果',
    mindfulness: 'マインドフル活動',
    groupActivity: 'グループ活動',
    
    // Personality Traits
    openness: '開放性',
    conscientiousness: '誠実性',
    extraversion: '外向性',
    agreeableness: '協調性',
    neuroticism: '神経症的傾向',
    
    // Activity Levels
    activityLevel: 'アクティビティレベル',
    activityLevelLow: '低活動',
    activityLevelModerate: '中程度の活動',
    activityLevelHigh: '高活動',
    
    // Work Preferences
    workPreference: '仕事スタイル',
    workStyleFocused: '集中型・構造的',
    workStyleBalanced: 'バランス型・安定的',
    workStyleFlexible: '柔軟型・適応的',
    
    // Social Preferences
    socialPreference: '社交スタイル',
    socialStyleIntroverted: '内向的',
    socialStyleBalanced: 'バランス型',
    socialStyleExtroverted: '外向的',
    
    // Moods
    mood: '現在の気分',
    moodEnergetic: '活発',
    moodFocused: '集中',
    moodRelaxed: 'リラックス',
    moodCreative: '創造的',
    moodSocial: '社交的',
    
    // Times
    timeOfDay: '時間帯',
    timeMorning: '朝',
    timeAfternoon: '午後',
    timeEvening: '夕方',
    timeNight: '夜',
    
    // Energy
    energyLevel: 'エネルギーレベル',
    energyLow: '低い',
    energyHigh: '高い',
    
    // Categories
    movies: '映画',
    musicCategory: '音楽',
    cuisine: '料理',
    
    // Recommendations
    movieSuggestion: '映画のおすすめ',
    musicSuggestion: '音楽のおすすめ',
    cuisineSuggestion: '料理のおすすめ',
    
    // Functions
    daysPerWeek: (days: number) => `週${days}日`,
  }
}; 