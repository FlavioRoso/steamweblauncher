import en, { type TranslationKey, type Translations } from "./locales/en";
import ptBR from "./locales/pt-BR";

export type Locale = "en" | "pt-BR";

const translations: Record<Locale, Translations> = {
  en,
  "pt-BR": ptBR,
};

type SteamWindow = { LocalizationManager?: { m_rgLocalesToUse?: string[] } };

let currentLocale: Locale | null = null;

export function resolveLocale(language: string | undefined): Locale {
  return language?.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

export function getLocale(): Locale {
  if (!currentLocale) {
    const steamLocale = (window as unknown as SteamWindow).LocalizationManager
      ?.m_rgLocalesToUse?.[0];
    currentLocale = resolveLocale(steamLocale ?? navigator.language);
  }
  return currentLocale;
}

export function t(
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const template = translations[getLocale()][key] ?? en[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
