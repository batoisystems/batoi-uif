// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import {
  applyLocale,
  configureLocale,
  formatUIFCurrency,
  formatUIFDate,
  getLocaleDirection,
  translateUIFMessage,
} from './localization.js';

afterEach(() => configureLocale(null));

describe('localization contract', () => {
  it('canonicalizes locale settings and applies text direction', () => {
    configureLocale({ locales: 'ar-EG', timeZone: 'UTC', currency: 'EGP' });
    applyLocale();
    expect(document.documentElement.lang).toBe('ar-EG');
    expect(document.documentElement.dir).toBe('rtl');
    expect(getLocaleDirection('en-US')).toBe('ltr');
    expect(formatUIFCurrency(12)).not.toBe('');
    expect(formatUIFDate('2026-01-02T00:00:00Z', { year: 'numeric' })).not.toBe('');
  });

  it('provides bounded text-only application message interpolation', () => {
    configureLocale({ messages: { greeting: 'Hello {name}' } });
    expect(translateUIFMessage('greeting', '', { name: '<Admin>' })).toBe('Hello <Admin>');
    expect(translateUIFMessage('missing', 'Fallback')).toBe('Fallback');
    expect(() => configureLocale({ messages: { constructor: 'unsafe' } })).toThrow('Invalid UIF locale configuration');
  });

  it('rejects malformed currency and time-zone configuration', () => {
    expect(() => configureLocale({ currency: 'usd' })).toThrow('Invalid UIF locale configuration');
    expect(() => configureLocale({ timeZone: 'Not/AZone' })).toThrow('Invalid UIF locale configuration');
  });
});
