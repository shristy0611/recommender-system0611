import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { UserPreferences, PersonalityTraits, MoodType, TimeContext, EnergyLevel, Language } from '../types/index';
import { translations } from '../translations/index';

export function Questionnaire({ onSubmit }: { onSubmit: (preferences: UserPreferences) => void }) {
  const { language } = useLanguage();

  // Helper function to handle translation values that might be functions
  function tString(key: keyof typeof translations.en): string {
    const value = translations[language as Language][key];
    return typeof value === 'function' ? '' : value;
  }

  // Personality traits
  const [traits, setTraits] = useState<PersonalityTraits>({
    openness: 3,
    conscientiousness: 3,
    extraversion: 3,
    agreeableness: 3,
    neuroticism: 3,
  });

  // Interests and goals
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Current context
  const [mood, setMood] = useState<MoodType>('energetic');
  const [timeOfDay, setTimeOfDay] = useState<TimeContext>('morning');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(3);

  // Lifestyle preferences
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [workStyle, setWorkStyle] = useState<'focused' | 'balanced' | 'flexible'>('balanced');
  const [socialStyle, setSocialStyle] = useState<'introverted' | 'balanced' | 'extroverted'>('balanced');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preferences = {
      language,
      profile: {
        traits,
        interests: selectedInterests,
        values: [],
        goals: selectedGoals,
      },
      context: {
        mood,
        timeOfDay,
        energyLevel,
        recentActivities: [] as string[],
        stressLevel: 3,
      },
      lifestyle: {
        activityLevel,
        workStyle,
        socialStyle,
      }
    };
    
    console.log('Form submission details:', {
      traits: JSON.stringify(traits),
      interests: selectedInterests,
      goals: selectedGoals,
      mood,
      timeOfDay,
      energyLevel,
      activityLevel,
      workStyle,
      socialStyle
    });
    
    onSubmit(preferences);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Personality Traits */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{tString('personalityTraits')}</h2>
        <div className="space-y-4">
          {Object.entries(traits).map(([trait, value]) => (
            <div key={trait} className="flex items-center gap-4">
              <label className="w-40">{tString(trait as keyof typeof translations.en)}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={value}
                onChange={(e) => setTraits({ ...traits, [trait]: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="w-8 text-center">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Interests */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{tString('interests')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedInterests.includes('technology')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedInterests([...selectedInterests, 'technology']);
                } else {
                  setSelectedInterests(selectedInterests.filter(i => i !== 'technology'));
                }
              }}
            />
            {tString('movies')}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedInterests.includes('arts')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedInterests([...selectedInterests, 'arts']);
                } else {
                  setSelectedInterests(selectedInterests.filter(i => i !== 'arts'));
                }
              }}
            />
            {tString('musicCategory')}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedInterests.includes('cuisine')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedInterests([...selectedInterests, 'cuisine']);
                } else {
                  setSelectedInterests(selectedInterests.filter(i => i !== 'cuisine'));
                }
              }}
            />
            {tString('cuisine')}
          </label>
        </div>
      </section>

      {/* Goals */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{tString('goals')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedGoals.includes('personal')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedGoals([...selectedGoals, 'personal']);
                } else {
                  setSelectedGoals(selectedGoals.filter(g => g !== 'personal'));
                }
              }}
            />
            Personal Growth
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedGoals.includes('creative')}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedGoals([...selectedGoals, 'creative']);
                } else {
                  setSelectedGoals(selectedGoals.filter(g => g !== 'creative'));
                }
              }}
            />
            Creative Expression
          </label>
        </div>
      </section>

      {/* Current Context */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{tString('currentContext')}</h2>
        
        {/* Mood */}
        <div className="mb-4">
          <label className="block mb-2">{tString('mood')}</label>
          <select 
            value={mood}
            onChange={(e) => setMood(e.target.value as MoodType)}
            className="w-full p-2 border rounded"
          >
            <option value="energetic">{tString('moodEnergetic')}</option>
            <option value="focused">{tString('moodFocused')}</option>
            <option value="relaxed">{tString('moodRelaxed')}</option>
            <option value="creative">{tString('moodCreative')}</option>
            <option value="social">{tString('moodSocial')}</option>
          </select>
        </div>

        {/* Time of Day */}
        <div className="mb-4">
          <label className="block mb-2">{tString('timeOfDay')}</label>
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value as TimeContext)}
            className="w-full p-2 border rounded"
          >
            <option value="morning">{tString('timeMorning')}</option>
            <option value="afternoon">{tString('timeAfternoon')}</option>
            <option value="evening">{tString('timeEvening')}</option>
            <option value="night">{tString('timeNight')}</option>
          </select>
        </div>

        {/* Energy Level */}
        <div>
          <label className="block mb-2">{tString('energyLevel')}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(parseInt(e.target.value) as EnergyLevel)}
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span>{tString('energyLow')}</span>
            <span>{tString('energyHigh')}</span>
          </div>
        </div>
      </section>

      {/* Lifestyle Preferences */}
      <section>
        {/* Activity Level */}
        <div className="mb-4">
          <label className="block mb-2">{tString('activityLevel')}</label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as 'low' | 'moderate' | 'high')}
            className="w-full p-2 border rounded"
          >
            <option value="low">{tString('activityLevelLow')}</option>
            <option value="moderate">{tString('activityLevelModerate')}</option>
            <option value="high">{tString('activityLevelHigh')}</option>
          </select>
        </div>

        {/* Work Style */}
        <div className="mb-4">
          <label className="block mb-2">{tString('workPreference')}</label>
          <select
            value={workStyle}
            onChange={(e) => setWorkStyle(e.target.value as 'focused' | 'balanced' | 'flexible')}
            className="w-full p-2 border rounded"
          >
            <option value="focused">{tString('workStyleFocused')}</option>
            <option value="balanced">{tString('workStyleBalanced')}</option>
            <option value="flexible">{tString('workStyleFlexible')}</option>
          </select>
        </div>

        {/* Social Style */}
        <div className="mb-4">
          <label className="block mb-2">{tString('socialPreference')}</label>
          <select
            value={socialStyle}
            onChange={(e) => setSocialStyle(e.target.value as 'introverted' | 'balanced' | 'extroverted')}
            className="w-full p-2 border rounded"
          >
            <option value="introverted">{tString('socialStyleIntroverted')}</option>
            <option value="balanced">{tString('socialStyleBalanced')}</option>
            <option value="extroverted">{tString('socialStyleExtroverted')}</option>
          </select>
        </div>
      </section>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        {tString('getRecommendations')}
      </button>
    </form>
  );
} 