import { Question } from '../types';

export const questions: Question[] = [
  {
    id: 'movie-genre',
    text: 'What type of movies do you enjoy the most?',
    type: 'select',
    options: ['Action & Adventure', 'Drama', 'Comedy', 'Sci-Fi', 'Mystery'],
    category: 'movies'
  },
  {
    id: 'book-genre',
    text: 'Which book genre interests you?',
    type: 'select',
    options: ['Fiction', 'Mystery', 'Science Fiction', 'Biography', 'Fantasy'],
    category: 'books'
  },
  {
    id: 'cuisine-type',
    text: 'What cuisine do you prefer?',
    type: 'select',
    options: ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American'],
    category: 'food'
  }
];