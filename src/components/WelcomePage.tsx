import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import translations from '../translations.json';
import { useLanguage } from '../contexts/LanguageContext';
import { isJapaneseText } from '../utils/languageDetection';

interface WelcomePageProps {
  onStart: (name: string) => void;
}

export function WelcomePage({ onStart }: WelcomePageProps) {
  const [name, setName] = useState('');
  const { language, setLanguage } = useLanguage();
  const [displayLanguage, setDisplayLanguage] = useState(language);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayLanguage(prev => prev === 'en' ? 'ja' : 'en');
    }, 3000); // Switch every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Update language based on input text
    if (newName.trim()) {
      setLanguage(isJapaneseText(newName) ? 'ja' : 'en');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-2xl text-center">
        <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl transition-opacity duration-500">
          {translations.welcome.title[displayLanguage]}
        </h1>
        <p className="mb-8 text-xl text-gray-600 transition-opacity duration-500">
          {translations.welcome.subtitle[displayLanguage]}
        </p>
        <form onSubmit={handleSubmit} className="flex items-center justify-center space-x-4">
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder={translations.welcome.nameInput.placeholder[language]}
            className="px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 text-lg font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {translations.welcome.nextButton[language]}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}