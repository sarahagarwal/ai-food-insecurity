"use client";

import React, { createContext, useState, useContext } from "react";
import { translations } from "../translations/translations";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: () => "",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en");

  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = translations[language as keyof typeof translations];
    
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    
    if (value === undefined) {
      // Fallback to English if translation is missing
      value = translations.en;
      for (const k of keys) {
        if (value === undefined) break;
        value = value[k];
      }
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);