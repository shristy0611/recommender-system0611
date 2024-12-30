export type Category = 'movies' | 'books' | 'food';

export interface Question {
  id: string;
  text: string;
  type: 'select' | 'radio';
  options: string[];
  category: Category;
}

export interface UserPreferences {
  name: string;
  movies?: string;
  books?: string;
  food?: string;
  language: 'en' | 'ja';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  rating: number;
  category: Category;
  imageUrl: string;
  externalUrl: string;
}