import { en, type Dictionary, type DictionaryKey } from "./dictionaries/en";
import { th } from "./dictionaries/th";

/** Register new languages here. Everything else adapts automatically. */
export const DICTIONARIES: Record<string, Dictionary> = { en, th };
export const LOCALES = [
  { code: "en", label: "English", bcp47: "en-US" },
  { code: "th", label: "ไทย", bcp47: "th-TH" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "amath_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

export type Translator = (key: DictionaryKey, params?: Record<string, string | number>) => string;

export function createTranslator(locale: Locale): Translator {
  const dict = DICTIONARIES[locale] ?? en;
  return (key, params) => {
    let text = dict[key] ?? en[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  };
}

/** Locale-aware number formatting. Display only — never used for game maths. */
export function formatNumber(value: number, locale: Locale): string {
  const bcp47 = LOCALES.find((l) => l.code === locale)?.bcp47 ?? "en-US";
  // Keep Arabic numerals in Thai UI so tile values and scores stay unambiguous.
  return new Intl.NumberFormat(locale === "th" ? `${bcp47}-u-nu-latn` : bcp47).format(value);
}
