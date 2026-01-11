import { useState, useEffect, type ReactNode } from "react";
import { I18nContext, translations, type Language } from "@/lib/i18n";

const STORAGE_KEY = "mineraltax-language";

function getInitialLanguage(): Language {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["fr", "de", "it", "en"].includes(stored)) {
      return stored as Language;
    }
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    if (["fr", "de", "it", "en"].includes(browserLang)) {
      return browserLang as Language;
    }
  }
  return "fr";
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}
