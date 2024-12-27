import React from 'react';
import { ArrowRight } from 'lucide-react';

interface WelcomePageProps {
  onStart: () => void;
}

export function WelcomePage({ onStart }: WelcomePageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-2xl text-center">
        <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">
          Next-Gen AI Recommender
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Discover personalized recommendations powered by advanced AI. Answer a few
          simple questions, and let our system surprise you with eerily accurate
          suggestions.
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}