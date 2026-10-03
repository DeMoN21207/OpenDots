import { useSyncExternalStore } from 'react';
import { ru } from './locales/ru';

export type Locale = 'en' | 'ru';
export const localeStorageKey = 'opendots.locale';
type Params = Record<string, string | number>;

export function preferredLocale(
  saved: string | null,
  browserLanguage = 'en',
): Locale {
  if (saved === 'en' || saved === 'ru') return saved;
  return /^ru(?:-|$)/i.test(browserLanguage) ? 'ru' : 'en';
}

function initialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    return preferredLocale(
      window.localStorage.getItem(localeStorageKey),
      navigator.language,
    );
  } catch {
    return preferredLocale(null, navigator.language);
  }
}

let locale = initialLocale();
const listeners = new Set<() => void>();
function applyLocale(next: Locale) {
  locale = next;
  if (typeof document !== 'undefined') document.documentElement.lang = next;
  listeners.forEach((listener) => listener());
}
if (typeof window !== 'undefined') {
  document.documentElement.lang = locale;
  window.addEventListener('storage', (event) => {
    if (event.key === localeStorageKey || event.key === null)
      applyLocale(preferredLocale(event.newValue, navigator.language));
  });
}

export function setLocale(next: Locale) {
  if (next !== 'en' && next !== 'ru') return;
  try {
    window.localStorage.setItem(localeStorageKey, next);
  } catch {
    // A blocked browser storage must not prevent changing the interface.
  }
  applyLocale(next);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function useLocale() {
  return useSyncExternalStore(
    subscribe,
    () => locale,
    () => 'en' as Locale,
  );
}

export function translate(
  language: Locale,
  message: string,
  params: Params = {},
) {
  const text = language === 'ru' ? (ru[message] ?? message) : message;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(params, key) ? String(params[key]) : match,
  );
}
/** Call only for interface messages, never for user documents or model output. */
export function t(message: string, params?: Params) {
  return translate(locale, message, params);
}

export function formatDate(
  value: number | string,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Date(value).toLocaleString(
    locale === 'ru' ? 'ru-RU' : 'en-US',
    options,
  );
}

export function pageCount(count: number, language: Locale = locale) {
  if (language === 'en') return `${count} ${count === 1 ? 'page' : 'pages'}`;
  const form = new Intl.PluralRules('ru').select(count);
  const noun =
    form === 'one' ? 'страница' : form === 'few' ? 'страницы' : 'страниц';
  return `${count} ${noun}`;
}
