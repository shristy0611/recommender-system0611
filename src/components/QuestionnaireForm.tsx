import React, { useState } from 'react';
import { questions } from '../data/questions';
import { UserPreferences } from '../types';

interface QuestionnaireFormProps {
  onSubmit: (preferences: UserPreferences) => void;
  loading?: boolean;
  error?: string | null;
}

export function QuestionnaireForm({ onSubmit, loading, error }: QuestionnaireFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<UserPreferences>({});

  const handleAnswer = (answer: string) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: answer,
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onSubmit(newAnswers);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-6">{question.text}</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={loading}
            className={`w-full p-4 text-left border rounded-lg transition-colors ${
              loading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-indigo-50 hover:border-indigo-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 text-center text-gray-600">
          Generating personalized recommendations...
        </div>
      )}
    </div>
  );
}