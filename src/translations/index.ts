import type { TranslationsWithFunctions } from '../types';

export const translations: { [key: string]: TranslationsWithFunctions } = {
  en: {
    // General
    interests: 'Your Interests',
    goals: 'Life Goals',
    getRecommendations: 'Get Recommendations',
    recommendationsTitle: 'Your Personalized Recommendations',
    currentContext: 'Current Context',
    personalityTraits: 'Personality Traits',
    personalityProfile: 'Your Personality Profile',
    noRecommendationsError: 'No recommendations found. Please try adjusting your preferences.',
    generalError: 'An error occurred while getting recommendations. Please try again.',
    
    // Recommendation Card
    impactPrimary: 'Primary Impact',
    contextRelevance: 'Best Times',
    personalFit: 'Personal Fit',
    enjoymentFactors: 'Enjoyment & Growth',
    shortTerm: 'Short Term',
    longTerm: 'Long Term',
    mindfulness: 'Mindful Activity',
    groupActivity: 'Group Activity',
    energyLevel: 'Energy Level',
    
    // Functions
    daysPerWeek: (days: number) => `${days} days per week`
  },
  ja: {
    // General
    interests: '興味・関心',
    goals: '人生の目標',
    getRecommendations: 'おすすめを取得',
    recommendationsTitle: 'あなたへのおすすめ',
    currentContext: '現在の状況',
    personalityTraits: '性格特性',
    personalityProfile: 'あなたの性格プロフィール',
    noRecommendationsError: 'おすすめが見つかりませんでした。設定を変更してお試しください。',
    generalError: 'おすすめの取得中にエラーが発生しました。もう一度お試しください。',
    
    // Recommendation Card
    impactPrimary: '主な影響',
    contextRelevance: '最適な時間帯',
    personalFit: '個人との相性',
    enjoymentFactors: '楽しさと成長',
    shortTerm: '短期的な効果',
    longTerm: '長期的な効果',
    mindfulness: 'マインドフルな活動',
    groupActivity: 'グループ活動',
    energyLevel: 'エネルギーレベル',
    
    // Functions
    daysPerWeek: (days: number) => `週${days}日`
  }
}; 