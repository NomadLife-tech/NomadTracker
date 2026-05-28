/**
 * Country Name Localization Utility
 * Uses i18n-iso-countries for standardized country name translations
 */
import countries from 'i18n-iso-countries';

// Import language packs for supported languages
import en from 'i18n-iso-countries/langs/en.json';
import es from 'i18n-iso-countries/langs/es.json';
import fr from 'i18n-iso-countries/langs/fr.json';
import de from 'i18n-iso-countries/langs/de.json';
import pt from 'i18n-iso-countries/langs/pt.json';
import zh from 'i18n-iso-countries/langs/zh.json';
import ja from 'i18n-iso-countries/langs/ja.json';
import ko from 'i18n-iso-countries/langs/ko.json';

// Register all language packs
countries.registerLocale(en);
countries.registerLocale(es);
countries.registerLocale(fr);
countries.registerLocale(de);
countries.registerLocale(pt);
countries.registerLocale(zh);
countries.registerLocale(ja);
countries.registerLocale(ko);

// Map app language codes to i18n-iso-countries language codes
const LANGUAGE_MAP: { [key: string]: string } = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  zh: 'zh',
  ja: 'ja',
  ko: 'ko',
};

/**
 * Get translated country name by ISO 2-letter code
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'DE', 'PT')
 * @param language - App language code (e.g., 'en', 'pt', 'es')
 * @returns Translated country name, or English fallback if not found
 */
export function getTranslatedCountryName(countryCode: string, language: string): string {
  if (!countryCode) return '';
  
  const isoLang = LANGUAGE_MAP[language] || 'en';
  const translatedName = countries.getName(countryCode.toUpperCase(), isoLang);
  
  // Fallback to English if translation not found
  if (!translatedName) {
    const englishName = countries.getName(countryCode.toUpperCase(), 'en');
    return englishName || countryCode;
  }
  
  return translatedName;
}

/**
 * Get all countries with translated names
 * @param language - App language code
 * @returns Object mapping country codes to translated names
 */
export function getAllTranslatedCountryNames(language: string): { [code: string]: string } {
  const isoLang = LANGUAGE_MAP[language] || 'en';
  const allCountries = countries.getNames(isoLang);
  return allCountries;
}

export default {
  getTranslatedCountryName,
  getAllTranslatedCountryNames,
};
