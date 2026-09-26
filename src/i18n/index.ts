import { create } from 'zustand';
import { translations, TranslationKey, Language } from './translations';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string, fallbackOrParams?: string | Record<string, string | number>) => string;
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('luxqmk_lang');
    if (saved === 'pl' || saved === 'en') return saved;
    const sysLang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
    if (sysLang.startsWith('pl')) return 'pl';
  } catch (e) {}
  return 'en';
}

const initialLang = getInitialLanguage();
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

export const useI18n = create<I18nState>((set, get) => ({
  language: initialLang,
  setLanguage: (lang: Language) => {
    try {
      localStorage.setItem('luxqmk_lang', lang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    } catch (e) {}
    set({ language: lang });
  },
  t: (key: TranslationKey | string, fallbackOrParams?: string | Record<string, string | number>): string => {
    const lang = get().language;
    const langDict = translations[lang] || translations.en;
    let text: string | undefined = (langDict as Record<string, string>)[key];

    if (!text) {
      text = (translations.en as Record<string, string>)[key];
    }

    if (!text) {
      return typeof fallbackOrParams === 'string' ? fallbackOrParams : key;
    }

    if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
      for (const [paramKey, paramVal] of Object.entries(fallbackOrParams)) {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      }
    }

    return text;
  },
}));

export function t(key: TranslationKey | string, fallbackOrParams?: string | Record<string, string | number>): string {
  return useI18n.getState().t(key, fallbackOrParams);
}
