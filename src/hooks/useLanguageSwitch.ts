import { useState, useEffect } from 'react';

type Language = 'ja' | 'en';

export function useLanguageSwitch(interval: number = 3000): Language {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ja');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLanguage((prev) => (prev === 'ja' ? 'en' : 'ja'));
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return currentLanguage;
}
