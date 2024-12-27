export type Category = 'movies' | 'books' | 'food';

export interface Question {
  id: string;
  text: string;
  type: 'select' | 'radio';
  options: string[];
  category: Category;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  rating: number;
  category: Category;
}

export interface UserPreferences {
  [key: string]: string;
}