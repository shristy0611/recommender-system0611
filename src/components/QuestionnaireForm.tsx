import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import translations from '../translations.json';
import { UserPreferences } from '../types';

interface QuestionnaireFormProps {
  onSubmit: (answers: UserPreferences) => void;
  loading: boolean;
  error: string | null;
}

const QUESTIONS = [
  {
    id: 'movie-genre',
    category: 'movies',
    options: ['Action & Adventure', 'Drama', 'Comedy', 'Sci-Fi', 'Mystery']
  },
  {
    id: 'book-genre',
    category: 'books',
    options: ['Fiction', 'Mystery', 'Science Fiction', 'Biography', 'Fantasy']
  },
  {
    id: 'cuisine-type',
    category: 'food',
    options: ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American']
  }
];

export function QuestionnaireForm({ onSubmit, loading, error }: QuestionnaireFormProps) {
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = QUESTIONS[currentQuestion];
  const questionTranslations = translations.questionnaire.questions[question.id];

  const handleOptionSelect = (option: string) => {
    const newAnswers = {
      ...answers,
      [question.category]: option
    };

    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      console.log('Submitting answers:', { ...newAnswers, language });
      onSubmit({ ...newAnswers, language });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-semibold mb-2">{translations.errors.api[language]}</p>
            <p>{error}</p>
            <p className="mt-2 text-sm text-red-600">
              {translations.errors.general[language]}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {questionTranslations.text[language]}
              </h2>
              <span className="text-sm text-gray-500">
                {translations.questionnaire.progress.question[language]
                  .replace('{current}', String(currentQuestion + 1))
                  .replace('{total}', String(QUESTIONS.length))}
              </span>
            </div>
            
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                disabled={loading}
                className={`w-full p-4 text-left rounded-lg border transition-colors duration-200 ${
                  loading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-indigo-50 hover:border-indigo-300'
                }`}
              >
                <span className="font-medium text-gray-900">
                  {questionTranslations.options[option][language]}
                </span>
              </button>
            ))}
          </div>

          {loading && (
            <div className="mt-4 text-center text-gray-600">
              {translations.questionnaire.loading[language]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}