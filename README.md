# Personal Life Recommender System

A React TypeScript application that provides personalized lifestyle recommendations based on user preferences, personality traits, and current context. The system uses Google's Gemini AI to generate tailored suggestions for activities that can enrich your personal life.

## Features

- Personalized recommendations based on:
  - Personality traits (Big Five)
  - Personal interests and goals
  - Current mood and energy level
  - Time of day and context
  - Social preferences
- Multi-language support (English and Japanese)
- Rich recommendation details including:
  - Impact on personal growth
  - Contextual relevance
  - Enjoyment factors
  - Wellbeing aspects
  - Social dimensions
- Modern, responsive UI with a clean design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shristy0611/recommender-system0611.git
   cd recommender-system0611
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Usage

1. Fill out the questionnaire with your preferences
2. Click "Get Recommendations" to receive personalized suggestions
3. Explore the detailed recommendations provided

## Technology Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI API
- React Context for state management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
