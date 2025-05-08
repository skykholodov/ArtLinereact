import { translations } from "@shared/translations";

export type Language = "ru" | "kz" | "en";
export type TranslationKey = keyof typeof translations.ru;

// Create the base path structure for nested translations
export type NestedTranslationKeys<T> = {
  [K in keyof T]: T[K] extends object
    ? `${string & K}.${string & keyof T[K]}`
    : K;
}[keyof T];

export type TranslationPath = NestedTranslationKeys<typeof translations.ru>;

// Function to get nested translation value
export function getNestedTranslation(
  obj: any,
  path: string,
  language: Language
): string {
  const keys = path.split(".");
  
  let current = obj[language];
  for (const key of keys) {
    if (current === undefined || current === null) {
      console.warn(`Translation key not found: ${path} for language ${language}`);
      return path;
    }
    current = current[key];
  }
  
  return current || path;
}

// Simplified translate function to be used in components
export function translate(path: TranslationPath, language: Language = "ru"): string {
  return getNestedTranslation(translations, path, language);
}
