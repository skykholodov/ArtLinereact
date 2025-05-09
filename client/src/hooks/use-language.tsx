import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { Language } from "@/lib/i18n";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: "ru",
  setLanguage: () => {}
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Try to load saved language preference from localStorage
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("language");
    return (savedLanguage as Language) || "ru";
  });

  // Set language handler that also updates localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    
    // Update html lang attribute for accessibility
    document.documentElement.lang = lang;
  };

  // Update document language on initial load
  useEffect(() => {
    document.documentElement.lang = language;
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
