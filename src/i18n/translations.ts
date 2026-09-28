import { en, TranslationKey } from './locales/en';
import { pl } from './locales/pl';

export const translations = {
  en,
  pl,
} as const;

export type { TranslationKey };
export type Language = 'en' | 'pl';
