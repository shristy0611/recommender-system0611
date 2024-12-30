export const API_CONFIG = {
  GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  GEMINI_KEY: import.meta.env.VITE_GEMINI_API_KEY,
};

export const EXTERNAL_LINKS = {
  movies: (title: string) => `https://www.imdb.com/find?q=${encodeURIComponent(title)}`,
  books: (title: string) => `https://www.goodreads.com/search?q=${encodeURIComponent(title)}`,
  food: (title: string) => `https://www.allrecipes.com/search?q=${encodeURIComponent(title)}`,
};

export const CATEGORIES = ['movies', 'books', 'food'] as const;