import { isSafeObjectKey, UIFError } from './contracts.js';

export interface UIFLocaleOptions {
  locales?: string | readonly string[];
  timeZone?: string;
  currency?: string;
  messages?: Readonly<Record<string, string>>;
}

export type UIFTextDirection = 'ltr' | 'rtl';

interface UIFLocaleConfiguration {
  locales: readonly string[];
  timeZone?: string;
  currency?: string;
  messages: Readonly<Record<string, string>>;
}

const defaultLocales = Object.freeze(['en']);
let localeConfiguration: Readonly<UIFLocaleConfiguration> = Object.freeze({
  locales: defaultLocales,
  messages: Object.freeze({}),
});

function localeError(message: string, cause?: unknown): UIFError {
  return new UIFError(message, {
    code: 'UIF_LOCALE_CONFIG',
    category: 'config',
    package: 'core',
    phase: 'localization',
    recoverable: true,
    cause,
  });
}

export function configureLocale(options: UIFLocaleOptions | null): void {
  if (!options) {
    localeConfiguration = Object.freeze({ locales: defaultLocales, messages: Object.freeze({}) });
    return;
  }
  try {
    const requested = typeof options.locales === 'string' ? [options.locales] : [...(options.locales ?? defaultLocales)];
    const locales = Object.freeze(Intl.getCanonicalLocales(requested));
    if (!locales.length) throw new Error('At least one locale is required.');
    if (options.currency && !/^[A-Z]{3}$/.test(options.currency)) throw new Error('Currency must be an uppercase ISO 4217 code.');
    if (options.timeZone) new Intl.DateTimeFormat(locales, { timeZone: options.timeZone }).format(0);
    const messages = Object.create(null) as Record<string, string>;
    Object.entries(options.messages ?? {}).forEach(([key, value]) => {
      if (!isSafeObjectKey(key) || key.length > 200 || value.length > 10_000) throw new Error(`Invalid locale message: ${key}`);
      messages[key] = value;
    });
    localeConfiguration = Object.freeze({
      locales,
      timeZone: options.timeZone,
      currency: options.currency,
      messages: Object.freeze(messages),
    });
  } catch (cause) {
    throw localeError('Invalid UIF locale configuration', cause);
  }
}

export function getLocaleConfiguration(): Readonly<UIFLocaleConfiguration> {
  return localeConfiguration;
}

export function getLocaleDirection(locale = localeConfiguration.locales[0]): UIFTextDirection {
  try {
    const localeInfo = new Intl.Locale(locale) as Intl.Locale & { textInfo?: { direction?: string } };
    const direction = localeInfo.textInfo?.direction;
    return direction === 'rtl' ? 'rtl' : 'ltr';
  } catch {
    return 'ltr';
  }
}

export function applyLocale(target: HTMLElement = document.documentElement): void {
  target.lang = localeConfiguration.locales[0];
  target.dir = getLocaleDirection();
}

export function formatUIFNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(localeConfiguration.locales, options).format(value);
}

export function formatUIFCurrency(value: number, currency = localeConfiguration.currency): string {
  if (!currency) throw localeError('A currency is required for currency formatting');
  return formatUIFNumber(value, { style: 'currency', currency });
}

export function formatUIFDate(value: Date | number | string, options: Intl.DateTimeFormatOptions = {}): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(localeConfiguration.locales, {
    ...(localeConfiguration.timeZone ? { timeZone: localeConfiguration.timeZone } : {}),
    ...options,
  }).format(date);
}

export function translateUIFMessage(
  key: string,
  fallback = key,
  values: Readonly<Record<string, string | number>> = {},
): string {
  const template = localeConfiguration.messages[key] ?? fallback;
  return template.replace(/\{([a-zA-Z0-9._-]+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match,
  );
}
