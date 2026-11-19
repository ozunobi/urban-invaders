import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { Language } from '../constants/Translations';
import { getTranslation } from '../constants/Translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await SecureStore.getItemAsync('app-language');
        if (savedLanguage === 'en' || savedLanguage === 'fil') {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error('Failed to load language:', error);
        // Fall back to English if SecureStore fails
        setLanguageState('en');
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      await SecureStore.setItemAsync('app-language', newLanguage);
    } catch (error) {
      console.error('Failed to save language:', error);
      // Still update local state even if storage fails
    }
  };

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  if (isLoading) {
    return null; // Or return a loading screen
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
